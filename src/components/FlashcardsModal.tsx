import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Layers,
  Plus,
  RotateCcw,
  Share2,
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
import {
  formatNextInterval,
  isCardDue,
  serializeCustomDeckJson,
} from '../utils/spacedRepetition';
import type { SrsRating, SubjectId } from '../types';
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
    activeCls: 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs',
  },
  {
    id: 'econ',
    label: 'Econ',
    activeCls: 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 shadow-2xs',
  },
  {
    id: 'probstat',
    label: 'ProbStat',
    activeCls: 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 shadow-2xs',
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
    rateFlashcard,
  } = useApp();
  const bilingual = settings.lang === 'bilingual';

  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [deckKind, setDeckKind] = useState<ModalDeckTab>('formulas');
  const [dueOnly, setDueOnly] = useState(false);
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
  const [copiedDeck, setCopiedDeck] = useState(false);

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

  const dueCount = useMemo(
    () => baseDeck.filter((c) => isCardDue(progress.flashcardSrs?.[c.id])).length,
    [baseDeck, progress.flashcardSrs],
  );

  const resetDeck = useCallback(
    (shuffled = false, onlyDue = dueOnly) => {
      const pool = onlyDue
        ? baseDeck.filter((c) => isCardDue(progress.flashcardSrs?.[c.id]))
        : baseDeck;
      setQueue(shuffled ? shuffleCards(pool) : pool);
      setMasteredIds(new Set());
      setFlipped(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseDeck, dueOnly],
  );

  useEffect(() => {
    if (open) {
      setSubject(initialSubject);
      setImportFeedback(null);
    }
  }, [open, initialSubject]);

  useEffect(() => {
    resetDeck(false, dueOnly);
  }, [resetDeck, dueOnly]);

  const currentCard = queue[0] ?? null;
  const sessionTotal = useMemo(() => queue.length + masteredIds.size, [queue.length, masteredIds.size]);
  const masteredCount = masteredIds.size;
  const progressPct = sessionTotal > 0 ? Math.round((masteredCount / sessionTotal) * 100) : 0;

  const handleRate = useCallback(
    (rating: SrsRating) => {
      if (!currentCard) return;
      rateFlashcard(currentCard.id, rating);
      if (rating === 'again') {
        setQueue((prev) => (prev.length <= 1 ? prev : [...prev.slice(1), prev[0]]));
      } else {
        setMasteredIds((prev) => {
          const next = new Set(prev);
          next.add(currentCard.id);
          return next;
        });
        setQueue((prev) => prev.slice(1));
      }
      setFlipped(false);
    },
    [currentCard, rateFlashcard],
  );

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
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;
      if (isTyping) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && currentCard) {
        e.preventDefault();
        setFlipped((v) => !v);
      } else if (e.key === '1' && currentCard) {
        e.preventDefault();
        handleRate('again');
      } else if (e.key === '2' && currentCard) {
        e.preventDefault();
        handleRate('hard');
      } else if (e.key === '3' && currentCard) {
        e.preventDefault();
        handleRate('good');
      } else if (e.key === '4' && currentCard) {
        e.preventDefault();
        handleRate('easy');
      } else if (e.key === 'ArrowRight' && currentCard) {
        e.preventDefault();
        handleRate('again');
      } else if (e.key === 'ArrowLeft' && currentCard) {
        e.preventDefault();
        handlePrevPeek();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, currentCard, handleRate, handlePrevPeek]);

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

  const handleCopyDeckJson = async () => {
    if (customSubjectCards.length === 0) return;
    try {
      await navigator.clipboard.writeText(serializeCustomDeckJson(customSubjectCards));
      setCopiedDeck(true);
      setImportFeedback(`Copied ${customSubjectCards.length} cards as shareable JSON!`);
      window.setTimeout(() => setCopiedDeck(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const currentSrs = currentCard ? progress.flashcardSrs?.[currentCard.id] : undefined;

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in studio-card rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Quick Formula & SM-2 Flashcards"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                SM-2 Spaced Recall &amp; Custom Decks
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {bilingual
                  ? 'Space lật thẻ · Phím 1–4 chấm trí nhớ tự lên lịch ôn tập'
                  : 'Space to flip · Keys 1–4 rate recall & schedule next review'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 cursor-pointer"
            aria-label="Close Flashcards"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Strip */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Subject Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.05]">
              {SUBJECT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubject(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    subject === tab.id
                      ? tab.activeCls
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Deck Type + Due Filter + Shuffle */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-white/[0.05] text-xs">
                <button
                  type="button"
                  onClick={() => setDeckKind('formulas')}
                  className={`px-2 py-1 rounded-lg font-semibold cursor-pointer ${
                    deckKind === 'formulas'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
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
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
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
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  My Deck ({customSubjectCards.length})
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDueOnly((v) => !v)}
                className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold tabular-nums transition-colors cursor-pointer ${
                  dueOnly
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300'
                    : 'border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300'
                }`}
                title="Show only cards due for SM-2 review now"
              >
                Due ({dueCount})
              </button>
              <button
                type="button"
                onClick={() => resetDeck(true, dueOnly)}
                className="p-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 cursor-pointer"
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
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddForm ? 'Hide Editor' : 'Add / Import Cards'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCopyAiPrompt()}
                  className="px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] font-semibold inline-flex items-center gap-1 cursor-pointer"
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
                {customSubjectCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleCopyDeckJson()}
                    className="px-2.5 py-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    title="Copy this custom deck as JSON so classmates can paste-import it"
                  >
                    {copiedDeck ? (
                      <>
                        <Check className="w-3 h-3" /> Deck Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" /> Share Deck
                      </>
                    )}
                  </button>
                )}
              </div>

              {customSubjectCards.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Clear all custom cards for ${subject.toUpperCase()}?`)) {
                      clearCustomCards(subject);
                    }
                  }}
                  className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                >
                  Clear My Deck
                </button>
              )}
            </div>
          )}

          {importFeedback && deckKind === 'custom' && (
            <div className="px-2.5 py-1.5 rounded-lg bg-indigo-500/12 border border-indigo-500/20 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">
              {importFeedback}
            </div>
          )}

          {/* Mastery Progress Bar */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            <span className="shrink-0">
              {masteredCount}/{sessionTotal} rated
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.07] overflow-hidden">
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
            <div className="p-3.5 rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] space-y-3 text-xs">
              <form onSubmit={handleAddSingleCustom} className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">Quick Add 1 Card</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    placeholder="Topic/Ch."
                    maxLength={40}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                  <input
                    type="text"
                    value={customFront}
                    onChange={(e) => setCustomFront(e.target.value)}
                    placeholder="Front / Question *"
                    maxLength={300}
                    className="col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <textarea
                  rows={2}
                  value={customBack}
                  onChange={(e) => setCustomBack(e.target.value)}
                  placeholder="Back / Formula or Answer (supports $LaTeX$) *"
                  maxLength={800}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTrap}
                    onChange={(e) => setCustomTrap(e.target.value)}
                    placeholder="Optional exam trap / note..."
                    maxLength={240}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                  >
                    Save Card
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-indigo-500/20 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white">
                  Bulk Paste (Shared / AI JSON or <code className="font-mono">Front :: Back</code> lines)
                </div>
                <textarea
                  rows={3}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={'Paste classmate JSON array OR lines like:\nBayes Theorem :: P(A|B) = P(B|A)P(A)/P(B) :: Always check partition'}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Import Pasted Cards into {subject.toUpperCase()} My Deck
                </button>
              </div>
            </div>
          )}

          {baseDeck.length === 0 && deckKind === 'custom' ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/12 text-indigo-500 mx-auto flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Your {subject.toUpperCase()} Custom Deck is Empty
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bilingual
                    ? 'Tự thêm công thức ghi chú trên lớp hoặc dán bộ JSON bạn bè chia sẻ (đồng bộ Cloud).'
                    : 'Add your own lecture notes or bulk-import cards shared by classmates or AI (cloud-synced).'}
                </p>
              </div>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create / Import Cards
                </button>
              )}
            </div>
          ) : !currentCard ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {dueOnly && dueCount === 0
                    ? 'All Due Cards Caught Up!'
                    : `Deck Complete! (${sessionTotal}/${sessionTotal})`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {dueOnly && dueCount === 0
                    ? 'No cards are overdue in this deck right now. Switch off Due filter to cram anytime.'
                    : bilingual
                      ? 'Bạn đã hoàn thành lượt ôn SM-2 cho bộ thẻ này!'
                      : 'Great SM-2 recall session! Restart shuffled or review another deck.'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {dueOnly && (
                  <button
                    type="button"
                    onClick={() => setDueOnly(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/80 dark:bg-white/[0.04] text-xs font-bold cursor-pointer"
                  >
                    Show All {baseDeck.length} Cards
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => resetDeck(true, false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Shuffle &amp; Practice All
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setFlipped((v) => !v)}
              className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-slate-50/70 dark:bg-white/[0.03] hover:border-indigo-400/70 p-5 min-h-[235px] flex flex-col justify-between gap-4 cursor-pointer transition-colors"
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
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-indigo-600 dark:text-indigo-300">
                  {currentCard.badge}
                </span>
                <div className="flex items-center gap-2">
                  {currentSrs && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {currentSrs.reps} reps
                    </span>
                  )}
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
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 cursor-pointer"
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
                  <div className="font-display text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
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
                    <div className="rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/[0.08] px-3 py-2 space-y-1.5">
                      {currentCard.formulas.map((tex, idx) => (
                        <div key={idx} className="text-xs text-indigo-700 dark:text-indigo-300">
                          <MathFormula tex={tex} block />
                        </div>
                      ))}
                    </div>
                  )}

                  {currentCard.trap && (
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <RichMathText text={currentCard.trap} />
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-[11px] text-center text-slate-400">
                {flipped ? 'Rate recall below (keys 1–4) or click to flip' : 'Tap card or press Space to reveal'}
              </div>
            </div>
          )}
        </div>

        {/* Footer SM-2 Rating Controls */}
        {currentCard && (
          <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  {
                    rating: 'again' as SrsRating,
                    keyHint: '1',
                    label: 'Again',
                    cls: 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/18 text-rose-600 dark:text-rose-300',
                  },
                  {
                    rating: 'hard' as SrsRating,
                    keyHint: '2',
                    label: 'Hard',
                    cls: 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/18 text-amber-700 dark:text-amber-300',
                  },
                  {
                    rating: 'good' as SrsRating,
                    keyHint: '3',
                    label: 'Good',
                    cls: 'border-emerald-500/30 bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                  },
                  {
                    rating: 'easy' as SrsRating,
                    keyHint: '4',
                    label: 'Easy',
                    cls: 'border-indigo-500/30 bg-indigo-500/12 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.rating}
                  type="button"
                  onClick={() => handleRate(item.rating)}
                  className={`px-2 py-2 rounded-xl border text-center transition-colors cursor-pointer ${item.cls}`}
                >
                  <div className="text-xs font-bold">
                    {item.keyHint} · {item.label}
                  </div>
                  <div className="text-[10px] font-mono opacity-80 tabular-nums">
                    {formatNextInterval(currentSrs, item.rating)}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrevPeek}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-semibold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                title="Previous Card (←)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Prev
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
                className="px-3 py-1.5 rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
