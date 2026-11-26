import React from 'react';

interface MathKeypadProps {
  preset: 'mfc' | 'probstat';
  onInsert: (sym: string) => void;
  className?: string;
}

const MFC_SYMBOLS = [
  '∀',
  '∃',
  '¬',
  '∧',
  '∨',
  '→',
  '↔',
  '⇒',
  '∈',
  '∉',
  '⊆',
  '∪',
  '∩',
  '∅',
  '≡',
  '≠',
  '≤',
  '≥',
  'ℤ',
  'ℕ',
  '∴',
  '□',
];

const PROB_SYMBOLS = [
  'μ',
  'σ',
  'σ²',
  'x̄',
  's²',
  'p̂',
  'π',
  'λ',
  'α',
  'β',
  'Φ',
  'χ²',
  '≤',
  '≥',
  '≠',
  '≈',
  '±',
  '√',
  '∑',
  '∫',
  '∞',
  'H₀',
  'H₁',
  '⇒',
];

export const MathKeypad: React.FC<MathKeypadProps> = ({ preset, onInsert, className = '' }) => {
  const symbols = preset === 'mfc' ? MFC_SYMBOLS : PROB_SYMBOLS;
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      <span className="text-[11px] text-slate-400 mr-1">Insert symbol:</span>
      {symbols.map((sym) => (
        <button
          key={sym}
          type="button"
          onClick={() => onInsert(sym)}
          className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          {sym}
        </button>
      ))}
    </div>
  );
};
