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

interface EconDashboardProps {
  onNavigate: (route: EconPageRoute, query?: string) => void;
}

const TOPIC_TO_LAB: Record<EconTopicId, EconLabTab> = {
  'macro-gdp-cpi': 'gdp-cpi',
  'macro-growth-saving-unemp': 'money-saving',
  'macro-money-inflation': 'money-saving',
  'macro-open-econ': 'open-econ',
  'macro-adas-policy-phillips': 'adas-phillips',
  'micro-supply-elasticity-tax': 'micro',
  'micro-costs-markets': 'micro',
};

export const EconDashboardPage: React.FC<EconDashboardProps> = ({ onNavigate }) => {
  const { progress } = useApp();
  const topics = Object.keys(ECON_TOPIC_META) as EconTopicId[];

  const cards = topics.map((id) => {
    const m = progress.econMastery[id] ?? { correct: 0, attempts: 0 };
    const pct = m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0;
    return { id, ...m, pct };
  });

  const attempted = cards.filter((c) => c.attempts > 0);
  const readiness =
    attempted.length > 0
      ? Math.round(attempted.reduce((s, c) => s + c.pct, 0) / topics.length)
      : 0;

  const weakest = [...cards].sort((a, b) => a.pct - b.pct || a.attempts - b.attempts)[0];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Principles of Economics — Macro Final &amp; Micro Midterm
            </div>
            <div className="flex items-center gap-3">
              <img
                src="./logo.gif"
                alt="Exam Studio Logo"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/40 shadow-md shrink-0"
              />
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Economics Studio (Macro + Micro)
              </h1>
            </div>
            <BiText
              en="Built from Mankiw’s textbook & your ISB Macro Final (Ch. 23–35) and Micro Midterm (Ch. 1–21) handbooks — with live AD–AS, Twin-Market, and Supply/Demand SVG models."
              vi="Tổng hợp theo giáo trình Mankiw và 2 cuốn Handbook Kinh tế Vĩ mô (Ch. 23–35) + Vi mô (Ch. 1–21), kèm đồ thị tương tác AD–AS, Kinh tế mở và Cung–Cầu."
              className="text-sm text-emerald-50"
              viClassName="text-xs text-emerald-100/90 mt-1"
            />
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 min-w-[190px] text-center border border-white/15">
            <div className="text-xs uppercase tracking-wider text-emerald-100">Econ Readiness</div>
            <div className="text-4xl font-extrabold mt-1">{readiness}%</div>
            <div className="text-[11px] text-emerald-100 mt-1">
              {ECON_MCQS.length} MCQs · {ECON_SCENARIOS.length} Policy Cases · {ECON_KNOWLEDGE.length} Guides
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('exam', `seed=${randomSeedCode()}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-800 font-semibold text-sm hover:bg-emerald-50 cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Start / Share Group Econ Exam
          </button>
          <button
            onClick={() => onNavigate('labs', `tab=${TOPIC_TO_LAB[weakest.id]}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/40 hover:bg-emerald-500/60 border border-white/20 text-white font-semibold text-sm cursor-pointer"
          >
            Practice Next: {ECON_TOPIC_META[weakest.id].code} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold mb-3">Macro Final &amp; Micro Midterm Mastery</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cards.map((c) => {
            const meta = ECON_TOPIC_META[c.id];
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {meta.scope} · {meta.code}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {c.attempts > 0 ? `${c.correct}/${c.attempts} (${c.pct}%)` : 'New'}
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
                      onClick={() => onNavigate('labs', `tab=${TOPIC_TO_LAB[c.id]}`)}
                      className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
                    >
                      Open Lab →
                    </button>
                    <button
                      onClick={() => onNavigate('knowledge', `topic=${c.id}`)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Summary
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            route: 'labs' as EconPageRoute,
            icon: FlaskConical,
            title: 'Interactive Econ Labs',
            desc: 'GDP/CPI tables, Money Multiplier, Twin Markets, AD–AS + Phillips, and Tax/Monopoly.',
          },
          {
            route: 'drill' as EconPageRoute,
            icon: HelpCircle,
            title: 'Testbank & Policy Drills',
            desc: 'ISB Handbook MCQs with EN+VI explanations + Policy Essays with Copy Prompt.',
          },
          {
            route: 'knowledge' as EconPageRoute,
            icon: BookOpen,
            title: 'Macro & Micro Cheat Sheets',
            desc: 'All key formulas, exam traps & 30+ EN–VI Economics terms.',
          },
          {
            route: 'exam' as EconPageRoute,
            icon: ClipboardCheck,
            title: 'Mock Econ Exam',
            desc: 'Choose Macro Final, Micro Midterm, or Combined — shareable group seed link.',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.route}
              onClick={() => onNavigate(card.route)}
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
          <h2 className="text-sm font-bold">Recent Economics Mock Exams</h2>
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
