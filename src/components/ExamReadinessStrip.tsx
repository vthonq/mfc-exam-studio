import React, { useState } from 'react';
import { Calendar, Flame, Pencil, Play, Target, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildSmartFocusPlan, daysUntilExam, dispatchOpenFocus } from '../utils/smartFocusPlan';
import { dispatchOpenRoom } from '../utils/studyRoomStats';
import type { SubjectId } from '../types';

interface ExamReadinessStripProps {
  subject: SubjectId;
}

const ACCENT: Record<
  SubjectId,
  {
    bar: string;
    pill: string;
    btn: string;
  }
> = {
  mfc: {
    bar: 'bg-indigo-500',
    pill: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-500/25',
    btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20',
  },
  econ: {
    bar: 'bg-emerald-500',
    pill: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
  },
  probstat: {
    bar: 'bg-sky-500',
    pill: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/25',
    btn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-500/20',
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
    <div className="studio-card relative overflow-hidden rounded-2xl p-4 pl-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${cls.bar}`} aria-hidden="true" />
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {!editingDate ? (
            <button
              type="button"
              onClick={() => setEditingDate(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold cursor-pointer tabular-nums ${cls.pill}`}
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
                  className="text-[11px] text-rose-500 font-semibold px-1 cursor-pointer"
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/12 border border-amber-500/25 text-amber-700 dark:text-amber-300 font-semibold tabular-nums">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {streakCount}-day streak
            </span>
          )}

          {plan.dueMistakesCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/12 border border-rose-500/25 text-rose-600 dark:text-rose-300 font-semibold tabular-nums">
              {plan.dueMistakesCount} mistake{plan.dueMistakesCount > 1 ? 's' : ''} queued
            </span>
          )}
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Target className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
          <span>{bilingual ? plan.summaryVi : plan.summaryEn}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-nowrap items-stretch sm:items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => dispatchOpenRoom()}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-50/80 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          Study Rooms
        </button>
        <button
          type="button"
          onClick={() => dispatchOpenFocus(subject)}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0 ${cls.btn}`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Start Today&apos;s Smart Focus Drill
        </button>
      </div>
    </div>
  );
};
