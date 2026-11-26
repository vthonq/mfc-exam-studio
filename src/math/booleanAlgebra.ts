import { createRng } from './prng';

export interface BoolRow {
  x: 0 | 1;
  y: 0 | 1;
  z: 0 | 1;
  minterm: string;
  index: number;
}

export const THREE_VAR_ROWS: BoolRow[] = [
  { x: 1, y: 1, z: 1, minterm: "xyz", index: 7 },
  { x: 1, y: 1, z: 0, minterm: "xyz'", index: 6 },
  { x: 1, y: 0, z: 1, minterm: "xy'z", index: 5 },
  { x: 1, y: 0, z: 0, minterm: "xy'z'", index: 4 },
  { x: 0, y: 1, z: 1, minterm: "x'yz", index: 3 },
  { x: 0, y: 1, z: 0, minterm: "x'yz'", index: 2 },
  { x: 0, y: 0, z: 1, minterm: "x'y'z", index: 1 },
  { x: 0, y: 0, z: 0, minterm: "x'y'z'", index: 0 },
];

export function buildSumOfProducts(outputs: Array<0 | 1>): string {
  const terms: string[] = [];
  for (let i = 0; i < THREE_VAR_ROWS.length; i++) {
    if (outputs[i] === 1) terms.push(THREE_VAR_ROWS[i].minterm);
  }
  return terms.length > 0 ? terms.join(' + ') : '0';
}

export function evalBooleanExpr(
  expr: string,
  env: Record<string, 0 | 1>,
): 0 | 1 {
  // Supports variables w, x, y, z; complement via ' or ! or ~; product via juxtaposition or *; sum via +; parens ()
  const raw = expr.replace(/\s+/g, '');
  if (!raw) throw new Error('Empty Boolean expression');
  if (raw === '0') return 0;
  if (raw === '1') return 1;

  // Insert explicit '*' for implicit multiplication: xy, x'y, )x, x(, )(, )'
  let normalized = '';
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    const next = raw[i + 1];
    normalized += c;
    if (!next) continue;
    const isLeftAtom = /[wxyz01)']/.test(c);
    const isRightAtom = /[wxyz01(!~]/.test(next);
    if (isLeftAtom && isRightAtom) {
      normalized += '*';
    }
  }

  let pos = 0;
  const parseSum = (): number => {
    let val = parseProd();
    while (normalized[pos] === '+') {
      pos++;
      val = val | parseProd();
    }
    return val;
  };

  const parseProd = (): number => {
    let val = parseUnary();
    while (normalized[pos] === '*') {
      pos++;
      val = val & parseUnary();
    }
    return val;
  };

  const parseUnary = (): number => {
    if (normalized[pos] === '!' || normalized[pos] === '~') {
      pos++;
      return parseUnary() ? 0 : 1;
    }
    let val = parsePrimary();
    while (normalized[pos] === "'") {
      pos++;
      val = val ? 0 : 1;
    }
    return val;
  };

  const parsePrimary = (): number => {
    const ch = normalized[pos];
    if (ch === '(') {
      pos++;
      const val = parseSum();
      if (normalized[pos] !== ')') throw new Error('Unclosed parenthesis');
      pos++;
      return val;
    }
    if (ch === '0' || ch === '1') {
      pos++;
      return Number(ch);
    }
    if (/[wxyz]/.test(ch)) {
      pos++;
      return env[ch] ?? 0;
    }
    throw new Error(`Unexpected symbol "${ch ?? 'EOF'}" in Boolean expression`);
  };

  const result = parseSum();
  if (pos < normalized.length) {
    throw new Error(`Unexpected trailing character "${normalized[pos]}"`);
  }
  return result ? 1 : 0;
}

// 3-variable Gray-code K-Map:
// Rows: x in [1, 0]
// Cols (yz): [11, 10, 00, 01] -> minterm indices [7, 6, 4, 5] and [3, 2, 0, 1]
export const KMAP3_GRID: Array<Array<{ x: 0 | 1; y: 0 | 1; z: 0 | 1; idx: number; label: string }>> = [
  [
    { x: 1, y: 1, z: 1, idx: 7, label: '111' },
    { x: 1, y: 1, z: 0, idx: 6, label: '110' },
    { x: 1, y: 0, z: 0, idx: 4, label: '100' },
    { x: 1, y: 0, z: 1, idx: 5, label: '101' },
  ],
  [
    { x: 0, y: 1, z: 1, idx: 3, label: '011' },
    { x: 0, y: 1, z: 0, idx: 2, label: '010' },
    { x: 0, y: 0, z: 0, idx: 0, label: '000' },
    { x: 0, y: 0, z: 1, idx: 1, label: '001' },
  ],
];

// Check whether a selected set of minterm indices forms a valid K-Map implicant (power-of-2 hypercube)
export function validateKmap3Group(
  selectedIndices: number[],
  truthVector: Record<number, 0 | 1>,
): { valid: boolean; term: string; reason: string } {
  const uniq = Array.from(new Set(selectedIndices));
  const len = uniq.length;
  if (![1, 2, 4, 8].includes(len)) {
    return {
      valid: false,
      term: '',
      reason: `Group size must be a power of 2 (1, 2, 4, or 8); you selected ${len}.`,
    };
  }
  for (const idx of uniq) {
    if (truthVector[idx] !== 1) {
      return {
        valid: false,
        term: '',
        reason: `Cell m${idx} has value 0; K-map groups can only cover 1-cells.`,
      };
    }
  }

  // In a 3-var hypercube, a valid group of size 2^k has exactly 3-k fixed bits across all members
  const bits = uniq.map((idx) => [(idx >> 2) & 1, (idx >> 1) & 1, idx & 1]);
  const varNames = ['x', 'y', 'z'];
  const fixedLiterals: string[] = [];
  let varyingCount = 0;

  for (let b = 0; b < 3; b++) {
    const allOne = bits.every((row) => row[b] === 1);
    const allZero = bits.every((row) => row[b] === 0);
    if (allOne) fixedLiterals.push(varNames[b]);
    else if (allZero) fixedLiterals.push(`${varNames[b]}'`);
    else varyingCount++;
  }

  const expectedVarying = Math.log2(len);
  if (varyingCount !== expectedVarying) {
    return {
      valid: false,
      term: '',
      reason: 'Selected cells are not adjacent on the Karnaugh map (must form a rectangle including wrap-around).',
    };
  }

  return {
    valid: true,
    term: fixedLiterals.length > 0 ? fixedLiterals.join('') : '1',
    reason: `Valid group of ${len} representing ${fixedLiterals.length > 0 ? fixedLiterals.join('') : '1'}.`,
  };
}

export function verifyBooleanSimplification(
  userExpr: string,
  truthVector: Record<number, 0 | 1>,
): { equivalent: boolean; literalCount: number; optimalLiteralCount: number; error?: string } {
  try {
    for (let idx = 0; idx < 8; idx++) {
      const env = {
        x: ((idx >> 2) & 1) as 0 | 1,
        y: ((idx >> 1) & 1) as 0 | 1,
        z: (idx & 1) as 0 | 1,
      };
      if (evalBooleanExpr(userExpr, env) !== truthVector[idx]) {
        return {
          equivalent: false,
          literalCount: 0,
          optimalLiteralCount: 0,
          error: `Mismatch at (x=${env.x}, y=${env.y}, z=${env.z}): expected ${truthVector[idx]}`,
        };
      }
    }
  } catch (err) {
    return {
      equivalent: false,
      literalCount: 0,
      optimalLiteralCount: 0,
      error: err instanceof Error ? err.message : 'Invalid Boolean expression',
    };
  }

  const literalCount = (userExpr.match(/[xyz]/g) ?? []).length;
  const optimal = findOptimalSop3(truthVector);
  const optimalLiteralCount = (optimal.match(/[xyz]/g) ?? []).length;

  return { equivalent: true, literalCount, optimalLiteralCount };
}

export function findOptimalSop3(truthVector: Record<number, 0 | 1>): string {
  const ones = [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => truthVector[i] === 1);
  if (ones.length === 0) return '0';
  if (ones.length === 8) return '1';

  // Generate all valid prime-implicant candidates on {x,y,z}
  const candidates: Array<{ mask: number; term: string; literals: number }> = [];
  const opts = ['0', '1', '*'] as const;
  const names = ['x', 'y', 'z'];

  for (const a of opts) {
    for (const b of opts) {
      for (const c of opts) {
        const pat = [a, b, c];
        let mask = 0;
        let coversZero = false;
        for (let idx = 0; idx < 8; idx++) {
          const bits = [(idx >> 2) & 1, (idx >> 1) & 1, idx & 1];
          const match = pat.every((p, k) => p === '*' || Number(p) === bits[k]);
          if (match) {
            if (truthVector[idx] === 0) {
              coversZero = true;
              break;
            }
            mask |= 1 << idx;
          }
        }
        if (!coversZero && mask !== 0) {
          const termParts: string[] = [];
          pat.forEach((p, k) => {
            if (p === '1') termParts.push(names[k]);
            else if (p === '0') termParts.push(`${names[k]}'`);
          });
          candidates.push({
            mask,
            term: termParts.join('') || '1',
            literals: termParts.length,
          });
        }
      }
    }
  }

  // Keep only prime implicants (not strictly contained in another valid implicant)
  const primeCandidates = candidates
    .filter(
      (c, i) =>
        !candidates.some(
          (other, j) => i !== j && (c.mask & other.mask) === c.mask && other.mask !== c.mask,
        ),
    )
    .sort((a, b) => a.literals - b.literals);

  const targetMask = ones.reduce((acc, idx) => acc | (1 << idx), 0);
  let bestTerms: string[] | null = null;
  let bestScore = Infinity;

  const search = (covered: number, chosen: Array<{ term: string; literals: number }>) => {
    const score = chosen.length * 10 + chosen.reduce((s, t) => s + t.literals, 0);
    if (score >= bestScore) return;
    if (covered === targetMask) {
      bestScore = score;
      bestTerms = chosen.map((c) => c.term);
      return;
    }

    // Pick the first uncovered 1-bit; since it is uncovered, we never repeat a candidate
    let firstMissing = 0;
    while (((targetMask & ~covered) & (1 << firstMissing)) === 0) firstMissing++;

    for (let j = 0; j < primeCandidates.length; j++) {
      if ((primeCandidates[j].mask & (1 << firstMissing)) !== 0) {
        search(covered | primeCandidates[j].mask, [...chosen, primeCandidates[j]]);
      }
    }
  };

  search(0, []);
  return bestTerms ? (bestTerms as string[]).join(' + ') : '0';
}

export function dualBooleanExpr(expr: string): string {
  // Swaps + and · (explicit or implicit), and 0 <-> 1
  return expr
    .replace(/0/g, '__ONE__')
    .replace(/1/g, '0')
    .replace(/__ONE__/g, '1')
    .replace(/\+/g, '__DOT__')
    .replace(/·|\*/g, '+')
    .replace(/__DOT__/g, '·');
}

export function generateKmapProblem(seed: string | number): {
  truthVector: Record<number, 0 | 1>;
  optimalSop: string;
} {
  const rng = createRng(seed);
  const truthVector: Record<number, 0 | 1> = {};
  for (let i = 0; i < 8; i++) {
    truthVector[i] = rng.chance(0.5) ? 1 : 0;
  }
  const sum = Object.values(truthVector).reduce<number>((a, b) => a + b, 0);
  if (sum < 2) {
    truthVector[7] = 1;
    truthVector[6] = 1;
    truthVector[3] = 1;
  } else if (sum === 8) {
    truthVector[0] = 0;
  }
  return {
    truthVector,
    optimalSop: findOptimalSop3(truthVector),
  };
}
