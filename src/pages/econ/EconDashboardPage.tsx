import React from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FlaskConical,
  HelpCircle,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ECON_KNOWLEDGE, ECON_MCQS, ECON_SCENARIOS } from '../../data/economics';
import { randomSeedCode } from '../../math/prng';
import {
  ECON_TOPIC_META,
  type EconLabTab,
  type EconPageRoute,
  type EconTopicId,
} from '../../types';
import { BiText } from '../../components/BiText';
import { ExamReadinessStrip } from '../../components/ExamReadinessStrip';

interface EconDashboardProps {
  onNavigate: (route: EconPageRoute, query?: string) => void;
}

const PART_LIST: EconTopicId[] = ['part6', 'part7', 'part8', 'part9'];

export const EconDashboardPage: React.FC<EconDashboardProps> = ({ onNavigate }) => {
  const { progress } = useApp();

  const cards = PART_LIST.map((id) => {
    const m = progress.econMastery[id] ?? { correct: 0, attempts: 0 };
    const pct = m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0;
    return { id, ...m, pct };
  });

  const attempted = cards.filter((c) => c.attempts > 0);
  const readiness =
    attempted.length > 0
      ? Math.round(attempted.reduce((s, c) => s + c.pct, 0) / PART_LIST.length)
      : 0;

  const weakest = [...cards].sort((a, b) => a.pct - b.pct || a.attempts - b.attempts)[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-900/60 text-slate-900 dark:text-slate-100 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> ECO101 Final Exam · Macroeconomics (Ch. 23–26, 28–35)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Macroeconomics Final Studio
            </h1>
            <BiText
              en="Built strictly for your UEH-ISB Final Exam (40%): 100 minutes · 30 Multiple-Choice Questions (50%) + 4 Short-Answer Policy Questions (50%) across Parts 6–9."
              vi="Tối ưu theo đề thi cuối kỳ ECO101 (40%): 100 phút · 30 câu trắc nghiệm (50%) + 4 câu tự luận phân tích chính sách (50%) thuộc Phần 6–9."
              className="text-sm text-slate-600 dark:text-slate-300"
              viClassName="text-xs text-slate-500 dark:text-slate-400 mt-1"
            />
          </div>

          <div className="bg-white/90 dark:bg-slate-950/60 rounded-2xl p-4 min-w-[200px] text-center border border-slate-200 dark:border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Macro Readiness
            </div>
            <div className="text-4xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
              {readiness}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              12 Chapters · {ECON_MCQS.length} MCQs · {ECON_SCENARIOS.length} Policy Cases
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('exam', `seed=${randomSeedCode()}&mode=final`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4" /> Start 100m Final Exam (30 MCQ + 4 Essay)
          </button>
          <button
            onClick={() => onNavigate('labs', `tab=${weakest.id as EconLabTab}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer transition-colors"
          >
            Practice Weakest: {ECON_TOPIC_META[weakest.id].code} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ExamReadinessStrip subject="econ" />

      {/* 4 Official Macro Parts (Parts 6-9) */}
      <div>
        <h2 className="text-base font-bold mb-3">Final Exam Syllabus — Parts 6 to 9</h2>
        <div className="grid sm:grid-cols-2 gap-3.5">
          {cards.map((c) => {
            const meta = ECON_TOPIC_META[c.id];
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {meta.code} · {meta.quizTag}
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
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <button
                      onClick={() => onNavigate('labs', `tab=${c.id as EconLabTab}`)}
                      className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
                    >
                      Open {c.id.toUpperCase()} Lab →
                    </button>
                    <button
                      onClick={() => onNavigate('knowledge', `topic=${c.id}`)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Chapter Notes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tutorial Quizzes & Tools */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            onClick: () => onNavigate('labs'),
            icon: FlaskConical,
            title: 'Macro Simulators',
            desc: 'GDP/CPI, Money Multiplier, Twin-Market FX SVG & AD–AS + Phillips SVG.',
          },
          {
            onClick: () => onNavigate('drill'),
            icon: HelpCircle,
            title: '42 MCQs & 8 Policy Essays',
            desc: 'Testbank across all 12 chapters + short-answer trainer with No-Key checks.',
          },
          {
            onClick: () => onNavigate('knowledge'),
            icon: BookOpen,
            title: `${ECON_KNOWLEDGE.length} Chapter Cheat Sheets`,
            desc: 'Every Macro chapter Ch. 23–35 formulas, exam traps & 45+ EN–VI terms.',
          },
          {
            onClick: () => onNavigate('exam', `seed=${randomSeedCode()}&mode=quiz3`),
            icon: ClipboardCheck,
            title: 'Tutorial Quizzes 3, 4, 5',
            desc: '25-min 20-MCQ drills matching your official ISB tutorial sessions.',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={i}
              onClick={card.onClick}
              className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl p-4 space-y-2 transition-colors cursor-pointer"
            >
              <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div className="font-bold text-sm">{card.title}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{card.desc}</p>
            </button>
          );
        })}
      </div>

      {progress.econExamHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
          <h2 className="text-sm font-bold">Recent Macroeconomics Exam History</h2>
          {progress.econExamHistory.slice(0, 5).map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono"
            >
              <span>
                Seed <strong>{ex.seed}</strong> ({ex.mode})
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {ex.score} / {ex.maxScore} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
