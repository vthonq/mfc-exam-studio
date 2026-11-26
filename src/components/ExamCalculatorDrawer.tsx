import React, { useEffect, useState } from 'react';
import { Calculator, Check, Copy, X } from 'lucide-react';
import {
  computeCombinatorics,
  computeEconQuickCalc,
  computeModularCalc,
  computeQuickOneSampleT,
  computeSampleStats,
  convertIntegerBases,
  parseNumberList,
} from '../utils/examCalculator';
import type { SubjectId } from '../types';

interface ExamCalculatorDrawerProps {
  open: boolean;
  onClose: () => void;
  initialSubject: SubjectId;
}

export const ExamCalculatorDrawer: React.FC<ExamCalculatorDrawerProps> = ({
  open,
  onClose,
  initialSubject,
}) => {
  const [tab, setTab] = useState<SubjectId>(initialSubject);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);

  // ProbStat state
  const [sampleInput, setSampleInput] = useState('12, 15, 14, 18, 16, 15');
  const [mu0Input, setMu0Input] = useState('14');
  const [confLevel, setConfLevel] = useState(0.95);
  const [nComb, setNComb] = useState('10');
  const [rComb, setRComb] = useState('3');

  // MFC state
  const [modA, setModA] = useState('7');
  const [modB, setModB] = useState('13');
  const [modM, setModM] = useState('11');
  const [baseInput, setBaseInput] = useState('42');
  const [fromBase, setFromBase] = useState<10 | 2 | 16 | 8>(10);

  // Econ state
  const [oldVal, setOldVal] = useState('100');
  const [newVal, setNewVal] = useState('108');
  const [nomRate, setNomRate] = useState('7');
  const [infRate, setInfRate] = useState('3');
  const [mpcInput, setMpcInput] = useState('0.8');
  const [deltaGInput, setDeltaGInput] = useState('25');
  const [reservePct, setReservePct] = useState('10');

  useEffect(() => {
    if (open) {
      setTab(initialSubject);
    }
  }, [open, initialSubject]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const copySteps = async (id: string, lines: string[]) => {
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedBlock(id);
      window.setTimeout(() => setCopiedBlock(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  // Derived ProbStat computations
  const nums = parseNumberList(sampleInput);
  const stats = computeSampleStats(nums);
  const tTest =
    stats.n >= 2
      ? computeQuickOneSampleT(
          stats.mean,
          Number(mu0Input) || 0,
          stats.sampleSd,
          stats.n,
          confLevel,
        )
      : null;
  const comb = computeCombinatorics(Number(nComb) || 0, Number(rComb) || 0);

  // Derived MFC computations
  const modCalc = computeModularCalc(Number(modA) || 0, Number(modB) || 0, Number(modM) || 1);
  const baseRes = convertIntegerBases(baseInput, fromBase);

  // Derived Econ computations
  const econCalc = computeEconQuickCalc({
    oldVal: Number(oldVal) || 0,
    newVal: Number(newVal) || 0,
    nominalRate: Number(nomRate) || 0,
    inflationRate: Number(infRate) || 0,
    mpc: Number(mpcInput) || 0.8,
    deltaG: Number(deltaGInput) || 0,
    reserveRatioPct: Number(reservePct) || 10,
  });

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex justify-end"
      onClick={onClose}
    >
      <aside
        className="animate-slide-in-right w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Show-Your-Work Exam Calculator"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                  Show-Your-Work Exam Calc
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instant intermediate steps you can copy onto paper or exams
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              aria-label="Close Exam Calculator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-xs">
            {(
              [
                { id: 'probstat', label: 'ProbStat' },
                { id: 'mfc', label: 'MFC Mod' },
                { id: 'econ', label: 'Econ' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  tab === t.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {tab === 'probstat' && (
            <>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  1. Sample Stats, t-Test &amp; CI Scratchpad
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Paste sample values (comma or space separated):
                  </label>
                  <textarea
                    rows={2}
                    value={sampleInput}
                    onChange={(e) => setSampleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Null H₀ mean μ₀</label>
                    <input
                      type="number"
                      step="any"
                      value={mu0Input}
                      onChange={(e) => setMu0Input(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Confidence Level</label>
                    <select
                      value={confLevel}
                      onChange={(e) => setConfLevel(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    >
                      <option value={0.9}>90%</option>
                      <option value={0.95}>95%</option>
                      <option value={0.99}>99%</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">n / x̄</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {stats.n} / {stats.mean.toFixed(3)}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">s² / s</div>
                    <div className="font-bold text-sky-600 dark:text-sky-400">
                      {stats.sampleVar.toFixed(3)} / {stats.sampleSd.toFixed(3)}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Median</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {stats.median.toFixed(3)}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Show-Your-Work Steps
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void copySteps('ps-steps', [
                          ...stats.workingLines,
                          ...(tTest ? tTest.workingLines : []),
                        ])
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {copiedBlock === 'ps-steps' ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Steps
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    {stats.workingLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                    {tTest?.workingLines.map((line, i) => (
                      <div key={`t-${i}`} className="text-sky-700 dark:text-sky-300">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2.5">
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  2. Combinatorics: C(n, r) &amp; P(n, r)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    max={170}
                    value={nComb}
                    onChange={(e) => setNComb(e.target.value)}
                    placeholder="n"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                  <input
                    type="number"
                    min={0}
                    max={170}
                    value={rComb}
                    onChange={(e) => setRComb(e.target.value)}
                    placeholder="r"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex justify-between">
                  <span>C({nComb},{rComb}) = {comb.nCr.toLocaleString()}</span>
                  <span>P({nComb},{rComb}) = {comb.nPr.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

          {tab === 'mfc' && (
            <>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  1. Modular Power, GCD &amp; Inverse (Ch. 4)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Base a</label>
                    <input
                      type="number"
                      value={modA}
                      onChange={(e) => setModA(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Exp b</label>
                    <input
                      type="number"
                      value={modB}
                      onChange={(e) => setModB(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Mod m</label>
                    <input
                      type="number"
                      value={modM}
                      onChange={(e) => setModM(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">a^b mod m</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">{modCalc.powMod}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">gcd(a, m)</div>
                    <div className="font-bold">{modCalc.gcdVal}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">a⁻¹ mod m</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {modCalc.inverse ?? 'None'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Show-Your-Work Steps
                    </span>
                    <button
                      type="button"
                      onClick={() => void copySteps('mfc-steps', modCalc.workingLines)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {copiedBlock === 'mfc-steps' ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Steps
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    {modCalc.workingLines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2.5">
                <div className="font-bold text-slate-800 dark:text-slate-100">
                  2. Base Converter (Dec / Bin / Hex / Oct)
                </div>
                <div className="flex gap-2">
                  <select
                    value={fromBase}
                    onChange={(e) => setFromBase(Number(e.target.value) as 10 | 2 | 16 | 8)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  >
                    <option value={10}>Base 10</option>
                    <option value={2}>Base 2</option>
                    <option value={16}>Base 16</option>
                    <option value={8}>Base 8</option>
                  </select>
                  <input
                    type="text"
                    value={baseInput}
                    onChange={(e) => setBaseInput(e.target.value)}
                    placeholder="Value..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                {baseRes ? (
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      DEC: <strong>{baseRes.dec}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      HEX: <strong>{baseRes.hex}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2">
                      BIN: <strong>{baseRes.bin}</strong> · OCT: <strong>{baseRes.oct}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-rose-500 text-[11px]">Invalid digits for selected base.</div>
                )}
              </div>
            </>
          )}

          {tab === 'econ' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
              <div className="font-bold text-slate-800 dark:text-slate-100">
                Macro Exam Formula Scratchpad
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Old Value (CPI₁/Y₁)</label>
                  <input
                    type="number"
                    step="any"
                    value={oldVal}
                    onChange={(e) => setOldVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">New Value (CPI₂/Y₂)</label>
                  <input
                    type="number"
                    step="any"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Nominal i (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={nomRate}
                    onChange={(e) => setNomRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Inflation π (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={infRate}
                    onChange={(e) => setInfRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">MPC (0–0.98)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={mpcInput}
                    onChange={(e) => setMpcInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">ΔG &amp; Reserve R%</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="any"
                      value={deltaGInput}
                      onChange={(e) => setDeltaGInput(e.target.value)}
                      className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      title="ΔG"
                    />
                    <input
                      type="number"
                      step="any"
                      value={reservePct}
                      onChange={(e) => setReservePct(e.target.value)}
                      className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      title="Reserve Ratio %"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">% Change / Rule of 70</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    {econCalc.pctChange.toFixed(2)}% (
                    {Number.isFinite(econCalc.rule70Years)
                      ? `${econCalc.rule70Years.toFixed(1)}y`
                      : '∞'}
                    )
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400">Real r / Money Mult</div>
                  <div className="font-bold">
                    {econCalc.realRate.toFixed(2)}% / {econCalc.moneyMult.toFixed(2)}×
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Show-Your-Work Steps
                  </span>
                  <button
                    type="button"
                    onClick={() => void copySteps('econ-steps', econCalc.workingLines)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {copiedBlock === 'econ-steps' ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Steps
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  {econCalc.workingLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
