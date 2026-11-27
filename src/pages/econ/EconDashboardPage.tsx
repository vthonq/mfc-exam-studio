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
import { ReadinessRing } from '../../components/ReadinessRing';

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
      <div className="studio-card relative overflow-hidden rounded-2xl p-6 lg:p-7">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> ECO101 Final Exam · Macroeconomics (Ch. 23–26, 28–35)
            </div>
            <h1 className="font-display text-2xl md:text-[30px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Macroeconomics Final Studio
            </h1>
            <BiText
              en="Built strictly for your UEH-ISB Final Exam (40%): 100 minutes · 30 Multiple-Choice Questions (50%) + 4 Short-Answer Policy Questions (50%) across Parts 6–9."
              vi="Tối ưu theo đề thi cuối kỳ ECO101 (40%): 100 phút · 30 câu trắc nghiệm (50%) + 4 câu tự luận phân tích chính sách (50%) thuộc Phần 6–9."
              className="text-sm text-slate-600 dark:text-slate-300"
              viClassName="text-xs text-slate-500 dark:text-slate-400 mt-1"
            />
          </div>

          <ReadinessRing
            pct={readiness}
            subject="econ"
            label="Macro Readiness"
            sublabel={`12 Chapters · ${ECON_MCQS.length} MCQs · ${ECON_SCENARIOS.length} Cases`}
          />
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('exam', `seed=${randomSeedCode()}&mode=final`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm cursor-pointer shadow-md shadow-emerald-500/20 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Start 100m Final Exam (30 MCQ + 4 Essay)
          </button>
          <button
            onClick={() => onNavigate('labs', `tab=${weakest.id as EconLabTab}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.1] text-slate-700 dark:text-slate-200 font-semibold text-sm cursor-pointer transition-colors"
          >
            Practice Weakest: {ECON_TOPIC_META[weakest.id].code} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ExamReadinessStrip subject="econ" />

      {/* 4 Official Macro Parts (Parts 6-9) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold">Final Exam Syllabus — Parts 6 to 9</h2>
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">4 Parts</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          {cards.map((c) => {
            const meta = ECON_TOPIC_META[c.id];
            return (
              <div
                key={c.id}
                className="studio-card-interactive rounded-2xl p-4 flex flex-col justify-between gap-3.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      {meta.code} · {meta.quizTag}
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
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <button
                      onClick={() => onNavigate('labs', `tab=${c.id as EconLabTab}`)}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                    >
                      Open {c.id.toUpperCase()} Lab →
                    </button>
                    <button
                      onClick={() => onNavigate('knowledge', `topic=${c.id}`)}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
              className="studio-card-interactive text-left rounded-2xl p-4 space-y-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="font-display font-bold text-sm">{card.title}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
            </button>
          );
        })}
      </div>

      {progress.econExamHistory.length > 0 && (
        <div className="studio-card rounded-2xl p-5 space-y-2.5">
          <h2 className="font-display text-sm font-bold flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" /> Recent Macroeconomics Exam History
          </h2>
          {progress.econExamHistory.slice(0, 5).map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between text-xs px-3 py-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] font-mono"
            >
              <span>
                Seed <strong>{ex.seed}</strong> ({ex.mode})
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {ex.score} / {ex.maxScore} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
