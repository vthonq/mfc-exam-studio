import React, { useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { ECON_GLOSSARY, ECON_KNOWLEDGE } from '../../data/economics';
import { ECON_TOPIC_META, type EconPageRoute, type EconTopicId } from '../../types';
import { MathFormula } from '../../components/Math';
import { BiText } from '../../components/BiText';
import { useApp } from '../../context/AppContext';

interface EconKnowledgePageProps {
  initialTopic?: EconTopicId;
  onNavigate: (route: EconPageRoute, query?: string) => void;
}

export const EconKnowledgePage: React.FC<EconKnowledgePageProps> = ({
  initialTopic,
  onNavigate,
}) => {
  const { settings } = useApp();
  const [filter, setFilter] = useState<'all' | 'glossary' | EconTopicId>(initialTopic ?? 'all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const cards = ECON_KNOWLEDGE.filter((c) => {
    if (filter !== 'all' && filter !== 'glossary' && c.topic !== filter) return false;
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.titleVi.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.chapterLabel.toLowerCase().includes(q)
    );
  });

  const glossary = ECON_GLOSSARY.filter(
    (g) =>
      !q ||
      g.en.toLowerCase().includes(q) ||
      g.vi.toLowerCase().includes(q) ||
      g.note.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Macroeconomics Cheat Sheets &amp; EN–VI Glossary
        </h1>
        <BiText
          en="All 12 ECO101 Final Exam chapters (Ch. 23–26, 28–35) distilled with formulas, exam traps, and Mankiw glossary."
          vi="Trọn bộ 12 chương thi cuối kỳ Kinh tế Vĩ mô (Ch. 23–26, 28–35) kèm công thức, bẫy thường gặp và từ điển Anh–Việt."
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All 12 Chapters
          </button>
          {(['part6', 'part7', 'part8', 'part9'] as EconTopicId[]).map((tid) => (
            <button
              key={tid}
              onClick={() => setFilter(tid)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                filter === tid ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {ECON_TOPIC_META[tid].code}
            </button>
          ))}
          <button
            onClick={() => setFilter('glossary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filter === 'glossary' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            EN–VI Glossary ({ECON_GLOSSARY.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters or terms..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
      </div>

      {filter !== 'glossary' ? (
        <div className="space-y-4">
          {cards.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {c.chapterLabel} · {ECON_TOPIC_META[c.topic].code}
                  </span>
                  <BiText en={c.title} vi={c.titleVi} className="text-base font-bold" />
                </div>
                {c.relatedLab && (
                  <button
                    onClick={() => onNavigate('labs', `tab=${c.relatedLab}`)}
                    className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
                  >
                    Open Lab →
                  </button>
                )}
              </div>

              <BiText en={c.summary} vi={c.summaryVi} className="text-sm leading-relaxed" />

              {c.formulas.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 overflow-x-auto">
                  {c.formulas.map((f, i) => (
                    <MathFormula key={i} tex={f} block />
                  ))}
                </div>
              )}

              {c.examTrap && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Exam Trap:</strong> {c.examTrap}
                    {settings.lang === 'bilingual' && c.examTrapVi && (
                      <div className="text-slate-600 dark:text-slate-300 mt-0.5">{c.examTrapVi}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-left text-xs uppercase text-slate-500">
                <th className="p-3">Part</th>
                <th className="p-3">English Term</th>
                <th className="p-3">Vietnamese (Tiếng Việt)</th>
                <th className="p-3">Key Meaning</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((g, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    {g.topic.toUpperCase()}
                  </td>
                  <td className="p-3 font-semibold">{g.en}</td>
                  <td className="p-3 text-indigo-700 dark:text-indigo-300 font-medium">{g.vi}</td>
                  <td className="p-3 text-xs text-slate-500 dark:text-slate-400">{g.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
