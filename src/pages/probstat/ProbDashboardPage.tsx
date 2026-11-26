import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Share2,
  Table2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PROB_MIDTERM_MCQS, PROB_PROBLEM_SETS } from '../../data/probStat';
import { randomSeedCode } from '../../math/prng';
import {
  PROB_TOPIC_META,
  type ProbLabTab,
  type ProbPageRoute,
  type ProbTopicId,
} from '../../types';
import { BiText } from '../../components/BiText';

interface ProbDashboardProps {
  onNavigate: (route: ProbPageRoute, query?: string) => void;
}

const TOPICS: ProbTopicId[] = ['ps-ch1', 'ps-ch2', 'ps-ch3', 'ps-ch4', 'ps-ch5'];

const LAB_FOR_TOPIC: Record<ProbTopicId, ProbLabTab> = {
  'ps-ch1': 'discrete',
  'ps-ch2': 'continuous',
  'ps-ch3': 'bivariate',
  'ps-ch4': 'inference',
  'ps-ch5': 'inference',
};

export const ProbDashboardPage: React.FC<ProbDashboardProps> = ({ onNavigate }) => {
  const { progress } = useApp();

  const cards = TOPICS.map((id) => {
    const m = progress.probMastery[id] ?? { correct: 0, attempts: 0 };
    const pct = m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0;
    return { id, ...m, pct };
  });

  const attempted = cards.filter((c) => c.attempts > 0);
  const readiness =
    attempted.length > 0
      ? Math.round(attempted.reduce((s, c) => s + c.pct, 0) / TOPICS.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-50/70 via-white to-white dark:from-sky-950/30 dark:via-slate-900 dark:to-slate-900 border border-sky-200/70 dark:border-sky-900/60 text-slate-900 dark:text-slate-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100/80 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" /> UEH-ISB · Dr. Trần Minh Hoàng · Chapters 1–5 + SB Tables
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Probability &amp; Statistical Methods
            </h1>
            <BiText
              en="Final Exam: 100 min · 5 Written Step-by-Step Questions (NO MCQs — partial credit for methodology; 2 A4 formula sheets + SB Tables allowed). Midterm: 60 min · 20 MCQs (Ch. 1–3)."
              vi="Thi Cuối kỳ: 100 phút · 5 câu tự luận trình bày đủ bước (không trắc nghiệm; được mang 2 tờ A4 viết tay + bảng SB). Giữa kỳ: 60 phút · 20 câu trắc nghiệm (Ch. 1–3)."
              className="text-sm text-slate-600 dark:text-slate-300"
              viClassName="text-xs text-slate-500 dark:text-slate-400 mt-1"
            />
          </div>

          <div className="bg-white/90 dark:bg-slate-950/60 rounded-2xl p-4 min-w-[210px] text-center border border-slate-200 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Course Readiness
            </div>
            <div className="text-4xl font-extrabold mt-1 text-sky-600 dark:text-sky-400">
              {readiness}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {PROB_PROBLEM_SETS.length} Key PS Problems · {PROB_MIDTERM_MCQS.length} Midterm MCQs
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('tables')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 cursor-pointer shadow-xs transition-colors"
          >
            <Table2 className="w-4 h-4" /> Open Easy SB Statistical Tables
          </button>
          <button
            onClick={() => onNavigate('exam', `seed=${randomSeedCode()}&mode=final`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm cursor-pointer shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4" /> Start 100m Written Final (5 Qs)
          </button>
          <button
            onClick={() => onNavigate('exam', `seed=${randomSeedCode()}&mode=midterm`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer transition-colors"
          >
            60m Midterm (20 MCQs) <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chapter Mastery Grid */}
      <div>
        <h2 className="text-base font-bold mb-3">Syllabus Breakdown — Chapters 1 to 5</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cards.map((c) => {
            const meta = PROB_TOPIC_META[c.id];
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      {meta.code} · {meta.examTag}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {c.attempts > 0 ? `${c.correct}/${c.attempts} (${c.pct}%)` : 'Not practiced'}
                    </span>
                  </div>
                  <BiText en={meta.title} vi={meta.titleVi} className="font-semibold text-sm mt-1" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full transition-all"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <button
                      onClick={() => onNavigate('labs', `tab=${LAB_FOR_TOPIC[c.id]}`)}
                      className="text-sky-600 dark:text-sky-400 font-medium hover:underline cursor-pointer"
                    >
                      Open Lab →
                    </button>
                    <button
                      onClick={() => onNavigate('knowledge', `topic=${c.id}`)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Formula Sheet
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            onClick: () => onNavigate('tables'),
            icon: Table2,
            color: 'text-amber-600',
            title: 'Easy SB Stat Tables',
            sub: 'C-1, C-2, t, χ² & F lookup + drills',
          },
          {
            onClick: () => onNavigate('labs'),
            icon: FlaskConical,
            color: 'text-sky-600',
            title: 'Distribution & Inference Labs',
            sub: 'Discrete, Normal/Exp, Joint, CI & Tests',
          },
          {
            onClick: () => onNavigate('problems'),
            icon: FileText,
            color: 'text-indigo-600',
            title: 'Problem Sets 1–5',
            sub: `${progress.completedProbProblems.length}/${PROB_PROBLEM_SETS.length} solved with checks`,
          },
          {
            onClick: () => onNavigate('knowledge'),
            icon: BookOpen,
            color: 'text-emerald-600',
            title: '2-Page A4 Formula Helper',
            sub: 'Clean cheat sheets & EN–VI terms',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={card.onClick}
              className="text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 transition-colors cursor-pointer space-y-2"
            >
              <Icon className={`w-5 h-5 ${card.color}`} />
              <div className="font-bold text-sm">{card.title}</div>
              <div className="text-xs text-slate-500">{card.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Recent History */}
      {progress.probExamHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="font-bold text-sm flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-sky-600" /> Recent Prob &amp; Stat Mock Attempts
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {progress.probExamHistory.slice(0, 6).map((rec) => (
              <div
                key={rec.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold uppercase">{rec.mode} · Seed {rec.seed}</div>
                  <div className="text-slate-500">{new Date(rec.dateIso).toLocaleDateString()}</div>
                </div>
                <div className="font-mono font-bold text-sky-600">
                  {rec.score}/{rec.maxScore}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
