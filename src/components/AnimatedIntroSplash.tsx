import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Scale, Sparkles, TrendingUp } from 'lucide-react';

export const SPLASH_PLAYED_KEY = 'exam_studio_splash_played_v1';
export const REPLAY_SPLASH_EVENT = 'exam-studio:replay-splash';

const FLOATING_GLYPHS: Array<{ text: string; style: React.CSSProperties; delay: string }> = [
  { text: '∀x P(x)', style: { top: '14%', left: '10%' }, delay: '0s' },
  { text: 'a^b mod m', style: { top: '22%', right: '14%' }, delay: '0.6s' },
  { text: 'W_k', style: { top: '38%', left: '7%' }, delay: '1.1s' },
  { text: 'AD = AS', style: { top: '18%', left: '46%' }, delay: '0.3s' },
  { text: 'MV = PY', style: { top: '68%', left: '12%' }, delay: '0.8s' },
  { text: 'NCO = NX', style: { top: '76%', right: '15%' }, delay: '1.4s' },
  { text: 'P(Z ≤ z)', style: { top: '34%', right: '9%' }, delay: '0.4s' },
  { text: 'χ²(df)', style: { top: '60%', right: '11%' }, delay: '1.0s' },
  { text: 'E(X)', style: { top: '80%', left: '34%' }, delay: '0.2s' },
  { text: 'K-Map', style: { top: '12%', right: '32%' }, delay: '0.9s' },
];

export const AnimatedIntroSplash: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    try {
      const reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) return false;
      return sessionStorage.getItem(SPLASH_PLAYED_KEY) !== '1';
    } catch {
      return false;
    }
  });
  const [exiting, setExiting] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const exitTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (unmountTimerRef.current !== null) {
      window.clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    try {
      sessionStorage.setItem(SPLASH_PLAYED_KEY, '1');
    } catch {
      // ignore storage errors
    }
    setExiting(true);
    unmountTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 500);
  }, [clearTimers]);

  const scheduleAutoExit = useCallback(() => {
    clearTimers();
    exitTimerRef.current = window.setTimeout(() => {
      dismiss();
    }, 2750);
  }, [clearTimers, dismiss]);

  useEffect(() => {
    if (visible) {
      scheduleAutoExit();
    }
    return () => clearTimers();
  }, [visible, runKey, scheduleAutoExit, clearTimers]);

  useEffect(() => {
    const onReplay = () => {
      clearTimers();
      setExiting(false);
      setRunKey((k) => k + 1);
      setVisible(true);
    };
    window.addEventListener(REPLAY_SPLASH_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_SPLASH_EVENT, onReplay);
  }, [clearTimers]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      key={runKey}
      className={`no-print fixed inset-0 z-[70] bg-slate-950 text-white flex items-center justify-center overflow-hidden select-none transition-all duration-500 ease-out ${
        exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Exam Studio Hub Animated Intro"
    >
      {/* Subtle architectural grid background */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.6) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
        aria-hidden="true"
      />

      {/* Ambient glowing aurora orbs */}
      <div
        className="intro-orb absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="intro-orb absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-sky-500/25 blur-3xl pointer-events-none"
        style={{ animationDelay: '1.5s' }}
        aria-hidden="true"
      />
      <div
        className="intro-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"
        style={{ animationDelay: '0.8s' }}
        aria-hidden="true"
      />

      {/* Floating academic glyphs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {FLOATING_GLYPHS.map((g) => (
          <span
            key={g.text}
            className="intro-float-symbol absolute font-mono text-xs sm:text-sm font-semibold text-slate-400/25"
            style={{ ...g.style, animationDelay: g.delay }}
          >
            {g.text}
          </span>
        ))}
      </div>

      {/* Skip button */}
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-5 right-5 z-10 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
      >
        <span>Skip Intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Center Hero Choreography */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center flex flex-col items-center space-y-5">
        {/* Spinning Halo + Logo */}
        <div className="intro-logo-pop relative flex items-center justify-center">
          <div
            className="intro-ring-spin absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-500 via-emerald-400 to-sky-400 opacity-75 blur-sm"
            aria-hidden="true"
          />
          <img
            src="./logo.gif"
            alt="Exam Studio Hub"
            className="relative w-20 h-20 rounded-2xl object-cover shadow-2xl ring-2 ring-white/30 bg-slate-900"
          />
        </div>

        {/* Eyebrow Badge */}
        <div
          className="intro-reveal-up inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur text-[11px] font-bold tracking-wider uppercase text-indigo-200"
          style={{ animationDelay: '220ms' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          UEH-ISB · All-In-One Exam Platform
        </div>

        {/* Main Title & Bilingual Tagline */}
        <div className="space-y-2">
          <h1
            className="intro-reveal-up text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-indigo-200 bg-clip-text text-transparent"
            style={{ animationDelay: '380ms' }}
          >
            Exam Studio Hub
          </h1>
          <div
            className="intro-reveal-up space-y-1"
            style={{ animationDelay: '560ms' }}
          >
            <p className="text-sm sm:text-base text-slate-200 font-medium">
              Interactive Labs · SB Stat Tables · Group Mock Exams · AI Tutor
            </p>
            <p className="text-xs text-slate-400">
              Nền tảng ôn thi cuối kỳ 3 môn chuẩn UEH-ISB
            </p>
          </div>
        </div>

        {/* Staggered 3-Subject Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <span
            className="intro-reveal-up inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400/35 text-xs font-semibold text-indigo-200 backdrop-blur"
            style={{ animationDelay: '760ms' }}
          >
            <Scale className="w-3.5 h-3.5 text-indigo-300" />
            Math for Computing
          </span>
          <span
            className="intro-reveal-up inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-xs font-semibold text-emerald-200 backdrop-blur"
            style={{ animationDelay: '940ms' }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            Principles of Economics
          </span>
          <span
            className="intro-reveal-up inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/35 text-xs font-semibold text-sky-200 backdrop-blur"
            style={{ animationDelay: '1120ms' }}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-300" />
            Prob &amp; Statistics · SB
          </span>
        </div>

        {/* Progress Sweep Bar */}
        <div className="pt-2 flex flex-col items-center gap-2">
          <div className="w-56 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="intro-progress-fill w-full h-full rounded-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-sky-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Entering studio...
          </span>
        </div>
      </div>
    </div>
  );
};
