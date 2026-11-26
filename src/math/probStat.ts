/**
 * Pure TypeScript Probability & Statistical Tables Math Engine
 * Matches Dr. Tran Minh Hoang's UEH-ISB Ch. 1-5 conventions and SB Statistical Tables (Appendices C-1..F).
 */

const LANCZOS_G = 7;
const LANCZOS_COEFFS = [
  0.99999999999980993,
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

/** Natural logarithm of the Gamma function via Lanczos approximation. */
export function logGamma(z: number): number {
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  const shifted = z - 1;
  let x = LANCZOS_COEFFS[0];
  for (let i = 1; i < LANCZOS_COEFFS.length; i++) {
    x += LANCZOS_COEFFS[i] / (shifted + i);
  }
  const t = shifted + LANCZOS_G + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(x);
}

/** Natural logarithm of n! */
export function logFactorial(n: number): number {
  if (n <= 1) return 0;
  return logGamma(n + 1);
}

/** Binomial coefficient C(n, k) using log-gamma for stability. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n || !Number.isInteger(n) || !Number.isInteger(k)) return 0;
  if (k === 0 || k === n) return 1;
  return Math.round(Math.exp(logFactorial(n) - logFactorial(k) - logFactorial(n - k)));
}

/** Natural log of C(n, k). */
export function logChoose(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}

/** Regularized lower incomplete gamma P(a, x) = gamma(a, x) / Gamma(a). */
export function gammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  if (a <= 0) return 1;
  const eps = 3e-12;
  const fpmin = 1e-30;
  const gln = logGamma(a);

  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 1; n <= 300; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * eps) {
        return Math.min(1, Math.max(0, sum * Math.exp(-x + a * Math.log(x) - gln)));
      }
    }
    return Math.min(1, Math.max(0, sum * Math.exp(-x + a * Math.log(x) - gln)));
  }

  let b = x + 1 - a;
  let c = 1 / fpmin;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 300; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = b + an / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - gln) * h;
  return Math.min(1, Math.max(0, 1 - q));
}

/** Regularized upper incomplete gamma Q(a, x) = 1 - P(a, x). */
export function gammaQ(a: number, x: number): number {
  return Math.min(1, Math.max(0, 1 - gammaP(a, x)));
}

function betaCf(a: number, b: number, x: number): number {
  const eps = 3e-12;
  const fpmin = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

/** Regularized incomplete beta I_x(a, b). */
export function betaI(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) {
    return Math.min(1, Math.max(0, (bt * betaCf(a, b, x)) / a));
  }
  return Math.min(1, Math.max(0, 1 - (bt * betaCf(b, a, 1 - x)) / b));
}

/** Error function erf(x). */
export function erf(x: number): number {
  if (x === 0) return 0;
  const p = gammaP(0.5, x * x);
  return x >= 0 ? p : -p;
}

// ==================== STANDARD NORMAL (Appendices C-1 & C-2) ====================

export function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/** Cumulative standard normal Phi(z) = P(Z <= z) — Appendix C-2. */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** Area between 0 and |z|: P(0 <= Z <= |z|) — Appendix C-1. */
export function normalAreaZeroToZ(z: number): number {
  return Math.max(0, normalCdf(Math.abs(z)) - 0.5);
}

/** Inverse standard normal Phi^{-1}(p) via Acklam's rational approx + Newton polish. */
export function normalInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let x: number;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // Newton-Raphson refinement
  for (let i = 0; i < 2; i++) {
    const err = normalCdf(x) - p;
    x -= err / Math.max(1e-15, normalPdf(x));
  }
  return x;
}

export function normalZScore(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma;
}

export function normalProbBetween(a: number, b: number, mu = 0, sigma = 1): number {
  if (b <= a) return 0;
  return normalCdf((b - mu) / sigma) - normalCdf((a - mu) / sigma);
}

// ==================== STUDENT'S t (Appendix D) ====================

export function tPdf(t: number, df: number): number {
  if (!Number.isFinite(df) || df > 1e6) return normalPdf(t);
  const coeff = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / Math.sqrt(df * Math.PI);
  return coeff * Math.pow(1 + (t * t) / df, -(df + 1) / 2);
}

export function tCdf(t: number, df: number): number {
  if (!Number.isFinite(df) || df > 1e6) return normalCdf(t);
  const x = df / (df + t * t);
  const tail = 0.5 * betaI(x, df / 2, 0.5);
  return t >= 0 ? 1 - tail : tail;
}

/** Upper-tail critical value t_{alpha, df} such that P(T > t) = alpha. */
export function tCritUpper(alpha: number, df: number): number {
  if (alpha <= 0) return Infinity;
  if (alpha >= 1) return -Infinity;
  if (alpha === 0.5) return 0;
  if (alpha > 0.5) return -tCritUpper(1 - alpha, df);
  if (!Number.isFinite(df) || df > 1e6) return normalInv(1 - alpha);

  let lo = 0;
  let hi = Math.max(2, normalInv(1 - alpha) * 1.5);
  while (1 - tCdf(hi, df) > alpha && hi < 1e9) {
    hi *= 2;
  }
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    if (1 - tCdf(mid, df) > alpha) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

// ==================== CHI-SQUARE (Appendix E) ====================

export function chiSqPdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - logGamma(k));
}

export function chiSqCdf(x: number, df: number): number {
  if (x <= 0) return 0;
  return gammaP(df / 2, x / 2);
}

export function chiSqUpperTail(x: number, df: number): number {
  if (x <= 0) return 1;
  return gammaQ(df / 2, x / 2);
}

/** Upper-tail critical value chi^2_{alpha, df} such that P(X > c) = alpha. */
export function chiSqCritUpper(alpha: number, df: number): number {
  if (alpha <= 0) return Infinity;
  if (alpha >= 1) return 0;
  // Wilson-Hilferty approximation as starting anchor
  const z = normalInv(1 - alpha);
  const term = 1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df));
  const wh = df * Math.pow(Math.max(0.01, term), 3);

  let lo = Math.max(1e-10, wh * 0.2);
  let hi = Math.max(df + 5, wh * 2.5);
  while (chiSqUpperTail(lo, df) < alpha && lo > 1e-15) lo *= 0.1;
  while (chiSqUpperTail(hi, df) > alpha && hi < 1e9) hi *= 2;

  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    if (chiSqUpperTail(mid, df) > alpha) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

// ==================== F DISTRIBUTION (Appendix F) ====================

export function fPdf(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0;
  const half1 = df1 / 2;
  const half2 = df2 / 2;
  const logNorm =
    half1 * Math.log(df1) +
    half2 * Math.log(df2) +
    logGamma(half1 + half2) -
    logGamma(half1) -
    logGamma(half2);
  const logVal =
    logNorm + (half1 - 1) * Math.log(x) - (half1 + half2) * Math.log(df1 * x + df2);
  return Math.exp(logVal);
}

export function fCdf(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0;
  if (!Number.isFinite(df1) && !Number.isFinite(df2)) return x >= 1 ? 1 : 0;
  if (!Number.isFinite(df2)) return chiSqCdf(df1 * x, df1);
  if (!Number.isFinite(df1)) return chiSqUpperTail(df2 / x, df2);
  const bx = (df1 * x) / (df1 * x + df2);
  return betaI(bx, df1 / 2, df2 / 2);
}

export function fUpperTail(x: number, df1: number, df2: number): number {
  return Math.min(1, Math.max(0, 1 - fCdf(x, df1, df2)));
}

/** Upper-tail critical value F_{alpha, df1, df2} such that P(F > c) = alpha. */
export function fCritUpper(alpha: number, df1: number, df2: number): number {
  if (alpha <= 0) return Infinity;
  if (alpha >= 1) return 0;
  if (!Number.isFinite(df1) && !Number.isFinite(df2)) return 1.0;
  if (!Number.isFinite(df2)) return chiSqCritUpper(alpha, df1) / df1;
  if (!Number.isFinite(df1)) return df2 / chiSqCritUpper(1 - alpha, df2);

  let lo = 0;
  let hi = 5;
  while (fUpperTail(hi, df1, df2) > alpha && hi < 1e9) {
    hi *= 2;
  }
  for (let i = 0; i < 80; i++) {
    const mid = 0.5 * (lo + hi);
    if (fUpperTail(mid, df1, df2) > alpha) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

// ==================== SB STATISTICAL TABLES METADATA & FORMATTERS ====================

export const SB_NORMAL_COLS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09] as const;

export const SB_T_DFS: readonly number[] = [
  ...Array.from({ length: 50 }, (_, i) => i + 1),
  55,
  60,
  65,
  70,
  75,
  80,
  85,
  90,
  95,
  100,
  110,
  120,
  130,
  140,
  150,
  Infinity,
];

export const SB_T_COLUMNS = [
  { conf: 0.8, twoTail: 0.2, oneTail: 0.1, label: '.80 / .20 / .10' },
  { conf: 0.9, twoTail: 0.1, oneTail: 0.05, label: '.90 / .10 / .05' },
  { conf: 0.95, twoTail: 0.05, oneTail: 0.025, label: '.95 / .05 / .025' },
  { conf: 0.98, twoTail: 0.02, oneTail: 0.01, label: '.98 / .02 / .01' },
  { conf: 0.99, twoTail: 0.01, oneTail: 0.005, label: '.99 / .01 / .005' },
] as const;

export const SB_CHISQ_DFS: readonly number[] = [
  ...Array.from({ length: 40 }, (_, i) => i + 1),
  50,
  60,
  70,
  80,
  90,
  100,
];

export const SB_CHISQ_ALPHAS = [0.995, 0.99, 0.975, 0.95, 0.9, 0.1, 0.05, 0.025, 0.01, 0.005] as const;

export const SB_F_DF1: readonly number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 35, 40, 50, 60, 120, 200, Infinity,
];

export const SB_F_DF2: readonly number[] = [
  ...Array.from({ length: 30 }, (_, i) => i + 1),
  40,
  50,
  60,
  120,
  200,
  Infinity,
];

export const SB_F_ALPHAS = [0.1, 0.05, 0.025, 0.01] as const;

/** Matches Appendix C-1 / C-2 formatting: 4 decimals for |z| < 3.0, 5 decimals for |z| >= 3.0. */
export function formatSbNormal(prob: number, absZ: number): string {
  const digits = absZ >= 2.999 ? 5 : 4;
  return prob.toFixed(digits).replace(/^0\./, '.');
}

export function formatSbT(val: number): string {
  return val.toFixed(3);
}

export function formatSbChiSq(val: number): string {
  if (val < 10) return val.toFixed(3);
  if (val < 100) return val.toFixed(2);
  return val.toFixed(1);
}

export function formatSbF(val: number): string {
  if (val >= 1000) return val.toFixed(0);
  if (val >= 100) return val.toFixed(1);
  return val.toFixed(2);
}

// ==================== CHAPTER 1: DISCRETE DISTRIBUTIONS ====================

export function binomialPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n || !Number.isInteger(k)) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function binomialCdf(k: number, n: number, p: number): number {
  const hi = Math.min(n, Math.floor(k));
  let sum = 0;
  for (let i = 0; i <= hi; i++) sum += binomialPmf(i, n, p);
  return Math.min(1, sum);
}

export function binomialStats(n: number, p: number) {
  const mean = n * p;
  const variance = n * p * (1 - p);
  return { mean, variance, sd: Math.sqrt(variance) };
}

export function poissonPmf(k: number, lambda: number): number {
  if (k < 0 || !Number.isInteger(k) || lambda < 0) return 0;
  if (lambda === 0) return k === 0 ? 1 : 0;
  return Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k));
}

export function poissonCdf(k: number, lambda: number): number {
  const hi = Math.floor(k);
  if (hi < 0) return 0;
  let sum = 0;
  for (let i = 0; i <= hi; i++) sum += poissonPmf(i, lambda);
  return Math.min(1, sum);
}

export function poissonStats(lambda: number) {
  return { mean: lambda, variance: lambda, sd: Math.sqrt(lambda) };
}

/** Dr. Hoang's Ch. 1 convention: X = trial number of 1st success, k = 1, 2, ... */
export function geometricPmf(k: number, p: number): number {
  if (k < 1 || !Number.isInteger(k) || p <= 0 || p > 1) return 0;
  return p * Math.pow(1 - p, k - 1);
}

export function geometricCdf(k: number, p: number): number {
  if (k < 1) return 0;
  return 1 - Math.pow(1 - p, Math.floor(k));
}

export function geometricStats(p: number) {
  const mean = 1 / p;
  const variance = (1 - p) / (p * p);
  return { mean, variance, sd: Math.sqrt(variance) };
}

/** Dr. Hoang's Ch. 1 convention: X = trial number of r-th success, k >= r. */
export function negBinomialPmf(k: number, r: number, p: number): number {
  if (k < r || r < 1 || !Number.isInteger(k) || !Number.isInteger(r) || p <= 0 || p > 1) return 0;
  return Math.exp(logChoose(k - 1, r - 1) + r * Math.log(p) + (k - r) * Math.log(1 - p));
}

export function negBinomialCdf(k: number, r: number, p: number): number {
  const hi = Math.floor(k);
  if (hi < r) return 0;
  let sum = 0;
  for (let i = r; i <= hi; i++) sum += negBinomialPmf(i, r, p);
  return Math.min(1, sum);
}

export function negBinomialStats(r: number, p: number) {
  const mean = r / p;
  const variance = (r * (1 - p)) / (p * p);
  return { mean, variance, sd: Math.sqrt(variance) };
}

/** Hyper(n draws, N population, D successes). */
export function hypergeometricPmf(k: number, n: number, N: number, D: number): number {
  const minK = Math.max(0, n - (N - D));
  const maxK = Math.min(n, D);
  if (!Number.isInteger(k) || k < minK || k > maxK) return 0;
  return Math.exp(logChoose(D, k) + logChoose(N - D, n - k) - logChoose(N, n));
}

export function hypergeometricCdf(k: number, n: number, N: number, D: number): number {
  const minK = Math.max(0, n - (N - D));
  const hi = Math.min(Math.floor(k), Math.min(n, D));
  let sum = 0;
  for (let i = minK; i <= hi; i++) sum += hypergeometricPmf(i, n, N, D);
  return Math.min(1, sum);
}

export function hypergeometricStats(n: number, N: number, D: number) {
  const p = D / N;
  const mean = n * p;
  const variance = N > 1 ? n * p * (1 - p) * ((N - n) / (N - 1)) : 0;
  return { mean, variance, sd: Math.sqrt(variance) };
}

// ==================== CHAPTER 2: CONTINUOUS DISTRIBUTIONS ====================

export function uniformStats(a: number, b: number) {
  const mean = (a + b) / 2;
  const variance = ((b - a) * (b - a)) / 12;
  return { mean, variance, sd: Math.sqrt(variance) };
}

export function uniformCdf(x: number, a: number, b: number): number {
  if (b <= a) return 0;
  if (x <= a) return 0;
  if (x >= b) return 1;
  return (x - a) / (b - a);
}

export function exponentialPdf(x: number, lambda: number): number {
  if (x < 0 || lambda <= 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

export function exponentialCdf(x: number, lambda: number): number {
  if (x <= 0 || lambda <= 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

export function exponentialStats(lambda: number) {
  const mean = 1 / lambda;
  const variance = 1 / (lambda * lambda);
  return { mean, variance, sd: Math.sqrt(variance) };
}

/** Gamma(shape alpha, rate beta) matching Dr. Hoang's Ch. 2 notation. */
export function gammaPdf(x: number, alpha: number, beta: number): number {
  if (x <= 0 || alpha <= 0 || beta <= 0) return 0;
  return Math.exp(alpha * Math.log(beta) + (alpha - 1) * Math.log(x) - beta * x - logGamma(alpha));
}

export function gammaCdf(x: number, alpha: number, beta: number): number {
  if (x <= 0 || alpha <= 0 || beta <= 0) return 0;
  return gammaP(alpha, beta * x);
}

export function gammaStats(alpha: number, beta: number) {
  const mean = alpha / beta;
  const variance = alpha / (beta * beta);
  return { mean, variance, sd: Math.sqrt(variance) };
}

// ==================== CHAPTER 3: BIVARIATE DISCRETE ANALYZER ====================

export interface DiscreteJointAnalysis {
  totalProb: number;
  valid: boolean;
  marginalX: number[];
  marginalY: number[];
  ex: number;
  ey: number;
  ex2: number;
  ey2: number;
  varX: number;
  varY: number;
  exy: number;
  cov: number;
  corr: number;
  independent: boolean;
}

/** grid[rowY][colX] = P(X = xs[colX], Y = ys[rowY]). */
export function analyzeDiscreteJoint(
  xs: number[],
  ys: number[],
  grid: number[][],
): DiscreteJointAnalysis {
  const nx = xs.length;
  const ny = ys.length;
  const marginalX = new Array<number>(nx).fill(0);
  const marginalY = new Array<number>(ny).fill(0);
  let totalProb = 0;

  for (let r = 0; r < ny; r++) {
    for (let c = 0; c < nx; c++) {
      const p = grid[r]?.[c] ?? 0;
      totalProb += p;
      marginalX[c] += p;
      marginalY[r] += p;
    }
  }

  let ex = 0;
  let ex2 = 0;
  for (let c = 0; c < nx; c++) {
    ex += xs[c] * marginalX[c];
    ex2 += xs[c] * xs[c] * marginalX[c];
  }

  let ey = 0;
  let ey2 = 0;
  for (let r = 0; r < ny; r++) {
    ey += ys[r] * marginalY[r];
    ey2 += ys[r] * ys[r] * marginalY[r];
  }

  let exy = 0;
  for (let r = 0; r < ny; r++) {
    for (let c = 0; c < nx; c++) {
      exy += xs[c] * ys[r] * (grid[r]?.[c] ?? 0);
    }
  }

  const varX = Math.max(0, ex2 - ex * ex);
  const varY = Math.max(0, ey2 - ey * ey);
  const cov = exy - ex * ey;
  const denom = Math.sqrt(varX * varY);
  const corr = denom > 1e-12 ? cov / denom : 0;

  let independent = Math.abs(totalProb - 1) < 1e-4;
  if (independent) {
    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nx; c++) {
        const p = grid[r]?.[c] ?? 0;
        if (Math.abs(p - marginalX[c] * marginalY[r]) > 1e-4) {
          independent = false;
          break;
        }
      }
      if (!independent) break;
    }
  }

  const hasNeg = grid.some((row) => row.some((v) => v < -1e-9));
  return {
    totalProb,
    valid: !hasNeg && Math.abs(totalProb - 1) < 1e-4,
    marginalX,
    marginalY,
    ex,
    ey,
    ex2,
    ey2,
    varX,
    varY,
    exy,
    cov,
    corr,
    independent,
  };
}

// ==================== CHAPTERS 4 & 5: INFERENCE ENGINE ====================

export function ciMeanZ(xBar: number, sigma: number, n: number, confLevel: number) {
  const alpha = 1 - confLevel;
  const zCrit = normalInv(1 - alpha / 2);
  const se = sigma / Math.sqrt(n);
  const margin = zCrit * se;
  return {
    zCrit,
    se,
    margin,
    lower: xBar - margin,
    upper: xBar + margin,
  };
}

export function ciMeanT(xBar: number, s: number, n: number, confLevel: number) {
  const df = n - 1;
  const alpha = 1 - confLevel;
  const tCrit = tCritUpper(alpha / 2, df);
  const se = s / Math.sqrt(n);
  const margin = tCrit * se;
  return {
    df,
    tCrit,
    se,
    margin,
    lower: xBar - margin,
    upper: xBar + margin,
  };
}

export function ciProportion(x: number, n: number, confLevel: number) {
  const pHat = x / n;
  const alpha = 1 - confLevel;
  const zCrit = normalInv(1 - alpha / 2);
  const se = Math.sqrt((pHat * (1 - pHat)) / n);
  const margin = zCrit * se;
  return {
    pHat,
    zCrit,
    se,
    margin,
    lower: Math.max(0, pHat - margin),
    upper: Math.min(1, pHat + margin),
  };
}

export function ciVarianceChiSq(s2: number, n: number, confLevel: number) {
  const df = n - 1;
  const alpha = 1 - confLevel;
  // Upper-tail notation: chiLower = chi^2_{1 - alpha/2, df}, chiUpper = chi^2_{alpha/2, df}
  const chiLower = chiSqCritUpper(1 - alpha / 2, df);
  const chiUpper = chiSqCritUpper(alpha / 2, df);
  const lowerVar = (df * s2) / chiUpper;
  const upperVar = (df * s2) / chiLower;
  return {
    df,
    chiLower,
    chiUpper,
    lowerVar,
    upperVar,
    lowerSd: Math.sqrt(lowerVar),
    upperSd: Math.sqrt(upperVar),
  };
}

export function sampleSizeMean(sigma: number, margin: number, confLevel: number): number {
  const zCrit = normalInv(1 - (1 - confLevel) / 2);
  return Math.ceil(Math.pow((zCrit * sigma) / margin, 2));
}

export function sampleSizeProportion(pStar: number, margin: number, confLevel: number): number {
  const zCrit = normalInv(1 - (1 - confLevel) / 2);
  return Math.ceil((zCrit * zCrit * pStar * (1 - pStar)) / (margin * margin));
}

export type TailType = 'two' | 'right' | 'left';

export function testMeanZ(
  xBar: number,
  mu0: number,
  sigma: number,
  n: number,
  alpha: number,
  tail: TailType,
) {
  const se = sigma / Math.sqrt(n);
  const stat = (xBar - mu0) / se;
  let pValue: number;
  let critValue: number;
  let critText: string;
  let reject: boolean;

  if (tail === 'two') {
    pValue = 2 * (1 - normalCdf(Math.abs(stat)));
    critValue = normalInv(1 - alpha / 2);
    critText = `|z| > ${critValue.toFixed(3)}`;
    reject = Math.abs(stat) > critValue;
  } else if (tail === 'right') {
    pValue = 1 - normalCdf(stat);
    critValue = normalInv(1 - alpha);
    critText = `z > ${critValue.toFixed(3)}`;
    reject = stat > critValue;
  } else {
    pValue = normalCdf(stat);
    critValue = -normalInv(1 - alpha);
    critText = `z < ${critValue.toFixed(3)}`;
    reject = stat < critValue;
  }

  return {
    se,
    stat,
    pValue,
    critValue,
    critText,
    reject,
    sbTableRef: 'Appendix C-1 / C-2 (Standard Normal)',
  };
}

export function testMeanT(
  xBar: number,
  mu0: number,
  s: number,
  n: number,
  alpha: number,
  tail: TailType,
) {
  const df = n - 1;
  const se = s / Math.sqrt(n);
  const stat = (xBar - mu0) / se;
  let pValue: number;
  let critValue: number;
  let critText: string;
  let reject: boolean;

  if (tail === 'two') {
    pValue = 2 * (1 - tCdf(Math.abs(stat), df));
    critValue = tCritUpper(alpha / 2, df);
    critText = `|t| > ${critValue.toFixed(3)}`;
    reject = Math.abs(stat) > critValue;
  } else if (tail === 'right') {
    pValue = 1 - tCdf(stat, df);
    critValue = tCritUpper(alpha, df);
    critText = `t > ${critValue.toFixed(3)}`;
    reject = stat > critValue;
  } else {
    pValue = tCdf(stat, df);
    critValue = -tCritUpper(alpha, df);
    critText = `t < ${critValue.toFixed(3)}`;
    reject = stat < critValue;
  }

  return {
    df,
    se,
    stat,
    pValue,
    critValue,
    critText,
    reject,
    sbTableRef: `Appendix D (Student's t, df = ${df})`,
  };
}

export function testProportionZ(
  x: number,
  n: number,
  pi0: number,
  alpha: number,
  tail: TailType,
) {
  const pHat = x / n;
  const se0 = Math.sqrt((pi0 * (1 - pi0)) / n);
  const stat = (pHat - pi0) / se0;
  const normalApproxOk = n * pi0 >= 5 && n * (1 - pi0) >= 5;
  let pValue: number;
  let critValue: number;
  let critText: string;
  let reject: boolean;

  if (tail === 'two') {
    pValue = 2 * (1 - normalCdf(Math.abs(stat)));
    critValue = normalInv(1 - alpha / 2);
    critText = `|z| > ${critValue.toFixed(3)}`;
    reject = Math.abs(stat) > critValue;
  } else if (tail === 'right') {
    pValue = 1 - normalCdf(stat);
    critValue = normalInv(1 - alpha);
    critText = `z > ${critValue.toFixed(3)}`;
    reject = stat > critValue;
  } else {
    pValue = normalCdf(stat);
    critValue = -normalInv(1 - alpha);
    critText = `z < ${critValue.toFixed(3)}`;
    reject = stat < critValue;
  }

  return {
    pHat,
    se0,
    stat,
    pValue,
    critValue,
    critText,
    reject,
    normalApproxOk,
    sbTableRef: 'Appendix C-1 / C-2 (Standard Normal)',
  };
}

export function testVarianceChiSq(
  s2: number,
  sigma0Sq: number,
  n: number,
  alpha: number,
  tail: TailType,
) {
  const df = n - 1;
  const stat = (df * s2) / sigma0Sq;
  let pValue: number;
  let critText: string;
  let reject: boolean;

  if (tail === 'right') {
    pValue = chiSqUpperTail(stat, df);
    const cHigh = chiSqCritUpper(alpha, df);
    critText = `χ² > ${cHigh.toFixed(3)}`;
    reject = stat > cHigh;
  } else if (tail === 'left') {
    pValue = chiSqCdf(stat, df);
    const cLow = chiSqCritUpper(1 - alpha, df);
    critText = `χ² < ${cLow.toFixed(3)}`;
    reject = stat < cLow;
  } else {
    const pRight = chiSqUpperTail(stat, df);
    const pLeft = chiSqCdf(stat, df);
    pValue = Math.min(1, 2 * Math.min(pRight, pLeft));
    const cLow = chiSqCritUpper(1 - alpha / 2, df);
    const cHigh = chiSqCritUpper(alpha / 2, df);
    critText = `χ² < ${cLow.toFixed(3)} or χ² > ${cHigh.toFixed(3)}`;
    reject = stat < cLow || stat > cHigh;
  }

  return {
    df,
    stat,
    pValue,
    critText,
    reject,
    sbTableRef: `Appendix E (Chi-Square, df = ${df})`,
  };
}

export function powerMeanZ(
  mu0: number,
  muTrue: number,
  sigma: number,
  n: number,
  alpha: number,
  tail: TailType,
) {
  const se = sigma / Math.sqrt(n);
  let beta: number;
  let critCutoff: string;

  if (tail === 'right') {
    const zCrit = normalInv(1 - alpha);
    const xCrit = mu0 + zCrit * se;
    beta = normalCdf((xCrit - muTrue) / se);
    critCutoff = `X̄ > ${xCrit.toFixed(3)}`;
  } else if (tail === 'left') {
    const zCrit = normalInv(1 - alpha);
    const xCrit = mu0 - zCrit * se;
    beta = 1 - normalCdf((xCrit - muTrue) / se);
    critCutoff = `X̄ < ${xCrit.toFixed(3)}`;
  } else {
    const zCrit = normalInv(1 - alpha / 2);
    const xLo = mu0 - zCrit * se;
    const xHi = mu0 + zCrit * se;
    beta = normalCdf((xHi - muTrue) / se) - normalCdf((xLo - muTrue) / se);
    critCutoff = `X̄ < ${xLo.toFixed(3)} or X̄ > ${xHi.toFixed(3)}`;
  }

  return {
    se,
    critCutoff,
    beta,
    power: 1 - beta,
  };
}
