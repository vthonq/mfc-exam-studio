import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const ADMIN_EMAILS = [
  'nguyenvanvietthong@gmail.com',
  'thongnguyen.31261028903@st.ueh.edu.vn',
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin === normalized);
}

export function isUehStudentEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@st.ueh.edu.vn');
}

export const firebaseConfig = {
  apiKey: 'AIzaSyAGm1m-8AT6uxjrz09vuBEpzvbC9zeSBBI',
  authDomain: 'mfc-exam-studio-ueh-780e7.firebaseapp.com',
  projectId: 'mfc-exam-studio-ueh-780e7',
  storageBucket: 'mfc-exam-studio-ueh-780e7.firebasestorage.app',
  messagingSenderId: '871528605443',
  appId: '1:871528605443:web:74540348cd315cf94b6b36',
  measurementId: 'G-FLLT63QH4Y',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
