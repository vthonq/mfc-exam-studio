import React, { useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { GLOSSARY_TERMS, KNOWLEDGE_ITEMS } from '../data/knowledge';
import { CHAPTER_META, type ChapterId, type PageRoute } from '../types';
import { MathFormula } from '../components/Math';
import { BiText } from '../components/BiText';
import { useApp } from '../context/AppContext';

interface KnowledgePageProps {
  initialChapter?: ChapterId;
  onNavigate: (route: PageRoute, query?: string) => void;
}

export const KnowledgePage: React.FC<KnowledgePageProps> = ({
  initialChapter,
  onNavigate,
}) => {
  const { settings } = useApp();
  const [chapter, setChapter] = useState<'all' | 'glossary' | ChapterId>(
    initialChapter ?? 'all',
  );
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const filteredItems = KNOWLEDGE_ITEMS.filter((item) => {
    if (chapter !== 'all' && chapter !== 'glossary' && item.chapter !== chapter) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.titleVi.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.summaryVi.toLowerCase().includes(q)
    );
  });

  const filteredGlossary = GLOSSARY_TERMS.filter((g) => {
    if (!q) return true;
    return (
      g.en.toLowerCase().includes(q) ||
      g.vi.toLowerCase().includes(q) ||
      g.note.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Knowledge Base &amp; Exam Cheat Sheets</h1>
        <BiText
          en="Distilled from all 8 lecture slide decks (Chapters 1, 4, 9, 10, 11, 12) plus a searchable EN–VI glossary."
          vi="Tổng hợp công thức, định lý, bẫy thường gặp từ toàn bộ 8 bộ slide bài giảng và từ điển thuật ngữ Anh–Việt."
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setChapter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              chapter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Chapters
          </button>
          {(Object.keys(CHAPTER_META) as ChapterId[]).map((cid) => (
            <button
              key={cid}
              onClick={() => setChapter(cid)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                chapter === cid
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {CHAPTER_META[cid].code}
            </button>
          ))}
          <button
            onClick={() => setChapter('glossary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              chapter === 'glossary'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            EN–VI Glossary ({GLOSSARY_TERMS.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search theorems or terms..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
      </div>

      {chapter !== 'glossary' ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {CHAPTER_META[item.chapter].code} · §{item.section}
                  </span>
                  <BiText en={item.title} vi={item.titleVi} className="text-base font-bold" />
                </div>
                {item.relatedLab && (
                  <button
                    onClick={() => onNavigate('labs', `tab=${item.relatedLab}`)}
                    className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold cursor-pointer"
                  >
                    Practice in Lab →
                  </button>
                )}
              </div>

              <BiText en={item.summary} vi={item.summaryVi} className="text-sm leading-relaxed" />

              {item.formulas.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 overflow-x-auto">
                  {item.formulas.map((f, i) => (
                    <div key={i}>
                      <MathFormula tex={f} block />
                    </div>
                  ))}
                </div>
              )}

              {item.examTrap && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex gap-2 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Exam Trap:</strong> {item.examTrap}
                    {settings.lang === 'bilingual' && item.examTrapVi && (
                      <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                        {item.examTrapVi}
                      </div>
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
                <th className="p-3">Chapter</th>
                <th className="p-3">English Term</th>
                <th className="p-3">Vietnamese (Tiếng Việt)</th>
                <th className="p-3">Exam Meaning</th>
              </tr>
            </thead>
            <tbody>
              {filteredGlossary.map((g, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                    {CHAPTER_META[g.chapter].code}
                  </td>
                  <td className="p-3 font-semibold">{g.en}</td>
                  <td className="p-3 text-emerald-700 dark:text-emerald-400 font-medium">{g.vi}</td>
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
