import { createRng } from './prng';

export type Matrix01 = number[][];

export function cloneMatrix(m: Matrix01): Matrix01 {
  return m.map((row) => [...row]);
}

export function matricesEqual(a: Matrix01, b: Matrix01): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if ((a[i][j] ? 1 : 0) !== (b[i][j] ? 1 : 0)) return false;
    }
  }
  return true;
}

export function booleanProduct(a: Matrix01, b: Matrix01): Matrix01 {
  const n = a.length;
  const p = b[0]?.length ?? 0;
  const kLen = b.length;
  const out: Matrix01 = Array.from({ length: n }, () => Array(p).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      let val = 0;
      for (let k = 0; k < kLen; k++) {
        if (a[i][k] && b[k][j]) {
          val = 1;
          break;
        }
      }
      out[i][j] = val;
    }
  }
  return out;
}

export function matrixTranspose(m: Matrix01): Matrix01 {
  const rows = m.length;
  const cols = m[0]?.length ?? 0;
  const out: Matrix01 = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      out[j][i] = m[i][j] ? 1 : 0;
    }
  }
  return out;
}

export function matrixOr(a: Matrix01, b: Matrix01): Matrix01 {
  return a.map((row, i) => row.map((v, j) => (v || b[i][j] ? 1 : 0)));
}

export function warshallSteps(m: Matrix01): Matrix01[] {
  const n = m.length;
  const steps: Matrix01[] = [cloneMatrix(m)];
  let current = cloneMatrix(m);
  for (let k = 0; k < n; k++) {
    const next = cloneMatrix(current);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        next[i][j] = current[i][j] || (current[i][k] && current[k][j]) ? 1 : 0;
      }
    }
    steps.push(next);
    current = next;
  }
  return steps;
}

export interface PropertyReport {
  reflexive: { holds: boolean; counterexample?: string };
  irreflexive: { holds: boolean; counterexample?: string };
  symmetric: { holds: boolean; counterexample?: string };
  antisymmetric: { holds: boolean; counterexample?: string };
  transitive: { holds: boolean; counterexample?: string };
  isEquivalence: boolean;
  isPartialOrder: boolean;
}

export function checkRelationProperties(
  m: Matrix01,
  labels?: string[],
): PropertyReport {
  const n = m.length;
  const lbl = (idx: number) => (labels && labels[idx] ? labels[idx] : String(idx + 1));

  let refEx: string | undefined;
  let irrefEx: string | undefined;
  let symEx: string | undefined;
  let antiEx: string | undefined;
  let transEx: string | undefined;

  for (let i = 0; i < n; i++) {
    if (!m[i][i] && !refEx) refEx = `(${lbl(i)}, ${lbl(i)}) ∉ R`;
    if (m[i][i] && !irrefEx) irrefEx = `(${lbl(i)}, ${lbl(i)}) ∈ R`;

    for (let j = 0; j < n; j++) {
      if (m[i][j] && !m[j][i] && !symEx) {
        symEx = `(${lbl(i)}, ${lbl(j)}) ∈ R but (${lbl(j)}, ${lbl(i)}) ∉ R`;
      }
      if (i !== j && m[i][j] && m[j][i] && !antiEx) {
        antiEx = `(${lbl(i)}, ${lbl(j)}) ∈ R and (${lbl(j)}, ${lbl(i)}) ∈ R with ${lbl(i)} ≠ ${lbl(j)}`;
      }
      if (m[i][j]) {
        for (let k = 0; k < n; k++) {
          if (m[j][k] && !m[i][k] && !transEx) {
            transEx = `(${lbl(i)}, ${lbl(j)}) ∈ R and (${lbl(j)}, ${lbl(k)}) ∈ R, but (${lbl(i)}, ${lbl(k)}) ∉ R`;
          }
        }
      }
    }
  }

  const reflexive = !refEx;
  const irreflexive = !irrefEx;
  const symmetric = !symEx;
  const antisymmetric = !antiEx;
  const transitive = !transEx;

  return {
    reflexive: { holds: reflexive, counterexample: refEx },
    irreflexive: { holds: irreflexive, counterexample: irrefEx },
    symmetric: { holds: symmetric, counterexample: symEx },
    antisymmetric: { holds: antisymmetric, counterexample: antiEx },
    transitive: { holds: transitive, counterexample: transEx },
    isEquivalence: reflexive && symmetric && transitive,
    isPartialOrder: reflexive && antisymmetric && transitive,
  };
}

export function bellNumber(n: number): number {
  const bell: number[][] = Array.from({ length: n + 1 }, () => []);
  bell[0][0] = 1;
  for (let i = 1; i <= n; i++) {
    bell[i][0] = bell[i - 1][i - 1];
    for (let j = 1; j <= i; j++) {
      bell[i][j] = bell[i - 1][j - 1] + bell[i][j - 1];
    }
  }
  return bell[n][0];
}

export function countRelations(n: number) {
  return {
    total: 2 ** (n * n),
    reflexive: 2 ** (n * n - n),
    symmetric: 2 ** ((n * (n + 1)) / 2),
    antisymmetric: 2 ** n * 3 ** ((n * (n - 1)) / 2),
    reflexiveAndSymmetric: 2 ** ((n * (n - 1)) / 2),
    equivalence: bellNumber(n),
  };
}

export interface PosetAnalysis {
  elements: number[];
  coverEdges: Array<{ from: number; to: number }>; // from divides to directly
  minimal: number[];
  maximal: number[];
  least: number | null;
  greatest: number | null;
  levels: Record<number, number>;
  isLattice: boolean;
  nonLatticePair?: [number, number];
}

export function buildDivisorPoset(rawElements: number[]): PosetAnalysis {
  const elements = Array.from(new Set(rawElements)).sort((a, b) => a - b);
  const divides = (a: number, b: number) => b % a === 0;

  const coverEdges: Array<{ from: number; to: number }> = [];
  for (const a of elements) {
    for (const b of elements) {
      if (a < b && divides(a, b)) {
        const hasMid = elements.some((c) => c !== a && c !== b && divides(a, c) && divides(c, b));
        if (!hasMid) {
          coverEdges.push({ from: a, to: b });
        }
      }
    }
  }

  const minimal = elements.filter(
    (x) => !elements.some((y) => y !== x && divides(y, x)),
  );
  const maximal = elements.filter(
    (x) => !elements.some((y) => y !== x && divides(x, y)),
  );
  const least = minimal.length === 1 ? minimal[0] : null;
  const greatest = maximal.length === 1 ? maximal[0] : null;

  // Compute longest path from minimal elements for Hasse Y-levels
  const levels: Record<number, number> = {};
  for (const el of elements) {
    let lvl = 0;
    for (const prev of elements) {
      if (prev < el && divides(prev, el)) {
        lvl = Math.max(lvl, (levels[prev] ?? 0) + 1);
      }
    }
    levels[el] = lvl;
  }

  // Lattice check: every pair (a, b) has a unique LUB and unique GLB in elements
  let isLattice = true;
  let nonLatticePair: [number, number] | undefined;

  for (let i = 0; i < elements.length && isLattice; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const a = elements[i];
      const b = elements[j];
      const upperBounds = elements.filter((u) => divides(a, u) && divides(b, u));
      const lubs = upperBounds.filter((u) =>
        upperBounds.every((other) => divides(u, other)),
      );
      const lowerBounds = elements.filter((l) => divides(l, a) && divides(l, b));
      const glbs = lowerBounds.filter((l) =>
        lowerBounds.every((other) => divides(other, l)),
      );
      if (lubs.length !== 1 || glbs.length !== 1) {
        isLattice = false;
        nonLatticePair = [a, b];
        break;
      }
    }
  }

  return {
    elements,
    coverEdges,
    minimal,
    maximal,
    least,
    greatest,
    levels,
    isLattice,
    nonLatticePair,
  };
}

export function getSubsetBounds(elements: number[], subset: number[]) {
  const divides = (a: number, b: number) => b % a === 0;
  const upperBounds = elements.filter((u) => subset.every((s) => divides(s, u)));
  const lowerBounds = elements.filter((l) => subset.every((s) => divides(l, s)));
  const lub =
    upperBounds.find((u) => upperBounds.every((other) => divides(u, other))) ?? null;
  const glb =
    lowerBounds.find((l) => lowerBounds.every((other) => divides(other, l))) ?? null;
  return { upperBounds, lowerBounds, lub, glb };
}

export function isValidTopologicalSort(elements: number[], order: number[]): boolean {
  if (order.length !== elements.length) return false;
  const expected = new Set(elements);
  const seen = new Set<number>();
  for (let i = 0; i < order.length; i++) {
    const x = order[i];
    if (!expected.has(x) || seen.has(x)) return false;
    seen.add(x);
    for (let j = i + 1; j < order.length; j++) {
      const y = order[j];
      // y cannot precede x if y | x
      if (x % y === 0) return false;
    }
  }
  return true;
}

export function pairsToMatrix(n: number, pairs: Array<[number, number]>): Matrix01 {
  const m: Matrix01 = Array.from({ length: n }, () => Array(n).fill(0));
  for (const [r, c] of pairs) {
    if (r >= 1 && r <= n && c >= 1 && c <= n) {
      m[r - 1][c - 1] = 1;
    }
  }
  return m;
}

export function matrixToPairs(m: Matrix01): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m[i].length; j++) {
      if (m[i][j]) pairs.push([i + 1, j + 1]);
    }
  }
  return pairs;
}

export function generateRandomRelationMatrix(seed: string | number, size = 4): Matrix01 {
  const rng = createRng(seed);
  const m: Matrix01 = Array.from({ length: size }, () => Array(size).fill(0));
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      m[i][j] = rng.chance(i === j ? 0.35 : 0.38) ? 1 : 0;
    }
  }
  // Ensure at least 3 edges
  if (matrixToPairs(m).length < 3) {
    m[0][1] = 1;
    m[1][2] = 1;
    m[2][0] = 1;
  }
  return m;
}
