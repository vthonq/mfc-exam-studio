import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  generateRoomCode,
  normalizeRoomCode,
  type RoomSubmissionDoc,
  type StudyRoomDoc,
} from '../utils/studyRoomStats';
import type { SubjectId } from '../types';

export async function createStudyRoom(params: {
  title?: string;
  subject: SubjectId;
  mode: string;
  seed: string;
  hostUid: string;
  hostName: string;
  customCode?: string;
}): Promise<StudyRoomDoc> {
  const cleanTitle = (params.title || '').trim().slice(0, 80) || `${params.subject.toUpperCase()} Study Room`;
  const cleanSeed = params.seed.trim().toUpperCase().slice(0, 24) || 'ROOM';
  const cleanMode = params.mode.trim().slice(0, 24) || 'final';
  const cleanHost = params.hostName.trim().slice(0, 100) || 'Student';

  let roomCode = params.customCode ? normalizeRoomCode(params.customCode) : generateRoomCode();
  if (roomCode.length < 4) {
    roomCode = generateRoomCode();
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    const ref = doc(db, 'study_rooms', roomCode);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const payload: StudyRoomDoc = {
        roomCode,
        title: cleanTitle,
        subject: params.subject,
        mode: cleanMode,
        seed: cleanSeed,
        hostUid: params.hostUid,
        hostName: cleanHost,
        status: 'open',
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
      return payload;
    }
    if (params.customCode) {
      throw new Error(`Room code "${roomCode}" already exists — pick another or join it instead.`);
    }
    roomCode = generateRoomCode();
  }

  throw new Error('Could not allocate a unique room code. Please try again.');
}

export async function fetchStudyRoom(roomCode: string): Promise<StudyRoomDoc | null> {
  const code = normalizeRoomCode(roomCode);
  if (code.length < 4) return null;
  const snap = await getDoc(doc(db, 'study_rooms', code));
  return snap.exists() ? (snap.data() as StudyRoomDoc) : null;
}

export async function listRecentStudyRooms(maxItems = 8): Promise<StudyRoomDoc[]> {
  const q = query(collection(db, 'study_rooms'), orderBy('createdAt', 'desc'), limit(maxItems));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as StudyRoomDoc);
}

export function subscribeStudyRoom(
  roomCode: string,
  onData: (room: StudyRoomDoc | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const code = normalizeRoomCode(roomCode);
  return onSnapshot(
    doc(db, 'study_rooms', code),
    (snap) => {
      onData(snap.exists() ? (snap.data() as StudyRoomDoc) : null);
    },
    (err) => onError?.(err),
  );
}

export function subscribeRoomSubmissions(
  roomCode: string,
  onData: (submissions: RoomSubmissionDoc[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const code = normalizeRoomCode(roomCode);
  return onSnapshot(
    collection(db, 'study_rooms', code, 'submissions'),
    (snap) => {
      onData(snap.docs.map((d) => d.data() as RoomSubmissionDoc));
    },
    (err) => onError?.(err),
  );
}

export async function submitRoomResult(params: {
  roomCode: string;
  uid: string;
  displayName: string;
  score: number;
  maxScore: number;
  elapsedSeconds: number;
  missedLabels: string[];
}): Promise<void> {
  const code = normalizeRoomCode(params.roomCode);
  if (code.length < 4) return;
  const maxScore = Math.max(1, Math.min(200, Math.round(params.maxScore * 10) / 10));
  const score = Math.max(0, Math.min(200, Math.round(params.score * 10) / 10));
  const pct = Math.max(0, Math.min(100, Math.round((score / maxScore) * 1000) / 10));
  const elapsedSeconds = Math.max(0, Math.min(86400, Math.round(params.elapsedSeconds)));
  const missedLabels = params.missedLabels
    .map((x) => x.trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 40);

  await setDoc(doc(db, 'study_rooms', code, 'submissions', params.uid), {
    uid: params.uid,
    displayName: params.displayName.trim().slice(0, 100) || 'Student',
    score,
    maxScore,
    pct,
    elapsedSeconds,
    missedLabels,
    submittedAt: serverTimestamp(),
  });
}

export async function setStudyRoomStatus(
  roomCode: string,
  status: 'open' | 'closed',
): Promise<void> {
  const code = normalizeRoomCode(roomCode);
  await updateDoc(doc(db, 'study_rooms', code), { status });
}

export async function deleteStudyRoom(roomCode: string): Promise<void> {
  const code = normalizeRoomCode(roomCode);
  await deleteDoc(doc(db, 'study_rooms', code));
}
