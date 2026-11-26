import React, { useState } from 'react';
import { Calendar, Flame, Pencil, Play, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildSmartFocusPlan, daysUntilExam, dispatchOpenFocus } from '../utils/smartFocusPlan';
import type { SubjectId } from '../types';

interface ExamReadinessStripProps {
  subject: SubjectId;
}

const ACCENT: Record<
  SubjectId,
  {
    wrap: string;
    pill: string;
    btn: string;
  }
> = {
  mfc: {
    wrap: 'bg-white dark:bg-slate-900 border-indigo-200/80 dark:border-indigo-900/60',
    pill: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/70',
    btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  econ: {
    wrap: 'bg-white dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-900/60',
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/70',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  probstat: {
    wrap: 'bg-white dark:bg-slate-900 border-sky-200/80 dark:border-sky-900/60',
    pill: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/70',
    btn: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
};

export const ExamReadinessStrip: React.FC<ExamReadinessStripProps> = ({ subject }) => {
  const { settings, progress, setExamDate } = useApp();
  const [editingDate, setEditingDate] = useState(false);

  const bilingual = settings.lang === 'bilingual';
  const examDateIso = progress.examDates?.[subject] ?? '';
  const daysLeft = daysUntilExam(examDateIso);
  const streakCount = progress.studyStreak?.count ?? 0;
  const plan = buildSmartFocusPlan(subject, progress);
  const cls = ACCENT[subject];

  const countdownLabel =
    daysLeft === null
      ? bilingual
        ? 'Đặt ngày thi'
        : 'Set Exam Date'
      : daysLeft > 1
        ? `${daysLeft}d left`
        : daysLeft === 1
          ? 'Tomorrow'
          : daysLeft === 0
            ? 'Exam Today!'
            : `Passed (${Math.abs(daysLeft)}d ago)`;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 ${cls.wrap}`}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {!editingDate ? (
            <button
              type="button"
              onClick={() => setEditingDate(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold cursor-pointer ${cls.pill}`}
              title="Set your target final exam date (synced to Cloud)"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{countdownLabel}</span>
              {examDateIso && (
                <span className="font-mono text-[10px] opacity-80">({examDateIso})</span>
              )}
              <Pencil className="w-3 h-3 opacity-60" />
            </button>
          ) : (
            <div className="inline-flex flex-wrap items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
              <input
                type="date"
                value={examDateIso}
                onChange={(e) => {
                  setExamDate(subject, e.target.value);
                  setEditingDate(false);
                }}
                className="bg-transparent text-xs font-mono focus:outline-none"
              />
              {examDateIso && (
                <button
                  type="button"
                  onClick={() => {
                    setExamDate(subject, '');
                    setEditingDate(false);
                  }}
                  className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold px-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditingDate(false)}
                className="text-[11px] text-slate-500 px-1 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {streakCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/70 text-amber-800 dark:text-amber-300 font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {streakCount}-day streak
            </span>
          )}

          {plan.dueMistakesCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 font-semibold">
              {plan.dueMistakesCount} mistake{plan.dueMistakesCount > 1 ? 's' : ''} queued
            </span>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Target className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <span>{bilingual ? plan.summaryVi : plan.summaryEn}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatchOpenFocus(subject)}
        className={`w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors shrink-0 ${cls.btn}`}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        Start Today&apos;s Smart Focus Drill
      </button>
    </div>
  );
};
