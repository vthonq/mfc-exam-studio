import React, { useMemo, useState } from 'react';
import { BookOpen, Compass, Info, Sparkles } from 'lucide-react';
import {
  SB_CHISQ_ALPHAS,
  SB_CHISQ_DFS,
  SB_F_ALPHAS,
  SB_F_DF1,
  SB_F_DF2,
  SB_NORMAL_COLS,
  SB_T_COLUMNS,
  SB_T_DFS,
  chiSqCritUpper,
  chiSqUpperTail,
  fCritUpper,
  fUpperTail,
  formatSbChiSq,
  formatSbF,
  formatSbNormal,
  formatSbT,
  normalAreaZeroToZ,
  normalCdf,
  normalInv,
  tCdf,
  tCritUpper,
} from '../../math/probStat';
import { DistributionCurveSvg, type ShadeMode } from './DistributionCurveSvg';

export type SbAppendixId = 'c1' | 'c2' | 'd' | 'e' | 'f';

interface SbTableExplorerProps {
  initialTab?: SbAppendixId;
  compact?: boolean;
}

const F_PAGE_MAP: Record<number, string> = {
  0.1: 'p. 772–773',
  0.05: 'p. 774–775',
  0.025: 'p. 776–777',
  0.01: 'p. 778–779',
};

function nearestInList(val: number, list: readonly number[]): number {
  let best = list[0];
  let bestDiff = Math.abs(val - (Number.isFinite(list[0]) ? list[0] : 1e6));
  for (const item of list) {
    if (!Number.isFinite(item)) continue;
    const diff = Math.abs(val - item);
    if (diff < bestDiff) {
      best = item;
      bestDiff = diff;
    }
  }
  return best;
}

export const SbTableExplorer: React.FC<SbTableExplorerProps> = ({
  initialTab = 'c2',
  compact = false,
}) => {
  const [tab, setTab] = useState<SbAppendixId>(initialTab);

  // Appendix C-1 state: P(0 <= Z <= z)
  const [c1Z, setC1Z] = useState<number>(1.96);
  const [c1RevArea, setC1RevArea] = useState<string>('0.4750');

  // Appendix C-2 state: Cumulative Phi(z)
  const [c2Z, setC2Z] = useState<number>(-1.96);
  const [c2Mode, setC2Mode] = useState<'left' | 'right' | 'between' | 'raw'>('left');
  const [c2Z2, setC2Z2] = useState<number>(1.96);
  const [rawX, setRawX] = useState<number>(85);
  const [rawMu, setRawMu] = useState<number>(80);
  const [rawSigma, setRawSigma] = useState<number>(5);
  const [c2RevProb, setC2RevProb] = useState<string>('0.9750');

  // Appendix D state: Student's t
  const [tDf, setTDf] = useState<number>(15);
  const [tInf, setTInf] = useState<boolean>(false);
  const [tColIdx, setTColIdx] = useState<number>(2); // .95 / .05 two-tail / .025 one-tail
  const [tObsInput, setTObsInput] = useState<string>('');

  // Appendix E state: Chi-Square
  const [chiDf, setChiDf] = useState<number>(15);
  const [chiMode, setChiMode] = useState<'single' | 'ci'>('single');
  const [chiAlpha, setChiAlpha] = useState<number>(0.05);
  const [chiCiLevel, setChiCiLevel] = useState<0.9 | 0.95 | 0.98 | 0.99>(0.95);
  const [chiObsInput, setChiObsInput] = useState<string>('');

  // Appendix F state: F
  const [fAlpha, setFAlpha] = useState<(typeof SB_F_ALPHAS)[number]>(0.05);
  const [fDf1, setFDf1] = useState<number>(4);
  const [fDf2, setFDf2] = useState<number>(12);
  const [fDf1Inf, setFDf1Inf] = useState<boolean>(false);
  const [fDf2Inf, setFDf2Inf] = useState<boolean>(false);
  const [fPagePart, setFPagePart] = useState<'left' | 'right'>('left');

  // ==================== DERIVED LOOKUPS ====================

  // C-1 grid & active cell
  const c1Rows = useMemo(() => Array.from({ length: 38 }, (_, i) => Number((i * 0.1).toFixed(1))), []);
  const c1Abs = Math.min(3.79, Math.max(0, Math.round(Math.abs(c1Z) * 100) / 100));
  const c1RowIdx = Math.min(37, Math.floor(c1Abs * 10 + 1e-6));
  const c1ColIdx = Math.min(9, Math.round((c1Abs * 10 - c1RowIdx) * 10));
  const c1ExactArea = normalAreaZeroToZ(c1Z);

  // C-2 effective z and grid
  const effectiveC2Z = useMemo(() => {
    if (c2Mode === 'raw') {
      const sd = rawSigma > 0 ? rawSigma : 1;
      return (rawX - rawMu) / sd;
    }
    return c2Z;
  }, [c2Mode, c2Z, rawX, rawMu, rawSigma]);

  const c2IsNegative = effectiveC2Z < 0;
  const c2Rows = useMemo(() => {
    if (c2IsNegative) {
      return Array.from({ length: 38 }, (_, i) => -Number(((37 - i) * 0.1).toFixed(1)));
    }
    return Array.from({ length: 38 }, (_, i) => Number((i * 0.1).toFixed(1)));
  }, [c2IsNegative]);

  const c2Clamped = Math.max(-3.79, Math.min(3.79, effectiveC2Z));
  const c2RoundedAbs = Math.min(3.79, Math.round(Math.abs(c2Clamped) * 100) / 100);
  const c2AbsTenths = Math.min(37, Math.floor(c2RoundedAbs * 10 + 1e-6));
  const c2ColIdx = Math.min(9, Math.round((c2RoundedAbs * 10 - c2AbsTenths) * 10));
  const c2RowIdx = c2IsNegative ? 37 - c2AbsTenths : c2AbsTenths;

  const c2ProbabilitySummary = useMemo(() => {
    if (c2Mode === 'right') {
      const p = 1 - normalCdf(effectiveC2Z);
      return {
        formula: `P(Z ≥ ${effectiveC2Z.toFixed(2)}) = 1 − Φ(${effectiveC2Z.toFixed(2)})`,
        value: p,
        shade: 'right' as ShadeMode,
        a: effectiveC2Z,
        b: effectiveC2Z,
      };
    }
    if (c2Mode === 'between') {
      const lo = Math.min(effectiveC2Z, c2Z2);
      const hi = Math.max(effectiveC2Z, c2Z2);
      const p = normalCdf(hi) - normalCdf(lo);
      return {
        formula: `P(${lo.toFixed(2)} ≤ Z ≤ ${hi.toFixed(2)}) = Φ(${hi.toFixed(2)}) − Φ(${lo.toFixed(2)})`,
        value: p,
        shade: 'between' as ShadeMode,
        a: lo,
        b: hi,
      };
    }
    const p = normalCdf(effectiveC2Z);
    return {
      formula:
        c2Mode === 'raw'
          ? `z = (${rawX} − ${rawMu}) / ${rawSigma} = ${effectiveC2Z.toFixed(4)} ⇒ P(X ≤ ${rawX}) = Φ(z)`
          : `P(Z ≤ ${effectiveC2Z.toFixed(2)}) = Φ(${effectiveC2Z.toFixed(2)})`,
      value: p,
      shade: 'left' as ShadeMode,
      a: effectiveC2Z,
      b: effectiveC2Z,
    };
  }, [c2Mode, effectiveC2Z, c2Z2, rawX, rawMu, rawSigma]);

  // Appendix D derived
  const effectiveTDf = tInf ? Infinity : Math.max(1, Math.round(tDf));
  const activeTCol = SB_T_COLUMNS[tColIdx];
  const exactTCrit = tCritUpper(activeTCol.oneTail, effectiveTDf);
  const nearestTableTDf = tInf ? Infinity : nearestInList(effectiveTDf, SB_T_DFS);
  const tObsNum = Number(tObsInput);
  const tObsValid = tObsInput.trim() !== '' && Number.isFinite(tObsNum);
  const tObsPValue = tObsValid ? 1 - tCdf(Math.abs(tObsNum), effectiveTDf) : null;

  // Appendix E derived
  const effectiveChiDf = Math.max(1, Math.round(chiDf));
  const nearestTableChiDf = nearestInList(effectiveChiDf, SB_CHISQ_DFS);
  const ciTailAlpha = (1 - chiCiLevel) / 2;
  const chiLowerCrit = chiSqCritUpper(1 - ciTailAlpha, effectiveChiDf);
  const chiUpperCrit = chiSqCritUpper(ciTailAlpha, effectiveChiDf);
  const chiSingleCrit = chiSqCritUpper(chiAlpha, effectiveChiDf);
  const chiObsNum = Number(chiObsInput);
  const chiObsValid = chiObsInput.trim() !== '' && Number.isFinite(chiObsNum) && chiObsNum > 0;
  const chiObsUpperP = chiObsValid ? chiSqUpperTail(chiObsNum, effectiveChiDf) : null;

  // Appendix F derived
  const effFDf1 = fDf1Inf ? Infinity : Math.max(1, Math.round(fDf1));
  const effFDf2 = fDf2Inf ? Infinity : Math.max(1, Math.round(fDf2));
  const nearestFDf1 = fDf1Inf ? Infinity : nearestInList(effFDf1, SB_F_DF1);
  const nearestFDf2 = fDf2Inf ? Infinity : nearestInList(effFDf2, SB_F_DF2);
  const exactFCrit = fCritUpper(fAlpha, effFDf1, effFDf2);

  // Quick presets handler
  const applyPreset = (preset: string) => {
    if (preset === 'p-less') {
      setTab('c2');
      setC2Mode('left');
      setC2Z(-1.96);
    } else if (preset === '0-to-z') {
      setTab('c1');
      setC1Z(1.96);
    } else if (preset === 'rev-95') {
      setTab('c2');
      setC2Mode('left');
      setC2RevProb('0.9750');
      setC2Z(1.96);
    } else if (preset === 'raw-x') {
      setTab('c2');
      setC2Mode('raw');
    } else if (preset === 't-crit') {
      setTab('d');
      setTInf(false);
      setTDf(15);
      setTColIdx(2);
    } else if (preset === 'chi-ci') {
      setTab('e');
      setChiMode('ci');
      setChiDf(15);
      setChiCiLevel(0.95);
    } else if (preset === 'f-crit') {
      setTab('f');
      setFAlpha(0.05);
      setFDf1Inf(false);
      setFDf2Inf(false);
      setFDf1(4);
      setFDf2(12);
      setFPagePart('left');
    }
  };

  return (
    <div className="space-y-4">
      {/* Smart Task Presets Bar */}
      <div className="bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 rounded-xl p-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5 mb-2">
          <Compass className="w-3.5 h-3.5" /> Which SB Table Do I Need? (Click a task to jump right in)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'p-less', label: 'P(Z ≤ z) · App C-2' },
            { id: '0-to-z', label: 'P(0 ≤ Z ≤ z) · App C-1' },
            { id: 'rev-95', label: '95% Z CI (z = 1.96)' },
            { id: 'raw-x', label: 'Raw X ~ N(μ, σ²) → Z' },
            { id: 't-crit', label: "t critical (σ unknown) · App D" },
            { id: 'chi-ci', label: 'χ² CI for σ² (dual highlight) · App E' },
            { id: 'f-crit', label: 'F critical · App F' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-xs font-medium text-sky-800 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/60 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appendix Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(
          [
            { id: 'c1', label: 'App. C-1 · p.767', sub: 'Area 0 → z' },
            { id: 'c2', label: 'App. C-2 · p.768–769', sub: 'Cumulative Φ(z)' },
            { id: 'd', label: 'App. D · p.770', sub: "Student's t" },
            { id: 'e', label: 'App. E · p.771', sub: 'Chi-Square χ²' },
            { id: 'f', label: 'App. F · p.772–779', sub: 'F Critical' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
              tab === t.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <div className="text-xs font-bold">{t.label}</div>
            <div className={`text-[10px] ${tab === t.id ? 'text-sky-100' : 'text-slate-500'}`}>
              {t.sub}
            </div>
          </button>
        ))}
      </div>

      {/* ==================== TAB C-1 ==================== */}
      {tab === 'c1' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Appendix C-1 (Book p. 767): Standard Normal Area Between 0 and z
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Enter z (Forward Lookup)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="-3.79"
                    max="3.79"
                    value={c1Z}
                    onChange={(e) => setC1Z(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Or Reverse Lookup Area (0 to 0.4999)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={c1RevArea}
                      onChange={(e) => setC1RevArea(e.target.value)}
                      placeholder="0.4750"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                    />
                    <button
                      onClick={() => {
                        const area = Math.min(0.49995, Math.max(0, Number(c1RevArea) || 0));
                        const zFound = normalInv(0.5 + area);
                        setC1Z(Math.round(zFound * 100) / 100);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Find z
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                  P(0 ≤ Z ≤ {c1Abs.toFixed(2)}) = {c1ExactArea.toFixed(5)} (SB: {formatSbNormal(c1ExactArea, c1Abs)})
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  How to read paper SB p. 767: Go to row <strong>{c1Rows[c1RowIdx].toFixed(1)}</strong>{' '}
                  and column <strong>.{String(c1ColIdx).padStart(2, '0')}</strong>.{' '}
                  {c1Z < 0 && (
                    <span className="text-sky-700 dark:text-sky-300 font-medium">
                      (Negative z uses symmetry: P({c1Z.toFixed(2)} ≤ Z ≤ 0) = P(0 ≤ Z ≤ {c1Abs.toFixed(2)}).)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DistributionCurveSvg
              distribution="normal"
              shadeMode="zero-to-z"
              boundA={0}
              boundB={c1Abs}
              areaLabel={`Area = ${c1ExactArea.toFixed(4)}`}
            />
          </div>

          {/* Interactive Replica Grid C-1 */}
          <div className={`overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 ${compact ? 'max-h-72' : 'max-h-[420px]'}`}>
            <table className="w-full text-xs font-mono border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="p-1.5 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800">
                    z
                  </th>
                  {SB_NORMAL_COLS.map((col, ci) => (
                    <th
                      key={col}
                      className={`p-1.5 border-b border-slate-200 dark:border-slate-700 text-center ${
                        ci === c1ColIdx ? 'bg-amber-200/80 dark:bg-amber-800/60 text-amber-950 dark:text-amber-100' : ''
                      }`}
                    >
                      .{String(ci).padStart(2, '0')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c1Rows.map((rowVal, ri) => {
                  const isRowHit = ri === c1RowIdx;
                  return (
                    <tr key={rowVal} className={isRowHit ? 'bg-sky-50/90 dark:bg-sky-950/40' : ''}>
                      <th
                        className={`p-1.5 border-r border-slate-200 dark:border-slate-700 sticky left-0 text-right ${
                          isRowHit
                            ? 'bg-amber-200/80 dark:bg-amber-800/60 text-amber-950 dark:text-amber-100 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rowVal.toFixed(1)}
                      </th>
                      {SB_NORMAL_COLS.map((col, ci) => {
                        const z = rowVal + col;
                        const val = formatSbNormal(normalAreaZeroToZ(z), z);
                        const isCell = isRowHit && ci === c1ColIdx;
                        const isColHit = ci === c1ColIdx;
                        return (
                          <td
                            key={ci}
                            onClick={() => setC1Z(Number(z.toFixed(2)))}
                            className={`p-1.5 text-center cursor-pointer transition-colors ${
                              isCell
                                ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-600'
                                : isColHit
                                ? 'bg-amber-50/70 dark:bg-amber-950/20'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB C-2 ==================== */}
      {tab === 'c2' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  Appendix C-2 ({c2IsNegative ? 'p. 768 Negative z' : 'p. 769 Positive z'}): Φ(z) = P(Z ≤ z)
                </span>
                <div className="flex gap-1">
                  {(['left', 'right', 'between', 'raw'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setC2Mode(m)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer ${
                        c2Mode === m
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {m === 'left'
                        ? 'P(Z ≤ z)'
                        : m === 'right'
                        ? 'P(Z ≥ z)'
                        : m === 'between'
                        ? 'P(a ≤ Z ≤ b)'
                        : 'Raw X → z'}
                    </button>
                  ))}
                </div>
              </div>

              {c2Mode === 'raw' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">x</label>
                    <input
                      type="number"
                      step="0.5"
                      value={rawX}
                      onChange={(e) => setRawX(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Mean μ</label>
                    <input
                      type="number"
                      step="0.5"
                      value={rawMu}
                      onChange={(e) => setRawMu(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">SD σ</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.01"
                      value={rawSigma}
                      onChange={(e) => setRawSigma(Math.max(0.01, Number(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      {c2Mode === 'between' ? 'Lower z (a)' : 'Enter z (-3.79 to +3.79)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="-3.79"
                      max="3.79"
                      value={c2Z}
                      onChange={(e) => setC2Z(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                    />
                  </div>
                  {c2Mode === 'between' ? (
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">
                        Upper z (b)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="-3.79"
                        max="3.79"
                        value={c2Z2}
                        onChange={(e) => setC2Z2(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">
                        Reverse Lookup Φ(z) = p
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={c2RevProb}
                          onChange={(e) => setC2RevProb(e.target.value)}
                          placeholder="0.9750"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                        />
                        <button
                          onClick={() => {
                            const p = Math.min(0.99992, Math.max(0.00008, Number(c2RevProb) || 0.5));
                            const zFound = normalInv(p);
                            setC2Z(Math.round(zFound * 100) / 100);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          Find z
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confidence quick buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Quick CI z-crit:</span>
                {[
                  { label: '90% (z=1.645)', z: 1.64 },
                  { label: '95% (z=1.96)', z: 1.96 },
                  { label: '98% (z=2.33)', z: 2.33 },
                  { label: '99% (z=2.58)', z: 2.58 },
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => {
                      setC2Mode('left');
                      setC2Z(q.z);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 font-mono cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  {c2ProbabilitySummary.formula}
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                  Exact Probability = {c2ProbabilitySummary.value.toFixed(5)} · Cell Φ(
                  {c2Clamped.toFixed(2)}) = {formatSbNormal(normalCdf(c2Clamped), Math.abs(c2Clamped))}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Paper SB {c2IsNegative ? 'p. 768' : 'p. 769'}: Row{' '}
                  <strong>
                    {c2IsNegative && c2AbsTenths === 0
                      ? '-0.0'
                      : c2Rows[c2RowIdx].toFixed(1)}
                  </strong>{' '}
                  ∩ Column <strong>.{String(c2ColIdx).padStart(2, '0')}</strong>
                </div>
              </div>
            </div>

            <DistributionCurveSvg
              distribution="normal"
              shadeMode={c2ProbabilitySummary.shade}
              boundA={c2ProbabilitySummary.a}
              boundB={c2ProbabilitySummary.b}
              areaLabel={`Area = ${c2ProbabilitySummary.value.toFixed(4)}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing SB Page {c2IsNegative ? '768 (Negative z: -3.7 to -0.0)' : '769 (Positive z: 0.0 to 3.7)'}
            </span>
            <button
              onClick={() => setC2Z((prev) => (prev === 0 ? -0.5 : -prev))}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Flip Sign (±z) to view {c2IsNegative ? 'Positive p.769' : 'Negative p.768'}
            </button>
          </div>

          <div className={`overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 ${compact ? 'max-h-72' : 'max-h-[420px]'}`}>
            <table className="w-full text-xs font-mono border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="p-1.5 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800">
                    z
                  </th>
                  {SB_NORMAL_COLS.map((col, ci) => (
                    <th
                      key={col}
                      className={`p-1.5 border-b border-slate-200 dark:border-slate-700 text-center ${
                        ci === c2ColIdx ? 'bg-amber-200/80 dark:bg-amber-800/60' : ''
                      }`}
                    >
                      .{String(ci).padStart(2, '0')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c2Rows.map((rowVal, ri) => {
                  const isRowHit = ri === c2RowIdx;
                  const rowLabel =
                    c2IsNegative && Object.is(rowVal, -0)
                      ? '-0.0'
                      : c2IsNegative && rowVal === 0
                      ? '-0.0'
                      : rowVal.toFixed(1);
                  return (
                    <tr key={rowLabel} className={isRowHit ? 'bg-sky-50/90 dark:bg-sky-950/40' : ''}>
                      <th
                        className={`p-1.5 border-r border-slate-200 dark:border-slate-700 sticky left-0 text-right ${
                          isRowHit
                            ? 'bg-amber-200/80 dark:bg-amber-800/60 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rowLabel}
                      </th>
                      {SB_NORMAL_COLS.map((col, ci) => {
                        // Crucial fix: -1.9 + .06 = -1.96, NOT -1.84
                        const z = c2IsNegative ? -(Math.abs(rowVal) + col) : rowVal + col;
                        const val = formatSbNormal(normalCdf(z), Math.abs(z));
                        const isCell = isRowHit && ci === c2ColIdx;
                        const isColHit = ci === c2ColIdx;
                        return (
                          <td
                            key={ci}
                            onClick={() => {
                              if (c2Mode === 'raw') setC2Mode('left');
                              setC2Z(Number(z.toFixed(2)));
                            }}
                            className={`p-1.5 text-center cursor-pointer transition-colors ${
                              isCell
                                ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-600'
                                : isColHit
                                ? 'bg-amber-50/70 dark:bg-amber-950/20'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB D: STUDENT'S t ==================== */}
      {tab === 'd' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Appendix D (Book p. 770): Student's t Critical Values
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Degrees of Freedom (d.f. = n − 1)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      disabled={tInf}
                      value={tDf}
                      onChange={(e) => setTDf(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm disabled:opacity-50"
                    />
                    <button
                      onClick={() => setTInf((v) => !v)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                        tInf
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      df=∞
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Select Column (Conf / 2-Tail / 1-Tail)
                  </label>
                  <select
                    value={tColIdx}
                    onChange={(e) => setTColIdx(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                  >
                    {SB_T_COLUMNS.map((col, idx) => (
                      <option key={idx} value={idx}>
                        Conf {(col.conf * 100).toFixed(0)}% | 2-tail {col.twoTail} | 1-tail {col.oneTail}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Optional: Enter |t_obs| for p-value range
                  </label>
                  <input
                    type="text"
                    value={tObsInput}
                    onChange={(e) => setTObsInput(e.target.value)}
                    placeholder="e.g. 2.088"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                  />
                </div>
                {tObsValid && tObsPValue !== null && (
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs font-mono">
                    1-tail p = <strong>{tObsPValue.toFixed(4)}</strong> · 2-tail p ={' '}
                    <strong>{Math.min(1, 2 * tObsPValue).toFixed(4)}</strong>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                  t_({activeTCol.oneTail}, {tInf ? '∞' : effectiveTDf}) = {formatSbT(exactTCrit)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {tInf || effectiveTDf === nearestTableTDf ? (
                    <>Exact SB p. 770 row: d.f. = <strong>{tInf ? '∞' : effectiveTDf}</strong>.</>
                  ) : (
                    <>
                      d.f. = {effectiveTDf} is between printed rows; nearest highlighted row is{' '}
                      <strong>{nearestTableTDf}</strong> (conservative exam rule: round d.f. down to
                      smaller row!). Exact value computed = {formatSbT(exactTCrit)}.
                    </>
                  )}
                </div>
              </div>
            </div>

            <DistributionCurveSvg
              distribution="t"
              df={tInf ? 1e7 : effectiveTDf}
              shadeMode="right"
              boundA={exactTCrit}
              areaLabel={`Right tail α = ${activeTCol.oneTail}`}
            />
          </div>

          <div className={`overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 ${compact ? 'max-h-72' : 'max-h-[420px]'}`}>
            <table className="w-full text-xs font-mono border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <tr>
                  <th rowSpan={3} className="p-2 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800">
                    d.f.
                  </th>
                  <th colSpan={5} className="pt-1.5 px-2 text-center text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Confidence Level
                  </th>
                </tr>
                <tr>
                  {SB_T_COLUMNS.map((c, idx) => (
                    <th
                      key={`c-${idx}`}
                      className={`px-2 py-0.5 text-center ${
                        idx === tColIdx ? 'bg-amber-200/70 dark:bg-amber-800/50' : ''
                      }`}
                    >
                      .{Math.round(c.conf * 100)}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-slate-300 dark:border-slate-700">
                  {SB_T_COLUMNS.map((c, idx) => (
                    <th
                      key={`o-${idx}`}
                      className={`px-2 py-1 text-center text-[11px] ${
                        idx === tColIdx ? 'bg-amber-200/70 dark:bg-amber-800/50' : ''
                      }`}
                    >
                      <div>2-tail: {String(c.twoTail).replace(/^0/, '')}</div>
                      <div className="text-slate-500 dark:text-slate-400">
                        1-tail: {String(c.oneTail).replace(/^0/, '')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SB_T_DFS.map((dfRow) => {
                  const isRowHit = (tInf && dfRow === Infinity) || (!tInf && dfRow === nearestTableTDf);
                  return (
                    <tr key={String(dfRow)} className={isRowHit ? 'bg-sky-50/90 dark:bg-sky-950/40' : ''}>
                      <th
                        className={`p-1.5 border-r border-slate-200 dark:border-slate-700 sticky left-0 text-right ${
                          isRowHit
                            ? 'bg-amber-200/80 dark:bg-amber-800/60 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {dfRow === Infinity ? '∞' : dfRow}
                      </th>
                      {SB_T_COLUMNS.map((col, ci) => {
                        const val = formatSbT(tCritUpper(col.oneTail, dfRow));
                        const isCell = isRowHit && ci === tColIdx;
                        const isColHit = ci === tColIdx;
                        return (
                          <td
                            key={ci}
                            onClick={() => {
                              setTColIdx(ci);
                              if (dfRow === Infinity) setTInf(true);
                              else {
                                setTInf(false);
                                setTDf(dfRow);
                              }
                            }}
                            className={`p-1.5 text-center cursor-pointer ${
                              isCell
                                ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-600'
                                : isColHit
                                ? 'bg-amber-50/70 dark:bg-amber-950/20'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB E: CHI-SQUARE ==================== */}
      {tab === 'e' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  Appendix E (Book p. 771): Chi-Square (χ²) Upper-Tail Critical Values
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setChiMode('single')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      chiMode === 'single'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Single Tail α
                  </button>
                  <button
                    onClick={() => setChiMode('ci')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      chiMode === 'ci'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Two-Sided CI for σ²
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Degrees of Freedom (d.f. = n − 1)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={chiDf}
                    onChange={(e) => setChiDf(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                  />
                </div>
                {chiMode === 'single' ? (
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Area in Upper Tail (α)
                    </label>
                    <select
                      value={chiAlpha}
                      onChange={(e) => setChiAlpha(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                    >
                      {SB_CHISQ_ALPHAS.map((a) => (
                        <option key={a} value={a}>
                          {String(a).replace(/^0/, '')}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Confidence Level for σ²
                    </label>
                    <select
                      value={chiCiLevel}
                      onChange={(e) =>
                        setChiCiLevel(Number(e.target.value) as 0.9 | 0.95 | 0.98 | 0.99)
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                    >
                      <option value={0.9}>90% CI (.95 and .05)</option>
                      <option value={0.95}>95% CI (.975 and .025)</option>
                      <option value={0.98}>98% CI (.99 and .01)</option>
                      <option value={0.99}>99% CI (.995 and .005)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Optional: Enter χ²_obs for upper-tail p
                  </label>
                  <input
                    type="text"
                    value={chiObsInput}
                    onChange={(e) => setChiObsInput(e.target.value)}
                    placeholder="e.g. 17.45"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm"
                  />
                </div>
                {chiObsValid && chiObsUpperP !== null && (
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs font-mono">
                    Upper p = <strong>{chiObsUpperP.toFixed(4)}</strong>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                {chiMode === 'single' ? (
                  <div className="text-sm font-bold font-mono">
                    χ²_({chiAlpha}, {effectiveChiDf}) = {formatSbChiSq(chiSingleCrit)}
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-bold font-mono">
                      Lower χ²_({(1 - ciTailAlpha).toFixed(3)}, {effectiveChiDf}) ={' '}
                      {formatSbChiSq(chiLowerCrit)} · Upper χ²_({ciTailAlpha.toFixed(3)},{' '}
                      {effectiveChiDf}) = {formatSbChiSq(chiUpperCrit)}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                      <span>
                        Exam trap reminder: CI for σ² puts the <strong>larger</strong> χ² ({formatSbChiSq(chiUpperCrit)})
                        under the lower bound and the <strong>smaller</strong> χ² ({formatSbChiSq(chiLowerCrit)})
                        under the upper bound!
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <DistributionCurveSvg
              distribution="chisq"
              df={effectiveChiDf}
              shadeMode={chiMode === 'single' ? 'right' : 'central'}
              boundA={chiMode === 'single' ? chiSingleCrit : chiLowerCrit}
              boundB={chiMode === 'single' ? chiSingleCrit : chiUpperCrit}
              areaLabel={
                chiMode === 'single'
                  ? `Upper area = ${chiAlpha}`
                  : `Middle area = ${chiCiLevel}`
              }
            />
          </div>

          <div className={`overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 ${compact ? 'max-h-72' : 'max-h-[420px]'}`}>
            <table className="w-full text-xs font-mono border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="p-1.5 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800">
                    d.f.
                  </th>
                  {SB_CHISQ_ALPHAS.map((a) => {
                    const isColHit =
                      chiMode === 'single'
                        ? Math.abs(a - chiAlpha) < 1e-6
                        : Math.abs(a - ciTailAlpha) < 1e-4 ||
                          Math.abs(a - (1 - ciTailAlpha)) < 1e-4;
                    return (
                      <th
                        key={a}
                        className={`p-1.5 border-b border-slate-200 dark:border-slate-700 text-center ${
                          isColHit ? 'bg-amber-200/80 dark:bg-amber-800/60' : ''
                        }`}
                      >
                        {String(a).replace(/^0/, '')}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {SB_CHISQ_DFS.map((dfRow) => {
                  const isRowHit = dfRow === nearestTableChiDf;
                  return (
                    <tr key={dfRow} className={isRowHit ? 'bg-sky-50/90 dark:bg-sky-950/40' : ''}>
                      <th
                        className={`p-1.5 border-r border-slate-200 dark:border-slate-700 sticky left-0 text-right ${
                          isRowHit
                            ? 'bg-amber-200/80 dark:bg-amber-800/60 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {dfRow}
                      </th>
                      {SB_CHISQ_ALPHAS.map((a) => {
                        const val = formatSbChiSq(chiSqCritUpper(a, dfRow));
                        const isColHit =
                          chiMode === 'single'
                            ? Math.abs(a - chiAlpha) < 1e-6
                            : Math.abs(a - ciTailAlpha) < 1e-4 ||
                              Math.abs(a - (1 - ciTailAlpha)) < 1e-4;
                        const isCell = isRowHit && isColHit;
                        return (
                          <td
                            key={a}
                            onClick={() => {
                              setChiDf(dfRow);
                              if (chiMode === 'single') setChiAlpha(a);
                            }}
                            className={`p-1.5 text-center cursor-pointer ${
                              isCell
                                ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-600'
                                : isColHit
                                ? 'bg-amber-50/70 dark:bg-amber-950/20'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB F: F CRITICAL ==================== */}
      {tab === 'f' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Appendix F ({F_PAGE_MAP[fAlpha]}): Critical Values of F_{String(fAlpha).replace(/^0/, '')}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SB_F_ALPHAS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setFAlpha(a)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                      fAlpha === a
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    α = {String(a).replace(/^0/, '')} ({F_PAGE_MAP[a]})
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Numerator df₁ (columns)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      disabled={fDf1Inf}
                      value={fDf1}
                      onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value) || 1);
                        setFDf1(v);
                        setFPagePart(v <= 12 ? 'left' : 'right');
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm disabled:opacity-50"
                    />
                    <button
                      onClick={() => {
                        setFDf1Inf((v) => !v);
                        setFPagePart('right');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                        fDf1Inf ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      ∞
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Denominator df₂ (rows)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      disabled={fDf2Inf}
                      value={fDf2}
                      onChange={(e) => setFDf2(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm disabled:opacity-50"
                    />
                    <button
                      onClick={() => setFDf2Inf((v) => !v)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                        fDf2Inf ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      ∞
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
                <div className="text-sm font-bold font-mono">
                  F_{String(fAlpha).replace(/^0/, '')}({fDf1Inf ? '∞' : effFDf1},{' '}
                  {fDf2Inf ? '∞' : effFDf2}) = {formatSbF(exactFCrit)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Reverse F note: left-tail F_(1−α)(df₁, df₂) = 1 / F_α(df₂, df₁) ={' '}
                  <strong className="font-mono">
                    {(1 / fCritUpper(fAlpha, effFDf2, effFDf1)).toFixed(4)}
                  </strong>
                  . Exact upper-tail P(F &gt; {formatSbF(exactFCrit)}) ={' '}
                  {fUpperTail(exactFCrit, effFDf1, effFDf2).toFixed(4)}.
                </div>
              </div>
            </div>

            <DistributionCurveSvg
              distribution="f"
              df1={fDf1Inf ? 200 : effFDf1}
              df2={fDf2Inf ? 200 : effFDf2}
              shadeMode="right"
              boundA={exactFCrit}
              areaLabel={`Right tail α = ${fAlpha}`}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              SB Page columns split (like printed booklet):
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setFPagePart('left')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  fPagePart === 'left'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                df₁: 1 – 12 (Even p.)
              </button>
              <button
                onClick={() => setFPagePart('right')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  fPagePart === 'right'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                df₁: 15 – ∞ (Odd p.)
              </button>
            </div>
          </div>

          <div className={`overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 ${compact ? 'max-h-72' : 'max-h-[420px]'}`}>
            {(() => {
              const visibleDf1 =
                fPagePart === 'left'
                  ? SB_F_DF1.filter((x) => Number.isFinite(x) && x <= 12)
                  : SB_F_DF1.filter((x) => !Number.isFinite(x) || x >= 15);
              return (
                <table className="w-full text-xs font-mono border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="p-1.5 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-100 dark:bg-slate-800">
                        df₂ \ df₁
                      </th>
                      {visibleDf1.map((c) => {
                        const hit = c === nearestFDf1;
                        return (
                          <th
                            key={String(c)}
                            className={`p-1.5 border-b border-slate-200 dark:border-slate-700 text-center ${
                              hit ? 'bg-amber-200/80 dark:bg-amber-800/60' : ''
                            }`}
                          >
                            {c === Infinity ? '∞' : c}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {SB_F_DF2.map((r) => {
                      const isRowHit = r === nearestFDf2;
                      return (
                        <tr key={String(r)} className={isRowHit ? 'bg-sky-50/90 dark:bg-sky-950/40' : ''}>
                          <th
                            className={`p-1.5 border-r border-slate-200 dark:border-slate-700 sticky left-0 text-right ${
                              isRowHit
                                ? 'bg-amber-200/80 dark:bg-amber-800/60 font-bold'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {r === Infinity ? '∞' : r}
                          </th>
                          {visibleDf1.map((c) => {
                            const val = formatSbF(fCritUpper(fAlpha, c, r));
                            const isColHit = c === nearestFDf1;
                            const isCell = isRowHit && isColHit;
                            return (
                              <td
                                key={String(c)}
                                onClick={() => {
                                  if (c === Infinity) setFDf1Inf(true);
                                  else {
                                    setFDf1Inf(false);
                                    setFDf1(c);
                                  }
                                  if (r === Infinity) setFDf2Inf(true);
                                  else {
                                    setFDf2Inf(false);
                                    setFDf2(r);
                                  }
                                }}
                                className={`p-1.5 text-center cursor-pointer ${
                                  isCell
                                    ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-600'
                                    : isColHit
                                    ? 'bg-amber-50/70 dark:bg-amber-950/20'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}

      {/* Universal Booklet Legend */}
      <div className="rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
        <BookOpen className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> SB Booklet Tail Conventions at a Glance
          </div>
          <div>
            <strong>C-1 (p.767)</strong>: Middle area 0 → z · <strong>C-2 (p.768–769)</strong>: Left cumulative −∞ → z ·{' '}
            <strong>D (p.770)</strong>: Right-tail t · <strong>E (p.771)</strong>: Upper-tail χ² ·{' '}
            <strong>F (p.772–779)</strong>: Upper-tail F. Click any table cell to jump the visualizer to it!
          </div>
        </div>
      </div>
    </div>
  );
};
