import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Clock,
  Cloud,
  Copy,
  ExternalLink,
  LogOut,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 sm:p-6">
        <div className="max-w-5xl w-full grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Website Intro Showcase */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              UEH-ISB · Final Exam Studio Hub
            </div>

            <div className="flex items-start gap-4">
              <img
                src="./logo.gif"
                alt="Exam Studio Hub"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md shrink-0"
              />
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Master{' '}
                  <span className="bg-gradient-to-r from-indigo-600 via-emerald-600 to-sky-600 dark:from-indigo-400 dark:via-emerald-400 dark:to-sky-400 bg-clip-text text-transparent">
                    MFC, Economics &amp; ProbStat
                  </span>{' '}
                  — In One Studio.
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Interactive algorithm &amp; macro trainers, 13-page SB stat tables, synced group
                  mock exams, printable A4 cheat sheets, and built-in Gemini AI tutoring.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Nền tảng ôn thi cuối kỳ chuẩn UEH-ISB: phòng lab tương tác, tra bảng SB, đề thi
                  nhóm đồng bộ, in công thức A4 &amp; trợ lý AI bám sát giáo trình.
                </p>
              </div>
            </div>

            {/* 3 Subject Cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/85 dark:bg-slate-900/80 border border-indigo-200/80 dark:border-indigo-900/70 p-3.5 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Scale className="w-4 h-4 shrink-0" />
                  <span>Math for Computing</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ch. 1, 4, 9–12 · Step-by-Step ExtGCD, ModExp, Warshall, K-Maps &amp; Proofs Trainer.
                </p>
              </div>

              <div className="rounded-2xl bg-white/85 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-900/70 p-3.5 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Principles of Econ</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  ECO101 Parts 6–9 · Live Mankiw Curves (AD–AS, Twin Markets, Loanable Funds) &amp; Shock Drills.
                </p>
              </div>

              <div className="rounded-2xl bg-white/85 dark:bg-slate-900/80 border border-sky-200/80 dark:border-sky-900/70 p-3.5 shadow-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Prob &amp; Statistics</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ch. 1–5 · 13-Page Interactive SB Tables (C-1 to F), Simulators &amp; Written Finals.
                </p>
              </div>
            </div>

            {/* Highlights Strip */}
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" /> Synced Group Exams
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <Search className="w-3.5 h-3.5 text-sky-500" /> Ctrl+K Search
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" /> My Gemini AI &amp; Auto-Fill
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <Cloud className="w-3.5 h-3.5 text-emerald-500" /> Cloud Sync &amp; A4 Print
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Bilingual EN + VI
              </span>
            </div>
          </div>

          {/* Right Column: Class Access Sign-In Card */}
          <div className="lg:col-span-5">
            <div className="w-full rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src="./logo.gif"
                  alt="Exam Studio Hub"
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/30 shrink-0"
                />
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Student Sign-In
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Exam Studio Hub · UEH-ISB Class Gate
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Class Access Control / Cổng xác thực lớp học
                </div>
                <p>
                  Sign in with your Google / UEH student email to unlock all 3 subjects and sync
                  your study progress across devices.
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Đăng nhập bằng Google / Gmail sinh viên UEH để vào web và tự động đồng bộ tiến độ
                  ôn thi giữa laptop và điện thoại.
                </p>
              </div>

              {inAppWebview && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    Đang mở trong Zalo / Messenger?
                  </div>
                  <p className="leading-relaxed">
                    Google chặn đăng nhập trong trình duyệt nội bộ của Zalo/Messenger. Hãy bấm biểu
                    tượng <strong>⋯</strong> (góc trên/dưới) và chọn{' '}
                    <strong>Mở bằng Chrome / Safari</strong>.
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
