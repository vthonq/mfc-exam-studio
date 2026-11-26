import { ECON_GLOSSARY, ECON_KNOWLEDGE } from '../data/economics';
import { GLOSSARY_TERMS, KNOWLEDGE_ITEMS } from '../data/knowledge';
import { PROB_CHAPTER_NOTES, PROB_GLOSSARY } from '../data/probStat';
import { PROOF_EXERCISES } from '../data/proofs';
import type { EconPageRoute, PageRoute, ProbPageRoute, SubjectId } from '../types';

export interface GlobalSearchItem {
  id: string;
  subject: SubjectId | 'guide';
  category: string;
  title: string;
  subtitle: string;
  keywords: string;
  route: PageRoute | EconPageRoute | ProbPageRoute | 'guide';
  query?: string;
}

const LAB_ENTRIES: GlobalSearchItem[] = [
  // MFC 5 labs
  {
    id: 'lab-mfc-logic',
    subject: 'mfc',
    category: 'Practice Lab · Ch. 1',
    title: 'Logic & Truth Tables Lab',
    subtitle: 'Propositional evaluator, tautology/contradiction/contingency classifier & gates',
    keywords: 'truth table logic tautology implication contrapositive biconditional ch1',
    route: 'labs',
    query: 'tab=logic',
  },
  {
    id: 'lab-mfc-nt',
    subject: 'mfc',
    category: 'Practice Lab · Ch. 4',
    title: 'Number Theory & Cryptography Lab',
    subtitle: 'Binary modular exponentiation, Extended GCD, Bézout, CRT & RSA',
    keywords: 'modexp euclidean gcd bezout crt inverse rsa isbn modular ch4',
    route: 'labs',
    query: 'tab=number-theory',
  },
  {
    id: 'lab-mfc-rel',
    subject: 'mfc',
    category: 'Practice Lab · Ch. 9',
    title: 'Relations, Warshall & Posets Lab',
    subtitle: 'Boolean matrix product, reflexive/symmetric/transitive closures, Warshall & Hasse diagrams',
    keywords: 'relations warshall transitive closure matrix poset hasse equivalence ch9',
    route: 'labs',
    query: 'tab=relations',
  },
  {
    id: 'lab-mfc-graph',
    subject: 'mfc',
    category: 'Practice Lab · Ch. 10–11',
    title: 'Graphs, Dijkstra & Kruskal MST Lab',
    subtitle: 'Havel-Hakimi degree test, Dijkstra shortest path, Kruskal MST & expression trees',
    keywords: 'graph dijkstra kruskal mst tree havel hakimi euler hamilton postfix prefix ch10 ch11',
    route: 'labs',
    query: 'tab=graphs-trees',
  },
  {
    id: 'lab-mfc-bool',
    subject: 'mfc',
    category: 'Practice Lab · Ch. 12',
    title: 'Boolean Algebra & K-Maps Lab',
    subtitle: '3-variable and 4-variable Karnaugh Map simplifier, minterms & SOP',
    keywords: 'boolean algebra k-map karnaugh sop minterm prime implicant ch12',
    route: 'labs',
    query: 'tab=boolean',
  },
  {
    id: 'lab-mfc-trainers',
    subject: 'mfc',
    category: 'Exam Drills · Ch. 1, 4, 9, 11–12',
    title: 'MFC Step-by-Step Blank-Table & Quantifier Trainers',
    subtitle: 'Quantifier & negation traps, blank ExtGCD/ModExp tables, Warshall clickable grid, tree traversal & K-map validator',
    keywords: 'quantifier negation blank table extgcd modexp warshall traversal k-map trainer drill ch1 ch4 ch9 ch11 ch12',
    route: 'labs',
    query: 'tab=trainers',
  },

  // Econ 4 labs
  {
    id: 'lab-econ-part6',
    subject: 'econ',
    category: 'Econ Simulator · Part 6',
    title: 'Real Economy (GDP, CPI, Saving, Unemployment)',
    subtitle: 'Nominal/Real GDP, Deflator, CPI Basket, Dollar Indexing, Real Interest & Unemployment Rate',
    keywords: 'gdp deflator cpi inflation indexing fisher saving unemployment labor force ch23 ch24 ch25 ch26 ch28',
    route: 'labs',
    query: 'tab=part6',
  },
  {
    id: 'lab-econ-part7',
    subject: 'econ',
    category: 'Econ Simulator · Part 7',
    title: 'Money, Multiplier & MV = PY Simulator',
    subtitle: 'Reserve ratio, money multiplier, bank leverage ratio & quantity equation MV = PY',
    keywords: 'money multiplier reserve ratio bank leverage capital mv=py velocity quantity theory ch29 ch30',
    route: 'labs',
    query: 'tab=part7',
  },
  {
    id: 'lab-econ-part8',
    subject: 'econ',
    category: 'Econ Simulator · Part 8',
    title: 'Open Economy & Twin Markets Simulator',
    subtitle: 'Real exchange rate, S = I + NCO, loanable funds & foreign-currency exchange shocks',
    keywords: 'open economy exchange rate nco net capital outflow twin markets loanable funds tariff budget deficit ch31 ch32',
    route: 'labs',
    query: 'tab=part8',
  },
  {
    id: 'lab-econ-part9',
    subject: 'econ',
    category: 'Econ Simulator · Part 9',
    title: 'AD–AS, Multipliers & Phillips Curve Simulator',
    subtitle: 'Interactive AD/SRAS/LRAS shifts, Money Market (Liquidity Preference), MPC multipliers & sacrifice ratio',
    keywords: 'ad-as aggregate demand supply lras sras money market liquidity preference multiplier mpc crowding out phillips curve sacrifice ratio ch33 ch34 ch35',
    route: 'labs',
    query: 'tab=part9',
  },
  {
    id: 'lab-econ-loanable',
    subject: 'econ',
    category: 'Econ Diagram · Ch. 26',
    title: 'Closed-Economy Loanable Funds Diagram (Crowding Out)',
    subtitle: 'Saving incentive, investment tax credit & budget deficit crowding out interactive SVG',
    keywords: 'loanable funds crowding out saving investment tax credit budget deficit diagram ch26',
    route: 'labs',
    query: 'tab=part6',
  },
  {
    id: 'lab-econ-trainer',
    subject: 'econ',
    category: 'Exam Drills · ECO101 Final',
    title: 'Macro Shock Predictor & Blank T-Account / GDP Drills',
    subtitle: 'Predict curve shifts and variable directions (r, Y, P, u, NCO, ε, NX) + fill-in Bank Balance Sheet & GDP tables',
    keywords: 'shock predictor quiz blank table t-account bank balance sheet gdp deflator fisher trainer drill',
    route: 'labs',
    query: 'tab=trainer',
  },

  // Prob & Stat 4 labs + 5 SB Tables
  {
    id: 'lab-prob-discrete',
    subject: 'probstat',
    category: 'Stat Simulator · Ch. 1',
    title: 'Discrete Distributions Simulator',
    subtitle: 'Binomial, Poisson, Geometric, Negative Binomial & Hypergeometric PMF/CDF plotter',
    keywords: 'binomial poisson geometric negative binomial hypergeometric pmf cdf discrete ch1',
    route: 'labs',
    query: 'tab=discrete',
  },
  {
    id: 'lab-prob-continuous',
    subject: 'probstat',
    category: 'Stat Simulator · Ch. 2',
    title: 'Continuous Distributions Simulator',
    subtitle: 'Normal N(μ, σ²), Exponential, Gamma & Uniform probability calculator & curve',
    keywords: 'normal exponential gamma uniform pdf cdf standardization continuity correction ch2',
    route: 'labs',
    query: 'tab=continuous',
  },
  {
    id: 'lab-prob-bivariate',
    subject: 'probstat',
    category: 'Stat Simulator · Ch. 3',
    title: 'Bivariate Joint Table & Covariance Lab',
    subtitle: 'Marginal distributions, conditional expectation, Cov(X, Y), correlation & independence test',
    keywords: 'bivariate joint distribution marginal covariance correlation independence ch3',
    route: 'labs',
    query: 'tab=bivariate',
  },
  {
    id: 'lab-prob-inference',
    subject: 'probstat',
    category: 'Stat Simulator · Ch. 4–5',
    title: 'CI, Hypothesis Tests, Sample Size & Power Lab',
    subtitle: 'Z/t CI, chi-square variance CI, 1-sample hypothesis test, minimum n & statistical power',
    keywords: 'confidence interval hypothesis test p-value sample size power type ii error mle clt ch4 ch5',
    route: 'labs',
    query: 'tab=inference',
  },
  {
    id: 'sb-c1',
    subject: 'probstat',
    category: 'SB Stat Table · p. 767',
    title: 'SB Appendix C-1: Standard Normal P(0 ≤ Z ≤ z)',
    subtitle: 'Interactive center-to-z table with reverse area lookup and shaded bell curve',
    keywords: 'appendix c-1 c1 standard normal z table p.767 sb statistical tables',
    route: 'tables',
  },
  {
    id: 'sb-c2',
    subject: 'probstat',
    category: 'SB Stat Table · p. 768–769',
    title: 'SB Appendix C-2: Cumulative Normal Φ(z) = P(Z ≤ z)',
    subtitle: 'Left/right/between/raw (X, μ, σ) standardization mode & inverse quantile lookup',
    keywords: 'appendix c-2 c2 cumulative phi z table p.768 p.769 sb statistical tables',
    route: 'tables',
  },
  {
    id: 'sb-d',
    subject: 'probstat',
    category: 'SB Stat Table · p. 770',
    title: 'SB Appendix D: Student’s t Distribution',
    subtitle: 'Critical t values by df (1..29, ∞) for 1-tail, 2-tail & CI + t_obs p-value bracket',
    keywords: 'appendix d student t distribution critical value df p.770 p-value sb statistical tables',
    route: 'tables',
  },
  {
    id: 'sb-e',
    subject: 'probstat',
    category: 'SB Stat Table · p. 771',
    title: 'SB Appendix E: Chi-Square (χ²) Distribution',
    subtitle: 'Single critical tail & 2-sided Variance CI pair highlighter for σ²',
    keywords: 'appendix e chi-square chi2 variance ci critical value p.771 sb statistical tables',
    route: 'tables',
  },
  {
    id: 'sb-f',
    subject: 'probstat',
    category: 'SB Stat Table · p. 772–779',
    title: 'SB Appendix F: F Distribution (α = 0.10, 0.05, 0.025, 0.01)',
    subtitle: 'Interactive F table by numerator df1 and denominator df2 with crosshair highlight',
    keywords: 'appendix f distribution anova df1 df2 critical value p.772 p.779 sb statistical tables',
    route: 'tables',
  },
  {
    id: 'guide-home',
    subject: 'guide',
    category: 'Guide · Hướng dẫn 3 môn',
    title: 'Guide — Hướng dẫn sử dụng Exam Studio Hub',
    subtitle: 'Tóm tắt ngắn gọn các công cụ, Tra bảng SB, Phím tắt Ctrl+K, Review Bank & Mẹo thi',
    keywords: 'guide huong dan su dung vietnamese tieng viet shortcut ctrl+k review bank print a4',
    route: 'guide',
  },
];

let cachedItems: GlobalSearchItem[] | null = null;

export function buildGlobalSearchItems(): GlobalSearchItem[] {
  if (cachedItems) return cachedItems;

  const items: GlobalSearchItem[] = [...LAB_ENTRIES];

  for (const k of KNOWLEDGE_ITEMS) {
    items.push({
      id: `mfc-know-${k.id}`,
      subject: 'mfc',
      category: `Knowledge · ${k.chapter.toUpperCase()} §${k.section}`,
      title: k.title,
      subtitle: `${k.titleVi} — ${k.summary.slice(0, 120)}`,
      keywords: `${k.title} ${k.titleVi} ${k.summary} ${k.summaryVi} ${k.examTrap ?? ''}`,
      route: 'knowledge',
      query: `chapter=${k.chapter}`,
    });
  }

  for (const g of GLOSSARY_TERMS) {
    items.push({
      id: `mfc-gloss-${g.en}`,
      subject: 'mfc',
      category: `MFC Glossary · ${g.chapter.toUpperCase()}`,
      title: `${g.en} (${g.vi})`,
      subtitle: g.note,
      keywords: `${g.en} ${g.vi} ${g.note}`,
      route: 'knowledge',
      query: 'chapter=glossary',
    });
  }

  for (const p of PROOF_EXERCISES) {
    items.push({
      id: `mfc-proof-${p.id}`,
      subject: 'mfc',
      category: `Proof · ${p.method}`,
      title: p.title,
      subtitle: `${p.titleVi} — ${p.prompt.slice(0, 120)}`,
      keywords: `${p.title} ${p.titleVi} ${p.method} ${p.prompt} ${p.promptVi}`,
      route: 'proofs',
      query: `id=${encodeURIComponent(p.id)}`,
    });
  }

  for (const c of ECON_KNOWLEDGE) {
    items.push({
      id: `econ-know-${c.id}`,
      subject: 'econ',
      category: `Cheat Sheet · ${c.chapterLabel}`,
      title: c.title,
      subtitle: `${c.titleVi} — ${c.summary.slice(0, 120)}`,
      keywords: `${c.chapterLabel} ${c.title} ${c.titleVi} ${c.summary} ${c.summaryVi} ${c.examTrap ?? ''}`,
      route: 'knowledge',
      query: `topic=${c.topic}`,
    });
  }

  for (const g of ECON_GLOSSARY) {
    items.push({
      id: `econ-gloss-${g.en}`,
      subject: 'econ',
      category: `Econ Glossary · ${g.topic.toUpperCase()}`,
      title: `${g.en} (${g.vi})`,
      subtitle: g.note,
      keywords: `${g.en} ${g.vi} ${g.note}`,
      route: 'knowledge',
      query: 'topic=glossary',
    });
  }

  for (const c of PROB_CHAPTER_NOTES) {
    items.push({
      id: `prob-know-${c.topic}`,
      subject: 'probstat',
      category: `Formula Sheet · ${c.topic.replace('ps-', '').toUpperCase()}`,
      title: c.title,
      subtitle: `${c.titleVi} — ${c.summary.slice(0, 120)}`,
      keywords: `${c.title} ${c.titleVi} ${c.summary} ${c.sbTableTip} ${c.keyFormulas.map((f) => `${f.name} ${f.note}`).join(' ')}`,
      route: 'knowledge',
      query: `topic=${c.topic}`,
    });
  }

  for (const g of PROB_GLOSSARY) {
    items.push({
      id: `prob-gloss-${g.term}`,
      subject: 'probstat',
      category: `Prob Glossary · ${g.chapter.replace('ps-', '').toUpperCase()}`,
      title: `${g.term} (${g.termVi})`,
      subtitle: g.definition,
      keywords: `${g.term} ${g.termVi} ${g.definition}`,
      route: 'knowledge',
      query: 'topic=glossary',
    });
  }

  cachedItems = items;
  return items;
}

export function searchGlobalItems(
  rawQuery: string,
  subjectFilter: SubjectId | 'all' = 'all',
  limit: number = 18,
): GlobalSearchItem[] {
  const all = buildGlobalSearchItems();
  const filteredBySub =
    subjectFilter === 'all' ? all : all.filter((item) => item.subject === subjectFilter);

  const tokens = rawQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return filteredBySub.slice(0, limit);
  }

  const scored: Array<{ item: GlobalSearchItem; score: number }> = [];
  for (const item of filteredBySub) {
    const titleLow = item.title.toLowerCase();
    const catLow = item.category.toLowerCase();
    const subLow = item.subtitle.toLowerCase();
    const kwLow = item.keywords.toLowerCase();
    const haystack = `${titleLow} ${catLow} ${subLow} ${kwLow}`;

    if (!tokens.every((t) => haystack.includes(t))) continue;

    let score = 0;
    for (const t of tokens) {
      if (titleLow.includes(t)) score += 10;
      if (catLow.includes(t)) score += 5;
      if (subLow.includes(t)) score += 3;
      if (kwLow.includes(t)) score += 1;
    }
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
