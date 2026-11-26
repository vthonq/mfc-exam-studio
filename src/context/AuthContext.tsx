import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, isAdminEmail } from '../services/firebase';
import {
  fetchAccessConfig,
  registerOrSyncUser,
  type AccessConfigDoc,
  type UserProfileDoc,
} from '../services/accessControl';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfileDoc | null;
  accessConfig: AccessConfigDoc | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshAccess: () => Promise<void>;
  setAccessConfigLocal: (cfg: AccessConfigDoc) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in popup was closed before completing login.';
  }
  if (msg.includes('auth/unauthorized-domain')) {
    return 'This domain is not yet added in Firebase Console → Authentication → Settings → Authorized domains.';
  }
  if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
    return 'Firestore permission denied. Ensure Firestore database & security rules are deployed in Firebase Console.';
  }
  if (msg.includes('unavailable') || msg.includes('failed-precondition')) {
    return 'Cannot reach Cloud Firestore yet. Verify Cloud Firestore API is enabled in Firebase Console.';
  }
  return msg;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [accessConfig, setAccessConfig] = useState<AccessConfigDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncUser = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      setAccessConfig(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { profile: p, config } = await registerOrSyncUser(user);
      setProfile(p);
      setAccessConfig(config);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      void syncUser(user);
    });
    return () => unsub();
  }, [syncUser]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(formatAuthError(err));
    }
  };

  const signOutUser = async () => {
    setError(null);
    await signOut(auth);
  };

  const refreshAccess = async () => {
    if (!firebaseUser) return;
    await syncUser(firebaseUser);
    try {
      const cfg = await fetchAccessConfig();
      if (cfg) setAccessConfig(cfg);
    } catch {
      // ignore optional refresh error
    }
  };

  const isAdmin = Boolean(
    firebaseUser &&
      (profile?.role === 'admin' || isAdminEmail(firebaseUser.email)),
  );

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        accessConfig,
        loading,
        error,
        isAdmin,
        signInWithGoogle,
        signOutUser,
        refreshAccess,
        setAccessConfigLocal: setAccessConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
