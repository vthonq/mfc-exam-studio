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
import { ExamReadinessStrip } from '../components/ExamReadinessStrip';
import { ReadinessRing } from '../components/ReadinessRing';

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
      {/* Studio 5.0 Hero Bento */}
      <div className="studio-card relative overflow-hidden rounded-2xl p-6 lg:p-7">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/12 border border-indigo-500/25 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Mathematics for Computing — Final Exam Prep
            </div>
            <h1 className="font-display text-2xl md:text-[30px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Master Every Algorithm, Table &amp; Proof
            </h1>
            <BiText
              en="Built around your 6 course chapters and Assignments 1–4. Practice step-by-step derivations, train proofs, and share synced mock exams with your study group."
              vi="Xây dựng bám sát 6 chương học và 4 bài tập mẫu. Luyện giải từng bước, rèn chứng minh và chia sẻ đề thi thử đồng bộ cho cả nhóm."
              className="text-sm text-slate-600 dark:text-slate-300"
              viClassName="text-xs text-slate-500 dark:text-slate-400 mt-1"
            />
          </div>

          <ReadinessRing
            pct={readiness}
            subject="mfc"
            label="Exam Readiness"
            sublabel={`${doneAssignments}/${totalQuestions} Assign Qs · ${progress.completedProofs.length}/${PROOF_EXERCISES.length} Proofs`}
          />
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={launchGroupExam}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm cursor-pointer shadow-md shadow-indigo-500/20 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Start / Share Group Mock Exam
          </button>
          <button
            onClick={() => onNavigate('labs', `tab=${CHAPTER_TO_LAB[weakest.id]}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer transition-colors"
          >
            Practice Recommended: {CHAPTER_META[weakest.id].code} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ExamReadinessStrip subject="mfc" />

      {/* 6 Chapter Mastery Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold">Chapter Mastery Breakdown</h2>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">6 Chapters</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {chapterScores.map((c) => {
            const meta = CHAPTER_META[c.id];
            return (
              <div
                key={c.id}
                className="studio-card-interactive rounded-2xl p-4 flex flex-col justify-between gap-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                      {meta.code}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {c.attempts > 0 ? `${c.correct}/${c.attempts} (${c.pct}%)` : 'Not practiced'}
                    </span>
                  </div>
                  <BiText
                    en={meta.title}
                    vi={meta.titleVi}
                    className="font-semibold text-sm mt-2"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-white/[0.07] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <button
                      onClick={() => onNavigate('labs', `tab=${CHAPTER_TO_LAB[c.id]}`)}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Open Lab →
                    </button>
                    <button
                      onClick={() => onNavigate('knowledge', `chapter=${c.id}`)}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
              className="studio-card-interactive text-left rounded-2xl p-4 space-y-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/12 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="font-display font-bold text-sm">{card.title}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Recent Mock Exams */}
      {progress.examHistory.length > 0 && (
        <div className="studio-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-500" /> Recent Mock Exam History
            </h2>
          </div>
          <div className="space-y-2">
            {progress.examHistory.slice(0, 5).map((ex) => (
              <div
                key={ex.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs"
              >
                <div className="font-mono">
                  Seed <strong>{ex.seed}</strong> ({ex.mode}) — {new Date(ex.dateIso).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {ex.score} / {ex.maxScore} pts
                  </span>
                  <button
                    onClick={() => onNavigate('exam', `seed=${ex.seed}`)}
                    className="underline text-slate-500 hover:text-indigo-500 cursor-pointer"
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
