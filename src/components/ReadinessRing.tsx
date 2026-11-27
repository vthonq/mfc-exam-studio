import React from 'react';
import type { SubjectId } from '../types';

interface ReadinessRingProps {
  pct: number;
  label: string;
  sublabel: string;
  subject: SubjectId;
  size?: number;
  strokeWidth?: number;
}

const SUBJECT_STROKE: Record<
  SubjectId,
  { stroke: string; glow: string; text: string; track: string }
> = {
  mfc: {
    stroke: '#6366f1',
    glow: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.45))',
    text: 'text-indigo-600 dark:text-indigo-400',
    track: 'stroke-indigo-500/15 dark:stroke-indigo-400/15',
  },
  econ: {
    stroke: '#10b981',
    glow: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.45))',
    text: 'text-emerald-600 dark:text-emerald-400',
    track: 'stroke-emerald-500/15 dark:stroke-emerald-400/15',
  },
  probstat: {
    stroke: '#0ea5e9',
    glow: 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.45))',
    text: 'text-sky-600 dark:text-sky-400',
    track: 'stroke-sky-500/15 dark:stroke-sky-400/15',
  },
};

export const ReadinessRing: React.FC<ReadinessRingProps> = ({
  pct,
  label,
  sublabel,
  subject,
  size = 94,
  strokeWidth = 7,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;
  const accent = SUBJECT_STROKE[subject];

  return (
    <div className="studio-card rounded-2xl px-4 py-3.5 min-w-[215px] flex items-center gap-3.5 shrink-0">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={accent.track}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accent.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: clamped > 0 ? accent.glow : undefined,
              transition: 'stroke-dashoffset 500ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-display text-xl font-extrabold tabular-nums ${accent.text}`}>
            {clamped}%
          </span>
        </div>
      </div>

      <div className="min-w-0 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug tabular-nums">
          {sublabel}
        </div>
      </div>
    </div>
  );
};
