import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, isAdminEmail, isUehStudentEmail } from './firebase';
import { extractMillis } from '../utils/browserDetect';

export type UserRole = 'admin' | 'student';
export type UserAccessStatus = 'approved' | 'waitlist' | 'banned';

export interface AccessConfigDoc {
  maxUsers: number;
  approvedCount: number;
  registrationOpen: boolean;
  requireUehEmail?: boolean;
  updatedAt?: unknown;
  updatedBy: string;
}

export interface UserProfileDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status: UserAccessStatus;
  createdAt?: unknown;
  lastSeenAt?: unknown;
}

export interface CloudProgressDoc {
  progressJson: string;
  updatedAt?: unknown;
  updatedAtMs: number;
}

const DEFAULT_MAX_USERS = 50;

function safeStr(val: string | null | undefined, maxLen: number): string {
  return (val ?? '').trim().slice(0, maxLen);
}

export async function registerOrSyncUser(fbUser: User): Promise<{
  profile: UserProfileDoc;
  config: AccessConfigDoc;
}> {
  const email = safeStr(fbUser.email, 150).toLowerCase();
  const displayName =
    (safeStr(fbUser.displayName, 100) || safeStr(email, 100) || 'Student').slice(0, 100);
  const rawPhoto = safeStr(fbUser.photoURL, 500);
  const photoURL = /^https?:\/\//i.test(rawPhoto) ? rawPhoto : '';
  const adminFlag = isAdminEmail(email);

  const cfgRef = doc(db, 'access_config', 'settings');
  const userRef = doc(db, 'users', fbUser.uid);

  return runTransaction(db, async (tx) => {
    const cfgSnap = await tx.get(cfgRef);
    const userSnap = await tx.get(userRef);

    let config: AccessConfigDoc = cfgSnap.exists()
      ? (cfgSnap.data() as AccessConfigDoc)
      : {
          maxUsers: DEFAULT_MAX_USERS,
          approvedCount: 0,
          registrationOpen: true,
          requireUehEmail: false,
          updatedBy: email || 'system',
        };

    if (adminFlag) {
      if (!cfgSnap.exists()) {
        const initCfg: AccessConfigDoc = {
          maxUsers: DEFAULT_MAX_USERS,
          approvedCount: 0,
          registrationOpen: true,
          requireUehEmail: false,
          updatedAt: serverTimestamp(),
          updatedBy: email,
        };
        tx.set(cfgRef, initCfg);
        config = initCfg;
      }

      if (!userSnap.exists()) {
        const newAdmin: UserProfileDoc = {
          uid: fbUser.uid,
          email,
          displayName,
          photoURL,
          role: 'admin',
          status: 'approved',
          createdAt: serverTimestamp(),
          lastSeenAt: serverTimestamp(),
        };
        tx.set(userRef, newAdmin);
        return { profile: newAdmin, config };
      }

      const existing = userSnap.data() as UserProfileDoc;
      tx.update(userRef, {
        displayName,
        photoURL,
        role: 'admin',
        status: 'approved',
        lastSeenAt: serverTimestamp(),
      });
      return {
        profile: { ...existing, displayName, photoURL, role: 'admin', status: 'approved' },
        config,
      };
    }

    // Regular student flow
    if (userSnap.exists()) {
      const existing = userSnap.data() as UserProfileDoc;
      tx.update(userRef, {
        displayName,
        photoURL,
        lastSeenAt: serverTimestamp(),
      });
      return {
        profile: { ...existing, displayName, photoURL },
        config,
      };
    }

    // First-time student login: check cap & optional UEH domain atomically
    const passesDomain = !config.requireUehEmail || isUehStudentEmail(email);
    const canAutoApprove =
      cfgSnap.exists() &&
      config.registrationOpen === true &&
      passesDomain &&
      config.approvedCount < config.maxUsers;

    if (canAutoApprove) {
      const nextCount = config.approvedCount + 1;
      tx.update(cfgRef, { approvedCount: nextCount });
      config = { ...config, approvedCount: nextCount };

      const newStudent: UserProfileDoc = {
        uid: fbUser.uid,
        email,
        displayName,
        photoURL,
        role: 'student',
        status: 'approved',
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
      };
      tx.set(userRef, newStudent);
      return { profile: newStudent, config };
    }

    const waitlistedStudent: UserProfileDoc = {
      uid: fbUser.uid,
      email,
      displayName,
      photoURL,
      role: 'student',
      status: 'waitlist',
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    };
    tx.set(userRef, waitlistedStudent);
    return { profile: waitlistedStudent, config };
  });
}

export async function fetchAccessConfig(): Promise<AccessConfigDoc | null> {
  const snap = await getDoc(doc(db, 'access_config', 'settings'));
  return snap.exists() ? (snap.data() as AccessConfigDoc) : null;
}

export async function listAllUsers(): Promise<UserProfileDoc[]> {
  const snap = await getDocs(collection(db, 'users'));
  const list = snap.docs.map((d) => d.data() as UserProfileDoc);
  const statusRank: Record<UserAccessStatus, number> = {
    waitlist: 0,
    approved: 1,
    banned: 2,
  };
  list.sort((a, b) => {
    if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
    if (a.status !== b.status) return statusRank[a.status] - statusRank[b.status];
    const tA = extractMillis(a.lastSeenAt) ?? 0;
    const tB = extractMillis(b.lastSeenAt) ?? 0;
    if (tA !== tB) return tB - tA;
    return a.email.localeCompare(b.email);
  });
  return list;
}

export async function updateAccessSettings(params: {
  maxUsers: number;
  registrationOpen: boolean;
  requireUehEmail: boolean;
  updatedBy: string;
}): Promise<AccessConfigDoc> {
  const clampedMax = Math.max(0, Math.min(10000, Math.round(params.maxUsers)));
  const updatedBy = safeStr(params.updatedBy, 150).toLowerCase() || 'admin';
  const cfgRef = doc(db, 'access_config', 'settings');

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(cfgRef);
    const currentApproved = snap.exists() ? (snap.data() as AccessConfigDoc).approvedCount : 0;
    const nextDoc: AccessConfigDoc = {
      maxUsers: clampedMax,
      approvedCount: Math.max(0, currentApproved),
      registrationOpen: Boolean(params.registrationOpen),
      requireUehEmail: Boolean(params.requireUehEmail),
      updatedAt: serverTimestamp(),
      updatedBy,
    };
    tx.set(cfgRef, nextDoc);
    return nextDoc;
  });
}

export async function adminSetUserStatus(
  targetUid: string,
  nextStatus: UserAccessStatus,
  adminEmail: string,
): Promise<void> {
  const cfgRef = doc(db, 'access_config', 'settings');
  const userRef = doc(db, 'users', targetUid);

  await runTransaction(db, async (tx) => {
    const [cfgSnap, userSnap] = await Promise.all([tx.get(cfgRef), tx.get(userRef)]);
    if (!userSnap.exists()) throw new Error('User record not found.');

    const target = userSnap.data() as UserProfileDoc;
    if (target.role === 'admin') {
      throw new Error('Cannot change access status of an Admin account.');
    }

    const prevStatus = target.status;
    if (prevStatus === nextStatus) return;

    const currentApproved = cfgSnap.exists() ? (cfgSnap.data() as AccessConfigDoc).approvedCount : 0;
    let delta = 0;
    if (prevStatus !== 'approved' && nextStatus === 'approved') delta = 1;
    else if (prevStatus === 'approved' && nextStatus !== 'approved') delta = -1;

    tx.update(userRef, { status: nextStatus });
    if (cfgSnap.exists() && delta !== 0) {
      tx.update(cfgRef, {
        approvedCount: Math.max(0, currentApproved + delta),
        updatedAt: serverTimestamp(),
        updatedBy: safeStr(adminEmail, 150).toLowerCase(),
      });
    }
  });
}

export async function adminDeleteUser(targetUid: string, adminEmail: string): Promise<void> {
  const cfgRef = doc(db, 'access_config', 'settings');
  const userRef = doc(db, 'users', targetUid);

  await runTransaction(db, async (tx) => {
    const [cfgSnap, userSnap] = await Promise.all([tx.get(cfgRef), tx.get(userRef)]);
    if (!userSnap.exists()) return;

    const target = userSnap.data() as UserProfileDoc;
    if (target.role === 'admin') {
      throw new Error('Cannot delete an Admin account.');
    }

    const currentApproved = cfgSnap.exists() ? (cfgSnap.data() as AccessConfigDoc).approvedCount : 0;
    tx.delete(userRef);
    if (cfgSnap.exists() && target.status === 'approved') {
      tx.update(cfgRef, {
        approvedCount: Math.max(0, currentApproved - 1),
        updatedAt: serverTimestamp(),
        updatedBy: safeStr(adminEmail, 150).toLowerCase(),
      });
    }
  });
}

export async function adminRecountApproved(adminEmail: string): Promise<number> {
  const users = await listAllUsers();
  const approvedStudents = users.filter(
    (u) => u.role !== 'admin' && u.status === 'approved',
  ).length;
  const cfgRef = doc(db, 'access_config', 'settings');
  const snap = await getDoc(cfgRef);
  const existing = snap.exists()
    ? (snap.data() as AccessConfigDoc)
    : { maxUsers: DEFAULT_MAX_USERS, registrationOpen: true, requireUehEmail: false };

  await setDoc(cfgRef, {
    maxUsers: existing.maxUsers,
    approvedCount: approvedStudents,
    registrationOpen: existing.registrationOpen,
    requireUehEmail: Boolean(existing.requireUehEmail),
    updatedAt: serverTimestamp(),
    updatedBy: safeStr(adminEmail, 150).toLowerCase(),
  });

  return approvedStudents;
}

export async function fetchCloudProgress(uid: string): Promise<CloudProgressDoc | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'studio_data', 'progress'));
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<CloudProgressDoc>;
  if (typeof data.progressJson !== 'string' || typeof data.updatedAtMs !== 'number') {
    return null;
  }
  return {
    progressJson: data.progressJson,
    updatedAt: data.updatedAt,
    updatedAtMs: data.updatedAtMs,
  };
}

export async function saveCloudProgress(
  uid: string,
  progressJson: string,
  updatedAtMs: number,
): Promise<void> {
  if (progressJson.length > 195000) {
    throw new Error('Progress payload exceeds 195 KB cloud sync limit.');
  }
  await setDoc(doc(db, 'users', uid, 'studio_data', 'progress'), {
    progressJson,
    updatedAt: serverTimestamp(),
    updatedAtMs,
  });
}
