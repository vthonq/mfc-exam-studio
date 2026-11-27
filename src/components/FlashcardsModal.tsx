import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Layers,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dispatchAskAi } from '../utils/askAiBridge';
import {
  buildAiFlashcardImportPrompt,
  parseCustomCardsInput,
} from '../utils/customDeckParser';
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

type ModalDeckTab = FlashcardDeckKind | 'custom';

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
  const {
    settings,
    progress,
    addCustomCard,
    importCustomCards,
    removeCustomCard,
    clearCustomCards,
  } = useApp();
  const bilingual = settings.lang === 'bilingual';

  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [deckKind, setDeckKind] = useState<ModalDeckTab>('formulas');
  const [queue, setQueue] = useState<FlashcardItem[]>([]);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());
  const [flipped, setFlipped] = useState(false);

  // Custom Deck Author / Importer states
  const [showAddForm, setShowAddForm] = useState(false);
  const [customBadge, setCustomBadge] = useState('Lecture Note');
  const [customFront, setCustomFront] = useState('');
  const [customBack, setCustomBack] = useState('');
  const [customTrap, setCustomTrap] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const customSubjectCards = useMemo(
    () => (progress.customCards ?? []).filter((c) => c.subject === subject),
    [progress.customCards, subject],
  );

  const baseDeck: FlashcardItem[] = useMemo(() => {
    if (deckKind === 'custom') {
      return customSubjectCards.map((c) => ({
        id: c.id,
        subject: c.subject,
        deck: 'formulas',
        badge: c.badge,
        front: c.front,
        backSummary: c.back,
        trap: c.trap,
      }));
    }
    return buildFlashcardDeck(subject, deckKind, bilingual);
  }, [subject, deckKind, bilingual, customSubjectCards]);

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
      setImportFeedback(null);
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

  const handleAddSingleCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFront.trim() || !customBack.trim()) return;
    addCustomCard({
      subject,
      badge: customBadge.trim().slice(0, 40) || 'My Note',
      front: customFront.trim().slice(0, 300),
      back: customBack.trim().slice(0, 800),
      ...(customTrap.trim() ? { trap: customTrap.trim().slice(0, 240) } : {}),
    });
    setCustomFront('');
    setCustomBack('');
    setCustomTrap('');
    setShowAddForm(false);
    setImportFeedback('Added 1 custom card to My Deck!');
  };

  const handleBulkImport = () => {
    const parsed = parseCustomCardsInput(bulkInput, subject);
    if (parsed.length === 0) {
      setImportFeedback(
        'Could not parse cards — paste JSON array or lines like "Term :: Definition".',
      );
      return;
    }
    const added = importCustomCards(parsed);
    setBulkInput('');
    setShowAddForm(false);
    setImportFeedback(`Imported ${added} custom flashcard${added === 1 ? '' : 's'}!`);
  };

  const handleCopyAiPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildAiFlashcardImportPrompt(subject, bilingual));
      setCopiedPrompt(true);
      window.setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

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
                Quick Recall &amp; Custom Flashcards
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {bilingual
                  ? 'Ôn công thức, thuật ngữ & bộ thẻ tự tạo · Space để lật thẻ'
                  : 'Formulas, glossary & your own custom decks · Space to flip'}
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
                  className={`px-2 py-1 rounded-lg font-semibold cursor-pointer ${
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
                  className={`px-2 py-1 rounded-lg font-semibold cursor-pointer ${
                    deckKind === 'glossary'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  EN–VI
                </button>
                <button
                  type="button"
                  onClick={() => setDeckKind('custom')}
                  className={`px-2 py-1 rounded-lg font-semibold cursor-pointer ${
                    deckKind === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  My Deck ({customSubjectCards.length})
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

          {/* Custom Deck Action Strip */}
          {deckKind === 'custom' && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm((v) => !v)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddForm ? 'Hide Editor' : 'Add / Import Cards'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopyAiPrompt()}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  title="Copy prompt to convert lecture notes into JSON flashcards via Gemini/ChatGPT/Claude"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" /> Prompt Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy AI Prompt
                    </>
                  )}
                </button>
              </div>

              {customSubjectCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Clear all custom cards for ${subject.toUpperCase()}?`)) {
                      clearCustomCards(subject);
                    }
                  }}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Clear My Deck
                </button>
              )}
            </div>
          )}

          {importFeedback && deckKind === 'custom' && (
            <div className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              {importFeedback}
            </div>
          )}

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

        {/* Card Area or Custom Deck Editor */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {deckKind === 'custom' && showAddForm && (
            <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800/70 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3 text-xs">
              <form onSubmit={handleAddSingleCustom} className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">Quick Add 1 Card</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder="Topic/Ch."
                    maxLength={40}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={customFront}
                    onChange={(e) => setCustomFront(e.target.value)}
                    placeholder="Front / Question *"
                    maxLength={300}
                    className="col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <textarea
                  rows={2}
                  value={customBack}
                  onChange={(e) => setCustomBack(e.target.value)}
                  placeholder="Back / Formula or Answer (supports $LaTeX$) *"
                  maxLength={800}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTrap}
                    onChange={(e) => setCustomTrap(e.target.value)}
                    placeholder="Optional exam trap / note..."
                    maxLength={240}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Save Card
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-indigo-200/70 dark:border-indigo-800/60 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  Bulk Paste (AI JSON or <code className="font-mono">Front :: Back</code> lines)
                </div>
                <textarea
                  rows={3}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={'Paste AI JSON array OR lines like:\nBayes Theorem :: P(A|B) = P(B|A)P(A)/P(B) :: Always check partition'}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Import Pasted Cards into {subject.toUpperCase()} My Deck
                </button>
              </div>
            </div>
          )}

          {totalCount === 0 && deckKind === 'custom' ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Your {subject.toUpperCase()} Custom Deck is Empty
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bilingual
                    ? 'Tự thêm công thức ghi chú trên lớp hoặc dán hàng loạt bằng AI JSON (lưu đồng bộ Cloud trên tài khoản của bạn).'
                    : 'Add your own lecture notes or bulk-import cards from Gemini/ChatGPT/Claude (cloud-synced to your account).'}
                </p>
              </div>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create / Import Cards
                </button>
              )}
            </div>
          ) : !currentCard ? (
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
                    ? 'Bạn đã ôn hết thẻ trong bộ này. Bấm Restart hoặc chuyển sang bộ khác!'
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
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider font-semibold text-slate-400">
                    {flipped ? 'Answer / Notes' : 'Front · Click to Flip'}
                  </span>
                  {deckKind === 'custom' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomCard(currentCard.id);
                      }}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                      title="Delete this custom card"
                      aria-label="Delete custom card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
