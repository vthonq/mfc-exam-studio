import React, { useState } from 'react';
import { BookOpen, Printer, Search, Table2 } from 'lucide-react';
import { PROB_CHAPTER_NOTES, PROB_GLOSSARY } from '../../data/probStat';
import { PROB_TOPIC_META, type ProbLabTab, type ProbPageRoute, type ProbTopicId } from '../../types';
import { MathFormula } from '../../components/Math';
import { BiText } from '../../components/BiText';

interface ProbKnowledgePageProps {
  initialTopic?: ProbTopicId;
  onNavigate: (route: ProbPageRoute, query?: string) => void;
}

const LAB_MAP: Record<ProbTopicId, ProbLabTab> = {
  'ps-ch1': 'discrete',
  'ps-ch2': 'continuous',
  'ps-ch3': 'bivariate',
  'ps-ch4': 'inference',
  'ps-ch5': 'inference',
};

export const ProbKnowledgePage: React.FC<ProbKnowledgePageProps> = ({
  initialTopic,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'glossary' | ProbTopicId>(initialTopic ?? 'all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const notes = PROB_CHAPTER_NOTES.filter((n) => {
    if (filter !== 'all' && filter !== 'glossary' && n.topic !== filter) return false;
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      n.titleVi.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      n.keyFormulas.some((f) => f.name.toLowerCase().includes(q) || f.note.toLowerCase().includes(q))
    );
  });

  const glossary = PROB_GLOSSARY.filter(
    (g) =>
      !q ||
      g.term.toLowerCase().includes(q) ||
      g.termVi.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-600" />
            Formula Sheet Builder &amp; EN–VI Glossary
          </h1>
          <BiText
            en="Everything you need to prepare your 2 A4 double-sided handwritten Final Exam formula sheets (and 1 A4 sheet for Midterm)."
            vi="Tổng hợp công thức chuẩn bị cho 2 tờ A4 viết tay (Thi cuối kỳ) và từ điển thuật ngữ XSTK Anh–Việt."
            className="text-sm text-slate-500 mt-0.5"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('tables')}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
          >
            <Table2 className="w-3.5 h-3.5" /> SB Tables
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Reference
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filter === 'all'
                ? 'bg-sky-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All 5 Chapters
          </button>
          {(['ps-ch1', 'ps-ch2', 'ps-ch3', 'ps-ch4', 'ps-ch5'] as ProbTopicId[]).map((tid) => (
            <button
              key={tid}
              onClick={() => setFilter(tid)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                filter === tid
                  ? 'bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {PROB_TOPIC_META[tid].code}
            </button>
          ))}
          <button
            onClick={() => setFilter('glossary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filter === 'glossary'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            EN–VI Glossary ({PROB_GLOSSARY.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search formulas or terms..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
      </div>

      {filter !== 'glossary' ? (
        <div className="space-y-4">
          {notes.map((c) => (
            <div
              key={c.topic}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-600">
                    {PROB_TOPIC_META[c.topic].examTag}
                  </span>
                  <BiText en={c.title} vi={c.titleVi} className="text-base font-bold" />
                </div>
                <button
                  onClick={() => onNavigate('labs', `tab=${LAB_MAP[c.topic]}`)}
                  className="px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-semibold cursor-pointer"
                >
                  Open Interactive Lab →
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{c.summary}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {c.keyFormulas.map((f) => (
                  <div
                    key={f.name}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
                  >
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.name}</div>
                    <MathFormula tex={f.latex} block className="text-sm" />
                    <div className="text-[11px] text-slate-500">{f.note}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                <strong>SB Tables Mapping:</strong> {c.sbTableTip}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {glossary.map((g) => (
            <div
              key={g.term}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm">{g.term}</div>
                <span className="text-[11px] font-mono text-sky-600">{PROB_TOPIC_META[g.chapter].code}</span>
              </div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{g.termVi}</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{g.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
