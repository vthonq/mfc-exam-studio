import React from 'react';
import { ArrowDown, Clock } from 'lucide-react';

interface ExamStickyBarProps {
  secondsLeft: number;
  answeredCount: number;
  totalCount: number;
  accent: 'indigo' | 'emerald' | 'sky';
  label?: string;
  onJumpToSubmit: () => void;
  extraAction?: React.ReactNode;
}

const ACCENT_STYLES: Record<
  ExamStickyBarProps['accent'],
  { bar: string; btn: string }
> = {
  indigo: {
    bar: 'bg-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  emerald: {
    bar: 'bg-emerald-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  sky: {
    bar: 'bg-sky-600',
    btn: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
};

export const ExamStickyBar: React.FC<ExamStickyBarProps> = ({
  secondsLeft,
  answeredCount,
  totalCount,
  accent,
  label,
  onJumpToSubmit,
  extraAction,
}) => {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = totalCount > 0 ? Math.min(100, Math.round((answeredCount / totalCount) * 100)) : 0;

  const timerTone =
    secondsLeft < 180
      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 animate-pulse'
      : secondsLeft < 600
        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
        : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100';

  const styles = ACCENT_STYLES[accent];

  return (
    <div className="no-print sticky top-[98px] md:top-[68px] z-10 rounded-xl studio-glass border border-slate-200/90 dark:border-white/[0.1] shadow-md px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold tabular-nums ${timerTone}`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
        {label && (
          <span className="hidden sm:inline text-xs font-mono text-slate-500 dark:text-slate-400">
            {label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
          {answeredCount} / {totalCount} answered
        </span>
        <div
          className="w-20 sm:w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${styles.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {extraAction}
        <button
          type="button"
          onClick={onJumpToSubmit}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${styles.btn}`}
        >
          <span>Finish / Submit</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
