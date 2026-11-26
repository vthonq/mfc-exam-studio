export interface CopyPromptParams {
  subject: string;
  title: string;
  prompt: string;
  studentAnswer: string;
  modelSolution: string;
  rubric: Array<{ label: string; points: number }>;
  bilingual: boolean;
}

export function buildCopyableGradingPrompt(params: CopyPromptParams): string {
  const maxPts = params.rubric.reduce((s, r) => s + r.points, 0);
  const rubricText = params.rubric
    .map((r, i) => `${i + 1}. [${r.points} pts] ${r.label}`)
    .join('\n');

  return `You are a strict, helpful university exam grader for ${params.subject}.
Grade my written answer below against the problem, rubric (${maxPts} pts total), and reference solution.
Check every step, logical/economic reasoning, required theorem/rule names, and edge cases.
Give:
1) Score out of ${maxPts}
2) What is right (Strengths)
3) Any missing justifications or errors
4) One concrete suggestion to earn full credit${params.bilingual ? '\n5) A short Vietnamese (Tiếng Việt) summary.' : ''}

---
PROBLEM (${params.title}):
${params.prompt}

RUBRIC:
${rubricText}

REFERENCE SOLUTION:
${params.modelSolution}

MY ANSWER:
${params.studentAnswer.trim() || '(No answer typed yet)'}`;
}

export interface OfflineCheckResult {
  estimatedScore: number;
  maxScore: number;
  matched: string[];
  missing: string[];
}

interface Checkpoint {
  label: string;
  points: number;
  patterns: RegExp[];
}

const PROOF_CHECKPOINTS: Record<string, Checkpoint[]> = {
  'proof-randy': [
    { label: 'Lists hypotheses h, h → d, d → ¬j', points: 1, patterns: [/premise|hypothesis|works hard/i] },
    { label: 'Cites Modus Ponens (or Hypothetical Syllogism)', points: 2, patterns: [/modus ponens|hypothetical syllogism/i] },
    { label: 'States conclusion ¬j (will not get the job)', points: 1, patterns: [/¬j|not get the job/i] },
  ],
  'proof-sailing': [
    { label: 'Derives ¬s via Modus Tollens', points: 1, patterns: [/modus tollens/i] },
    { label: 'Uses Addition & De Morgan to get ¬(s ∧ l)', points: 1, patterns: [/addition/i, /de\s*morgan/i] },
    { label: 'Applies Simplification to conclude r (It rained)', points: 2, patterns: [/simplification/i, /\br\b|rained/i] },
  ],
  'proof-sum-odds': [
    { label: 'Uses two distinct integer parameters (e.g. 2k+1 and 2j+1)', points: 2, patterns: [/2[a-z]\s*\+\s*1/i] },
    { label: 'Factors out 2: 2(k + j + 1)', points: 1, patterns: [/2\s*\(/] },
    { label: 'Concludes sum is even (integer closure)', points: 1, patterns: [/even/i, /integer|ℤ/i] },
  ],
  'proof-n3-contraposition': [
    { label: 'States contrapositive ("if n is odd, then n³+5 is even")', points: 1, patterns: [/contraposit|assume\s+n\s+is\s+odd|suppose\s+n\s+is\s+odd/i] },
    { label: 'Substitutes n = 2k + 1 and expands cube', points: 2, patterns: [/2[a-z]\s*\+\s*1/, /8[a-z]\^?3|2\s*\(/i] },
    { label: 'Concludes n³ + 5 is even', points: 1, patterns: [/even/i] },
  ],
  'proof-n3-contradiction': [
    { label: 'Assumes BOTH n³ + 5 is odd AND n is odd', points: 1, patterns: [/contradict|assume.*both|suppose.*odd/i] },
    { label: 'Shows n³ + 5 = 2(...) is even', points: 2, patterns: [/2[a-z]\s*\+\s*1/, /2\s*\(/] },
    { label: 'Identifies contradiction & contrasts with contraposition', points: 1, patterns: [/contradict/i] },
  ],
  'proof-odd-sq-mod8': [
    { label: 'Writes n = 2k + 1 and expands n² − 1 = 4k(k+1)', points: 2, patterns: [/2[a-z]\s*\+\s*1/, /4[a-z]/i] },
    { label: 'Explains k(k+1) is even (consecutive integers)', points: 1, patterns: [/consecutive|even/i] },
    { label: 'Concludes 8 | (n² − 1) or n² ≡ 1 (mod 8)', points: 1, patterns: [/8|mod\s*8/i] },
  ],
  'proof-n3-n-div6': [
    { label: 'Factors n³ − n = (n − 1)n(n + 1)', points: 1, patterns: [/n\s*-\s*1.*n\s*\+\s*1|consecutive/i] },
    { label: 'Shows divisibility by 2 and by 3', points: 2, patterns: [/divisible by 2|2\s*\||even/i, /divisible by 3|3\s*\||mod\s*3/i] },
    { label: 'Notes gcd(2, 3) = 1 ⇒ 6 | (n³ − n)', points: 1, patterns: [/gcd|coprime|relatively prime|6\s*\|/i] },
  ],
  'proof-coprime-ab-div-c': [
    { label: 'Invokes Bézout’s theorem (sa + tb = 1)', points: 1, patterns: [/b[eé]zout|sa\s*\+\s*tb\s*=\s*1/i] },
    { label: 'Writes c = au and c = bv', points: 1, patterns: [/c\s*=/i] },
    { label: 'Multiplies by c and factors ab', points: 2, patterns: [/ab\s*\(|ab\s*\|/i] },
  ],
  'proof-inf-primes-4k3': [
    { label: 'Assumes finite list and defines N = 4p₁···pₘ − 1', points: 1, patterns: [/contradict|finite/i, /4p|4\s*\*/i] },
    { label: 'Shows N ≡ 3 (mod 4) needs prime factor q ≡ 3 (mod 4)', points: 2, patterns: [/mod\s*4|4k\s*\+\s*3/i] },
    { label: 'Derives contradiction q | 1 if q is in list', points: 1, patterns: [/q\s*\|\s*1|divides\s*1|impossible/i] },
  ],
  'proof-rel-intersection-trans': [
    { label: 'Shows (a,b),(b,c) ∈ R∩S ⇒ (a,c) ∈ R and S', points: 2, patterns: [/r\s*∩\s*s|intersection/i, /transitive/i] },
    { label: 'Gives explicit counterexample for R ∪ S', points: 2, patterns: [/counterexample|\{\s*\(/i] },
  ],
  'proof-equiv-fractions': [
    { label: 'Checks reflexive and symmetric', points: 1, patterns: [/reflexive/i, /symmetric/i] },
    { label: 'Proves transitive and explicitly notes d ≠ 0', points: 2, patterns: [/transitive/i, /d\s*(?:!=|≠|not\s*equal)\s*0|nonzero/i] },
    { label: 'Describes [(1, 2)] and ℚ', points: 1, patterns: [/1\/2|rational|ℚ/i] },
  ],
  'proof-finite-poset-minimal': [
    { label: 'Builds descending chain a₀ ≻ a₁ ≻ ...', points: 1, patterns: [/minimal/i] },
    { label: 'Uses transitivity & antisymmetry to show distinctness', points: 2, patterns: [/antisym|transitiv/i] },
    { label: 'Uses finiteness and links to topological sort', points: 1, patterns: [/finite/i, /topological/i] },
  ],
  'proof-same-degree': [
    { label: 'Identifies degrees in {0, ..., n − 1}', points: 1, patterns: [/n\s*-\s*1|degree/i] },
    { label: 'Explains 0 and n − 1 cannot coexist', points: 2, patterns: [/0.*n\s*-\s*1|isolated/i] },
    { label: 'Applies Pigeonhole Principle', points: 1, patterns: [/pigeonhole|dirichlet|contradict/i] },
  ],
  'proof-kmn-hamilton': [
    { label: 'Uses bipartition (V₁, V₂) of sizes m and n', points: 1, patterns: [/bipartite|v1|v_1/i] },
    { label: 'Notes Hamilton circuit alternates parts & returns to start', points: 2, patterns: [/alternate|even length/i] },
    { label: 'Concludes m = n, contradicting m ≠ n', points: 1, patterns: [/m\s*=\s*n/i] },
  ],
  'proof-k33-prism': [
    { label: 'Cites cycle length / bipartiteness invariant', points: 2, patterns: [/triangle|3-cycle|odd cycle|bipartite|invariant/i] },
    { label: 'Contrasts prism (has 3-cycle) vs K_{3,3} (no odd cycles)', points: 2, patterns: [/prism/i, /k_?\{?3,?\s*3\}?/i] },
  ],
  'proof-tree-2leaves': [
    { label: 'Considers longest simple path v₀...vₖ', points: 1, patterns: [/longest|path|handshaking/i] },
    { label: 'Uses maximality + acyclicity (no cycles)', points: 2, patterns: [/cycle|circuit|maxim/i] },
    { label: 'Concludes deg = 1 (at least 2 leaves)', points: 1, patterns: [/leaf|leaves|deg.*=\s*1/i] },
  ],
  'proof-bool-absorption': [
    { label: 'Applies Identity Law (x = x·1)', points: 1, patterns: [/identity/i] },
    { label: 'Factors x(1 + y) via Distributive Law', points: 1, patterns: [/distributive/i] },
    { label: 'Applies Domination Law (1 + y = 1)', points: 2, patterns: [/domination|1\s*\+\s*y\s*=\s*1/i] },
  ],
  'scen-p6-gdp-cpi': [
    { label: 'Notes CPI rises (imports) while GDP Deflator stays unchanged (domestic only)', points: 1.5, patterns: [/cpi/i, /deflator/i, /import|domestic/i] },
    { label: 'Lists CPI biases (substitution, new goods, quality)', points: 1.5, patterns: [/substitution/i, /quality|new good/i] },
    { label: 'Links real interest r = i − π to borrowers gaining & lenders losing', points: 1, patterns: [/borrower|lender/i] },
  ],
  'scen-p6-saving-unemp': [
    { label: 'Shows budget deficit lowers public saving & shifts Loanable Funds Supply left', points: 1.5, patterns: [/public saving|national saving|supply/i, /left/i] },
    { label: 'Identifies r rises & crowds out private investment', points: 1, patterns: [/interest|r\s*rises|crowding/i] },
    { label: 'Explains discouraged workers leave BOTH U and labor force', points: 1.5, patterns: [/discouraged|labor force/i, /fall|drop|decreas/i] },
  ],
  'scen-p7-money-mult': [
    { label: 'Computes multiplier 1/R = 10 and max $10,000', points: 1.5, patterns: [/10|10,?000/] },
    { label: 'Notes households holding cash (currency drain)', points: 1.25, patterns: [/cash|currency/i] },
    { label: 'Notes banks holding excess reserves', points: 1.25, patterns: [/excess reserve/i] },
  ],
  'scen-p7-quantity-inflation': [
    { label: 'Uses MV = PY & Monetary Neutrality', points: 1.5, patterns: [/mv\s*=\s*py|quantity|neutral/i] },
    { label: 'Explains Fisher Effect (i = r + π)', points: 1.25, patterns: [/fisher|i\s*=\s*r/i] },
    { label: 'Mentions inflation tax & social costs (shoeleather/menu/tax)', points: 1.25, patterns: [/shoeleather|menu|inflation tax|redistribution/i] },
  ],
  'scen-p8-budget-deficit': [
    { label: 'Loanable funds supply shifts left ⇒ r rises', points: 1, patterns: [/supply/i, /interest|r\s*rise/i] },
    { label: 'Higher r reduces NCO', points: 1, patterns: [/nco|net capital outflow/i] },
    { label: 'FX supply shifts left ⇒ currency appreciates', points: 1, patterns: [/appreciat/i] },
    { label: 'Net exports NX falls (twin deficits)', points: 1, patterns: [/nx|net export/i] },
  ],
  'scen-p8-quota-vs-flight': [
    { label: 'Tariff/quota shifts FX demand right ⇒ currency appreciates', points: 1.5, patterns: [/appreciat|demand/i] },
    { label: 'Explains NX = NCO = S − I stays unchanged', points: 1.5, patterns: [/unchanged|s\s*-\s*i|s\s*−\s*i/i] },
    { label: 'Contrasts Capital Flight (NCO right, r↑, depreciates, NX↑)', points: 1, patterns: [/capital flight|depreciat/i] },
  ],
  'scen-p9-stagflation': [
    { label: 'SRAS shifts left ⇒ P↑ and Y↓ (stagflation)', points: 1.5, patterns: [/sras|aggregate supply/i, /left|stagflation/i] },
    { label: 'SRPC shifts right (higher π & u)', points: 1, patterns: [/phillips|srpc/i] },
    { label: 'Contrasts accommodating AD vs waiting for wages to fall', points: 1.5, patterns: [/accommodat|ad|wage/i] },
  ],
  'scen-p9-policy-lags': [
    { label: 'Compares spending multiplier (5) vs tax multiplier (−4)', points: 1.5, patterns: [/multiplier|5|4/i] },
    { label: 'Explains crowding out (r↑ reduces I)', points: 1.25, patterns: [/crowding/i] },
    { label: 'Links central bank credibility / rational expectations to lower sacrifice ratio', points: 1.25, patterns: [/credib|rational|sacrifice/i] },
  ],
};

export function analyzeWrittenProofOffline(
  proofId: string,
  studentText: string,
  fallbackRubric?: Array<{ label: string; points: number }>,
): OfflineCheckResult {
  const text = studentText.trim();
  const checkpoints = PROOF_CHECKPOINTS[proofId];

  if (!checkpoints) {
    const rubric = fallbackRubric ?? [];
    const maxScore = rubric.reduce((s, r) => s + r.points, 0);
    if (!text) {
      return {
        estimatedScore: 0,
        maxScore,
        matched: [],
        missing: rubric.map((r) => r.label),
      };
    }
    const matched: string[] = [];
    const missing: string[] = [];
    let score = 0;
    for (const r of rubric) {
      const words = r.label
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 4);
      const hitCount = words.filter((w) => text.toLowerCase().includes(w)).length;
      if (words.length > 0 && hitCount >= Math.min(2, words.length)) {
        matched.push(r.label);
        score += r.points;
      } else {
        missing.push(r.label);
      }
    }
    return { estimatedScore: score, maxScore, matched, missing };
  }

  const maxScore = checkpoints.reduce((s, c) => s + c.points, 0);
  if (!text) {
    return {
      estimatedScore: 0,
      maxScore,
      matched: [],
      missing: checkpoints.map((c) => c.label),
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];
  let estimatedScore = 0;

  for (const cp of checkpoints) {
    const ok = cp.patterns.every((rx) => rx.test(text));
    if (ok) {
      matched.push(cp.label);
      estimatedScore += cp.points;
    } else {
      missing.push(cp.label);
    }
  }

  return { estimatedScore, maxScore, matched, missing };
}
