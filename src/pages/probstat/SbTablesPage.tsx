import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, RefreshCw, Sparkles, Table2 } from 'lucide-react';
import { SbTableExplorer, type SbAppendixId } from '../../components/probstat/SbTableExplorer';
import {
  chiSqCritUpper,
  formatSbChiSq,
  formatSbF,
  formatSbNormal,
  formatSbT,
  fCritUpper,
  normalAreaZeroToZ,
  normalCdf,
  tCritUpper,
} from '../../math/probStat';
import { BiText } from '../../components/BiText';

interface DrillChallenge {
  id: string;
  appendix: SbAppendixId;
  prompt: string;
  answer: number;
  tolerance: number;
  hint: string;
}

const DRILL_BANK: DrillChallenge[] = [
  {
    id: 'd1',
    appendix: 'c2',
    prompt: 'Using Appendix C-2 (p.768), find Φ(−1.96) = P(Z ≤ −1.96).',
    answer: normalCdf(-1.96),
    tolerance: 0.0006,
    hint: `Go to App. C-2 row -1.9, column .06 ⇒ ${formatSbNormal(normalCdf(-1.96), 1.96)}.`,
  },
  {
    id: 'd2',
    appendix: 'c1',
    prompt: 'Using Appendix C-1 (p.767), find P(0 ≤ Z ≤ 2.33).',
    answer: normalAreaZeroToZ(2.33),
    tolerance: 0.0006,
    hint: `Go to App. C-1 row 2.3, column .03 ⇒ ${formatSbNormal(normalAreaZeroToZ(2.33), 2.33)}.`,
  },
  {
    id: 'd3',
    appendix: 'd',
    prompt: 'Using Appendix D (p.770), find the 95% confidence critical value t_{0.025, 15}.',
    answer: tCritUpper(0.025, 15),
    tolerance: 0.002,
    hint: `Go to App. D row d.f.=15, Conf .95 / 1-tail .025 ⇒ ${formatSbT(tCritUpper(0.025, 15))}.`,
  },
  {
    id: 'd4',
    appendix: 'e',
    prompt: 'Using Appendix E (p.771), find χ²_{0.05, 12} (upper tail = .05, d.f. = 12).',
    answer: chiSqCritUpper(0.05, 12),
    tolerance: 0.02,
    hint: `Go to App. E row d.f.=12, column .05 ⇒ ${formatSbChiSq(chiSqCritUpper(0.05, 12))}.`,
  },
  {
    id: 'd5',
    appendix: 'e',
    prompt: 'Using Appendix E (p.771), find the LOWER-tail denominator χ²_{0.975, 15} needed for a 95% CI for σ² with n=16.',
    answer: chiSqCritUpper(0.975, 15),
    tolerance: 0.02,
    hint: `Go to App. E row d.f.=15, column .975 ⇒ ${formatSbChiSq(chiSqCritUpper(0.975, 15))}.`,
  },
  {
    id: 'd6',
    appendix: 'f',
    prompt: 'Using Appendix F (p.774), find F_{0.05}(df₁ = 4, df₂ = 12).',
    answer: fCritUpper(0.05, 4, 12),
    tolerance: 0.02,
    hint: `Open App. F α=.05, col df₁=4, row df₂=12 ⇒ ${formatSbF(fCritUpper(0.05, 4, 12))}.`,
  },
];

export const SbTablesPage: React.FC = () => {
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillIdx, setDrillIdx] = useState(0);
  const [guess, setGuess] = useState('');
  const [checked, setChecked] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [explorerKey, setExplorerKey] = useState(0);
  const [forcedTab, setForcedTab] = useState<SbAppendixId>('c2');

  const currentDrill = useMemo(() => DRILL_BANK[drillIdx], [drillIdx]);

  const checkGuess = () => {
    const val = Number(guess);
    if (!Number.isFinite(val)) {
      setChecked(false);
      return;
    }
    setChecked(Math.abs(val - currentDrill.answer) <= currentDrill.tolerance);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Table2 className="w-6 h-6 text-sky-600" />
            Easy SB Statistical Tables (Appendices C-1 to F)
          </h1>
          <BiText
            en="Interactive replica of all 13 pages (p.767–779) of your approved UEH-ISB exam tables — with visual curves, crosshair highlights & reverse lookup."
            vi="Bản tra cứu tương tác đầy đủ 13 trang Phụ lục C-1 đến F (tr. 767–779) — có đồ thị tô vùng, đánh dấu hàng/cột và tra ngược."
            className="text-sm text-slate-600 dark:text-slate-400 mt-0.5"
            viClassName="text-xs text-slate-500 mt-0.5"
          />
        </div>

        <button
          onClick={() => setDrillOpen((v) => !v)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
            drillOpen
              ? 'bg-amber-500 text-slate-950'
              : 'bg-sky-600 hover:bg-sky-700 text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {drillOpen ? 'Hide Speed Drill' : 'SB Table Speed Drill'}
        </button>
      </div>

      {/* Optional Speed Drill Banner */}
      {drillOpen && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Exam Speed Drill · Challenge {drillIdx + 1} / {DRILL_BANK.length}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  setForcedTab(currentDrill.appendix);
                  setExplorerKey((k) => k + 1);
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs font-semibold cursor-pointer"
              >
                Jump to Appendix {currentDrill.appendix.toUpperCase()}
              </button>
              <button
                onClick={() => {
                  setDrillIdx((i) => (i + 1) % DRILL_BANK.length);
                  setGuess('');
                  setChecked(null);
                  setShowHint(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Next
              </button>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {currentDrill.prompt}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => {
                setGuess(e.target.value);
                setChecked(null);
              }}
              placeholder="Type your SB table value..."
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-sm font-mono w-48"
            />
            <button
              onClick={checkGuess}
              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold cursor-pointer"
            >
              Check
            </button>
            <button
              onClick={() => setShowHint((h) => !h)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-semibold cursor-pointer"
            >
              {showHint ? 'Hide Hint' : 'Show Table Path'}
            </button>
            {checked === true && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> Spot on! ({currentDrill.answer.toFixed(4)})
              </span>
            )}
            {checked === false && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Not quite — use Appendix {currentDrill.appendix.toUpperCase()} below or click "Show Table Path".
              </span>
            )}
          </div>

          {showHint && (
            <div className="text-xs text-amber-900 dark:text-amber-200 font-mono bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg">
              {currentDrill.hint}
            </div>
          )}
        </div>
      )}

      <SbTableExplorer key={explorerKey} initialTab={forcedTab} />
    </div>
  );
};
