import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildExplainQuestionPrompt, dispatchAskAi } from '../utils/askAiBridge';
import {
  buildSmartDrillQuestions,
  buildSmartFocusPlan,
  type SmartDrillQuestion,
} from '../utils/smartFocus';
import type { ChapterId, EconTopicId, ProbTopicId, SubjectId } from '../types';
import { RichMathText } from './Math';

interface SmartFocusModalProps {
  open: boolean;
  onClose: () => void;
  initialSubject: SubjectId;
}

const SUBJECT_TABS: Array<{ id: SubjectId; label: string; activeCls: string }> = [
  {
    id: 'mfc',
    label: 'MFC',
    activeCls: 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs',
  },
  {
    id: 'econ',
    label: 'Econ',
    activeCls: 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs',
  },
  {
    id: 'probstat',
    label: 'ProbStat',
    activeCls: 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs',
  },
];

export const SmartFocusModal: React.FC<SmartFocusModalProps> = ({
  open,
  onClose,
  initialSubject,
}) => {
  const {
    settings,
    progress,
    recordPractice,
    recordEconPractice,
    recordProbPractice,
    recordMistake,
    removeMistake,
  } = useApp();

  const bilingual = settings.lang === 'bilingual';
  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [questions, setQuestions] = useState<SmartDrillQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [clearedMistakes, setClearedMistakes] = useState(0);

  const startSession = (subj: SubjectId) => {
    setSubject(subj);
    setQuestions(buildSmartDrillQuestions(subj, progress, 8));
    setIdx(0);
    setPicked(null);
    setScore(0);
    setClearedMistakes(0);
  };

  useEffect(() => {
    if (open) {
      startSession(initialSubject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSubject]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const plan = buildSmartFocusPlan(subject, progress);
  const finished = questions.length > 0 && idx >= questions.length;
  const q = !finished ? questions[idx] : null;
  const total = questions.length;
  const progressPct = total > 0 ? Math.round((Math.min(idx, total) / total) * 100) : 0;

  const handleChoose = (ci: number) => {
    if (!q || picked !== null) return;
    setPicked(ci);
    const isCorrect = ci === q.correctIndex;

    if (q.subject === 'mfc') recordPractice(q.topicId as ChapterId, isCorrect);
    else if (q.subject === 'econ') recordEconPractice(q.topicId as EconTopicId, isCorrect);
    else recordProbPractice(q.topicId as ProbTopicId, isCorrect);

    if (isCorrect) {
      setScore((s) => s + 1);
      if (q.source === 'mistake' && q.mistakeId) {
        removeMistake(q.mistakeId);
        setClearedMistakes((c) => c + 1);
      }
    } else {
      recordMistake({
        id: q.mistakeId ?? `focus-${q.subject}-${q.id}`,
        subject: q.subject,
        topicLabel: q.topicCode,
        question: q.question,
        choices: q.choices,
        correctIndex: q.correctIndex,
        userAnswerText: q.choices[ci],
        explanation: q.explanation,
        source: 'mistake',
      });
    }
  };

  const handleNext = () => {
    setPicked(null);
    setIdx((cur) => cur + 1);
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Smart Focus Drill"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/70 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                Today&apos;s Smart Focus Drill
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {bilingual ? plan.summaryVi : plan.summaryEn}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            aria-label="Close Smart Focus Drill"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls & Progress */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/90">
              {SUBJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => startSession(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    subject === tab.id
                      ? tab.activeCls
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              {(progress.studyStreak?.count ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                  <Flame className="w-3 h-3 text-amber-500" />
                  {progress.studyStreak?.count}d
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
                Score: {score}/{Math.min(idx + (picked !== null ? 1 : 0), total)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>
              {finished ? `Done ${total}/${total}` : `Question ${Math.min(idx + 1, total)}/${total}`}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${finished ? 100 : progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {finished ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Smart Focus Session Complete — {score} / {total}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {clearedMistakes > 0
                    ? `Mastered & cleared ${clearedMistakes} Review Bank mistake${clearedMistakes > 1 ? 's' : ''}! Any newly missed items were saved for your next retry.`
                    : 'Your chapter mastery & study streak have been updated and synced.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startSession(subject)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Another 8-Question Drill
              </button>
            </div>
          ) : q ? (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {q.topicCode}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                    q.source === 'mistake'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {q.source === 'mistake' ? 'Review Bank Retry' : 'Weak Topic Focus'}
                </span>
              </div>

              <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                <RichMathText text={q.question} />
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                {q.choices.map((ch, ci) => {
                  const isCorrect = ci === q.correctIndex;
                  const isChosen = picked === ci;
                  let cls =
                    'border-slate-200 dark:border-slate-700 hover:border-indigo-400 bg-white dark:bg-slate-950/50';
                  if (picked !== null) {
                    if (isCorrect) {
                      cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-semibold';
                    } else if (isChosen) {
                      cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
                    } else {
                      cls = 'border-slate-200 dark:border-slate-800 opacity-70';
                    }
                  }
                  return (
                    <button
                      key={ci}
                      type="button"
                      disabled={picked !== null}
                      onClick={() => handleChoose(ci)}
                      className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${cls}`}
                    >
                      <span>
                        <strong>{String.fromCharCode(65 + ci)}.</strong> <RichMathText text={ch} />
                      </span>
                      {picked !== null && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {picked !== null && isChosen && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {picked !== null && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                  {picked === q.correctIndex && q.source === 'mistake' && (
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">
                      ✓ Cleared from your Review Bank!
                    </div>
                  )}
                  <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    <strong>Explanation:</strong> <RichMathText text={q.explanation} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        dispatchAskAi({
                          subject: q.subject,
                          prompt: buildExplainQuestionPrompt({
                            topicLabel: q.topicCode,
                            question: q.question,
                            userAnswer: q.choices[picked],
                            expectedAnswer: q.choices[q.correctIndex],
                            explanation: q.explanation,
                          }),
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Explain with AI
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {idx + 1 >= total ? 'Finish Session' : 'Next Question'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
