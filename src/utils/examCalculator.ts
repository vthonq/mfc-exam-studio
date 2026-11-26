import { binaryModExpSteps, extendedGcdSteps, modInverse } from '../math/numberTheory';
import { choose, ciMeanT, tCdf, tCritUpper } from '../math/probStat';

export function parseNumberList(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

export interface SampleStatsResult {
  n: number;
  sum: number;
  mean: number;
  sumSqDev: number;
  sampleVar: number;
  sampleSd: number;
  popSd: number;
  se: number;
  min: number;
  max: number;
  median: number;
  workingLines: string[];
}

export function computeSampleStats(values: number[]): SampleStatsResult {
  const n = values.length;
  if (n === 0) {
    return {
      n: 0,
      sum: 0,
      mean: 0,
      sumSqDev: 0,
      sampleVar: 0,
      sampleSd: 0,
      popSd: 0,
      se: 0,
      min: 0,
      max: 0,
      median: 0,
      workingLines: ['Enter at least 1 number separated by spaces or commas.'],
    };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const sumSqDev = values.reduce((a, x) => a + (x - mean) ** 2, 0);
  const sampleVar = n > 1 ? sumSqDev / (n - 1) : 0;
  const sampleSd = Math.sqrt(sampleVar);
  const popSd = Math.sqrt(sumSqDev / n);
  const se = sampleSd / Math.sqrt(n);
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(n / 2);
  const median = n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const workingLines = [
    `1. n = ${n}, Σx = ${Number(sum.toFixed(6))}`,
    `2. Sample mean: x̄ = ${Number(sum.toFixed(6))} / ${n} = ${mean.toFixed(4)}`,
    `3. Sum of squared deviations: Σ(xᵢ − x̄)² = ${sumSqDev.toFixed(4)}`,
    n > 1
      ? `4. Sample variance: s² = ${sumSqDev.toFixed(4)} / (${n} − 1) = ${sampleVar.toFixed(4)} → s = ${sampleSd.toFixed(4)}`
      : '4. Sample variance s² requires n ≥ 2 observations.',
    `5. Standard error: SE = s / √n = ${se.toFixed(4)}`,
  ];

  return {
    n,
    sum,
    mean,
    sumSqDev,
    sampleVar,
    sampleSd,
    popSd,
    se,
    min: sorted[0],
    max: sorted[n - 1],
    median,
    workingLines,
  };
}

export interface QuickOneSampleTResult {
  df: number;
  se: number;
  tStat: number;
  pTwoTail: number;
  pRight: number;
  pLeft: number;
  tCrit: number;
  ciLow: number;
  ciHigh: number;
  workingLines: string[];
}

export function computeQuickOneSampleT(
  xBar: number,
  mu0: number,
  s: number,
  n: number,
  confLevel = 0.95,
): QuickOneSampleTResult {
  const safeN = Math.max(2, Math.floor(n));
  const safeS = Math.max(1e-9, Math.abs(s));
  const df = safeN - 1;
  const se = safeS / Math.sqrt(safeN);
  const tStat = (xBar - mu0) / se;
  const cdf = tCdf(tStat, df);
  const pRight = 1 - cdf;
  const pLeft = cdf;
  const pTwoTail = Math.min(1, 2 * Math.min(pRight, pLeft));
  const alpha = 1 - confLevel;
  const tCrit = tCritUpper(alpha / 2, df);
  const ci = ciMeanT(xBar, safeS, safeN, confLevel);

  const workingLines = [
    `1. SE = s / √n = ${safeS.toFixed(4)} / √${safeN} = ${se.toFixed(4)}`,
    `2. t = (x̄ − μ₀) / SE = (${xBar} − ${mu0}) / ${se.toFixed(4)} = ${tStat.toFixed(4)} (df = ${df})`,
    `3. Two-tailed p-value = ${pTwoTail.toFixed(4)} (SB Appendix D t_{${(alpha / 2).toFixed(3)}, ${df}} = ${tCrit.toFixed(3)})`,
    `4. ${Math.round(confLevel * 100)}% CI: ${xBar} ± ${tCrit.toFixed(3)}(${se.toFixed(4)}) = [${ci.lower.toFixed(4)}, ${ci.upper.toFixed(4)}]`,
  ];

  return {
    df,
    se,
    tStat,
    pTwoTail,
    pRight,
    pLeft,
    tCrit,
    ciLow: ci.lower,
    ciHigh: ci.upper,
    workingLines,
  };
}

export function computeCombinatorics(n: number, r: number): { nCr: number; nPr: number; nFact: number } {
  const nn = Math.max(0, Math.min(170, Math.floor(n)));
  const rr = Math.max(0, Math.min(nn, Math.floor(r)));
  const nCr = Math.round(choose(nn, rr));
  let nPr = 1;
  for (let i = 0; i < rr; i++) nPr *= nn - i;
  let nFact = 1;
  for (let i = 2; i <= Math.min(nn, 20); i++) nFact *= i;
  if (nn > 20) nFact = Infinity;
  return { nCr, nPr, nFact };
}

export interface ModularCalcResult {
  powMod: number;
  gcdVal: number;
  bezoutX: number;
  bezoutY: number;
  inverse: number | null;
  workingLines: string[];
}

export function computeModularCalc(a: number, b: number, m: number): ModularCalcResult {
  const safeM = Math.max(1, Math.floor(Math.abs(m)));
  const safeA = Math.trunc(a);
  const safeExp = Math.max(0, Math.min(1_000_000, Math.floor(Math.abs(b))));

  const powRes = binaryModExpSteps(safeA, safeExp, safeM);
  const ext = extendedGcdSteps(Math.abs(safeA), safeM);
  const invRes = modInverse(safeA, safeM);

  const workingLines = [
    `1. Binary exponentiation (${safeExp}₁₀ = ${powRes.binaryMsb}₂): ${safeA}^${safeExp} mod ${safeM} = ${powRes.result}`,
    `2. Euclidean Bézout: gcd(${Math.abs(safeA)}, ${safeM}) = ${ext.gcd} = (${ext.s})·${Math.abs(safeA)} + (${ext.t})·${safeM}`,
    invRes.exists && invRes.inverse !== null
      ? `3. Modular inverse: ${safeA}⁻¹ ≡ ${invRes.inverse} (mod ${safeM}) since gcd = 1`
      : `3. Modular inverse does NOT exist (gcd(${safeA}, ${safeM}) = ${ext.gcd} ≠ 1)`,
  ];

  return {
    powMod: powRes.result,
    gcdVal: ext.gcd,
    bezoutX: ext.s,
    bezoutY: ext.t,
    inverse: invRes.inverse,
    workingLines,
  };
}

export function convertIntegerBases(
  raw: string,
  fromBase: 10 | 2 | 16 | 8,
): { dec: string; bin: string; hex: string; oct: string } | null {
  const cleaned = raw.trim().replace(/^0[bxo]/i, '');
  if (!cleaned) return null;
  const validators: Record<10 | 2 | 16 | 8, RegExp> = {
    10: /^-?\d+$/,
    2: /^[01]+$/,
    16: /^[0-9a-f]+$/i,
    8: /^[0-7]+$/,
  };
  if (!validators[fromBase].test(cleaned)) return null;
  const num = Number.parseInt(cleaned, fromBase);
  if (!Number.isSafeInteger(num)) return null;
  return {
    dec: num.toString(10),
    bin: num.toString(2),
    hex: num.toString(16).toUpperCase(),
    oct: num.toString(8),
  };
}

export interface EconQuickCalcResult {
  pctChange: number;
  rule70Years: number;
  realRate: number;
  spendingMult: number;
  taxMult: number;
  adShift: number;
  moneyMult: number;
  workingLines: string[];
}

export function computeEconQuickCalc(opts: {
  oldVal: number;
  newVal: number;
  nominalRate: number;
  inflationRate: number;
  mpc: number;
  deltaG: number;
  reserveRatioPct: number;
}): EconQuickCalcResult {
  const safeOld = opts.oldVal === 0 ? 1 : opts.oldVal;
  const pctChange = ((opts.newVal - opts.oldVal) / safeOld) * 100;
  const rule70Years = Math.abs(pctChange) > 0.05 ? 70 / Math.abs(pctChange) : Infinity;
  const realRate = opts.nominalRate - opts.inflationRate;
  const safeMpc = Math.min(0.98, Math.max(0.01, opts.mpc));
  const spendingMult = 1 / (1 - safeMpc);
  const taxMult = -safeMpc / (1 - safeMpc);
  const adShift = spendingMult * opts.deltaG;
  const rr = Math.min(1, Math.max(0.01, opts.reserveRatioPct / 100));
  const moneyMult = 1 / rr;

  const workingLines = [
    `1. % Change = (${opts.newVal} − ${opts.oldVal}) / ${safeOld} × 100 = ${pctChange.toFixed(2)}%`,
    `2. Fisher equation: r = i − π = ${opts.nominalRate}% − ${opts.inflationRate}% = ${realRate.toFixed(2)}%`,
    `3. Spending multiplier = 1 / (1 − ${safeMpc}) = ${spendingMult.toFixed(2)}; ΔAD = ${spendingMult.toFixed(2)} × ${opts.deltaG} = ${adShift.toFixed(2)}`,
    `4. Money multiplier = 1 / R = 1 / ${rr.toFixed(2)} = ${moneyMult.toFixed(2)}×`,
  ];

  return {
    pctChange,
    rule70Years,
    realRate,
    spendingMult,
    taxMult,
    adShift,
    moneyMult,
    workingLines,
  };
}
