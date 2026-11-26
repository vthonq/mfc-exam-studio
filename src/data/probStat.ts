import type { ProbTopicId } from '../types';
import { createRng } from '../math/prng';
import {
  binomialCdf,
  binomialPmf,
  binomialStats,
  chiSqCritUpper,
  ciMeanT,
  ciMeanZ,
  exponentialCdf,
  geometricStats,
  normalCdf,
  poissonCdf,
  poissonPmf,
  sampleSizeMean,
  tCritUpper,
  testMeanT,
  testProportionZ,
  testVarianceChiSq,
} from '../math/probStat';

export interface ProbChapterNote {
  topic: ProbTopicId;
  title: string;
  titleVi: string;
  summary: string;
  keyFormulas: Array<{ name: string; latex: string; note: string }>;
  sbTableTip: string;
}

export const PROB_CHAPTER_NOTES: ProbChapterNote[] = [
  {
    topic: 'ps-ch1',
    title: 'Ch. 1 · Discrete Random Variables',
    titleVi: 'Chương 1 · Biến ngẫu nhiên rời rạc',
    summary:
      'Models countable outcomes using PMF P(X=k) and CDF F(x). Covers general moments E(X), Var(X)=E(X²)−[E(X)]², plus Binomial, Poisson, Geometric, Negative Binomial, and Hypergeometric families.',
    keyFormulas: [
      {
        name: 'Linear Transform Moments',
        latex: 'E(aX+b) = aE(X)+b, \\quad \\mathrm{Var}(aX+b) = a^2\\mathrm{Var}(X)',
        note: 'Applies to ALL RVs (discrete or continuous).',
      },
      {
        name: 'Binomial B(n, p)',
        latex: 'P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k},\\; E=np,\\; \\mathrm{Var}=np(1-p)',
        note: 'n independent Bernoulli trials, fixed p.',
      },
      {
        name: 'Poisson(λ)',
        latex: 'P(X=k)=\\frac{e^{-\\lambda}\\lambda^k}{k!},\\; E=\\lambda,\\; \\mathrm{Var}=\\lambda',
        note: 'Approx B(n,p) when n large, p small (np=λ).',
      },
      {
        name: 'Geometric Geo(p)',
        latex: 'P(X=k)=p(1-p)^{k-1}\\;(k\\ge 1),\\; E=\\frac{1}{p},\\; \\mathrm{Var}=\\frac{1-p}{p^2}',
        note: 'Dr. Hoang convention: trials UNTIL 1st success (memoryless!).',
      },
      {
        name: 'Negative Binomial NB(r, p)',
        latex: 'P(X=k)=\\binom{k-1}{r-1}p^r(1-p)^{k-r}\\;(k\\ge r),\\; E=\\frac{r}{p},\\; \\mathrm{Var}=\\frac{r(1-p)}{p^2}',
        note: 'Sum of r i.i.d. Geo(p) random variables.',
      },
      {
        name: 'Hypergeometric(n, N, D)',
        latex: 'P(X=k)=\\frac{\\binom{D}{k}\\binom{N-D}{n-k}}{\\binom{N}{n}},\\; E=n\\frac{D}{N},\\; \\mathrm{Var}=n\\frac{D}{N}\\left(1-\\frac{D}{N}\\right)\\frac{N-n}{N-1}',
        note: 'Sampling WITHOUT replacement; → Bin(n, D/N) if N/n > 20.',
      },
    ],
    sbTableTip: 'Most Ch. 1 problems use direct formulas/calculator; Binomial or Poisson sums appear directly in Final Q1.',
  },
  {
    topic: 'ps-ch2',
    title: 'Ch. 2 · Continuous Random Variables',
    titleVi: 'Chương 2 · Biến ngẫu nhiên liên tục',
    summary:
      'PDF integrates to 1 and P(a ≤ X ≤ b) = ∫_a^b f(x)dx = F(b) − F(a). Covers Uniform, Normal N(μ, σ²), Exponential Exp(λ), Gamma Γ(α, β), and Chi-Square χ²(n).',
    keyFormulas: [
      {
        name: 'Uniform U(a, b)',
        latex: 'f(x)=\\frac{1}{b-a},\\; E=\\frac{a+b}{2},\\; \\mathrm{Var}=\\frac{(b-a)^2}{12}',
        note: 'Constant density on (a, b).',
      },
      {
        name: 'Normal Standardization',
        latex: 'X\\sim N(\\mu,\\sigma^2)\\implies Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1),\\; P(X\\le x)=\\Phi\\!\\left(\\frac{x-\\mu}{\\sigma}\\right)',
        note: 'Continuity correction ±0.5 when Normal approximates Binomial.',
      },
      {
        name: 'Exponential Exp(λ)',
        latex: 'f(x)=\\lambda e^{-\\lambda x}\\;(x\\ge 0),\\; F(x)=1-e^{-\\lambda x},\\; E=\\frac{1}{\\lambda},\\; \\mathrm{Var}=\\frac{1}{\\lambda^2}',
        note: 'Memoryless: P(X > s+t | X > s) = P(X > t). Time between Poisson(λ) events.',
      },
      {
        name: 'Gamma Γ(α, β) & χ²(n)',
        latex: 'f(x)=\\frac{\\beta^\\alpha}{\\Gamma(\\alpha)}x^{\\alpha-1}e^{-\\beta x},\\; E=\\frac{\\alpha}{\\beta},\\; \\mathrm{Var}=\\frac{\\alpha}{\\beta^2}',
        note: 'Shape α, rate β. χ²(n) = Γ(n/2, 1/2) has mean n, variance 2n.',
      },
    ],
    sbTableTip: 'Use Appendix C-1 (p.767) for P(0 ≤ Z ≤ z) or Appendix C-2 (p.768–769) for cumulative P(Z ≤ z).',
  },
  {
    topic: 'ps-ch3',
    title: 'Ch. 3 · Bivariate Distributions',
    titleVi: 'Chương 3 · Phân phối xác suất hai chiều',
    summary:
      'Analyze two RVs together: marginal pmf/pdf, conditional distribution f(y|x) = f(x,y)/f_X(x), independence f(x,y)=f_X(x)f_Y(y), covariance, and portfolio combinations aX + bY.',
    keyFormulas: [
      {
        name: 'Marginals & Conditionals',
        latex: 'f_X(x)=\\int_{-\\infty}^{\\infty} f(x,y)\\,dy,\\quad f_{Y|X}(y|x)=\\frac{f(x,y)}{f_X(x)}',
        note: 'Check integration limits carefully when support is triangular (e.g. x+y ≤ 1)!',
      },
      {
        name: 'Covariance & Correlation',
        latex: '\\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y),\\quad \\rho_{X,Y}=\\frac{\\mathrm{Cov}(X,Y)}{\\sigma_X\\sigma_Y}\\in[-1,1]',
        note: 'Independent ⇒ Cov = 0 (converse is NOT always true!).',
      },
      {
        name: 'Linear Combination Variance',
        latex: '\\mathrm{Var}(aX+bY)=a^2\\mathrm{Var}(X)+b^2\\mathrm{Var}(Y)+2ab\\,\\mathrm{Cov}(X,Y)',
        note: 'Crucial for finance portfolio problems (Ch. 3 slide 39).',
      },
    ],
    sbTableTip: 'Usually double integrals / probability tables — watch support bounds on triangular regions.',
  },
  {
    topic: 'ps-ch4',
    title: 'Ch. 4 · Random Samples & Estimation',
    titleVi: 'Chương 4 · Mẫu ngẫu nhiên & Ước lượng điểm',
    summary:
      'Connects samples to parameters via Method of Moments (MoM), Maximum Likelihood Estimation (MLE), Chebyshev/LLN bounds, CLT for sample mean and proportion, and χ² for sample variance.',
    keyFormulas: [
      {
        name: 'Method of Moments (MoM)',
        latex: '\\text{Set } E(X^k)=\\frac{1}{n}\\sum_{i=1}^n X_i^k\\;(k=1,2,\\dots)',
        note: 'Equate population moments to sample moments and solve for θ.',
      },
      {
        name: 'Maximum Likelihood (MLE)',
        latex: 'L(\\theta)=\\prod_{i=1}^n f(x_i;\\theta),\\quad \\ell(\\theta)=\\ln L(\\theta),\\quad \\frac{d\\ell}{d\\theta}=0',
        note: 'Always check boundary cases (e.g. U(0, θ) ⇒ θ̂_MLE = max(X_i), derivative ≠ 0!).',
      },
      {
        name: 'LLN & CLT',
        latex: 'P(|\\bar{X}-\\mu|\\ge\\varepsilon)\\le\\frac{\\sigma^2}{n\\varepsilon^2},\\qquad \\bar{X}\\approx N\\!\\left(\\mu,\\frac{\\sigma^2}{n}\\right),\\qquad \\hat{p}\\approx N\\!\\left(\\pi,\\frac{\\pi(1-\\pi)}{n}\\right)',
        note: 'Use C-2 to approximate P(a ≤ X̄ ≤ b) or sample proportion probabilities.',
      },
      {
        name: 'Sample Variance Pivot',
        latex: '\\frac{(n-1)S^2}{\\sigma^2} = \\frac{1}{\\sigma^2}\\sum_{i=1}^n(X_i-\\bar{X})^2 \\sim \\chi^2_{n-1}',
        note: 'Requires Normal population! Uses Appendix E.',
      },
    ],
    sbTableTip: 'CLT uses Appendix C-1/C-2 (Z); sample variance questions P(S² ≤ c) use Appendix E (χ² with df = n − 1).',
  },
  {
    topic: 'ps-ch5',
    title: 'Ch. 5 · Confidence Intervals & Hypothesis Tests',
    titleVi: 'Chương 5 · Khoảng tin cậy & Kiểm định giả thuyết',
    summary:
      'Always state: (1) Hypotheses H₀/H₁, (2) Pivot / Test Statistic, (3) Critical Value from SB Tables or p-value, (4) Statistical decision + Context conclusion. Includes sample size & Power β.',
    keyFormulas: [
      {
        name: 'Mean CI & Test (σ Known)',
        latex: '\\bar{x}\\pm z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}},\\qquad z_{\\text{obs}}=\\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}}',
        note: 'SB Appendix C-1/C-2. Sample size n = ceil((z_{α/2} σ / E)²).',
      },
      {
        name: 'Mean CI & Test (σ Unknown)',
        latex: '\\bar{x}\\pm t_{\\alpha/2,\\,n-1}\\frac{s}{\\sqrt{n}},\\qquad t_{\\text{obs}}=\\frac{\\bar{x}-\\mu_0}{s/\\sqrt{n}}',
        note: 'SB Appendix D (df = n − 1). Check Conf Level vs 1-tail vs 2-tail header!',
      },
      {
        name: 'Proportion CI & Test',
        latex: '\\hat{p}\\pm z_{\\alpha/2}\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}},\\qquad z_{\\text{obs}}=\\frac{\\hat{p}-\\pi_0}{\\sqrt{\\pi_0(1-\\pi_0)/n}}',
        note: 'Notice: CI uses p̂(1−p̂), Hypothesis Test uses null π₀(1−π₀)!',
      },
      {
        name: 'Variance σ² CI & Test',
        latex: '\\left[\\frac{(n-1)s^2}{\\chi^2_{\\alpha/2,\\,n-1}},\\;\\frac{(n-1)s^2}{\\chi^2_{1-\\alpha/2,\\,n-1}}\\right],\\qquad \\chi^2_{\\text{obs}}=\\frac{(n-1)s^2}{\\sigma_0^2}',
        note: 'SB Appendix E (p.771). Larger χ² denominator gives LOWER bound!',
      },
      {
        name: 'Type II Error (β) & Power',
        latex: '\\beta(\\mu_1)=P(\\text{Fail to reject } H_0\\mid \\mu=\\mu_1),\\qquad \\text{Power}=1-\\beta',
        note: 'First find cutoff value of X̄ under H₀, then standardize using μ₁.',
      },
    ],
    sbTableTip: 'Mean (σ known) & Proportion → App. C-1/C-2 | Mean (σ unknown) → App. D | Variance σ² → App. E | Var Ratio → App. F.',
  },
];

export interface ProbGlossaryItem {
  term: string;
  termVi: string;
  chapter: ProbTopicId;
  definition: string;
}

export const PROB_GLOSSARY: ProbGlossaryItem[] = [
  { term: 'Probability Mass Function (PMF)', termVi: 'Hàm khối xác suất', chapter: 'ps-ch1', definition: 'f(x) = P(X = x) for discrete RVs; non-negative and sums to 1 over support.' },
  { term: 'Probability Density Function (PDF)', termVi: 'Hàm mật độ xác suất', chapter: 'ps-ch2', definition: 'f(x) ≥ 0 integrating to 1; P(a ≤ X ≤ b) = ∫_a^b f(x)dx (point prob P(X=a)=0).' },
  { term: 'Cumulative Distribution Function (CDF)', termVi: 'Hàm phân phối tích lũy', chapter: 'ps-ch2', definition: 'F(x) = P(X ≤ x); non-decreasing from 0 to 1, derivative equals PDF for continuous RVs.' },
  { term: 'Memoryless Property', termVi: 'Tính chất không nhớ', chapter: 'ps-ch2', definition: 'P(X > s+t | X > s) = P(X > t); satisfied exclusively by Geometric (discrete) and Exponential (continuous).' },
  { term: 'Continuity Correction', termVi: 'Hiệu chỉnh liên tục', chapter: 'ps-ch2', definition: 'Adding/subtracting 0.5 when approximating integer Binomial X by continuous Normal curve.' },
  { term: 'Marginal Distribution', termVi: 'Phân phối biên', chapter: 'ps-ch3', definition: 'Distribution of X alone obtained by summing/integrating joint f(x,y) over all y.' },
  { term: 'Conditional Distribution', termVi: 'Phân phối có điều kiện', chapter: 'ps-ch3', definition: 'f_{Y|X}(y|x) = f(x,y)/f_X(x), describing Y when X=x is known.' },
  { term: 'Covariance', termVi: 'Hiệp phương sai', chapter: 'ps-ch3', definition: 'Cov(X,Y) = E[(X−μ_X)(Y−μ_Y)] = E(XY) − E(X)E(Y); measures linear co-movement.' },
  { term: 'Correlation Coefficient', termVi: 'Hệ số tương quan', chapter: 'ps-ch3', definition: 'ρ_{X,Y} = Cov(X,Y)/(σ_X σ_Y) ∈ [−1, 1]; scale-free linear association.' },
  { term: 'Method of Moments (MoM)', termVi: 'Phương pháp mô-men', chapter: 'ps-ch4', definition: 'Equates theoretical E(X^k) to sample moments m_k and solves for parameters.' },
  { term: 'Maximum Likelihood Estimator (MLE)', termVi: 'Ước lượng hợp lý cực đại', chapter: 'ps-ch4', definition: 'Parameter value θ̂ maximizing joint likelihood L(θ) or log-likelihood ℓ(θ).' },
  { term: 'Unbiased Estimator', termVi: 'Ước lượng không chệch', chapter: 'ps-ch4', definition: 'Estimator θ̂ satisfying E(θ̂) = θ (e.g., X̄ for μ and sample s² with n−1 denominator for σ²).' },
  { term: 'Law of Large Numbers (LLN)', termVi: 'Luật số lớn', chapter: 'ps-ch4', definition: 'Sample mean X̄ converges in probability to true population mean μ as n → ∞.' },
  { term: 'Central Limit Theorem (CLT)', termVi: 'Định lý giới hạn trung tâm', chapter: 'ps-ch4', definition: 'For large n, X̄ is approximately N(μ, σ²/n) regardless of population shape.' },
  { term: 'Degrees of Freedom (d.f.)', termVi: 'Bậc tự do', chapter: 'ps-ch5', definition: 'Independent pieces of information in a statistic (e.g., n−1 for one-sample t and χ² variance inference).' },
  { term: 'Margin of Error', termVi: 'Sai số biên / Biên độ sai số', chapter: 'ps-ch5', definition: 'Half-width E of a symmetric CI (z_{α/2}·SE or t_{α/2, n−1}·SE).' },
  { term: 'p-value', termVi: 'Giá trị p (p-value)', chapter: 'ps-ch5', definition: 'Probability under H₀ of observing a test statistic at least as extreme as observed; reject H₀ when p ≤ α.' },
  { term: 'Type I & Type II Error', termVi: 'Sai lầm loại I & loại II', chapter: 'ps-ch5', definition: 'Type I (α): rejecting true H₀. Type II (β): failing to reject false H₀. Power = 1 − β.' },
];

export interface NumericSubCheck {
  id: string;
  label: string;
  expected: number;
  tolerance: number;
  unitHint?: string;
}

export interface ProbProblemItem {
  id: string;
  psRef: 'PS 1' | 'PS 2' | 'PS 3' | 'PS 4' | 'PS 5';
  topic: ProbTopicId;
  title: string;
  titleVi: string;
  prompt: string;
  sbHint?: string;
  hints: string[];
  numericChecks: NumericSubCheck[];
  modelSolution: string;
  rubric: Array<{ label: string; points: number }>;
}

export const PROB_PROBLEM_SETS: ProbProblemItem[] = [
  {
    id: 'ps1-p1',
    psRef: 'PS 1',
    topic: 'ps-ch1',
    title: 'PS1 · Prob. 1 — Solve Unknown PMF Constants p, q & Variance',
    titleVi: 'PS1 · Bài 1 — Tìm hằng số p, q trong phân phối xác suất & Phương sai',
    prompt: `A discrete RV $X$ takes values $\\{-2, -1, 1/2, 3/2, 2\\}$ with probabilities $\\{p, q, 0.2, 0.3, p\\}$. Given $E(X) = 0.4$:\na) Determine $p$ and $q$.\nb) Find $\\mathrm{Var}(X)$.\nc) For $R = 1/X$, find $P(S > R)$ where $S = X$.`,
    hints: [
      'Sum of probabilities must equal 1: 2p + q + 0.5 = 1 ⇒ 2p + q = 0.5.',
      'Use E(X) = -2p - q + 0.5(0.2) + 1.5(0.3) + 2p = 0.4. Notice -2p and +2p cancel!',
    ],
    numericChecks: [
      { id: 'q', label: 'q = P(X = -1)', expected: 0.15, tolerance: 0.002 },
      { id: 'p', label: 'p = P(X = ±2)', expected: 0.175, tolerance: 0.002 },
      { id: 'varx', label: 'Var(X)', expected: 2.115, tolerance: 0.01 },
    ],
    modelSolution: `Step 1 (Sum to 1): $2p + q + 0.2 + 0.3 = 1 \\implies 2p + q = 0.5$.\nStep 2 (Mean equation): $E(X) = (-2)p + (-1)q + 0.5(0.2) + 1.5(0.3) + 2p = -q + 0.55 = 0.4 \\implies q = 0.15$.\nHence $2p = 0.35 \\implies p = 0.175$.\nStep 3 (Variance): $E(X^2) = 4(0.175) + 1(0.15) + 0.25(0.2) + 2.25(0.3) + 4(0.175) = 2.275$.\n$\\mathrm{Var}(X) = E(X^2) - [E(X)]^2 = 2.275 - 0.16 = 2.115$.\nStep 4 (S > R): Compare $X$ vs $1/X$: holds at $X = -1/2$? Not in support; holds at $X = 3/2$ ($1.5 > 2/3$) and $X = 2$ ($2 > 0.5$): wait—at $X = -1$, $S = R = -1$ (draw); at $X = -2$, $-2 < -0.5$. Wait carefully: at $X = 1/2$, $0.5 < 2$. So Sarah ($S$) > Rebecca ($R$) ONLY when $X \\in \\{3/2, 2\\}$, probability $0.3 + 0.175 = 0.475$.`,
    rubric: [
      { label: 'Sets up ΣP=1 and E(X)=0.4 to solve q=0.15, p=0.175', points: 2 },
      { label: 'Computes E(X²)=2.275 and Var(X)=2.115', points: 1 },
      { label: 'Identifies S > 1/S cases cleanly (0.475)', points: 1 },
    ],
  },
  {
    id: 'ps1-p2',
    psRef: 'PS 1',
    topic: 'ps-ch1',
    title: 'PS1 · Prob. 2 — Real Estate Sales (Binomial & Least Sample Size)',
    titleVi: 'PS1 · Bài 2 — Xác suất bán bất động sản (Phân phối Nhị thức)',
    prompt: `A real estate agent closes a sale with probability $p = 0.05$ per client independently.\na) Find $P(X \\ge 2)$ when approaching $n = 10$ clients.\nb) Find the smallest $n$ such that $P(X \\ge 1) > 0.75$.`,
    hints: [
      'Complement rule: P(X ≥ 2) = 1 − P(X=0) − P(X=1).',
      'For part b: 1 − 0.95^n > 0.75 ⇒ 0.95^n < 0.25 ⇒ n > ln(0.25)/ln(0.95).',
    ],
    numericChecks: [
      { id: 'pa', label: 'P(X ≥ 2) for n=10', expected: 0.0861, tolerance: 0.002 },
      { id: 'nb', label: 'Least integer n', expected: 28, tolerance: 0.01 },
    ],
    modelSolution: `a) $X \\sim \\mathrm{Bin}(10, 0.05)$.\n$P(X \\ge 2) = 1 - P(X=0) - P(X=1) = 1 - 0.95^{10} - 10(0.05)(0.95)^9 = 1 - 0.59874 - 0.31512 = 0.08614$.\nb) $P(X \\ge 1) = 1 - (0.95)^n > 0.75 \\iff 0.95^n < 0.25$.\nTaking logs: $n > \\frac{\\ln(0.25)}{\\ln(0.95)} \\approx 27.03 \\implies$ least integer $n = 28$.\nc) Mean $= 28(0.05) = 1.4$, $\\mathrm{Var} = 28(0.05)(0.95) = 1.33$.`,
    rubric: [
      { label: 'Uses complement 1 − P(0) − P(1) correctly for Bin(10, 0.05)', points: 2 },
      { label: 'Solves exponential inequality via logarithm to get n = 28', points: 2 },
    ],
  },
  {
    id: 'ps1-p5',
    psRef: 'PS 1',
    topic: 'ps-ch1',
    title: 'PS1 · Prob. 5 — Corporate Bond Defaults (Poisson Inference)',
    titleVi: 'PS1 · Bài 5 — Vỡ nợ trái phiếu (Phân phối Poisson)',
    prompt: `Annual corporate bond defaults follow $X \\sim \\mathrm{Poisson}(\\lambda)$.\na) Given $P(X \\ge 1) = 0.8647$, find expected defaults per year $\\lambda$.\nb) Find $P(X > 5)$.`,
    hints: [
      'P(X ≥ 1) = 1 − P(X=0) = 1 − e^{-λ} = 0.8647 ⇒ e^{-λ} = 0.1353.',
      'For part b: P(X > 5) = 1 − Σ_{k=0}^5 e^{-λ} λ^k / k!.',
    ],
    numericChecks: [
      { id: 'lam', label: 'Rate λ', expected: 2, tolerance: 0.02 },
      { id: 'gt5', label: 'P(X > 5)', expected: 0.0166, tolerance: 0.001 },
    ],
    modelSolution: `a) $P(X \\ge 1) = 1 - e^{-\\lambda} = 0.8647 \\implies e^{-\\lambda} = 0.1353 \\implies \\lambda = -\\ln(0.1353) \\approx 2.00$.\nb) With $\\lambda = 2$, $P(X \\le 5) = e^{-2}(1 + 2 + 2 + \\frac{8}{6} + \\frac{16}{24} + \\frac{32}{120}) = e^{-2}(7.2667) = 0.9834$.\nThus $P(X > 5) = 1 - 0.9834 = 0.0166$.`,
    rubric: [
      { label: 'Extracts λ = 2 from 1 − e^{-λ} = 0.8647', points: 2 },
      { label: 'Computes 1 − P(X ≤ 5) accurately (0.0166)', points: 2 },
    ],
  },
  {
    id: 'ps1-p9',
    psRef: 'PS 1',
    topic: 'ps-ch1',
    title: 'PS1 · Prob. 9 — Job Interviews (Geometric vs Negative Binomial)',
    titleVi: 'PS1 · Bài 9 — Phỏng vấn xin việc (Phân phối Hình học & Nhị thức âm)',
    prompt: `Each independent job interview results in an offer with $p = 0.35$.\na) Find $E(Y)$ and $\\mathrm{Var}(Y)$ for interviews $Y$ until the FIRST offer, plus $P(Y \\le 6)$.\nb) Now Sophie interviews until she secures $r = 3$ offers ($X \\sim \\mathrm{NB}(3, 0.35)$). Find $E(X)$ and $\\mathrm{Var}(X)$.`,
    hints: [
      'Geometric trials Y: E(Y) = 1/p, Var(Y) = (1−p)/p², P(Y ≤ 6) = 1 − (1−p)^6.',
      'Negative Binomial NB(r, p): X = sum of 3 independent Geo(p) variables ⇒ multiply mean & variance by 3.',
    ],
    numericChecks: [
      { id: 'ey', label: 'E(Y) (1st offer)', expected: 2.857, tolerance: 0.01 },
      { id: 'p6', label: 'P(Y ≤ 6)', expected: 0.9246, tolerance: 0.002 },
      { id: 'ex', label: 'E(X) (3rd offer)', expected: 8.571, tolerance: 0.02 },
    ],
    modelSolution: `a) $Y \\sim \\mathrm{Geo}(0.35)$: $E(Y) = 1/0.35 = 2.8571$, $\\mathrm{Var}(Y) = 0.65 / 0.35^2 = 5.3061$.\n$P(Y \\le 6) = 1 - P(Y > 6) = 1 - 0.65^6 = 0.9246$.\nb) $X \\sim \\mathrm{NB}(3, 0.35)$: $E(X) = 3/0.35 = 8.5714$, $\\mathrm{Var}(X) = 3(0.65)/0.35^2 = 15.9184$.`,
    rubric: [
      { label: 'Correctly uses Geo(p) formulas on k ≥ 1', points: 2 },
      { label: 'Computes P(Y ≤ 6) = 1 − 0.65^6 = 0.9246', points: 1 },
      { label: 'Scales E(X) = 3/p and Var(X) = 3(1−p)/p²', points: 1 },
    ],
  },
  {
    id: 'ps2-p1',
    psRef: 'PS 2',
    topic: 'ps-ch2',
    title: 'PS2 · Prob. 1 — Continuous PDF Normalization, CDF & Moments',
    titleVi: 'PS2 · Bài 1 — Hàm mật độ liên tục f(x) = cx²(6−x)',
    prompt: `A continuous RV $X$ on $[0, 6]$ has PDF $f(x) = c x^2(6 - x)$.\na) Determine $c$.\nb) Calculate $P(X > 2)$.\nc) Find $E(X)$ and $\\mathrm{Var}(X)$.`,
    hints: [
      'Integrate cx²(6−x) from 0 to 6 and equate to 1: ∫₀⁶ (6x² − x³) dx = [2x³ − x⁴/4]₀⁶ = 432 − 324 = 108.',
      'Compute E(X) = ∫₀⁶ x f(x) dx and E(X²) = ∫₀⁶ x² f(x) dx.',
    ],
    numericChecks: [
      { id: 'c', label: 'Constant c (decimal, 1/108)', expected: 0.00926, tolerance: 0.0005 },
      { id: 'pgt2', label: 'P(X > 2)', expected: 0.8889, tolerance: 0.002 },
      { id: 'ex', label: 'E(X)', expected: 3.6, tolerance: 0.01 },
    ],
    modelSolution: `a) $\\int_0^6 c(6x^2 - x^3)\\,dx = c\\left[2x^3 - \\frac{x^4}{4}\\right]_0^6 = c(432 - 324) = 108c = 1 \\implies c = \\frac{1}{108} \\approx 0.00926$.\nb) $P(X \\le 2) = \\frac{1}{108}[2(8) - 16/4] = \\frac{12}{108} = \\frac{1}{9} \\implies P(X > 2) = \\frac{8}{9} \\approx 0.8889$.\nc) $E(X) = \\frac{1}{108}\\int_0^6(6x^3 - x^4)\\,dx = \\frac{1}{108}\\left[\\frac{3}{2}x^4 - \\frac{x^5}{5}\\right]_0^6 = \\frac{1}{108}(1944 - 1555.2) = 3.6$.\n$E(X^2) = \\frac{1}{108}[\\frac{6}{5}x^5 - \\frac{x^6}{6}]_0^6 = 14.4 \\implies \\mathrm{Var}(X) = 14.4 - 3.6^2 = 1.44$.`,
    rubric: [
      { label: 'Integrates PDF over [0,6] to prove c = 1/108', points: 1.5 },
      { label: 'Computes P(X > 2) = 8/9 via complement or direct integral', points: 1 },
      { label: 'Derives E(X) = 3.6 and Var(X) = 1.44', points: 1.5 },
    ],
  },
  {
    id: 'ps2-p6',
    psRef: 'PS 2',
    topic: 'ps-ch2',
    title: 'PS2 · Prob. 6 — Inverse Normal (Solve μ, σ and IQR using SB C-2)',
    titleVi: 'PS2 · Bài 6 — Tìm μ, σ và khoảng tứ phân vị IQR từ bảng SB C-2',
    prompt: `Let $X \\sim N(\\mu, \\sigma^2)$ with $P(X < 50) = 0.05$ and $P(X > 80) = 0.10$.\na) Using SB Appendix C-2, find $\\mu$ and $\\sigma$.\nb) Determine the interquartile range $\\mathrm{IQR} = Q_3 - Q_1$.`,
    sbHint: 'Look inside Appendix C-2 body for .0500 (z ≈ -1.645) and .9000 (z ≈ 1.282), plus .7500 for Q3 (z ≈ 0.674).',
    hints: [
      'P(Z ≤ z₁) = 0.05 ⇒ z₁ ≈ −1.645. P(Z ≤ z₂) = 0.90 ⇒ z₂ ≈ +1.282.',
      'Solve two linear equations: 50 = μ − 1.645σ and 80 = μ + 1.282σ.',
    ],
    numericChecks: [
      { id: 'sd', label: 'Standard deviation σ', expected: 10.25, tolerance: 0.15 },
      { id: 'mu', label: 'Mean μ', expected: 66.86, tolerance: 0.25 },
      { id: 'iqr', label: 'IQR = 2(0.6745)σ', expected: 13.83, tolerance: 0.25 },
    ],
    modelSolution: `Step 1 (SB Appendix C-2 reverse lookup): $P(X < 50) = 0.05 \\implies z_1 = \\frac{50 - \\mu}{\\sigma} \\approx -1.645$.\n$P(X > 80) = 0.10 \\implies P(X \\le 80) = 0.90 \\implies z_2 = \\frac{80 - \\mu}{\\sigma} \\approx 1.282$.\nStep 2 (Solve system): Subtracting gives $30 = (1.282 + 1.645)\\sigma = 2.927\\sigma \\implies \\sigma \\approx 10.25$.\nThen $\\mu = 80 - 1.282(10.25) \\approx 66.86$.\nStep 3 (IQR): By symmetry, $Q_3 = \\mu + 0.6745\\sigma$ and $Q_1 = \\mu - 0.6745\\sigma \\implies \\mathrm{IQR} = 2(0.6745)(10.25) \\approx 13.83$.`,
    rubric: [
      { label: 'Correct SB Appendix C-2 z-quantiles (-1.645 and +1.282)', points: 1.5 },
      { label: 'Solves simultaneous equations for σ ≈ 10.25 and μ ≈ 66.86', points: 1.5 },
      { label: 'Computes IQR using Q₃ − Q₁ = 2(0.6745)σ ≈ 13.83', points: 1 },
    ],
  },
  {
    id: 'ps2-p8',
    psRef: 'PS 2',
    topic: 'ps-ch2',
    title: 'PS2 · Prob. 8 — Exponential Waiting Time & Memoryless Property',
    titleVi: 'PS2 · Bài 8 — Thời gian chờ Exponential & Tính chất không nhớ',
    prompt: `Student waiting time $X$ follows an Exponential distribution with mean 10 minutes.\na) Find $P(X > 15)$ and $\\mathrm{Var}(X)$.\nb) If no student arrives in the first 40 minutes, find the probability that a student arrives before the 60-minute hour ends.`,
    hints: [
      'Mean = 1/λ = 10 ⇒ λ = 0.1 per minute; Var(X) = 1/λ² = 100.',
      'Memoryless: P(X ≤ 60 | X > 40) = P(X ≤ 20) = 1 − e^{-0.1(20)}.',
    ],
    numericChecks: [
      { id: 'pgt15', label: 'P(X > 15)', expected: 0.2231, tolerance: 0.002 },
      { id: 'varx', label: 'Var(X)', expected: 100, tolerance: 0.01 },
      { id: 'cond', label: 'P(X ≤ 60 | X > 40)', expected: 0.8647, tolerance: 0.002 },
    ],
    modelSolution: `Step 1: $E(X) = 1/\\lambda = 10 \\implies \\lambda = 0.1\\text{ min}^{-1}$. $\\mathrm{Var}(X) = 1/\\lambda^2 = 100$.\na) $P(X > 15) = e^{-0.1(15)} = e^{-1.5} \\approx 0.2231$.\nb) By the **memoryless property**, $P(X < 60 \\mid X > 40) = P(X < 20) = 1 - e^{-0.1(20)} = 1 - e^{-2} \\approx 0.8647$.`,
    rubric: [
      { label: 'Identifies λ = 0.1 and Var(X) = 100', points: 1.5 },
      { label: 'Computes P(X > 15) = e^{-1.5} = 0.2231', points: 1 },
      { label: 'Invokes Memoryless Property to get 1 − e^{-2} = 0.8647', points: 1.5 },
    ],
  },
  {
    id: 'ps3-p2',
    psRef: 'PS 3',
    topic: 'ps-ch3',
    title: 'PS3 · Prob. 2 — Discrete Joint Table: Marginals & Expected Cost',
    titleVi: 'PS3 · Bài 2 — Bảng phân phối kết hợp & Kỳ vọng hàm chi phí C = 2X + 10Y²',
    prompt: `Moisture $X \\in \\{1,2,3,4\\}$ and impurity $Y \\in \\{1,2\\}$ have joint PMF:\n$Y=2$: $[0.10, 0.20, 0.30, 0.05]$; $Y=1$: $[0.05, 0.05, 0.15, 0.10]$.\na) Find the marginal PMFs of $X$ and $Y$.\nb) Additional cost is $C = 2X + 10Y^2$. Find $E(C)$.`,
    hints: [
      'Row sums give P(Y=1)=0.35 and P(Y=2)=0.65.',
      'Use linearity: E(C) = 2E(X) + 10E(Y²), where E(Y²) = 1²(0.35) + 2²(0.65).',
    ],
    numericChecks: [
      { id: 'ex', label: 'E(X)', expected: 2.6, tolerance: 0.01 },
      { id: 'ey2', label: 'E(Y²)', expected: 2.95, tolerance: 0.01 },
      { id: 'ec', label: 'E(C) = E(2X + 10Y²)', expected: 34.7, tolerance: 0.05 },
    ],
    modelSolution: `a) Column sums for $f_X(x)$: $P(X=1)=0.15,\\; P(X=2)=0.25,\\; P(X=3)=0.45,\\; P(X=4)=0.15$.\nRow sums for $f_Y(y)$: $P(Y=1)=0.35,\\; P(Y=2)=0.65$.\nb) $E(X) = 1(0.15)+2(0.25)+3(0.45)+4(0.15) = 2.60$.\n$E(Y^2) = 1^2(0.35) + 2^2(0.65) = 0.35 + 2.60 = 2.95$.\n$E(C) = 2E(X) + 10E(Y^2) = 2(2.60) + 10(2.95) = 34.70$.`,
    rubric: [
      { label: 'Computes marginal PMFs f_X and f_Y accurately', points: 1.5 },
      { label: 'Computes E(X)=2.6 and E(Y²)=2.95', points: 1.5 },
      { label: 'Applies linearity E(C)=2E(X)+10E(Y²)=34.7', points: 1 },
    ],
  },
  {
    id: 'ps3-p4',
    psRef: 'PS 3',
    topic: 'ps-ch3',
    title: 'PS3 · Prob. 4 — Continuous Joint on Triangle: Cov(X,Y) & Correlation',
    titleVi: 'PS3 · Bài 4 — Phân phối liên tục trên miền tam giác: Cov & Hệ số tương quan',
    prompt: `Let $f(x, y) = 24xy$ for $0 \\le x, y \\le 1$ and $x + y \\le 1$ (0 elsewhere).\na) Calculate $E(X)$ and $E(Y)$.\nb) Calculate $\\mathrm{Cov}(X, Y)$ and correlation $\\rho_{X,Y}$.`,
    hints: [
      'Marginal f_X(x) = ∫₀^{1−x} 24xy dy = 12x(1−x)² for 0 ≤ x ≤ 1.',
      'By symmetry, E(X) = E(Y) = 2/5 = 0.4, Var(X) = Var(Y) = 1/25 = 0.04, E(XY) = 2/15.',
    ],
    numericChecks: [
      { id: 'ex', label: 'E(X) = E(Y)', expected: 0.4, tolerance: 0.005 },
      { id: 'cov', label: 'Cov(X, Y) (-0.0267)', expected: -0.0267, tolerance: 0.002 },
      { id: 'rho', label: 'Correlation ρ (-0.6667)', expected: -0.6667, tolerance: 0.01 },
    ],
    modelSolution: `a) $f_X(x) = \\int_0^{1-x} 24xy\\,dy = 12x(1-x)^2$ on $[0,1]$.\n$E(X) = \\int_0^1 12x^2(1-x)^2\\,dx = 12(\\frac{1}{3}-\\frac{2}{4}+\\frac{1}{5}) = 0.4$. By symmetry, $E(Y) = 0.4$.\nb) $E(X^2) = \\int_0^1 12x^3(1-x)^2\\,dx = 12(\\frac{1}{4}-\\frac{2}{5}+\\frac{1}{6}) = 0.2 \\implies \\mathrm{Var}(X)=\\mathrm{Var}(Y)=0.2-0.16=0.04$.\n$E(XY) = \\int_0^1 \\int_0^{1-x} 24x^2 y^2\\,dy\\,dx = 8\\int_0^1 x^2(1-x)^3\\,dx = 8 \\cdot \\frac{1}{60} = \\frac{2}{15} \\approx 0.1333$.\n$\\mathrm{Cov}(X,Y) = \\frac{2}{15} - (0.4)(0.4) = -\\frac{2}{75} \\approx -0.0267$, and $\\rho = \\frac{-2/75}{0.04} = -\\frac{2}{3} \\approx -0.6667$.`,
    rubric: [
      { label: 'Correct triangular integration bounds y ∈ [0, 1−x]', points: 1 },
      { label: 'Derives E(X)=E(Y)=0.4 and Var(X)=0.04', points: 1.5 },
      { label: 'Computes E(XY)=2/15, Cov=−2/75, ρ=−2/3', points: 1.5 },
    ],
  },
  {
    id: 'ps4-p1',
    psRef: 'PS 4',
    topic: 'ps-ch4',
    title: 'PS4 · Prob. 1 & 4 — MLE Derivation (Exp(λ)) & CLT Sample Mean Prob',
    titleVi: 'PS4 · Bài 1 & 4 — Ước lượng MLE cho Exp(λ) & Định lý CLT',
    prompt: `Part A: Let $X_1,\\dots,X_n \\stackrel{\\text{i.i.d.}}{\\sim} \\mathrm{Exp}(\\lambda)$. Derive the log-likelihood $\\ell(\\lambda)$ and solve for MLE $\\hat{\\lambda}$.\nPart B (Prob 4): Weekly student spending has $\\mu = \\$115.50$, $\\sigma = \\$35$. With $n = 40$ students, find $P(|\\bar{X} - 115.50| \\le 10)$ and $P(\\bar{X} \\le 100)$.`,
    sbHint: 'Use Appendix C-2 for Z = (125.5−115.5)/(35/√40) ≈ ±1.81 and Z = (100−115.5)/5.534 ≈ −2.80.',
    hints: [
      'L(λ) = λ^n exp(−λ Σx_i) ⇒ ℓ(λ) = n ln(λ) − λ Σx_i. Set dℓ/dλ = 0 ⇒ λ̂ = n / ΣX_i = 1 / X̄.',
      'SE = 35 / √40 ≈ 5.534.',
    ],
    numericChecks: [
      { id: 'se', label: 'Standard Error σ/√40', expected: 5.534, tolerance: 0.02 },
      { id: 'pwithin', label: 'P(|X̄ − μ| ≤ 10)', expected: 0.9293, tolerance: 0.003 },
      { id: 'ple100', label: 'P(X̄ ≤ 100)', expected: 0.0026, tolerance: 0.001 },
    ],
    modelSolution: `Part A: $L(\\lambda) = \\prod_{i=1}^n \\lambda e^{-\\lambda x_i} = \\lambda^n e^{-\\lambda \\sum x_i}$, so $\\ell(\\lambda) = n\\ln\\lambda - \\lambda \\sum x_i$.\nSetting $\\ell'(\\lambda) = \\frac{n}{\\lambda} - \\sum x_i = 0$ (and $\\ell''(\\lambda) = -n/\\lambda^2 < 0$) yields $\\hat{\\lambda}_{\\text{MLE}} = \\frac{n}{\\sum X_i} = \\frac{1}{\\bar{X}}$ (identical to MoM).\nPart B: By CLT, $\\bar{X} \\approx N(115.5, 35^2/40)$ with $SE = 5.534$.\n$P(|\\bar{X}-115.5| \\le 10) = P(|Z| \\le 10/5.534) = P(|Z| \\le 1.807) = \\Phi(1.81)-\\Phi(-1.81) \\approx 0.9293$.\n$P(\\bar{X} \\le 100) = \\Phi(-15.5/5.534) = \\Phi(-2.80) = 0.0026$ (very unusual!).`,
    rubric: [
      { label: 'Derives log-likelihood ℓ(λ) = n ln λ − λ Σx_i & sets derivative to 0', points: 2 },
      { label: 'Applies CLT with SE = 35/√40 ≈ 5.534 for within-$10 probability', points: 1 },
      { label: 'Computes P(X̄ ≤ 100) ≈ 0.0026 and interprets rarity', points: 1 },
    ],
  },
  {
    id: 'ps5-p1',
    psRef: 'PS 5',
    topic: 'ps-ch5',
    title: 'PS5 · Prob. 1 — Sugar Bags 99% Z-CI & Minimum Sample Size',
    titleVi: 'PS5 · Bài 1 — Khoảng tin cậy 99% cho trung bình (biết σ) & Cỡ mẫu tối thiểu',
    prompt: `Weights of sugar bags are Normal with known $\\sigma = 1.2$ oz. A sample of $n = 25$ bags gave $\\bar{x} = 19.8$ oz.\na) Find the 99% confidence interval for $\\mu$.\nb) Find the smallest sample size $n$ for a 99% CI margin of error $E \\le 0.1$ oz.`,
    sbHint: 'From Appendix C-2, 99% CI has α/2 = 0.005 ⇒ cumulative 0.9950 ⇒ z_{0.005} ≈ 2.576.',
    hints: [
      'Use z = 2.576 and SE = 1.2 / √25 = 0.24.',
      'Sample size formula: n ≥ (z * σ / E)² = (2.5758 * 1.2 / 0.1)², always round UP.',
    ],
    numericChecks: [
      { id: 'lo', label: '99% CI Lower bound', expected: 19.182, tolerance: 0.01 },
      { id: 'hi', label: '99% CI Upper bound', expected: 20.418, tolerance: 0.01 },
      { id: 'nmin', label: 'Required sample size n', expected: 956, tolerance: 2 },
    ],
    modelSolution: `a) Because population is Normal and $\\sigma = 1.2$ is known, use $Z$: $z_{0.005} \\approx 2.576$, $SE = 1.2/\\sqrt{25} = 0.24$.\nMargin $E = 2.576(0.24) = 0.6182 \\implies 99\\%\\text{ CI} = [19.8 - 0.6182,\\; 19.8 + 0.6182] = [19.182,\\; 20.418]$ oz.\nb) $n = \\lceil (2.5758 \\times 1.2 / 0.1)^2 \\rceil = \\lceil 955.4 \\rceil = 956$ bags.`,
    rubric: [
      { label: 'Selects Z-interval with z_{0.005} ≈ 2.576', points: 1 },
      { label: 'Computes 99% CI [19.182, 20.418]', points: 1.5 },
      { label: 'Applies n = (zσ/E)² and rounds UP to 956', points: 1.5 },
    ],
  },
  {
    id: 'ps5-p5',
    psRef: 'PS 5',
    topic: 'ps-ch5',
    title: 'PS5 · Prob. 5 — Student Heights t-Test (α = 5% vs 1%) & Type I Error',
    titleVi: 'PS5 · Bài 5 — Kiểm định giả thuyết t (mức 5% và 1%) & Sai lầm loại I',
    prompt: `In 2015, mean height was $165$ cm. A 2025 sample of $n = 100$ students gave $\\bar{x} = 167.1$ cm and $s^2 = 101.2$. David tests if mean height increased at $\\alpha = 5\\%$, James tests at $\\alpha = 1\\%$.\na) State $H_0, H_1$ and determine both test outcomes using Appendix D ($df = 99$).\nb) If true 2025 mean is actually 165 cm, did either commit a Type I or Type II error?`,
    sbHint: 'In Appendix D (p.770), look at d.f. = 95/100 (conservatively 95), one-tailed α = .05 (t ≈ 1.661) and α = .01 (t ≈ 2.365).',
    hints: [
      's = √101.2 ≈ 10.06, SE = s / √100 ≈ 1.006 ⇒ t_obs = (167.1 − 165) / 1.006 ≈ 2.088.',
      'Compare t_obs = 2.088 with one-tailed critical values at α=0.05 vs α=0.01.',
    ],
    numericChecks: [
      { id: 'tobs', label: 'Test statistic t_obs', expected: 2.088, tolerance: 0.01 },
    ],
    modelSolution: `a) $H_0: \\mu = 165$ vs $H_1: \\mu > 165$ (one-sided right-tail).\nWith $\\sigma$ unknown, $t_{\\text{obs}} = \\frac{167.1 - 165}{\\sqrt{101.2}/\\sqrt{100}} = \\frac{2.1}{1.006} = 2.088$ ($df = 99$).\nFrom Appendix D ($df \\approx 99$): $t_{0.05, 99} \\approx 1.660 < 2.088$ ⇒ **David rejects $H_0$** ($p \\approx 0.0197$). Meanwhile $t_{0.01, 99} \\approx 2.365 > 2.088$ ⇒ **James fails to reject $H_0$**.\nb) Since $H_0$ ($\mu=165$) is actually TRUE: David rejected true $H_0$ (**Type I error**); James did not reject (**neither error / correct decision**).`,
    rubric: [
      { label: 'States H₀: μ=165 vs H₁: μ>165 and computes t_obs = 2.088', points: 1.5 },
      { label: 'Compares against Appendix D one-tail critical values at 5% and 1%', points: 1.5 },
      { label: 'Identifies David = Type I error, James = no error', points: 1 },
    ],
  },
  {
    id: 'ps5-p7',
    psRef: 'PS 5',
    topic: 'ps-ch5',
    title: 'PS5 · Prob. 7 & 11 — Proportion Z-Test and Variance χ² Test',
    titleVi: 'PS5 · Bài 7 & 11 — Kiểm định Tỷ lệ (Z) và Phương sai (χ²)',
    prompt: `Part A (Prob 7): $355$ of $546$ travelers use a laptop. Find the 95% CI for true proportion $\\pi$ and test $H_0: \\pi = 2/3$ vs $H_1: \\pi \\ne 2/3$ at $\\alpha = 5\\%$.\nPart B (Prob 11): Quality spec requires thickness variance $\\sigma^2 \\le 1.65\\text{ mm}^2$. A sample of $n = 10$ sheets gives $s^2 = 3.20$. Test $H_0: \\sigma^2 \\le 1.65$ vs $H_1: \\sigma^2 > 1.65$ at $\\alpha = 5\\%$ using Appendix E.`,
    sbHint: 'Use Appendix C-2 for z = 1.96 (Part A) and Appendix E (p.771, d.f. = 9, upper tail .05 ⇒ χ² = 16.92) for Part B.',
    hints: [
      'Part A uses p̂ = 355/546 = 0.6502 in CI SE, and π₀ = 2/3 in the Z-test SE!',
      'Part B: χ²_obs = (n − 1)s² / σ₀² = 9(3.20) / 1.65 = 17.455 > 16.92.',
    ],
    numericChecks: [
      { id: 'phat', label: 'Sample proportion p̂', expected: 0.6502, tolerance: 0.002 },
      { id: 'zprop', label: 'Proportion Z_obs', expected: -0.818, tolerance: 0.02 },
      { id: 'chiobs', label: 'Variance χ²_obs', expected: 17.455, tolerance: 0.05 },
    ],
    modelSolution: `Part A: $\\hat{p} = 355/546 = 0.6502$. $95\\%$ CI $= 0.6502 \\pm 1.96\\sqrt{0.6502(0.3498)/546} = [0.6102,\\; 0.6902]$.\nFor $H_0: \\pi = 2/3$, $z_{\\text{obs}} = \\frac{0.6502 - 0.6667}{\\sqrt{(2/3)(1/3)/546}} = -0.818$. Since $|z| < 1.96$ ($p = 0.413$), **fail to reject $H_0$** (consistent with 2/3 lying inside CI).\nPart B: $H_0: \\sigma^2 \\le 1.65$ vs $H_1: \\sigma^2 > 1.65$. $\\chi^2_{\\text{obs}} = \\frac{9(3.20)}{1.65} = 17.455$.\nFrom SB Appendix E ($df = 9, \\alpha = 0.05$), $\\chi^2_{0.05, 9} = 16.92 < 17.455$ ⇒ **Reject $H_0$** (variance exceeds 1.65!).`,
    rubric: [
      { label: 'Computes 95% proportion CI [0.610, 0.690] & uses π₀ SE in z-test (-0.818)', points: 2 },
      { label: 'Computes χ²_obs = 17.455 and looks up χ²_{0.05, 9} = 16.92 correctly', points: 2 },
    ],
  },
];

// ==================== MIDTERM 25 MCQs (Ch. 1-3) ====================

export interface ProbMcqItem {
  id: string;
  topic: 'ps-ch1' | 'ps-ch2' | 'ps-ch3';
  tag: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  explanationVi: string;
}

export const PROB_MIDTERM_MCQS: ProbMcqItem[] = [
  {
    id: 'mc-1',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Moments',
    question: 'If E(X) = 4 and Var(X) = 9, what are E(2X − 3) and Var(2X − 3)?',
    choices: ['5 and 36', '5 and 18', '5 and 15', '8 and 36'],
    correctIndex: 0,
    explanation: 'E(2X − 3) = 2(4) − 3 = 5; Var(2X − 3) = 2² Var(X) = 4(9) = 36 (shift −3 drops out of variance).',
    explanationVi: 'E(2X−3)=2(4)−3=5; Var(2X−3)=2²·Var(X)=4·9=36 (hằng số cộng trừ không ảnh hưởng phương sai).',
  },
  {
    id: 'mc-2',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Binomial',
    question: 'For X ~ Bin(100, 0.02), the exact variance Var(X) and Poisson approximation parameter λ are:',
    choices: ['Var = 1.96, λ = 2', 'Var = 2.00, λ = 2', 'Var = 1.96, λ = 0.02', 'Var = 98, λ = 2'],
    correctIndex: 0,
    explanation: 'Exact Binomial Var = np(1−p) = 100(0.02)(0.98) = 1.96; Poisson approximation uses λ = np = 2.',
    explanationVi: 'Phương sai đúng của Nhị thức là np(1−p)=1.96; xấp xỉ Poisson lấy λ = np = 2.',
  },
  {
    id: 'mc-3',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Geometric',
    question: 'Sophie interviews until her first offer (p = 0.25 each time). Under Dr. Hoang’s Geometric convention, P(X > 4) equals:',
    choices: ['(0.75)^4 = 0.3164', '(0.75)^3 = 0.4219', '0.25(0.75)^4', '1 − (0.75)^4'],
    correctIndex: 0,
    explanation: 'X > 4 means the first 4 interviews ALL fail: P(X > 4) = (1 − p)^4 = 0.75^4 = 0.3164.',
    explanationVi: 'X > 4 nghĩa là 4 lần phỏng vấn đầu tiên đều trượt: (1−p)^4 = 0.75^4 = 0.3164.',
  },
  {
    id: 'mc-4',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Negative Binomial',
    question: 'If X ~ NB(r = 3, p = 0.5) (trials until 3rd success), what is E(X) + Var(X)?',
    choices: ['12', '9', '6', '15'],
    correctIndex: 0,
    explanation: 'E(X) = r/p = 3/0.5 = 6; Var(X) = r(1−p)/p² = 3(0.5)/0.25 = 6. Sum = 12.',
    explanationVi: 'E(X)=r/p=6 và Var(X)=r(1−p)/p²=6 nên tổng bằng 12.',
  },
  {
    id: 'mc-5',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Poisson Sum',
    question: 'If X₁ ~ Poisson(2) and X₂ ~ Poisson(3) are independent, what is the distribution of X₁ + X₂?',
    choices: ['Poisson(5)', 'Poisson(6)', 'Binomial(5, 0.5)', 'Exponential(5)'],
    correctIndex: 0,
    explanation: 'Sums of independent Poisson RVs follow Poisson(λ₁ + λ₂) = Poisson(5).',
    explanationVi: 'Tổng hai biến Poisson độc lập tuân theo Poisson(λ₁+λ₂) = Poisson(5).',
  },
  {
    id: 'mc-6',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Hypergeometric',
    question: 'A box has N=10 eggs with D=2 rotten. You pick n=2 WITHOUT replacement. What is P(0 rotten eggs)?',
    choices: ['28/45 ≈ 0.6222', '0.64', '2/45', '8/10'],
    correctIndex: 0,
    explanation: 'C(8,2)/C(10,2) = 28/45 ≈ 0.6222.',
    explanationVi: 'X ~ Hyper(2, 10, 2) ⇒ P(X=0) = C(8,2)/C(10,2) = 28/45.',
  },
  {
    id: 'mc-7',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Conditional Poisson',
    question: 'If X₁ ~ Poisson(λ₁), X₂ ~ Poisson(λ₂) independent, then given X₁ + X₂ = n, the conditional distribution of X₁ is:',
    choices: ['Binomial(n, λ₁/(λ₁+λ₂))', 'Poisson(λ₁)', 'Hypergeometric', 'Geometric'],
    correctIndex: 0,
    explanation: 'Problem Set 1 Prob. 18b result: X₁ | (X₁+X₂=n) ~ Bin(n, λ₁/(λ₁+λ₂)).',
    explanationVi: 'Kết quả kinh điển (PS1 Bài 18b): X₁ | (X₁+X₂=n) ~ Bin(n, λ₁/(λ₁+λ₂)).',
  },
  {
    id: 'mc-8',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · CDF Jump',
    question: 'For a discrete RV, F(x) = P(X ≤ x) has a jump at x = 2 from F(1.9) = 0.35 to F(2) = 0.60. What is P(X = 2)?',
    choices: ['0.25', '0.60', '0.35', '0'],
    correctIndex: 0,
    explanation: 'Jump size at x = 2 equals P(X = 2) = 0.60 − 0.35 = 0.25.',
    explanationVi: 'Độ lớn bước nhảy của hàm CDF tại x=2 chính là P(X=2) = 0.60 − 0.35 = 0.25.',
  },
  {
    id: 'mc-9',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Continuous PDF',
    question: 'For ANY continuous random variable X, which statement is ALWAYS true?',
    choices: [
      'P(a ≤ X ≤ b) = P(a < X < b)',
      'f(x) ≤ 1 for all x',
      'P(X = x) = f(x)',
      'F(x) is strictly decreasing',
    ],
    correctIndex: 0,
    explanation: 'Continuous RVs assign 0 probability to single points, so endpoints do not change interval probabilities (f(x) CAN exceed 1, e.g. U(0, 0.5) has f=2).',
    explanationVi: 'Với biến liên tục, P(X=a)=0 nên đóng/mở đầu mút không đổi xác suất; mật độ f(x) vẫn có thể lớn hơn 1.',
  },
  {
    id: 'mc-10',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Uniform',
    question: 'If X ~ U(a, b) has E(X) = 2 and Var(X) = 3, find (a, b):',
    choices: ['(-1, 5)', '(0, 4)', '(-2, 6)', '(1, 3)'],
    correctIndex: 0,
    explanation: '(a+b)/2 = 2 ⇒ a+b = 4. (b−a)²/12 = 3 ⇒ b−a = 6. Solving gives a = −1, b = 5.',
    explanationVi: '(a+b)/2=2 và (b−a)²/12=3 ⇒ b−a=6 ⇒ a=−1, b=5.',
  },
  {
    id: 'mc-11',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Normal (SB C-2)',
    question: 'From SB Appendix C-2, Φ(−1.96) equals:',
    choices: ['.0250', '.4750', '.9750', '.0500'],
    correctIndex: 0,
    explanation: 'Appendix C-2 gives left-tail cumulative area P(Z ≤ −1.96) = .0250.',
    explanationVi: 'Bảng C-2 cho diện tích tích lũy bên trái P(Z ≤ −1.96) = .0250.',
  },
  {
    id: 'mc-12',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Normal (SB C-1)',
    question: 'If SB Appendix C-1 shows P(0 ≤ Z ≤ 1.64) = .4495, then P(Z > 1.64) equals:',
    choices: ['.0505', '.4495', '.9495', '.1010'],
    correctIndex: 0,
    explanation: 'Right half-curve has area 0.5000, so P(Z > 1.64) = 0.5000 − 0.4495 = .0505.',
    explanationVi: 'Nửa phải có diện tích 0.5000 ⇒ P(Z > 1.64) = 0.5000 − 0.4495 = .0505.',
  },
  {
    id: 'mc-13',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Exponential',
    question: 'Office interruptions occur as a Poisson process at rate λ = 5.5/hour. The time between two interruptions follows:',
    choices: ['Exp(5.5) with mean 1/5.5 hour', 'Exp(1/5.5) with mean 5.5 hours', 'Normal(5.5, 5.5)', 'Gamma(2, 5.5)'],
    correctIndex: 0,
    explanation: 'Poisson(λ) arrivals have inter-arrival times Exp(λ) with mean 1/λ.',
    explanationVi: 'Thời gian giữa 2 sự kiện Poisson(λ) phân phối theo Exp(λ) với kỳ vọng 1/λ.',
  },
  {
    id: 'mc-14',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Exponential Memoryless',
    question: 'If X ~ Exp(λ = 0.2), what is P(X > 15 | X > 10)?',
    choices: ['e^{-1} ≈ 0.3679', 'e^{-3}', 'e^{-2}', '1 − e^{-1}'],
    correctIndex: 0,
    explanation: 'Memoryless: P(X > 15 | X > 10) = P(X > 5) = e^{-0.2×5} = e^{-1}.',
    explanationVi: 'Tính chất không nhớ: P(X > 15 | X > 10) = P(X > 5) = e^{-0.2×5} = e^{-1}.',
  },
  {
    id: 'mc-15',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Gamma & Chi-Square',
    question: 'In Dr. Hoang’s Ch. 2 notation Γ(α, β) (shape α, rate β), χ²(n) corresponds to:',
    choices: ['Γ(n/2, 1/2) with mean n, variance 2n', 'Γ(1/2, n/2) with mean 1/n', 'Γ(n, 2) with mean 2n', 'Γ(n, 1) with variance n'],
    correctIndex: 0,
    explanation: 'χ²(n) = Γ(α = n/2, β = 1/2), giving E(X) = (n/2)/(1/2) = n and Var(X) = 2n.',
    explanationVi: 'χ²(n) là trường hợp riêng Γ(n/2, 1/2), có kỳ vọng n và phương sai 2n.',
  },
  {
    id: 'mc-16',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Normal Approx',
    question: 'To approximate P(X ≥ 30) for X ~ Bin(100, 0.25) with continuity correction, evaluate Normal probability for:',
    choices: ['X_norm ≥ 29.5', 'X_norm ≥ 30.5', 'X_norm ≥ 30.0', 'X_norm ≤ 29.5'],
    correctIndex: 0,
    explanation: 'Integer 30 spans [29.5, 30.5], so X ≥ 30 corresponds to continuous X ≥ 29.5.',
    explanationVi: 'Số nguyên 30 ứng với [29.5, 30.5] ⇒ X ≥ 30 trở thành X_liên tục ≥ 29.5.',
  },
  {
    id: 'mc-17',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Gamma Mode',
    question: 'For X ~ Gamma(α, β) with α > 1, where is the mode (peak of the PDF)?',
    choices: ['(α − 1)/β', 'α/β', 'β/(α − 1)', 'α/β²'],
    correctIndex: 0,
    explanation: 'Setting d/dx[x^{α−1}e^{−βx}] = 0 yields x = (α−1)/β (PS2 Prob. 14a).',
    explanationVi: 'Giải f′(x) = 0 cho đỉnh mật độ tại x = (α − 1)/β (PS2 Bài 14a).',
  },
  {
    id: 'mc-18',
    topic: 'ps-ch3',
    tag: 'Ch. 3 · Independence',
    question: 'If X and Y are continuous RVs on 0 ≤ x, y ≤ 1 with x + y ≤ 1 and f(x,y) = 24xy, are X and Y independent?',
    choices: [
      'No, because the triangular domain depends on both x and y',
      'Yes, because 24xy factors into (24x)·(y)',
      'Yes, because Cov(X, Y) = 0',
      'Cannot be determined without CDF',
    ],
    correctIndex: 0,
    explanation: 'For independence, BOTH f(x,y) must factor AND support must be a product rectangle A × B.',
    explanationVi: 'Điều kiện độc lập đòi hỏi miền xác định phải là hình chữ nhật A×B; miền tam giác x+y≤1 không độc lập.',
  },
  {
    id: 'mc-19',
    topic: 'ps-ch3',
    tag: 'Ch. 3 · Zero Covariance Trap',
    question: 'Which statement about Covariance Cov(X,Y) and Independence is TRUE?',
    choices: [
      'Independence implies Cov(X,Y) = 0, but Cov(X,Y) = 0 does NOT imply independence',
      'Cov(X,Y) = 0 implies X and Y are independent',
      'Cov(X,Y) must always lie between −1 and +1',
      'Var(X − Y) = Var(X) − Var(Y) always',
    ],
    correctIndex: 0,
    explanation: 'Cov only detects linear dependence (e.g. X ~ U(−1,1), Y = X² has Cov=0 but is strongly dependent).',
    explanationVi: 'Độc lập ⇒ Cov = 0, nhưng chiều ngược lại sai (ví dụ Y = X² với X đối xứng quanh 0).',
  },
  {
    id: 'mc-20',
    topic: 'ps-ch3',
    tag: 'Ch. 3 · Linear Combination',
    question: 'If Var(X) = 4, Var(Y) = 9, and Cov(X, Y) = −2, what is Var(2X − Y)?',
    choices: ['33', '25', '17', '−2'],
    correctIndex: 0,
    explanation: 'Var(2X − Y) = 4(4) + 1(9) + 2(2)(−1)(−2) = 16 + 9 + 8 = 33!',
    explanationVi: 'Var(2X−Y) = 2²·4 + (−1)²·9 + 2(2)(−1)(−2) = 16 + 9 + 8 = 33.',
  },
  {
    id: 'mc-21',
    topic: 'ps-ch3',
    tag: 'Ch. 3 · Conditional Expectation',
    question: 'If X ~ U(0, 1) and Y | (X = x) ~ U(0, x), what is E(Y)?',
    choices: ['1/4', '1/2', '1/3', '1/6'],
    correctIndex: 0,
    explanation: 'E(Y | X = x) = x/2, so E(Y) = E[E(Y|X)] = E(X/2) = 0.5(0.5) = 1/4.',
    explanationVi: 'E(Y|X=x)=x/2 ⇒ theo kỳ vọng toàn phần E(Y) = E(X/2) = 1/4.',
  },
  {
    id: 'mc-22',
    topic: 'ps-ch3',
    tag: 'Ch. 3 · Correlation Bounds',
    question: 'Which value is IMPOSSIBLE for a Pearson correlation coefficient ρ_{X,Y}?',
    choices: ['−1.05', '−1.00', '0.00', '0.99'],
    correctIndex: 0,
    explanation: 'By Cauchy–Schwarz, −1 ≤ ρ_{X,Y} ≤ 1 always.',
    explanationVi: 'Hệ số tương quan luôn thỏa mãn −1 ≤ ρ ≤ 1.',
  },
  {
    id: 'mc-23',
    topic: 'ps-ch3',
    tag: 'Ch. 3 · Marginal Verification',
    question: 'If joint PMF has rows Y∈{1,2} summing to 0.35 and 0.65, then P(X=2 | Y=1) equals:',
    choices: ['f(2, 1) / 0.35', 'f(2, 1) / f_X(2)', 'f(2, 1) × 0.35', '0.35'],
    correctIndex: 0,
    explanation: 'f_{X|Y}(2|1) = P(X=2, Y=1) / P(Y=1) = f(2,1) / 0.35.',
    explanationVi: 'P(X=2 | Y=1) = f(2,1) / P(Y=1) = f(2,1) / 0.35.',
  },
  {
    id: 'mc-24',
    topic: 'ps-ch1',
    tag: 'Ch. 1 · Pool Testing',
    question: 'Pool 10 blood samples (disease p = 0.05). One pooled test (1 test) clears all 10 if negative; if positive, retest all 10 individually (11 total). E(tests) is:',
    choices: ['1 + 10(1 − 0.95^10) ≈ 5.01', '10 × 0.05 = 0.5', '11 × 0.05 = 0.55', '10'],
    correctIndex: 0,
    explanation: 'PS1 Prob. 11: E(T) = 1·(0.95^10) + 11·(1 − 0.95^10) = 1 + 10(1 − 0.5987) = 5.013 tests.',
    explanationVi: 'PS1 Bài 11: E(Số xét nghiệm) = 1·0.95^10 + 11·(1−0.95^10) = 5.013.',
  },
  {
    id: 'mc-25',
    topic: 'ps-ch2',
    tag: 'Ch. 2 · Median of Symmetric PDF',
    question: 'If Y has symmetric Laplace-like PDF f(y) = 0.5 e^{−|y|} for all real y, what is E(Y)?',
    choices: ['0', '1', '2', '0.5'],
    correctIndex: 0,
    explanation: 'f(−y) = f(y) is symmetric about 0 and integrable, so E(Y) = 0 and median = 0.',
    explanationVi: 'Hàm mật độ chẵn đối xứng quanh 0 nên E(Y) = 0.',
  },
];

// ==================== SEEDED OFFICIAL FINAL EXAM GENERATOR (5 WRITTEN QUESTIONS, NO MCQS) ====================

export interface FinalWrittenQuestion {
  id: string;
  questionNum: number;
  topic: ProbTopicId;
  title: string;
  sbTableHint: string;
  prompt: string;
  numericChecks: NumericSubCheck[];
  modelSolution: string;
  rubric: Array<{ label: string; points: number }>;
}

export function generateProbFinalExam(seed: string): FinalWrittenQuestion[] {
  const rng = createRng(`probstat-final:${seed}`);

  // Q1 (Ch. 1): Binomial + Poisson or Geometric
  const q1N = rng.pick([8, 10, 12]);
  const q1P = rng.pick([0.05, 0.1, 0.15]);
  const q1Ge2 = 1 - binomialCdf(1, q1N, q1P);
  const q1Stats = binomialStats(q1N, q1P);
  const q1Lam = rng.pick([1.5, 2.0, 2.5, 3.0]);
  const q1Pois = 1 - poissonCdf(2, q1Lam);
  const geoStats = geometricStats(q1P);

  const q1: FinalWrittenQuestion = {
    id: 'prob-final-ch1',
    questionNum: 1,
    topic: 'ps-ch1',
    title: 'Q1 (Ch. 1 · Discrete RVs) — Quality Control & Arrival Modeling',
    sbTableHint: 'No SB Table required (compute exact Binomial, Poisson & Geometric expressions).',
    prompt: `Part (a) [10 pts]: An automated assembly line produces items with independent defect probability $p = ${q1P}$. In a random batch of $n = ${q1N}$ items, let $X$ be the number of defectives.\n  (i) Compute $E(X)$, $\\mathrm{Var}(X)$, and $P(X \\ge 2)$ showing full step-by-step formulas.\n  (ii) If items are inspected one-by-one until the first defective is found ($Y$), find $E(Y)$.\nPart (b) [10 pts]: Daily server error alerts follow $W \\sim \\mathrm{Poisson}(\\lambda = ${q1Lam})$. Compute $P(W \\ge 3)$ and state the expected value and standard deviation of $W$.`,
    numericChecks: [
      { id: 'q1_ex', label: 'E(X) = np', expected: Number(q1Stats.mean.toFixed(4)), tolerance: 0.01 },
      { id: 'q1_pge2', label: 'P(X ≥ 2)', expected: Number(q1Ge2.toFixed(4)), tolerance: 0.002 },
      { id: 'q1_ey', label: 'E(Y) = 1/p', expected: Number(geoStats.mean.toFixed(4)), tolerance: 0.05 },
      { id: 'q1_w3', label: 'P(W ≥ 3)', expected: Number(q1Pois.toFixed(4)), tolerance: 0.002 },
    ],
    modelSolution: `Part (a): $X \\sim \\mathrm{Bin}(${q1N}, ${q1P})$.\n• $E(X) = np = ${q1N}(${q1P}) = ${q1Stats.mean.toFixed(3)}$, $\\mathrm{Var}(X) = np(1-p) = ${q1Stats.variance.toFixed(4)}$.\n• $P(X \\ge 2) = 1 - P(X=0) - P(X=1) = 1 - ${(1 - q1P).toFixed(2)}^{${q1N}} - ${q1N}(${q1P})(${(1 - q1P).toFixed(2)})^{${q1N - 1}} = 1 - ${binomialPmf(0, q1N, q1P).toFixed(4)} - ${binomialPmf(1, q1N, q1P).toFixed(4)} = ${q1Ge2.toFixed(4)}$.\n• $Y \\sim \\mathrm{Geo}(${q1P})$ (trials until 1st defective): $E(Y) = 1/${q1P} = ${geoStats.mean.toFixed(2)}$.\n\nPart (b): $W \\sim \\mathrm{Poisson}(${q1Lam})$.\n• $P(W \\ge 3) = 1 - [P(W=0) + P(W=1) + P(W=2)] = 1 - [${poissonPmf(0, q1Lam).toFixed(4)} + ${poissonPmf(1, q1Lam).toFixed(4)} + ${poissonPmf(2, q1Lam).toFixed(4)}] = ${q1Pois.toFixed(4)}$.\n• $E(W) = ${q1Lam}$, $\\mathrm{SD}(W) = \\sqrt{${q1Lam}} = ${Math.sqrt(q1Lam).toFixed(4)}$.`,
    rubric: [
      { label: 'Correctly identifies Bin(n, p) & computes complement 1 − P(0) − P(1)', points: 7 },
      { label: 'Uses Geometric E(Y) = 1/p correctly', points: 4 },
      { label: 'Applies Poisson complement 1 − P(W ≤ 2) with full steps', points: 9 },
    ],
  };

  // Q2 (Ch. 2): Normal + Exponential
  const mu2 = rng.pick([70, 75, 80, 100]);
  const sd2 = rng.pick([8, 10, 12]);
  const xCutoff = mu2 + sd2 * rng.pick([1, 1.5]);
  const zCutoff = (xCutoff - mu2) / sd2;
  const pGtCut = 1 - normalCdf(zCutoff);
  const expMean = rng.pick([5, 8, 10, 12]);
  const expLam = 1 / expMean;
  const tWait = expMean + 2;
  const pExpCond = 1 - exponentialCdf(tWait, expLam);

  const q2: FinalWrittenQuestion = {
    id: 'prob-final-ch2',
    questionNum: 2,
    topic: 'ps-ch2',
    title: 'Q2 (Ch. 2 · Continuous RVs) — Normal Standardization & Exponential Memoryless',
    sbTableHint: 'Use SB Appendix C-1 (p.767) or Appendix C-2 (p.768–769) for Z probabilities!',
    prompt: `Part (a) [10 pts]: Completion times follow $X \\sim N(\\mu = ${mu2}, \\sigma = ${sd2})$ minutes.\n  (i) Standardize and use SB Tables (App. C-1/C-2) to find $P(X > ${xCutoff})$.\n  (ii) Find the 90th percentile $x_{0.90}$ such that $P(X \\le x_{0.90}) = 0.90$.\nPart (b) [10 pts]: Queue inter-arrival time $T \\sim \\mathrm{Exp}(\\lambda)$ has mean $${expMean}$ minutes. Write $\\lambda$, compute $P(T > ${tWait})$, and find $P(T > ${tWait + 20} \\mid T > 20)$ citing the named property.`,
    numericChecks: [
      { id: 'q2_z', label: 'Z-score for x cutoff', expected: Number(zCutoff.toFixed(4)), tolerance: 0.01 },
      { id: 'q2_pgt', label: 'P(X > cutoff)', expected: Number(pGtCut.toFixed(4)), tolerance: 0.002 },
      { id: 'q2_p90', label: '90th percentile', expected: Number((mu2 + 1.2816 * sd2).toFixed(2)), tolerance: 0.1 },
      { id: 'q2_exp', label: 'P(T > wait)', expected: Number(pExpCond.toFixed(4)), tolerance: 0.002 },
    ],
    modelSolution: `Part (a): $z = \\frac{${xCutoff} - ${mu2}}{${sd2}} = ${zCutoff.toFixed(2)}$.\nFrom SB Appendix C-2, $\\Phi(${zCutoff.toFixed(2)}) = ${normalCdf(zCutoff).toFixed(4)}$, so $P(X > ${xCutoff}) = 1 - ${normalCdf(zCutoff).toFixed(4)} = ${pGtCut.toFixed(4)}$.\nFor 90th percentile, SB Appendix C-2 gives $\\Phi(1.2816) \\approx 0.90$, so $x_{0.90} = ${mu2} + 1.2816(${sd2}) = ${(mu2 + 1.2816 * sd2).toFixed(2)}$.\n\nPart (b): $\\lambda = 1/${expMean} = ${expLam.toFixed(4)}$. $P(T > ${tWait}) = e^{-${tWait}/${expMean}} = ${pExpCond.toFixed(4)}$.\nBy the **Memoryless Property** of the Exponential distribution, $P(T > ${tWait + 20} \\mid T > 20) = P(T > ${tWait}) = ${pExpCond.toFixed(4)}$.`,
    rubric: [
      { label: 'Shows z = (X − μ)/σ and correct SB C-1/C-2 table lookup', points: 6 },
      { label: 'Finds inverse 90th percentile with z ≈ 1.28', points: 4 },
      { label: 'Sets λ = 1/mean and invokes Memoryless Property explicitly', points: 10 },
    ],
  };

  // Q3 (Ch. 3): Bivariate discrete joint table
  const kBase = rng.pick([1, 2]);
  // Construct valid normalized 2x2 table
  const p00 = 0.2;
  const p01 = kBase === 1 ? 0.3 : 0.25;
  const p10 = kBase === 1 ? 0.1 : 0.15;
  const p11 = Number((1 - p00 - p01 - p10).toFixed(2));
  const ex3 = 1 * p00 + 2 * p01 + 1 * p10 + 2 * p11;
  const ey3 = 1 * (p00 + p01) + 2 * (p10 + p11);
  const exy3 = 1 * 1 * p00 + 2 * 1 * p01 + 1 * 2 * p10 + 2 * 2 * p11;
  const cov3 = exy3 - ex3 * ey3;

  const q3: FinalWrittenQuestion = {
    id: 'prob-final-ch3',
    questionNum: 3,
    topic: 'ps-ch3',
    title: 'Q3 (Ch. 3 · Bivariate Distributions) — Marginals, Conditionals, Independence & Covariance',
    sbTableHint: 'No SB Table needed; show every sum and cross-product step explicitly.',
    prompt: `Discrete RVs $X \\in \\{1, 2\\}$ and $Y \\in \\{1, 2\\}$ have joint PMF $f(x, y)$:\n  • Row $Y = 1$: $f(1,1) = ${p00},\\; f(2,1) = ${p01}$\n  • Row $Y = 2$: $f(1,2) = ${p10},\\; f(2,2) = ${p11}$\na) Compute marginal PMFs $f_X(x)$ and $f_Y(y)$, and test whether $X$ and $Y$ are independent.\nb) Find conditional expectation $E(X \\mid Y = 2)$.\nc) Compute $E(X)$, $E(Y)$, $E(XY)$, and $\\mathrm{Cov}(X, Y)$.`,
    numericChecks: [
      { id: 'q3_ex', label: 'E(X)', expected: Number(ex3.toFixed(4)), tolerance: 0.005 },
      { id: 'q3_ey', label: 'E(Y)', expected: Number(ey3.toFixed(4)), tolerance: 0.005 },
      { id: 'q3_cov', label: 'Cov(X, Y)', expected: Number(cov3.toFixed(4)), tolerance: 0.005 },
    ],
    modelSolution: `a) Marginals: $P(X=1) = ${(p00 + p10).toFixed(2)}$, $P(X=2) = ${(p01 + p11).toFixed(2)}$; $P(Y=1) = ${(p00 + p01).toFixed(2)}$, $P(Y=2) = ${(p10 + p11).toFixed(2)}$.\nCheck independence: $P(X=1)\\cdot P(Y=1) = ${((p00 + p10) * (p00 + p01)).toFixed(4)} \\ne f(1,1) = ${p00}$, so $X$ and $Y$ are **dependent**.\nb) $P(X=1 \\mid Y=2) = ${p10}/${(p10 + p11).toFixed(2)} = ${(p10 / (p10 + p11)).toFixed(4)}$, $P(X=2 \\mid Y=2) = ${(p11 / (p10 + p11)).toFixed(4)}$, so $E(X \\mid Y=2) = ${(1 * (p10 / (p10 + p11)) + 2 * (p11 / (p10 + p11))).toFixed(4)}$.\nc) $E(X) = ${ex3.toFixed(4)}$, $E(Y) = ${ey3.toFixed(4)}$, $E(XY) = ${exy3.toFixed(4)} \\implies \\mathrm{Cov}(X,Y) = ${exy3.toFixed(4)} - (${ex3.toFixed(4)})(${ey3.toFixed(4)}) = ${cov3.toFixed(4)}$.`,
    rubric: [
      { label: 'Computes marginals and checks f(x,y) = f_X(x)f_Y(y) for independence', points: 7 },
      { label: 'Computes conditional distribution & E(X | Y=2)', points: 6 },
      { label: 'Computes E(X), E(Y), E(XY), Cov(X,Y) accurately', points: 7 },
    ],
  };

  // Q4 (Ch. 4): MLE / MoM + CLT / Chi-sq sampling distribution
  const mu4 = rng.pick([40, 50, 60]);
  const sd4 = rng.pick([10, 12, 15]);
  const n4 = rng.pick([36, 49, 64]);
  const se4 = sd4 / Math.sqrt(n4);
  const delta4 = rng.pick([2, 3, 4]);
  const pClt = normalCdf(delta4 / se4) - normalCdf(-delta4 / se4);
  const chiSampleN = 20;
  const chiCrit95 = chiSqCritUpper(0.05, chiSampleN - 1);

  const q4: FinalWrittenQuestion = {
    id: 'prob-final-ch4',
    questionNum: 4,
    topic: 'ps-ch4',
    title: 'Q4 (Ch. 4 · Estimation & Sampling) — MLE Derivation + CLT & χ² Sampling',
    sbTableHint: 'Use SB Appendix C-2 for CLT and Appendix E (p.771, df = 19) for sample variance quantile.',
    prompt: `Part (a) [10 pts]: Let $X_1,\\dots,X_n \\stackrel{\\text{i.i.d.}}{\\sim} \\mathrm{Geometric}(\\pi)$ with $P(X=x) = \\pi(1-\\pi)^{x-1}$ ($x \\ge 1$). Write the likelihood $L(\\pi)$, log-likelihood $\\ell(\\pi)$, and derive the MLE $\\hat{\\pi}$.\nPart (b) [6 pts]: A skewed population has mean $\\mu = ${mu4}$ and $\\sigma = ${sd4}$. For a random sample of size $n = ${n4}$, invoke the CLT to find $P(|\\bar{X} - ${mu4}| \\le ${delta4})$.\nPart (c) [4 pts]: For $n = 20$ sampled from $N(\\mu, \\sigma^2 = 16)$, find $c$ such that $P(S^2 \\le c) = 0.95$ using SB Appendix E.`,
    numericChecks: [
      { id: 'q4_se', label: 'CLT Standard Error', expected: Number(se4.toFixed(4)), tolerance: 0.01 },
      { id: 'q4_pclt', label: 'P(|X̄ − μ| ≤ δ)', expected: Number(pClt.toFixed(4)), tolerance: 0.002 },
      { id: 'q4_c', label: '95th percentile c of S²', expected: Number(((16 * chiCrit95) / 19).toFixed(2)), tolerance: 0.08 },
    ],
    modelSolution: `Part (a): $L(\\pi) = \\pi^n (1-\\pi)^{\\sum X_i - n}$, so $\\ell(\\pi) = n\\ln\\pi + (\\sum X_i - n)\\ln(1-\\pi)$.\nSetting $\\ell'(\\pi) = \\frac{n}{\\pi} - \\frac{\\sum X_i - n}{1-\\pi} = 0 \\implies \\hat{\\pi}_{\\text{MLE}} = \\frac{n}{\\sum X_i} = \\frac{1}{\\bar{X}}$.\nPart (b): By CLT, $\\bar{X} \\approx N(${mu4}, (${sd4}/\\sqrt{${n4}})^2)$ with $SE = ${se4.toFixed(3)}$.\n$z = ${delta4}/${se4.toFixed(3)} = ${(delta4 / se4).toFixed(2)} \\implies P(|Z| \\le ${(delta4 / se4).toFixed(2)}) = ${pClt.toFixed(4)}$.\nPart (c): $\\frac{19S^2}{16} \\sim \\chi^2_{19}$. From SB Appendix E (upper tail $0.05$, $df=19$), $\\chi^2_{0.05, 19} = ${chiCrit95.toFixed(2)} \\implies c = \\frac{16(${chiCrit95.toFixed(2)})}{19} = ${((16 * chiCrit95) / 19).toFixed(2)}$.`,
    rubric: [
      { label: 'Derives Geometric log-likelihood & solves π̂ = 1/X̄', points: 10 },
      { label: 'Applies CLT with SE = σ/√n & SB C-2 lookup', points: 6 },
      { label: 'Uses (n−1)S²/σ² ~ χ²_{n−1} and SB Appendix E correctly', points: 4 },
    ],
  };

  // Q5 (Ch. 5): Full CI & Hypothesis Test + Sample Size
  const n5 = rng.pick([16, 20, 25]);
  const xBar5 = rng.pick([51.4, 52.2, 53.0]);
  const mu05 = 50;
  const s5 = rng.pick([3.6, 4.2, 4.8]);
  const ci5 = ciMeanT(xBar5, s5, n5, 0.95);
  const tTest5 = testMeanT(xBar5, mu05, s5, n5, 0.05, 'right');
  const reqN5 = sampleSizeMean(s5, 1.0, 0.99);

  // Also check Z-CI helper wasn't unused or combine proportion/variance check cleanly
  void ciMeanZ;
  void testProportionZ;
  void testVarianceChiSq;
  void tCritUpper;

  const q5: FinalWrittenQuestion = {
    id: 'prob-final-ch5',
    questionNum: 5,
    topic: 'ps-ch5',
    title: 'Q5 (Ch. 5 · Statistical Inference) — Student’s t CI, Hypothesis Test & Sample Size',
    sbTableHint: `Use SB Appendix D (p.770, df = ${n5 - 1}) and Appendix C-2 for sample size z_{0.005}.`,
    prompt: `A Normal process has unknown mean $\\mu$ and unknown $\\sigma$. A random sample of $n = ${n5}$ units yields $\\bar{x} = ${xBar5}$ and sample SD $s = ${s5}$.\na) Construct the 95% confidence interval for $\\mu$ using SB Appendix D.\nb) Test at $\\alpha = 5\\%$ whether true mean exceeds $${mu05}$ ($H_0: \\mu = ${mu05}$ vs $H_1: \\mu > ${mu05}$). State $t_{\\text{obs}}$, critical value, decision, and conclusion.\nc) For planning with $\\sigma \\approx ${s5}$, find the minimum $n$ needed for a 99% $Z$-interval margin of error $E \\le 1.0$.`,
    numericChecks: [
      { id: 'q5_ci_lo', label: '95% CI Lower bound', expected: Number(ci5.lower.toFixed(3)), tolerance: 0.03 },
      { id: 'q5_ci_hi', label: '95% CI Upper bound', expected: Number(ci5.upper.toFixed(3)), tolerance: 0.03 },
      { id: 'q5_tobs', label: 't_obs statistic', expected: Number(tTest5.stat.toFixed(3)), tolerance: 0.02 },
      { id: 'q5_n', label: 'Required sample size n', expected: reqN5, tolerance: 2 },
    ],
    modelSolution: `a) Unknown $\\sigma$, Normal population ⇒ use $t$ with $df = ${n5 - 1}$. From SB Appendix D, $t_{0.025, ${n5 - 1}} = ${ci5.tCrit.toFixed(3)}$.\n$SE = ${s5}/\\sqrt{${n5}} = ${ci5.se.toFixed(4)}$, Margin $= ${ci5.margin.toFixed(3)}$.\n95% CI $= [${ci5.lower.toFixed(3)},\\; ${ci5.upper.toFixed(3)}]$.\nb) $H_0: \\mu = ${mu05}$ vs $H_1: \\mu > ${mu05}$ (one-tailed $\\alpha = 0.05$).\n$t_{\\text{obs}} = \\frac{${xBar5} - ${mu05}}{${ci5.se.toFixed(4)}} = ${tTest5.stat.toFixed(3)}$. From Appendix D ($df=${n5 - 1}$, one-tail $0.05$), $t_{\\text{crit}} = ${tTest5.critValue.toFixed(3)}$.\nSince $t_{\\text{obs}} ${tTest5.reject ? '>' : '\\le'} t_{\\text{crit}}$ ($p = ${tTest5.pValue.toFixed(4)}$), **${tTest5.reject ? 'reject H₀' : 'fail to reject H₀'}**.\nc) $n = \\lceil (2.5758 \\times ${s5} / 1.0)^2 \\rceil = ${reqN5}$.`,
    rubric: [
      { label: 'Computes 95% t-CI with exact df = n−1 from SB Appendix D', points: 7 },
      { label: 'Executes full 5-step hypothesis test (H₀/H₁, t_obs, critical value, conclusion)', points: 9 },
      { label: 'Computes n = ceil((2.576·s/1.0)²) correctly', points: 4 },
    ],
  };

  return [q1, q2, q3, q4, q5];
}
