import React, { useState } from 'react';
import { CheckCircle2, Circle, Eye, HelpCircle } from 'lucide-react';
import { ASSIGNMENTS } from '../data/assignments';
import { useApp } from '../context/AppContext';
import type { LabTab, PageRoute } from '../types';
import { BiText } from '../components/BiText';

interface AssignmentsPageProps {
  onNavigate: (route: PageRoute, query?: string) => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ onNavigate }) => {
  const { settings, progress, toggleAssignmentDone } = useApp();
  const [activeId, setActiveId] = useState<'a1' | 'a2' | 'a3' | 'a4'>('a1');
  const [openHints, setOpenHints] = useState<Record<string, number>>({});
  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});

  const doc = ASSIGNMENTS.find((a) => a.id === activeId) ?? ASSIGNMENTS[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Assignments 1–4 Reference</h1>
        <BiText
          en="Exact teacher reference questions with progressive hints, verified step-by-step solutions, and direct jumps to interactive Labs."
          vi="Toàn bộ 4 bài tập mẫu của giảng viên kèm gợi ý từng bước và lời giải chi tiết đã kiểm chứng."
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {ASSIGNMENTS.map((a) => {
          const doneCount = a.questions.filter((q) =>
            progress.completedAssignments.includes(q.id),
          ).length;
          return (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer flex items-center gap-2 ${
                activeId === a.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{a.title.split(' — ')[0]}</span>
              <span className="text-xs opacity-75 font-mono">
                {doneCount}/{a.questions.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-bold text-base">{doc.title}</div>
          {settings.lang === 'bilingual' && (
            <div className="text-xs text-slate-600 dark:text-slate-300">{doc.titleVi}</div>
          )}
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800">
          {doc.totalPoints}
        </span>
      </div>

      <div className="space-y-4">
        {doc.questions.map((q) => {
          const isDone = progress.completedAssignments.includes(q.id);
          const shownHints = openHints[q.id] ?? 0;
          const solVisible = Boolean(openSolutions[q.id]);

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {q.label}
                  </span>
                  <h3 className="text-base font-bold">{q.title}</h3>
                </div>
                <button
                  onClick={() => toggleAssignmentDone(q.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {isDone ? 'Mastered' : 'Mark Done'}
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl">
                {q.prompt}
              </pre>
              {settings.lang === 'bilingual' && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <strong>Tóm tắt (VI):</strong> {q.promptVi}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {shownHints < q.hints.length && (
                  <button
                    onClick={() =>
                      setOpenHints((prev) => ({ ...prev, [q.id]: (prev[q.id] ?? 0) + 1 }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Hint ({shownHints}/{q.hints.length})
                  </button>
                )}
                <button
                  onClick={() =>
                    setOpenSolutions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> {solVisible ? 'Hide Solution' : 'Show Full Solution'}
                </button>
                {q.relatedLab && (
                  <button
                    onClick={() => onNavigate('labs', `tab=${q.relatedLab as LabTab}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:text-indigo-600 cursor-pointer"
                  >
                    Practice in Lab →
                  </button>
                )}
                {q.relatedProofId && (
                  <button
                    onClick={() => onNavigate('proofs', `id=${q.relatedProofId}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:text-indigo-600 cursor-pointer"
                  >
                    Open in Proofs Trainer →
                  </button>
                )}
              </div>

              {shownHints > 0 && (
                <div className="space-y-1.5">
                  {q.hints.slice(0, shownHints).map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs"
                    >
                      <strong>Hint {i + 1}:</strong> {h}
                    </div>
                  ))}
                </div>
              )}

              {solVisible && (
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                    Verified Step-by-Step Solution
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {q.solution}
                  </pre>
                  {settings.lang === 'bilingual' && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                      <strong>Ghi chú (VI):</strong> {q.solutionVi}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
