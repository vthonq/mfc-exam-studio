import React from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Scale,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ASSIGNMENTS } from '../data/assignments';
import { PROOF_EXERCISES } from '../data/proofs';
import { randomSeedCode } from '../math/prng';
import { CHAPTER_META, type ChapterId, type LabTab, type PageRoute } from '../types';
import { BiText } from '../components/BiText';

interface DashboardPageProps {
  onNavigate: (route: PageRoute, query?: string) => void;
}

const CHAPTER_TO_LAB: Record<ChapterId, LabTab> = {
  ch1: 'logic',
  ch4: 'number-theory',
  ch9: 'relations',
  ch10: 'graphs-trees',
  ch11: 'graphs-trees',
  ch12: 'boolean',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { progress } = useApp();
  const chapters = Object.keys(CHAPTER_META) as ChapterId[];

  const totalQuestions = ASSIGNMENTS.reduce((s, a) => s + a.questions.length, 0);
  const doneAssignments = progress.completedAssignments.length;

  const chapterScores = chapters.map((id) => {
    const m = progress.mastery[id];
    const pct = m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0;
    return { id, ...m, pct };
  });

  const overallAttempted = chapterScores.filter((c) => c.attempts > 0);
  const readiness =
    overallAttempted.length > 0
      ? Math.round(
          overallAttempted.reduce((s, c) => s + c.pct, 0) / chapters.length,
        )
      : 0;

  const weakest = [...chapterScores].sort((a, b) => a.pct - b.pct || a.attempts - b.attempts)[0];

  const launchGroupExam = () => {
    const seed = randomSeedCode();
    onNavigate('exam', `seed=${seed}`);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-white dark:from-indigo-950/35 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-900/60 text-slate-900 dark:text-slate-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Mathematics for Computing — Final Exam Prep
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Master Every Algorithm, Table &amp; Proof
            </h1>
            <BiText
              en="Built around your 6 course chapters and Assignments 1–4. Practice step-by-step derivations, train proofs, and share synced mock exams with your study group."
              vi="Xây dựng bám sát 6 chương học và 4 bài tập mẫu. Luyện giải từng bước, rèn chứng minh và chia sẻ đề thi thử đồng bộ cho cả nhóm."
              className="text-sm text-slate-600 dark:text-slate-300"
              viClassName="text-xs text-slate-500 dark:text-slate-400 mt-1"
            />
          </div>

          <div className="bg-white/90 dark:bg-slate-950/60 rounded-2xl p-4 min-w-[190px] text-center border border-slate-200 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Exam Readiness
            </div>
            <div className="text-4xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">
              {readiness}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {doneAssignments}/{totalQuestions} Assignment Qs · {progress.completedProofs.length}/
              {PROOF_EXERCISES.length} Proofs
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={launchGroupExam}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm cursor-pointer shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4" /> Start / Share Group Mock Exam
          </button>
          <button
            onClick={() => onNavigate('labs', `tab=${CHAPTER_TO_LAB[weakest.id]}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer transition-colors"
          >
            Practice Recommended: {CHAPTER_META[weakest.id].code} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Chapter Mastery Grid */}
      <div>
        <h2 className="text-base font-bold mb-3">Chapter Mastery Breakdown</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {chapterScores.map((c) => {
            const meta = CHAPTER_META[c.id];
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {meta.code}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {c.attempts > 0 ? `${c.correct}/${c.attempts} (${c.pct}%)` : 'Not practiced yet'}
                    </span>
                  </div>
                  <BiText
                    en={meta.title}
                    vi={meta.titleVi}
                    className="font-semibold text-sm mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <button
                      onClick={() => onNavigate('labs', `tab=${CHAPTER_TO_LAB[c.id]}`)}
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                    >
                      Open Lab →
                    </button>
                    <button
                      onClick={() => onNavigate('knowledge', `chapter=${c.id}`)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Cheat Sheet
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Study Modes */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            route: 'labs' as PageRoute,
            icon: FlaskConical,
            title: 'Interactive Labs',
            desc: 'Truth tables, ModExp, ExtGCD, Warshall, Dijkstra, Prim/Kruskal & K-Maps.',
          },
          {
            route: 'proofs' as PageRoute,
            icon: Scale,
            title: 'Proofs Trainer',
            desc: 'Scrambled Parsons proofs, rule pickers, rubric self-check & optional AI grader.',
          },
          {
            route: 'assignments' as PageRoute,
            icon: FileText,
            title: 'Assignments 1–4',
            desc: 'All teacher questions with progressive hints and verified full derivations.',
          },
          {
            route: 'knowledge' as PageRoute,
            icon: BookOpen,
            title: 'Knowledge & Glossary',
            desc: 'All 6 chapters distilled into exam formulas, traps & EN–VI math terms.',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.route}
              onClick={() => onNavigate(card.route)}
              className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-2xl p-4 space-y-2 transition-colors cursor-pointer"
            >
              <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="font-bold text-sm">{card.title}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{card.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Recent Mock Exams */}
      {progress.examHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" /> Recent Mock Exam History
            </h2>
          </div>
          <div className="space-y-2">
            {progress.examHistory.slice(0, 5).map((ex) => (
              <div
                key={ex.id}
                className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
              >
                <div className="font-mono">
                  Seed <strong>{ex.seed}</strong> ({ex.mode}) — {new Date(ex.dateIso).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {ex.score} / {ex.maxScore} pts
                  </span>
                  <button
                    onClick={() => onNavigate('exam', `seed=${ex.seed}`)}
                    className="underline text-slate-500 hover:text-indigo-600 cursor-pointer"
                  >
                    Retake
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
