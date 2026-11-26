import React, { useMemo, useState } from 'react';
import { BarChart3, FlaskConical, Table2 } from 'lucide-react';
import {
  analyzeDiscreteJoint,
  binomialCdf,
  binomialPmf,
  binomialStats,
  ciMeanT,
  ciMeanZ,
  ciProportion,
  ciVarianceChiSq,
  exponentialCdf,
  exponentialStats,
  gammaStats,
  geometricCdf,
  geometricPmf,
  geometricStats,
  hypergeometricCdf,
  hypergeometricPmf,
  hypergeometricStats,
  negBinomialCdf,
  negBinomialPmf,
  negBinomialStats,
  normalCdf,
  normalInv,
  poissonCdf,
  poissonPmf,
  poissonStats,
  powerMeanZ,
  sampleSizeMean,
  sampleSizeProportion,
  testMeanT,
  testMeanZ,
  testProportionZ,
  testVarianceChiSq,
  uniformCdf,
  uniformStats,
  type TailType,
} from '../../math/probStat';
import type { ProbLabTab } from '../../types';
import { DistributionCurveSvg } from '../../components/probstat/DistributionCurveSvg';
import { SbTableModal } from '../../components/probstat/SbTableModal';
import type { SbAppendixId } from '../../components/probstat/SbTableExplorer';
import { MathFormula } from '../../components/Math';

interface ProbLabsPageProps {
  activeTab: ProbLabTab;
  onSelectTab: (tab: ProbLabTab) => void;
}

type DiscreteFamily = 'binomial' | 'poisson' | 'geometric' | 'negbin' | 'hyper';

export const ProbLabsPage: React.FC<ProbLabsPageProps> = ({ activeTab, onSelectTab }) => {
  const [sbModalOpen, setSbModalOpen] = useState(false);
  const [sbTab, setSbTab] = useState<SbAppendixId>('c2');

  // ---------- Tab 1: Discrete ----------
  const [discFam, setDiscFam] = useState<DiscreteFamily>('binomial');
  const [dN, setDN] = useState(10);
  const [dP, setDP] = useState(0.3);
  const [dLam, setDLam] = useState(2.5);
  const [dR, setDR] = useState(3);
  const [dPopN, setDPopN] = useState(25);
  const [dPopD, setDPopD] = useState(5);
  const [dK, setDK] = useState(3);

  const discResult = useMemo(() => {
    const k = Math.max(0, Math.round(dK));
    const bars: Array<{ k: number; p: number }> = [];
    let mean = 0;
    let variance = 0;
    let pmfAtK = 0;
    let cdfAtK = 0;
    let note = '';

    if (discFam === 'binomial') {
      const n = Math.max(1, Math.min(40, Math.round(dN)));
      const p = Math.min(0.999, Math.max(0.001, dP));
      const st = binomialStats(n, p);
      mean = st.mean;
      variance = st.variance;
      pmfAtK = binomialPmf(k, n, p);
      cdfAtK = binomialCdf(k, n, p);
      for (let i = 0; i <= Math.min(n, 20); i++) bars.push({ k: i, p: binomialPmf(i, n, p) });
      if (n >= 20 && p <= 0.05) {
        note = `Poisson approx applies (n≥20, p≤0.05): Poisson(λ = np = ${(n * p).toFixed(2)}).`;
      }
    } else if (discFam === 'poisson') {
      const lam = Math.max(0.1, dLam);
      const st = poissonStats(lam);
      mean = st.mean;
      variance = st.variance;
      pmfAtK = poissonPmf(k, lam);
      cdfAtK = poissonCdf(k, lam);
      const maxBar = Math.min(24, Math.max(10, Math.ceil(lam + 4 * Math.sqrt(lam))));
      for (let i = 0; i <= maxBar; i++) bars.push({ k: i, p: poissonPmf(i, lam) });
      note = `E(X) = Var(X) = λ = ${lam}.`;
    } else if (discFam === 'geometric') {
      const p = Math.min(0.999, Math.max(0.01, dP));
      const kk = Math.max(1, k);
      const st = geometricStats(p);
      mean = st.mean;
      variance = st.variance;
      pmfAtK = geometricPmf(kk, p);
      cdfAtK = geometricCdf(kk, p);
      for (let i = 1; i <= 15; i++) bars.push({ k: i, p: geometricPmf(i, p) });
      note = `Dr. Hoang convention: trial of 1st success (k ≥ 1). Memoryless!`;
    } else if (discFam === 'negbin') {
      const r = Math.max(1, Math.min(10, Math.round(dR)));
      const p = Math.min(0.999, Math.max(0.01, dP));
      const kk = Math.max(r, k);
      const st = negBinomialStats(r, p);
      mean = st.mean;
      variance = st.variance;
      pmfAtK = negBinomialPmf(kk, r, p);
      cdfAtK = negBinomialCdf(kk, r, p);
      const maxBar = Math.min(r + 18, Math.ceil(mean + 3 * st.sd));
      for (let i = r; i <= maxBar; i++) bars.push({ k: i, p: negBinomialPmf(i, r, p) });
      note = `Trials until r=${r} successes (k ≥ ${r}). Sum of ${r} i.i.d. Geo(${p}).`;
    } else {
      const N = Math.max(2, Math.round(dPopN));
      const D = Math.min(N, Math.max(1, Math.round(dPopD)));
      const n = Math.min(N, Math.max(1, Math.round(dN)));
      const st = hypergeometricStats(n, N, D);
      mean = st.mean;
      variance = st.variance;
      pmfAtK = hypergeometricPmf(k, n, N, D);
      cdfAtK = hypergeometricCdf(k, n, N, D);
      const lo = Math.max(0, n - (N - D));
      const hi = Math.min(n, D);
      for (let i = lo; i <= hi; i++) bars.push({ k: i, p: hypergeometricPmf(i, n, N, D) });
      note =
        N / n > 20
          ? `N/n = ${(N / n).toFixed(1)} > 20 ⇒ Binomial(${n}, ${(D / N).toFixed(3)}) approximates closely.`
          : `Sampling WITHOUT replacement from N=${N} with D=${D}.`;
    }
    return {
      bars,
      mean,
      variance,
      sd: Math.sqrt(variance),
      pmfAtK,
      cdfAtK,
      pGeK: 1 - cdfAtK + pmfAtK,
      note,
    };
  }, [discFam, dN, dP, dLam, dR, dPopN, dPopD, dK]);

  // ---------- Tab 2: Continuous ----------
  const [normMu, setNormMu] = useState(450);
  const [normSigma, setNormSigma] = useState(100);
  const [normLo, setNormLo] = useState(400);
  const [normHi, setNormHi] = useState(500);
  const [expMean, setExpMean] = useState(10);
  const [expT, setExpT] = useState(15);
  const [gamAlpha, setGamAlpha] = useState(3);
  const [gamBeta, setGamBeta] = useState(0.5);
  const [uniA, setUniA] = useState(-1);
  const [uniB, setUniB] = useState(5);

  const zLo = (normLo - normMu) / Math.max(0.01, normSigma);
  const zHi = (normHi - normMu) / Math.max(0.01, normSigma);
  const normProb = Math.max(0, normalCdf(Math.max(zLo, zHi)) - normalCdf(Math.min(zLo, zHi)));
  const expLam = 1 / Math.max(0.01, expMean);
  const expPgt = 1 - exponentialCdf(expT, expLam);
  const expSt = exponentialStats(expLam);
  const gamSt = gammaStats(gamAlpha, gamBeta);
  const uniSt = uniformStats(uniA, uniB);

  // ---------- Tab 3: Bivariate Joint Table ----------
  const [xs] = useState([1, 2, 3, 4]);
  const [ys] = useState([1, 2]);
  const [jointGrid, setJointGrid] = useState<number[][]>([
    [0.05, 0.05, 0.15, 0.1],
    [0.1, 0.2, 0.3, 0.05],
  ]);
  const [linA, setLinA] = useState(2);
  const [linB, setLinB] = useState(-3);

  const jointRes = useMemo(
    () => analyzeDiscreteJoint(xs, ys, jointGrid),
    [xs, ys, jointGrid],
  );
  const linMean = linA * jointRes.ex + linB * jointRes.ey;
  const linVar =
    linA * linA * jointRes.varX +
    linB * linB * jointRes.varY +
    2 * linA * linB * jointRes.cov;

  // ---------- Tab 4: Ch. 4-5 Inference Workbench ----------
  const [infMode, setInfMode] = useState<'mean-z' | 'mean-t' | 'prop' | 'var'>('mean-t');
  const [infXbar, setInfXbar] = useState(167.1);
  const [infMu0, setInfMu0] = useState(165);
  const [infS, setInfS] = useState(10.06);
  const [infN, setInfN] = useState(100);
  const [infCount, setInfCount] = useState(355);
  const [infPi0, setInfPi0] = useState(0.6667);
  const [infS2, setInfS2] = useState(3.2);
  const [infSig0Sq, setInfSig0Sq] = useState(1.65);
  const [infAlpha, setInfAlpha] = useState(0.05);
  const [infTail, setInfTail] = useState<TailType>('right');
  const [pwrMuTrue, setPwrMuTrue] = useState(168);

  const openSbAt = (t: SbAppendixId) => {
    setSbTab(t);
    setSbModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-sky-600" />
            Probability &amp; Statistics Interactive Labs
          </h1>
          <p className="text-xs text-slate-500">
            Verify formulas, visualize shaded curves, and cross-check SB Tables step by step.
          </p>
        </div>

        <button
          onClick={() => openSbAt(activeTab === 'inference' ? 'd' : 'c2')}
          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
        >
          <Table2 className="w-4 h-4" /> Open SB Tables Popup
        </button>
      </div>

      {/* Lab Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(
          [
            { id: 'discrete', label: 'Ch. 1 · Discrete Distributions' },
            { id: 'continuous', label: 'Ch. 2 · Continuous (Normal / Exp / Gamma)' },
            { id: 'bivariate', label: 'Ch. 3 · Bivariate Joint Table' },
            { id: 'inference', label: 'Ch. 4–5 · CI, Tests & Power' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              activeTab === t.id
                ? 'bg-sky-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB 1: DISCRETE ==================== */}
      {activeTab === 'discrete' && (
        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'binomial', label: 'Binomial' },
                  { id: 'poisson', label: 'Poisson' },
                  { id: 'geometric', label: 'Geometric' },
                  { id: 'negbin', label: 'Neg. Binomial' },
                  { id: 'hyper', label: 'Hypergeometric' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDiscFam(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    discFam === f.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {(discFam === 'binomial' || discFam === 'hyper') && (
                <div>
                  <label className="text-slate-500 block mb-1">Sample / Trials n</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={dN}
                    onChange={(e) => setDN(Number(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              )}
              {(discFam === 'binomial' || discFam === 'geometric' || discFam === 'negbin') && (
                <div>
                  <label className="text-slate-500 block mb-1">Success prob p</label>
                  <input
                    type="number"
                    step="0.05"
                    min={0.01}
                    max={0.99}
                    value={dP}
                    onChange={(e) => setDP(Number(e.target.value) || 0.1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              )}
              {discFam === 'poisson' && (
                <div>
                  <label className="text-slate-500 block mb-1">Rate λ</label>
                  <input
                    type="number"
                    step="0.2"
                    min={0.1}
                    value={dLam}
                    onChange={(e) => setDLam(Number(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              )}
              {discFam === 'negbin' && (
                <div>
                  <label className="text-slate-500 block mb-1">Target successes r</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={dR}
                    onChange={(e) => setDR(Number(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              )}
              {discFam === 'hyper' && (
                <>
                  <div>
                    <label className="text-slate-500 block mb-1">Population N</label>
                    <input
                      type="number"
                      min={2}
                      value={dPopN}
                      onChange={(e) => setDPopN(Number(e.target.value) || 2)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Successes in Pop D</label>
                    <input
                      type="number"
                      min={1}
                      value={dPopD}
                      onChange={(e) => setDPopD(Number(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="text-slate-500 block mb-1">Evaluate at k</label>
                <input
                  type="number"
                  min={0}
                  value={dK}
                  onChange={(e) => setDK(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <div className="text-[10px] text-slate-500">E(X)</div>
                <div className="font-mono font-bold text-sm">{discResult.mean.toFixed(3)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <div className="text-[10px] text-slate-500">Var(X)</div>
                <div className="font-mono font-bold text-sm">{discResult.variance.toFixed(3)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <div className="text-[10px] text-slate-500">SD(X)</div>
                <div className="font-mono font-bold text-sm">{discResult.sd.toFixed(3)}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs font-mono space-y-1">
              <div>P(X = {dK}) = <strong>{discResult.pmfAtK.toFixed(5)}</strong></div>
              <div>P(X ≤ {dK}) = <strong>{discResult.cdfAtK.toFixed(5)}</strong></div>
              <div>P(X ≥ {dK}) = <strong>{discResult.pGeK.toFixed(5)}</strong></div>
            </div>
            {discResult.note && <p className="text-xs text-slate-500">{discResult.note}</p>}
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-sky-600" /> PMF Bar Chart (click any bar to set k)
            </div>
            {(() => {
              const maxP = Math.max(0.05, ...discResult.bars.map((b) => b.p));
              return (
                <div className="flex items-end gap-1.5 h-56 pt-4 pb-2 overflow-x-auto">
                  {discResult.bars.map((b) => {
                    const pctH = Math.round((b.p / maxP) * 100);
                    const hit = b.k === Math.round(dK);
                    return (
                      <button
                        key={b.k}
                        onClick={() => setDK(b.k)}
                        className="flex-1 min-w-[26px] flex flex-col items-center justify-end h-full group cursor-pointer"
                        title={`k=${b.k}: P(X=${b.k}) = ${b.p.toFixed(4)}`}
                      >
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-sky-600 mb-1">
                          {b.p >= 0.005 ? b.p.toFixed(2) : ''}
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            hit
                              ? 'bg-amber-400 ring-2 ring-amber-600'
                              : b.k <= dK
                              ? 'bg-sky-500/80'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{ height: `${Math.max(3, pctH)}%` }}
                        />
                        <span className={`text-[10px] font-mono mt-1 ${hit ? 'font-bold text-amber-600' : 'text-slate-500'}`}>
                          {b.k}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CONTINUOUS ==================== */}
      {activeTab === 'continuous' && (
        <div className="space-y-4">
          {/* Normal Lab */}
          <div className="grid lg:grid-cols-2 gap-4 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm">Normal Distribution N(μ, σ²) &amp; SB Standardization</h2>
                <button
                  onClick={() => openSbAt('c2')}
                  className="text-xs text-sky-600 font-semibold hover:underline cursor-pointer"
                >
                  Open App. C-2 →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-slate-500 block">Mean μ</label>
                  <input
                    type="number"
                    value={normMu}
                    onChange={(e) => setNormMu(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block">SD σ</label>
                  <input
                    type="number"
                    min={0.01}
                    value={normSigma}
                    onChange={(e) => setNormSigma(Math.max(0.01, Number(e.target.value) || 1))}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block">Lower a</label>
                  <input
                    type="number"
                    value={normLo}
                    onChange={(e) => setNormLo(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block">Upper b</label>
                  <input
                    type="number"
                    value={normHi}
                    onChange={(e) => setNormHi(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs font-mono space-y-1">
                <div>z₁ = ({normLo} − {normMu})/{normSigma} = <strong>{zLo.toFixed(3)}</strong> (Φ={normalCdf(zLo).toFixed(4)})</div>
                <div>z₂ = ({normHi} − {normMu})/{normSigma} = <strong>{zHi.toFixed(3)}</strong> (Φ={normalCdf(zHi).toFixed(4)})</div>
                <div>P({Math.min(normLo, normHi)} ≤ X ≤ {Math.max(normLo, normHi)}) = <strong>{normProb.toFixed(5)}</strong></div>
                <div>Q₁ = {(normMu + normalInv(0.25) * normSigma).toFixed(2)}, Q₃ = {(normMu + normalInv(0.75) * normSigma).toFixed(2)}</div>
              </div>
            </div>
            <DistributionCurveSvg
              distribution="normal"
              shadeMode="between"
              boundA={zLo}
              boundB={zHi}
              areaLabel={`P = ${normProb.toFixed(4)}`}
            />
          </div>

          {/* Exponential, Uniform, Gamma Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="font-bold text-sm">Exponential Exp(λ = 1/mean)</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block">Mean 1/λ</label>
                  <input
                    type="number"
                    min={0.1}
                    value={expMean}
                    onChange={(e) => setExpMean(Math.max(0.1, Number(e.target.value) || 1))}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block">Time t</label>
                  <input
                    type="number"
                    min={0}
                    value={expT}
                    onChange={(e) => setExpT(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 font-mono space-y-0.5">
                <div>λ = {expLam.toFixed(4)}, Var = {expSt.variance.toFixed(2)}</div>
                <div>P(X &gt; {expT}) = e^(−λt) = <strong>{expPgt.toFixed(4)}</strong></div>
                <div>P(X &gt; s+{expT} | X &gt; s) = <strong>{expPgt.toFixed(4)}</strong></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="font-bold text-sm">Gamma Γ(shape α, rate β)</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block">Shape α</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={gamAlpha}
                    onChange={(e) => setGamAlpha(Math.max(0.5, Number(e.target.value) || 1))}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block">Rate β</label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={gamBeta}
                    onChange={(e) => setGamBeta(Math.max(0.1, Number(e.target.value) || 0.5))}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 font-mono space-y-0.5">
                <div>E(X) = α/β = <strong>{gamSt.mean.toFixed(3)}</strong></div>
                <div>Var(X) = α/β² = <strong>{gamSt.variance.toFixed(3)}</strong></div>
                {gamAlpha > 1 && <div>Mode = (α−1)/β = <strong>{((gamAlpha - 1) / gamBeta).toFixed(3)}</strong></div>}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="font-bold text-sm">Uniform U(a, b)</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block">Lower a</label>
                  <input
                    type="number"
                    value={uniA}
                    onChange={(e) => setUniA(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block">Upper b</label>
                  <input
                    type="number"
                    value={uniB}
                    onChange={(e) => setUniB(Number(e.target.value) || 1)}
                    className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 font-mono space-y-0.5">
                <div>E(X) = <strong>{uniSt.mean.toFixed(3)}</strong></div>
                <div>Var(X) = (b−a)²/12 = <strong>{uniSt.variance.toFixed(3)}</strong></div>
                <div>P(X ≤ {(uniA + uniB) / 2}) = {uniformCdf((uniA + uniB) / 2, uniA, uniB).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: BIVARIATE ==================== */}
      {activeTab === 'bivariate' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-base">Bivariate Discrete Joint PMF Explorer</h2>
              <p className="text-xs text-slate-500">
                Preloaded with Problem Set 3 · Prob. 2 (Moisture X &amp; Impurity Y). Edit any cell!
              </p>
            </div>
            <button
              onClick={() =>
                setJointGrid([
                  [0.05, 0.05, 0.15, 0.1],
                  [0.1, 0.2, 0.3, 0.05],
                ])
              }
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              Reset PS3 Prob. 2
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="p-2 border border-slate-200 dark:border-slate-700">Y \ X</th>
                  {xs.map((x) => (
                    <th key={x} className="p-2 border border-slate-200 dark:border-slate-700">
                      X = {x}
                    </th>
                  ))}
                  <th className="p-2 border border-slate-200 dark:border-slate-700 text-sky-700 dark:text-sky-300">
                    f_Y(y)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ys.map((y, r) => (
                  <tr key={y}>
                    <th className="p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                      Y = {y}
                    </th>
                    {xs.map((x, c) => (
                      <td key={x} className="p-1.5 border border-slate-200 dark:border-slate-700">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={jointGrid[r][c]}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setJointGrid((prev) =>
                              prev.map((row, ri) =>
                                ri === r ? row.map((v, ci) => (ci === c ? val : v)) : row,
                              ),
                            );
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-center"
                        />
                      </td>
                    ))}
                    <td className="p-2 border border-slate-200 dark:border-slate-700 font-bold text-sky-700 dark:text-sky-300 text-center">
                      {jointRes.marginalY[r].toFixed(3)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-sky-50/70 dark:bg-sky-950/30 font-bold">
                  <th className="p-2 border border-slate-200 dark:border-slate-700">f_X(x)</th>
                  {jointRes.marginalX.map((m, ci) => (
                    <td key={ci} className="p-2 border border-slate-200 dark:border-slate-700 text-center text-sky-700 dark:text-sky-300">
                      {m.toFixed(3)}
                    </td>
                  ))}
                  <td className={`p-2 border border-slate-200 dark:border-slate-700 text-center ${jointRes.valid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Σ = {jointRes.totalProb.toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>E(X) = <strong>{jointRes.ex.toFixed(4)}</strong></div>
              <div>Var(X) = <strong>{jointRes.varX.toFixed(4)}</strong></div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>E(Y) = <strong>{jointRes.ey.toFixed(4)}</strong></div>
              <div>Var(Y) = <strong>{jointRes.varY.toFixed(4)}</strong></div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>E(XY) = <strong>{jointRes.exy.toFixed(4)}</strong></div>
              <div>Cov(X,Y) = <strong>{jointRes.cov.toFixed(4)}</strong></div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>Corr ρ = <strong>{jointRes.corr.toFixed(4)}</strong></div>
              <div>Independent? <strong>{jointRes.independent ? 'YES' : 'NO'}</strong></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span>Linear Portfolio W = aX + bY:</span>
            <label className="flex items-center gap-1">
              a =
              <input
                type="number"
                value={linA}
                onChange={(e) => setLinA(Number(e.target.value) || 0)}
                className="w-14 px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-950"
              />
            </label>
            <label className="flex items-center gap-1">
              b =
              <input
                type="number"
                value={linB}
                onChange={(e) => setLinB(Number(e.target.value) || 0)}
                className="w-14 px-2 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-950"
              />
            </label>
            <span>⇒ E(W) = <strong>{linMean.toFixed(3)}</strong> · Var(W) = <strong>{linVar.toFixed(4)}</strong></span>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: INFERENCE WORKBENCH ==================== */}
      {activeTab === 'inference' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'mean-z', label: 'Mean μ (σ known · Z · App C-2)' },
                { id: 'mean-t', label: 'Mean μ (σ unknown · t · App D)' },
                { id: 'prop', label: 'Proportion π (Z · App C-2)' },
                { id: 'var', label: 'Variance σ² (χ² · App E)' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setInfMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  infMode === m.id
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-slate-500 block">Sample size n</label>
                  <input
                    type="number"
                    min={2}
                    value={infN}
                    onChange={(e) => setInfN(Math.max(2, Number(e.target.value) || 10))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                {(infMode === 'mean-z' || infMode === 'mean-t') && (
                  <>
                    <div>
                      <label className="text-slate-500 block">Sample x̄</label>
                      <input
                        type="number"
                        step="0.1"
                        value={infXbar}
                        onChange={(e) => setInfXbar(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">Null μ₀</label>
                      <input
                        type="number"
                        step="0.1"
                        value={infMu0}
                        onChange={(e) => setInfMu0(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">
                        {infMode === 'mean-z' ? 'Known σ' : 'Sample s'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min={0.01}
                        value={infS}
                        onChange={(e) => setInfS(Math.max(0.01, Number(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                  </>
                )}
                {infMode === 'prop' && (
                  <>
                    <div>
                      <label className="text-slate-500 block">Success count x</label>
                      <input
                        type="number"
                        min={0}
                        max={infN}
                        value={infCount}
                        onChange={(e) => setInfCount(Math.min(infN, Math.max(0, Number(e.target.value) || 0)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">Null π₀</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0.01}
                        max={0.99}
                        value={infPi0}
                        onChange={(e) => setInfPi0(Math.min(0.99, Math.max(0.01, Number(e.target.value) || 0.5)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                  </>
                )}
                {infMode === 'var' && (
                  <>
                    <div>
                      <label className="text-slate-500 block">Sample s²</label>
                      <input
                        type="number"
                        step="0.1"
                        min={0.01}
                        value={infS2}
                        onChange={(e) => setInfS2(Math.max(0.01, Number(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block">Null σ₀²</label>
                      <input
                        type="number"
                        step="0.05"
                        min={0.01}
                        value={infSig0Sq}
                        onChange={(e) => setInfSig0Sq(Math.max(0.01, Number(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-slate-500 block">Alpha α (CI = 1−α)</label>
                  <select
                    value={infAlpha}
                    onChange={(e) => setInfAlpha(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  >
                    <option value={0.1}>α = 0.10 (90% CI)</option>
                    <option value={0.05}>α = 0.05 (95% CI)</option>
                    <option value={0.02}>α = 0.02 (98% CI)</option>
                    <option value={0.01}>α = 0.01 (99% CI)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block">Alternative H₁</label>
                  <select
                    value={infTail}
                    onChange={(e) => setInfTail(e.target.value as TailType)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  >
                    <option value="two">Two-sided (≠)</option>
                    <option value="right">Right-tail (&gt;)</option>
                    <option value="left">Left-tail (&lt;)</option>
                  </select>
                </div>
              </div>

              {(() => {
                if (infMode === 'mean-z') {
                  const ci = ciMeanZ(infXbar, infS, infN, 1 - infAlpha);
                  const tst = testMeanZ(infXbar, infMu0, infS, infN, infAlpha, infTail);
                  const reqN = sampleSizeMean(infS, ci.margin, 1 - infAlpha);
                  const pwr = powerMeanZ(infMu0, pwrMuTrue, infS, infN, infAlpha, infTail);
                  return (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-1">
                        <div>{((1 - infAlpha) * 100).toFixed(0)}% CI: <strong>[{ci.lower.toFixed(4)}, {ci.upper.toFixed(4)}]</strong> (z={ci.zCrit.toFixed(3)}, E={ci.margin.toFixed(3)})</div>
                        <div>Test z_obs = <strong>{tst.stat.toFixed(4)}</strong> | Reject if {tst.critText}</div>
                        <div>p-value = <strong>{tst.pValue.toFixed(5)}</strong> ⇒ <strong className={tst.reject ? 'text-rose-600' : 'text-emerald-600'}>{tst.reject ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}</strong></div>
                        <div>Planning sample size for E={ci.margin.toFixed(2)}: n = {reqN}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center gap-2">
                        <span>True μ₁ =</span>
                        <input
                          type="number"
                          step="0.5"
                          value={pwrMuTrue}
                          onChange={(e) => setPwrMuTrue(Number(e.target.value) || 0)}
                          className="w-16 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                        <span>⇒ Type II β = <strong>{pwr.beta.toFixed(4)}</strong> · Power = <strong>{pwr.power.toFixed(4)}</strong></span>
                      </div>
                    </div>
                  );
                }
                if (infMode === 'mean-t') {
                  const ci = ciMeanT(infXbar, infS, infN, 1 - infAlpha);
                  const tst = testMeanT(infXbar, infMu0, infS, infN, infAlpha, infTail);
                  return (
                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs font-mono space-y-1">
                      <div>df = {ci.df} · {((1 - infAlpha) * 100).toFixed(0)}% CI: <strong>[{ci.lower.toFixed(4)}, {ci.upper.toFixed(4)}]</strong> (t_crit={ci.tCrit.toFixed(3)})</div>
                      <div>Test t_obs = <strong>{tst.stat.toFixed(4)}</strong> | Rejection: {tst.critText}</div>
                      <div>p-value = <strong>{tst.pValue.toFixed(5)}</strong> ⇒ <strong className={tst.reject ? 'text-rose-600' : 'text-emerald-600'}>{tst.reject ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}</strong></div>
                      <button onClick={() => openSbAt('d')} className="text-sky-600 underline cursor-pointer">
                        Verify t critical value in SB Appendix D →
                      </button>
                    </div>
                  );
                }
                if (infMode === 'prop') {
                  const ci = ciProportion(infCount, infN, 1 - infAlpha);
                  const tst = testProportionZ(infCount, infN, infPi0, infAlpha, infTail);
                  const reqN = sampleSizeProportion(infPi0, 0.03, 1 - infAlpha);
                  return (
                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs font-mono space-y-1">
                      <div>p̂ = {ci.pHat.toFixed(4)} · {((1 - infAlpha) * 100).toFixed(0)}% CI: <strong>[{ci.lower.toFixed(4)}, {ci.upper.toFixed(4)}]</strong></div>
                      <div>Null SE = {tst.se0.toFixed(4)} · z_obs = <strong>{tst.stat.toFixed(4)}</strong> ({tst.normalApproxOk ? 'np₀ ≥ 5 OK' : 'Small sample caution'})</div>
                      <div>p-value = <strong>{tst.pValue.toFixed(5)}</strong> ⇒ <strong className={tst.reject ? 'text-rose-600' : 'text-emerald-600'}>{tst.reject ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}</strong></div>
                      <div>Survey sample size for ±3% margin: n = {reqN}</div>
                    </div>
                  );
                }
                const ci = ciVarianceChiSq(infS2, infN, 1 - infAlpha);
                const tst = testVarianceChiSq(infS2, infSig0Sq, infN, infAlpha, infTail);
                return (
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs font-mono space-y-1">
                    <div>df = {ci.df} · χ²_lower = {ci.chiLower.toFixed(3)}, χ²_upper = {ci.chiUpper.toFixed(3)}</div>
                    <div>{((1 - infAlpha) * 100).toFixed(0)}% CI for σ²: <strong>[{ci.lowerVar.toFixed(4)}, {ci.upperVar.toFixed(4)}]</strong> (σ: [{ci.lowerSd.toFixed(3)}, {ci.upperSd.toFixed(3)}])</div>
                    <div>χ²_obs = <strong>{tst.stat.toFixed(4)}</strong> · p-value = <strong>{tst.pValue.toFixed(5)}</strong> ⇒ <strong className={tst.reject ? 'text-rose-600' : 'text-emerald-600'}>{tst.reject ? 'REJECT H₀' : 'FAIL TO REJECT H₀'}</strong></div>
                    <button onClick={() => openSbAt('e')} className="text-sky-600 underline cursor-pointer">
                      Verify in SB Appendix E →
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col justify-center">
              {(() => {
                if (infMode === 'var') {
                  const tst = testVarianceChiSq(infS2, infSig0Sq, infN, infAlpha, infTail);
                  return (
                    <DistributionCurveSvg
                      distribution="chisq"
                      df={tst.df}
                      shadeMode={infTail === 'left' ? 'left' : 'right'}
                      boundA={tst.stat}
                      areaLabel={`p = ${tst.pValue.toFixed(4)}`}
                      markerLabel={`χ²=${tst.stat.toFixed(2)}`}
                    />
                  );
                }
                const isT = infMode === 'mean-t';
                const tst =
                  infMode === 'mean-t'
                    ? testMeanT(infXbar, infMu0, infS, infN, infAlpha, infTail)
                    : infMode === 'mean-z'
                    ? testMeanZ(infXbar, infMu0, infS, infN, infAlpha, infTail)
                    : testProportionZ(infCount, infN, infPi0, infAlpha, infTail);
                return (
                  <DistributionCurveSvg
                    distribution={isT ? 't' : 'normal'}
                    df={isT ? infN - 1 : undefined}
                    shadeMode={infTail === 'two' ? 'two-tail' : infTail}
                    boundA={tst.stat}
                    areaLabel={`p = ${tst.pValue.toFixed(4)}`}
                  />
                );
              })()}
              <div className="text-center text-xs text-slate-500 mt-1">
                Pivot formula:{' '}
                <MathFormula
                  tex={
                    infMode === 'mean-t'
                      ? 'T = \\frac{\\bar{X}-\\mu_0}{S/\\sqrt{n}} \\sim t_{n-1}'
                      : infMode === 'mean-z'
                      ? 'Z = \\frac{\\bar{X}-\\mu_0}{\\sigma/\\sqrt{n}} \\sim N(0,1)'
                      : infMode === 'prop'
                      ? 'Z = \\frac{\\hat{p}-\\pi_0}{\\sqrt{\\pi_0(1-\\pi_0)/n}}'
                      : '\\chi^2 = \\frac{(n-1)S^2}{\\sigma_0^2} \\sim \\chi^2_{n-1}'
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <SbTableModal open={sbModalOpen} onClose={() => setSbModalOpen(false)} initialTab={sbTab} />
    </div>
  );
};
