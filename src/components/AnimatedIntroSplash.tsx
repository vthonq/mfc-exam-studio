import React, { useCallback, useEffect, useRef, useState } from 'react';

export const REPLAY_SPLASH_EVENT = 'exam-studio:replay-splash';

export const AnimatedIntroSplash: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const exitingRef = useRef(false);
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
    if (exitingRef.current) return;
    exitingRef.current = true;
    clearTimers();
    setExiting(true);
    unmountTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
      exitingRef.current = false;
    }, 350);
  }, [clearTimers]);

  const scheduleAutoExit = useCallback(() => {
    clearTimers();
    exitTimerRef.current = window.setTimeout(() => {
      dismiss();
    }, 1850);
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
      exitingRef.current = false;
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
      className={`no-print fixed inset-0 z-[70] bg-slate-950 text-white flex items-center justify-center overflow-hidden select-none transition-opacity duration-350 ease-out ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Exam Studio Hub Intro"
    >
      {/* One soft, calm ambient glow */}
      <div
        className="absolute w-96 h-96 rounded-full bg-indigo-500/12 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Quiet Skip Button */}
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-5 right-5 z-10 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-slate-300 cursor-pointer transition-colors"
      >
        Skip
      </button>

      {/* Calm Minimal Center Stack */}
      <div className="relative z-10 max-w-md mx-auto px-6 text-center flex flex-col items-center space-y-4">
        <img
          src="./logo.png"
          alt="Exam Studio Hub"
          className="intro-logo-fade w-16 h-16 rounded-2xl object-cover shadow-lg ring-1 ring-white/15 bg-slate-900"
        />

        <div className="space-y-1.5">
          <h1
            className="intro-text-rise text-2xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ animationDelay: '120ms' }}
          >
            Exam Studio Hub
          </h1>
          <p
            className="intro-text-rise text-xs sm:text-sm text-slate-400"
            style={{ animationDelay: '220ms' }}
          >
            MFC · Macroeconomics · Prob &amp; Statistics
          </p>
        </div>

        <div className="pt-2 w-44 h-[3px] rounded-full bg-white/10 overflow-hidden">
          <div className="intro-progress-fill w-full h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400" />
        </div>

        <p
          className="intro-text-rise text-[11px] font-medium tracking-wide text-slate-500 pt-1"
          style={{ animationDelay: '300ms' }}
        >
          Built by <span className="text-slate-300 font-semibold">vthonq</span>
        </p>
      </div>
    </div>
  );
};
