import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  RotateCcw,
  Shuffle,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dispatchAskAi } from '../utils/askAiBridge';
import {
  buildFlashcardDeck,
  type FlashcardDeckKind,
  type FlashcardItem,
} from '../utils/flashcards';
import type { SubjectId } from '../types';
import { MathFormula, RichMathText } from './Math';

interface FlashcardsModalProps {
  open: boolean;
  onClose: () => void;
  initialSubject: SubjectId;
}

const SUBJECT_TABS: Array<{ id: SubjectId; label: string; activeCls: string }> = [
  {
    id: 'mfc',
    label: 'MFC',
    activeCls: 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs',
  },
  {
    id: 'econ',
    label: 'Econ',
    activeCls: 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs',
  },
  {
    id: 'probstat',
    label: 'ProbStat',
    activeCls: 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs',
  },
];

function shuffleCards<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  open,
  onClose,
  initialSubject,
}) => {
  const { settings } = useApp();
  const bilingual = settings.lang === 'bilingual';

  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [deckKind, setDeckKind] = useState<FlashcardDeckKind>('formulas');
  const [queue, setQueue] = useState<FlashcardItem[]>([]);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());
  const [flipped, setFlipped] = useState(false);

  const baseDeck = useMemo(
    () => buildFlashcardDeck(subject, deckKind, bilingual),
    [subject, deckKind, bilingual],
  );

  const resetDeck = useCallback(
    (shuffled = false) => {
      setQueue(shuffled ? shuffleCards(baseDeck) : baseDeck);
      setMasteredIds(new Set());
      setFlipped(false);
    },
    [baseDeck],
  );

  useEffect(() => {
    if (open) {
      setSubject(initialSubject);
    }
  }, [open, initialSubject]);

  useEffect(() => {
    resetDeck(false);
  }, [resetDeck]);

  const currentCard = queue[0] ?? null;
  const totalCount = baseDeck.length;
  const masteredCount = masteredIds.size;
  const progressPct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  const handleGotIt = useCallback(() => {
    if (!currentCard) return;
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
    setQueue((prev) => prev.slice(1));
    setFlipped(false);
  }, [currentCard]);

  const handleReviewAgain = useCallback(() => {
    if (!currentCard) return;
    setQueue((prev) => (prev.length <= 1 ? prev : [...prev.slice(1), prev[0]]));
    setFlipped(false);
  }, [currentCard]);

  const handlePrevPeek = useCallback(() => {
    setQueue((prev) => (prev.length <= 1 ? prev : [prev[prev.length - 1], ...prev.slice(0, -1)]));
    setFlipped(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (isTyping) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && currentCard) {
        e.preventDefault();
        setFlipped((v) => !v);
      } else if (e.key === 'ArrowRight' && currentCard) {
        e.preventDefault();
        handleReviewAgain();
      } else if (e.key === 'ArrowLeft' && currentCard) {
        e.preventDefault();
        handlePrevPeek();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, currentCard, handleReviewAgain, handlePrevPeek]);

  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Quick Formula & Trap Flashcards"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/70 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                Quick Recall Flashcards
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {bilingual
                  ? 'Ôn nhanh công thức, bẫy thi & thuật ngữ · Nhấn Space để lật thẻ'
                  : 'Formulas, exam traps & glossary · Press Space to flip'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            aria-label="Close Flashcards"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Strip */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Subject Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/90">
              {SUBJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubject(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    subject === tab.id
                      ? tab.activeCls
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Deck Type + Shuffle */}
            <div className="flex items-center gap-1.5">
              <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/90 text-xs">
                <button
                  type="button"
                  onClick={() => setDeckKind('formulas')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    deckKind === 'formulas'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Formulas
                </button>
                <button
                  type="button"
                  onClick={() => setDeckKind('glossary')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    deckKind === 'glossary'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  EN–VI Terms
                </button>
              </div>
              <button
                type="button"
                onClick={() => resetDeck(true)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Shuffle & Restart Deck"
                aria-label="Shuffle Deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mastery Progress Bar */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="shrink-0">
              {masteredCount}/{totalCount} mastered
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="shrink-0">{queue.length} left</span>
          </div>
        </div>

        {/* Card Area */}
        <div className="p-5 overflow-y-auto flex-1">
          {!currentCard ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Deck Complete! ({totalCount}/{totalCount})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bilingual
                    ? 'Bạn đã ôn hết thẻ trong bộ này. Bấm Restart hoặc chuyển sang môn khác!'
                    : 'Great recall session! Restart shuffled or switch decks above.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetDeck(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Shuffle &amp; Restart
              </button>
            </div>
          ) : (
            <div
              onClick={() => setFlipped((v) => !v)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-400/70 p-5 min-h-[240px] flex flex-col justify-between gap-4 cursor-pointer transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setFlipped((v) => !v);
                }
              }}
            >
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                  {currentCard.badge}
                </span>
                <span className="uppercase tracking-wider font-semibold text-slate-400">
                  {flipped ? 'Answer / Notes' : 'Front · Click to Flip'}
                </span>
              </div>

              {!flipped ? (
                <div className="my-auto text-center space-y-2 py-4">
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
                    <RichMathText text={currentCard.front} />
                  </div>
                  {currentCard.frontSub && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <RichMathText text={currentCard.frontSub} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    <RichMathText text={currentCard.front} />
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <RichMathText text={currentCard.backSummary} />
                  </div>

                  {currentCard.formulas && currentCard.formulas.length > 0 && (
                    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 space-y-1.5">
                      {currentCard.formulas.map((tex, idx) => (
                        <div key={idx} className="text-xs text-indigo-700 dark:text-indigo-300">
                          <MathFormula tex={tex} block />
                        </div>
                      ))}
                    </div>
                  )}

                  {currentCard.trap && (
                    <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 px-3 py-2 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <RichMathText text={currentCard.trap} />
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-[11px] text-center text-slate-400">
                {flipped ? 'Click card to hide answer' : 'Tap card or press Space to reveal'}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {currentCard && (
          <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevPeek}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Previous Card (←)"
                aria-label="Previous Card"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const formulaLine = currentCard.formulas?.length
                    ? `\nFormulas: ${currentCard.formulas.join(' ; ')}`
                    : '';
                  onClose();
                  dispatchAskAi({
                    subject: currentCard.subject,
                    prompt: `Explain "${currentCard.front}" (${currentCard.badge}) clearly with a quick exam example and common trap to avoid.${formulaLine}`,
                  });
                }}
                className="px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReviewAgain}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                Review Again
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleGotIt}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
