import { ECON_MCQS } from '../data/economics';
import { PROB_MIDTERM_MCQS } from '../data/probStat';
import { binaryModExpSteps, gcd, modInverse } from '../math/numberTheory';
import { createRng, randomSeedCode } from '../math/prng';
import {
  ECON_TOPIC_META,
  PROB_TOPIC_META,
  type ProgressState,
  type SubjectId,
} from '../types';
import {
  OPEN_FOCUS_EVENT,
  buildSmartFocusPlan,
  daysUntilExam,
  dispatchOpenFocus,
  type SmartFocusPlan,
  type WeakTopicSummary,
} from './smartFocusPlan';

export {
  OPEN_FOCUS_EVENT,
  buildSmartFocusPlan,
  daysUntilExam,
  dispatchOpenFocus,
  type SmartFocusPlan,
  type WeakTopicSummary,
};

export interface SmartDrillQuestion {
  id: string;
  subject: SubjectId;
  topicId: string;
  topicCode: string;
  source: 'mistake' | 'adaptive';
  mistakeId?: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

function buildMfcAdaptivePool(seed: string): SmartDrillQuestion[] {
  const rng = createRng(`mfc-focus-${seed}`);
  const primes = [7, 11, 13, 17];
  const p = rng.pick(primes);
  const aPow = rng.int(2, 5);
  const exp = rng.int(5, 9);
  const modRes = binaryModExpSteps(aPow, exp, p).result;
  const invA = rng.pick([3, 4, 5, 7]);
  const invM = rng.pick([11, 13, 17]);
  const invVal = modInverse(invA, invM).inverse ?? 1;
  const gA = rng.pick([36, 48, 54, 60]);
  const gB = rng.pick([21, 28, 35]);
  const gVal = gcd(gA, gB);
  const treeN = rng.int(8, 15);
  const mTree = rng.pick([2, 3]);
  const leavesTree = rng.int(4, 9);
  const totalVertices = (mTree * leavesTree - 1) / (mTree - 1);

  return [
    {
      id: 'mfc-ch1-neg',
      subject: 'mfc',
      topicId: 'ch1',
      topicCode: 'Ch. 1',
      source: 'adaptive',
      question: 'Which logical statement is the exact negation $\\neg(\\forall x\\, \\exists y\\, (P(x, y) \\to Q(x, y)))$?',
      choices: [
        '$\\exists x\\, \\forall y\\, (P(x, y) \\land \\neg Q(x, y))$',
        '$\\exists x\\, \\forall y\\, (\\neg P(x, y) \\lor Q(x, y))$',
        '$\\forall x\\, \\exists y\\, (P(x, y) \\land \\neg Q(x, y))$',
        '$\\exists x\\, \\exists y\\, (\\neg P(x, y) \\to \\neg Q(x, y))$',
      ],
      correctIndex: 0,
      explanation: 'Flip each quantifier ($\\forall\\to\\exists$, $\\exists\\to\\forall$) and apply $\\neg(P \\to Q) \\equiv P \\land \\neg Q$.',
    },
    {
      id: 'mfc-ch1-contra',
      subject: 'mfc',
      topicId: 'ch1',
      topicCode: 'Ch. 1',
      source: 'adaptive',
      question: 'Which form is ALWAYS logically equivalent to $p \\to q$?',
      choices: ['Contrapositive ($\\neg q \\to \\neg p$)', 'Converse ($q \\to p$)', 'Inverse ($\\neg p \\to \\neg q$)', '$p \\land q$'],
      correctIndex: 0,
      explanation: 'Only the contrapositive $\\neg q \\to \\neg p$ is logically equivalent to the original conditional $p \\to q$.',
    },
    {
      id: 'mfc-ch4-modexp',
      subject: 'mfc',
      topicId: 'ch4',
      topicCode: 'Ch. 4',
      source: 'adaptive',
      question: `Compute $${aPow}^{${exp}} \\bmod ${p}$ using modular exponentiation.`,
      choices: [
        String(modRes),
        String((modRes + 1) % p),
        String((modRes + 2) % p),
        String((modRes + p - 1) % p),
      ],
      correctIndex: 0,
      explanation: `Squaring and multiplying binary bits modulo ${p} gives ${aPow}^${exp} ≡ ${modRes} (mod ${p}).`,
    },
    {
      id: 'mfc-ch4-inv',
      subject: 'mfc',
      topicId: 'ch4',
      topicCode: 'Ch. 4',
      source: 'adaptive',
      question: `What is the modular inverse of $${invA}$ modulo $${invM}$?`,
      choices: [
        String(invVal),
        String((invVal + 1) % invM),
        String((invVal + 3) % invM),
        String(invM - invVal),
      ],
      correctIndex: 0,
      explanation: `Since $\\gcd(${invA}, ${invM}) = 1$, $${invA} \\cdot ${invVal} \\equiv 1 \\pmod{${invM}}$.`,
    },
    {
      id: 'mfc-ch4-gcd',
      subject: 'mfc',
      topicId: 'ch4',
      topicCode: 'Ch. 4',
      source: 'adaptive',
      question: `Find $\\gcd(${gA}, ${gB})$ via Euclidean division.`,
      choices: [String(gVal), String(gVal + 1), String(gVal * 2), String(gVal + 3)],
      correctIndex: 0,
      explanation: `Running Euclidean algorithm on (${gA}, ${gB}) yields gcd = ${gVal}.`,
    },
    {
      id: 'mfc-ch9-eq',
      subject: 'mfc',
      topicId: 'ch9',
      topicCode: 'Ch. 9',
      source: 'adaptive',
      question: 'Which three relation properties are required for a Partial Ordering (POSET) on a set $A$?',
      choices: [
        'Reflexive, Antisymmetric, Transitive',
        'Reflexive, Symmetric, Transitive',
        'Irreflexive, Symmetric, Transitive',
        'Reflexive, Antisymmetric, Symmetric',
      ],
      correctIndex: 0,
      explanation: 'A POSET requires Reflexive + Antisymmetric + Transitive; an Equivalence Relation requires Symmetric instead of Antisymmetric.',
    },
    {
      id: 'mfc-ch9-warshall',
      subject: 'mfc',
      topicId: 'ch9',
      topicCode: 'Ch. 9',
      source: 'adaptive',
      question: "In Warshall's algorithm, what does matrix entry $W_k[i][j] = 1$ mean?",
      choices: [
        'There is a path from vertex $i$ to $j$ using intermediate vertices only from $\\{1, \\dots, k\\}$',
        'Vertex $i$ has degree $k$',
        'The shortest path from $i$ to $j$ has weight $k$',
        'The relation is symmetric at step $k$',
      ],
      correctIndex: 0,
      explanation: '$W_k[i][j] = W_{k-1}[i][j] \\lor (W_{k-1}[i][k] \\land W_{k-1}[k][j])$ tracks reachability through vertices $1\\dots k$.',
    },
    {
      id: 'mfc-ch10-hand',
      subject: 'mfc',
      topicId: 'ch10',
      topicCode: 'Ch. 10',
      source: 'adaptive',
      question: 'An undirected graph has vertices of degrees 4, 3, 3, 2, 2. How many edges does it have?',
      choices: ['7', '14', '6', '5'],
      correctIndex: 0,
      explanation: 'By the Handshaking Theorem, $\\sum \\deg(v) = 2|E|$. Sum = 14, so $|E| = 14/2 = 7$.',
    },
    {
      id: 'mfc-ch10-euler',
      subject: 'mfc',
      topicId: 'ch10',
      topicCode: 'Ch. 10',
      source: 'adaptive',
      question: 'A connected multigraph has an Euler circuit (visits every EDGE once and returns to start) iff:',
      choices: [
        'Every vertex has even degree',
        'Exactly 2 vertices have odd degree',
        'Every vertex has degree ≥ n/2',
        'The graph contains no triangles',
      ],
      correctIndex: 0,
      explanation: 'Euler circuit ⇔ all vertices have even degree. Euler path (non-closed) ⇔ exactly 2 vertices of odd degree.',
    },
    {
      id: 'mfc-ch11-tree',
      subject: 'mfc',
      topicId: 'ch11',
      topicCode: 'Ch. 11',
      source: 'adaptive',
      question: `A tree (connected acyclic graph) with $${treeN}$ vertices must have exactly how many edges?`,
      choices: [String(treeN - 1), String(treeN), String(treeN + 1), String(2 * treeN)],
      correctIndex: 0,
      explanation: 'Every tree on $n$ vertices has exactly $n - 1$ edges.',
    },
    {
      id: 'mfc-ch11-mary',
      subject: 'mfc',
      topicId: 'ch11',
      topicCode: 'Ch. 11',
      source: 'adaptive',
      question: `A full $${mTree}$-ary tree has $${leavesTree}$ leaves. How many total vertices does it have?`,
      choices: [
        String(totalVertices),
        String(totalVertices + 1),
        String(leavesTree * mTree),
        String(leavesTree - 1),
      ],
      correctIndex: 0,
      explanation: `For a full $m$-ary tree with $l$ leaves, $n = \\frac{ml - 1}{m - 1} = ${totalVertices}$.`,
    },
    {
      id: 'mfc-ch12-kmap',
      subject: 'mfc',
      topicId: 'ch12',
      topicCode: 'Ch. 12',
      source: 'adaptive',
      question: 'Which K-Map grouping size is INVALID (not a valid implicant block)?',
      choices: ['6 cells (3×2)', '4 cells (2×2)', '8 cells (wrap-around 4×2)', '2 cells (row edges)'],
      correctIndex: 0,
      explanation: 'K-Map groups MUST be powers of 2 ($1, 2, 4, 8, 16$) in rectangular/wrap-around shapes — never 3 or 6.',
    },
  ];
}

function buildProbExtraPool(): SmartDrillQuestion[] {
  return [
    {
      id: 'ps-ch4-clt',
      subject: 'probstat',
      topicId: 'ps-ch4',
      topicCode: 'Ch. 4',
      source: 'adaptive',
      question: 'If $X_1, \\dots, X_{36}$ are i.i.d. with mean $\\mu = 50$ and $\\sigma = 12$, what is the standard error $\\sigma_{\\bar{X}}$?',
      choices: ['$2$', '$12$', '$0.33$', '$4$'],
      correctIndex: 0,
      explanation: 'By CLT / sampling distribution, $SE(\\bar{X}) = \\sigma / \\sqrt{n} = 12 / \\sqrt{36} = 12 / 6 = 2$.',
    },
    {
      id: 'ps-ch4-unbiased',
      subject: 'probstat',
      topicId: 'ps-ch4',
      topicCode: 'Ch. 4',
      source: 'adaptive',
      question: 'Why does sample variance $s^2 = \\frac{1}{n-1}\\sum (X_i - \\bar{X})^2$ divide by $n - 1$ instead of $n$?',
      choices: [
        'So that $E(s^2) = \\sigma^2$ (making $s^2$ an unbiased estimator of $\\sigma^2$)',
        'Because MLE variance always uses $n - 1$',
        'To guarantee normal distribution for all $n$',
        'To reduce $s^2$ below $\\sigma^2$',
      ],
      correctIndex: 0,
      explanation: 'Dividing by $df = n - 1$ corrects for estimating $\\mu$ with $\\bar{X}$, making $E(s^2) = \\sigma^2$ unbiased.',
    },
    {
      id: 'ps-ch5-pval',
      subject: 'probstat',
      topicId: 'ps-ch5',
      topicCode: 'Ch. 5',
      source: 'adaptive',
      question: 'At significance level $\\alpha = 0.05$, if a hypothesis test produces $p\\text{-value} = 0.018$, what is the decision?',
      choices: [
        'Reject $H_0$ ($p$-value $\\le \\alpha$)',
        'Fail to reject $H_0$',
        'Accept $H_0$ with 98.2% certainty',
        'Increase sample size immediately',
      ],
      correctIndex: 0,
      explanation: 'Whenever $p\\text{-value} \\le \\alpha$ ($0.018 \\le 0.05$), reject $H_0$ at the $\\alpha$ significance level.',
    },
    {
      id: 'ps-ch5-ciwidth',
      subject: 'probstat',
      topicId: 'ps-ch5',
      topicCode: 'Ch. 5',
      source: 'adaptive',
      question: 'To cut a confidence interval margin of error in HALF (at the same confidence level), how must sample size $n$ change?',
      choices: ['Multiply $n$ by 4', 'Multiply $n$ by 2', 'Multiply $n$ by $\\sqrt{2}$', 'Divide $n$ by 2'],
      correctIndex: 0,
      explanation: '$E = z \\cdot \\sigma / \\sqrt{n} \\implies n \\propto 1/E^2$. Halving $E$ requires $2^2 = 4$ times as many observations.',
    },
  ];
}

export function buildSmartDrillQuestions(
  subject: SubjectId,
  progress: ProgressState,
  count = 8,
  seed = randomSeedCode(),
): SmartDrillQuestion[] {
  const rng = createRng(`smart-${subject}-${seed}`);
  const plan = buildSmartFocusPlan(subject, progress);
  const rankIdx = new Map(plan.weakestTopics.map((t, i) => [t.id, i]));

  const out: SmartDrillQuestion[] = [];
  const usedPromptKeys = new Set<string>();

  // 1. Pull up to 3 eligible Review Bank mistakes first
  const mistakes = progress.mistakes.filter(
    (m) => m.subject === subject && m.choices && m.choices.length >= 2 && m.correctIndex !== undefined,
  );
  for (const m of mistakes.slice(0, 3)) {
    const key = m.question.trim().toLowerCase();
    if (usedPromptKeys.has(key)) continue;
    usedPromptKeys.add(key);
    out.push({
      id: `retry-${m.id}`,
      subject,
      topicId: plan.weakestTopics[0]?.id ?? subject,
      topicCode: m.topicLabel,
      source: 'mistake',
      mistakeId: m.id,
      question: m.question,
      choices: m.choices!,
      correctIndex: m.correctIndex!,
      explanation: m.explanation,
    });
  }

  // 2. Build subject pool ordered by weakest chapter priority
  let pool: SmartDrillQuestion[] = [];
  if (subject === 'mfc') {
    pool = rng.shuffle(buildMfcAdaptivePool(seed));
  } else if (subject === 'econ') {
    pool = rng.shuffle(ECON_MCQS).map((q) => ({
      id: q.id,
      subject: 'econ',
      topicId: q.topic,
      topicCode: `${ECON_TOPIC_META[q.topic].quizTag} (${q.chapter})`,
      source: 'adaptive',
      question: q.question,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));
  } else {
    const combined: SmartDrillQuestion[] = [
      ...buildProbExtraPool(),
      ...PROB_MIDTERM_MCQS.map((q) => ({
        id: q.id,
        subject: 'probstat' as const,
        topicId: q.topic,
        topicCode: PROB_TOPIC_META[q.topic].code,
        source: 'adaptive' as const,
        question: q.question,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    ];
    pool = rng.shuffle(combined);
  }

  // Sort by weakest topic tier while preserving within-tier shuffle
  pool.sort((a, b) => (rankIdx.get(a.topicId) ?? 99) - (rankIdx.get(b.topicId) ?? 99));

  for (const q of pool) {
    if (out.length >= count) break;
    const key = q.question.trim().toLowerCase();
    if (usedPromptKeys.has(key)) continue;
    usedPromptKeys.add(key);
    out.push(q);
  }

  return out;
}
