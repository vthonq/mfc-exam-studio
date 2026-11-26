import React, { useState } from 'react';
import { Clock, Copy, ExternalLink, LogOut, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isUehStudentEmail } from '../services/firebase';
import { isInAppBrowser } from '../utils/browserDetect';

export const AccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    firebaseUser,
    profile,
    accessConfig,
    loading,
    error,
    isAdmin,
    signInWithGoogle,
    signOutUser,
    refreshAccess,
  } = useAuth();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const inAppWebview = isInAppBrowser();

  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="text-center space-y-3">
          <img
            src="./logo.gif"
            alt="Exam Studio Hub"
            className="w-14 h-14 rounded-2xl mx-auto object-cover ring-2 ring-indigo-500/40"
          />
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Verifying class access...
          </div>
          <div className="text-xs text-slate-400">Đang kiểm tra quyền truy cập lớp học...</div>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <img
              src="./logo.gif"
              alt="Exam Studio Hub"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 shrink-0"
            />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Exam Studio Hub
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                UEH-ISB · MFC · Macroeconomics · Prob &amp; Statistics
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
            <div className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Class Access Control / Cổng xác thực lớp học
            </div>
            <p>
              Sign in with your Google / UEH student email to enter. Total student seats are managed
              live by the class Admin.
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Đăng nhập bằng Google / Gmail sinh viên UEH để vào web. Sĩ số được Admin kiểm soát
              tự động.
            </p>
          </div>

          {inAppWebview && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 shrink-0" />
                Đang mở trong Zalo / Messenger?
              </div>
              <p className="leading-relaxed">
                Google chặn đăng nhập trong trình duyệt nội bộ của Zalo/Messenger. Hãy bấm biểu tượng{' '}
                <strong>⋯</strong> (góc trên/dưới) và chọn <strong>Mở bằng Chrome / Safari</strong>.
              </p>
              <button
                onClick={() => void copyCurrentUrl()}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedUrl ? 'Đã sao chép link!' : 'Copy Link để mở bằng Chrome/Safari'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <button
            onClick={() => void signInWithGoogle()}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
            <ShieldAlert className="w-5 h-5" />
            Access Verification Error
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {error || 'Could not load your access profile from Firestore.'}
          </p>
          <div className="text-xs text-slate-400 font-mono truncate">
            Signed in as: {firebaseUser.email}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void refreshAccess()}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            <button
              onClick={() => void signOutUser()}
              className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && profile.status === 'waitlist') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
            <Clock className="w-5 h-5" />
            Class Capacity Reached / Đang chờ Admin duyệt
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your account (<strong className="font-mono">{profile.email}</strong>) is on the{' '}
            <strong>Waitlist</strong> because the class limit has been reached or auto-join is paused.
            Ask your class Admin to raise the user cap or approve your email.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tài khoản của bạn đang ở danh sách chờ vì đã đủ sĩ số lớp. Hãy nhắn Admin nâng giới hạn
            hoặc bấm Approve cho email của bạn rồi nhấn nút kiểm tra lại bên dưới.
          </p>
          {accessConfig?.requireUehEmail && !isUehStudentEmail(profile.email) && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              Admin currently requires a <strong>@st.ueh.edu.vn</strong> email for instant entry. Sign
              out and sign in with your UEH student Gmail, or ask Admin to approve this email.
            </div>
          )}
          {accessConfig && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-mono flex items-center justify-between">
              <span>Current Seats Used:</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">
                {accessConfig.approvedCount} / {accessConfig.maxUsers}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => void refreshAccess()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Check Status Again
            </button>
            <button
              onClick={() => void signOutUser()}
              className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && profile.status === 'banned') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
            <ShieldAlert className="w-5 h-5" />
            Access Revoked / Tài khoản đã bị khóa
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Access for <strong className="font-mono">{profile.email}</strong> has been revoked by
            the class Admin.
          </p>
          <button
            onClick={() => void signOutUser()}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
