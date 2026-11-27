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
import { ExamReadinessStrip } from '../../components/ExamReadinessStrip';
import { ReadinessRing } from '../../components/ReadinessRing';

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
      {/* Studio 5.0 Hero Banner */}
      <div className="studio-card relative overflow-hidden rounded-2xl p-6 lg:p-7">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/12 border border-sky-500/25 text-sky-700 dark:text-sky-300 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" /> UEH-ISB · Dr. Trần Minh Hoàng · Chapters 1–5 + SB Tables
            </div>
            <h1 className="font-display text-2xl md:text-[30px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Probability &amp; Statistical Methods
            </h1>
            <BiText
              en="Final Exam: 100 min · 5 Written Step-by-Step Questions (NO MCQs — partial credit for methodology; 2 A4 formula sheets + SB Tables allowed). Midterm: 60 min · 20 MCQs (Ch. 1–3)."
              vi="Thi Cuối kỳ: 100 phút · 5 câu tự luận trình bày đủ bước (không trắc nghiệm; được mang 2 tờ A4 viết tay + bảng SB). Giữa kỳ: 60 phút · 20 câu trắc nghiệm (Ch. 1–3)."
              className="text-sm text-slate-600 dark:text-slate-300"
              viClassName="text-xs text-slate-500 dark:text-slate-400 mt-1"
            />
          </div>

          <ReadinessRing
            pct={readiness}
            subject="probstat"
            label="Course Readiness"
            sublabel={`${PROB_PROBLEM_SETS.length} Key PS Problems · ${PROB_MIDTERM_MCQS.length} MCQs`}
          />
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('tables')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 cursor-pointer shadow-md shadow-amber-500/15 transition-colors"
          >
            <Table2 className="w-4 h-4" /> Open Easy SB Statistical Tables
          </button>
          <button
            onClick={() => onNavigate('exam', `seed=${randomSeedCode()}&mode=final`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm cursor-pointer shadow-md shadow-sky-500/20 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Start 100m Written Final (5 Qs)
          </button>
          <button
            onClick={() => onNavigate('exam', `seed=${randomSeedCode()}&mode=midterm`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer transition-colors"
          >
            60m Midterm (20 MCQs) <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ExamReadinessStrip subject="probstat" />

      {/* Chapter Mastery Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold">Syllabus Breakdown — Chapters 1 to 5</h2>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">5 Chapters</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cards.map((c) => {
            const meta = PROB_TOPIC_META[c.id];
            return (
              <div
                key={c.id}
                className="studio-card-interactive rounded-2xl p-4 flex flex-col justify-between gap-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                      {meta.code} · {meta.examTag}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {c.attempts > 0 ? `${c.correct}/${c.attempts} (${c.pct}%)` : 'Not practiced'}
                    </span>
                  </div>
                  <BiText en={meta.title} vi={meta.titleVi} className="font-semibold text-sm mt-2" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-1.5 rounded-full bg-slate-200/80 dark:bg-white/[0.07] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <button
                      onClick={() => onNavigate('labs', `tab=${LAB_FOR_TOPIC[c.id]}`)}
                      className="text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
                    >
                      Open Lab →
                    </button>
                    <button
                      onClick={() => onNavigate('knowledge', `topic=${c.id}`)}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
            bg: 'bg-amber-500/12 border-amber-500/20',
            color: 'text-amber-500',
            title: 'Easy SB Stat Tables',
            sub: 'C-1, C-2, t, χ² & F lookup + drills',
          },
          {
            onClick: () => onNavigate('labs'),
            icon: FlaskConical,
            bg: 'bg-sky-500/12 border-sky-500/20',
            color: 'text-sky-500',
            title: 'Distribution & Inference Labs',
            sub: 'Discrete, Normal/Exp, Joint, CI & Tests',
          },
          {
            onClick: () => onNavigate('problems'),
            icon: FileText,
            bg: 'bg-indigo-500/12 border-indigo-500/20',
            color: 'text-indigo-500',
            title: 'Problem Sets 1–5',
            sub: `${progress.completedProbProblems.length}/${PROB_PROBLEM_SETS.length} solved with checks`,
          },
          {
            onClick: () => onNavigate('knowledge'),
            icon: BookOpen,
            bg: 'bg-emerald-500/12 border-emerald-500/20',
            color: 'text-emerald-500',
            title: '2-Page A4 Formula Helper',
            sub: 'Clean cheat sheets & EN–VI terms',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={card.onClick}
              className="studio-card-interactive text-left p-4 rounded-2xl cursor-pointer space-y-2.5"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="font-display font-bold text-sm">{card.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.sub}</div>
            </button>
          );
        })}
      </div>

      {/* Recent History */}
      {progress.probExamHistory.length > 0 && (
        <div className="studio-card rounded-2xl p-5 space-y-3">
          <div className="font-display font-bold text-sm flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-sky-500" /> Recent Prob &amp; Stat Mock Attempts
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {progress.probExamHistory.slice(0, 6).map((rec) => (
              <div
                key={rec.id}
                className="px-3 py-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold uppercase">{rec.mode} · Seed {rec.seed}</div>
                  <div className="text-slate-500 dark:text-slate-400">{new Date(rec.dateIso).toLocaleDateString()}</div>
                </div>
                <div className="font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">
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
