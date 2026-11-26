import { describe, expect, it } from 'vitest';
import { areEquivalent, generateTruthTable } from '../src/math/logic';
import {
  affineDecrypt,
  binaryModExpSteps,
  charToNum,
  crackAffineFromTwoPairs,
  extendedGcdSteps,
  factorSmallSemiprime,
  fermatReduce,
  numToChar,
  rsaDecryptBlock,
  rsaEncryptBlock,
  solveCRT,
  solveIsbn10Missing,
  solveLinearCongruence,
} from '../src/math/numberTheory';
import {
  booleanProduct,
  buildDivisorPoset,
  checkRelationProperties,
  countRelations,
  getSubsetBounds,
  isValidTopologicalSort,
  matrixOr,
  matrixTranspose,
  pairsToMatrix,
  warshallSteps,
} from '../src/math/relations';
import {
  ASSIGNMENT4_EXPR_TREE,
  ASSIGNMENT4_GRAPH,
  dijkstraSteps,
  evaluatePostfix,
  fullMaryTreeCalc,
  havelHakimiSteps,
  kruskalSteps,
  postorder,
  preorder,
  primSteps,
} from '../src/math/graphsTrees';
import {
  buildSumOfProducts,
  findOptimalSop3,
  validateKmap3Group,
  verifyBooleanSimplification,
} from '../src/math/booleanAlgebra';

describe('Chapter 1 — Propositional Logic', () => {
  it('verifies Assignment 1 Q2(a) distributive law', () => {
    const eq = areEquivalent('p ∧ (q ∨ r)', '(p ∧ q) ∨ (p ∧ r)');
    expect(eq.equivalent).toBe(true);
    expect(eq.rows).toHaveLength(8);
  });

  it('verifies Assignment 1 Q2(b) tautologies', () => {
    expect(generateTruthTable('¬p → (p → q)').classification).toBe('tautology');
    expect(generateTruthTable('(p ∧ q) → (p → q)').classification).toBe('tautology');
    expect(generateTruthTable('¬(p → q) → p').classification).toBe('tautology');
  });

  it('verifies airport Wi-Fi equivalence w → (d ∨ s)', () => {
    expect(areEquivalent('w → (¬s → d)', 'w → (d ∨ s)').equivalent).toBe(true);
  });
});

describe('Chapter 4 — Number Theory & Cryptography (Assignment 2)', () => {
  it('Q2(a): 7^644 mod 645 via binary modular exponentiation', () => {
    const res = binaryModExpSteps(7, 644, 645);
    expect(res.binaryMsb).toBe('1010000100');
    expect(res.result).toBe(436);
  });

  it('Q3(a): gcd(24140, 16762) and Bezout coefficients', () => {
    const res = extendedGcdSteps(24140, 16762);
    expect(res.gcd).toBe(34);
    expect(res.s).toBe(-234);
    expect(res.t).toBe(337);
    expect(res.s * 24140 + res.t * 16762).toBe(34);
    expect(res.lcm).toBe(11901020);
  });

  it('Q4(a): 144x ≡ 4 (mod 233)', () => {
    const res = solveLinearCongruence(144, 4, 233);
    expect(res.solvable).toBe(true);
    expect(res.inverseModReduced).toBe(89);
    expect(res.solutions).toEqual([123]);
  });

  it('Q4(b): CRT x ≡ 2 (mod 3), 1 (mod 4), 3 (mod 5)', () => {
    const res = solveCRT([
      { a: 2, m: 3 },
      { a: 1, m: 4 },
      { a: 3, m: 5 },
    ]);
    expect(res.M).toBe(60);
    expect(res.x).toBe(53);
  });

  it('Q4(c): 3^302 mod 5, 7, 11 and mod 385', () => {
    const r5 = fermatReduce(3, 302, 5).result;
    const r7 = fermatReduce(3, 302, 7).result;
    const r11 = fermatReduce(3, 302, 11).result;
    expect([r5, r7, r11]).toEqual([4, 2, 9]);
    const crt = solveCRT([
      { a: r5, m: 5 },
      { a: r7, m: 7 },
      { a: r11, m: 11 },
    ]);
    expect(crt.M).toBe(385);
    expect(crt.x).toBe(9);
  });

  it('Q4(d): 2^340 ≡ 1 (mod 341)', () => {
    expect(binaryModExpSteps(2, 340, 341).result).toBe(1);
  });

  it('Q5(a): ISBN-10 0-07-8Q0008-0', () => {
    const res = solveIsbn10Missing('0-07-8?0008-0');
    expect(res.missingIndex1Based).toBe(5);
    expect(res.missingValue).toBe('8');
  });

  it('Q5(b): Affine cipher JFFG JF DG GAF KSHYTF', () => {
    const cracked = crackAffineFromTwoPairs('E', 'F', 'T', 'G');
    expect(cracked.a).toBe(7);
    expect(cracked.b).toBe(3);
    expect(cracked.aInv).toBe(15);
    const dec = affineDecrypt('JFFG JF DG GAF KSHYTF', cracked.a, cracked.b);
    expect(dec.plaintext).toBe('MEET ME AT THE BRIDGE');
  });

  it('Q5(c): RSA (n=119, e=5)', () => {
    const encG = rsaEncryptBlock(charToNum('G'), 5, 119).result;
    const encO = rsaEncryptBlock(charToNum('O'), 5, 119).result;
    expect([encG, encO]).toEqual([41, 63]);
    const fac = factorSmallSemiprime(119);
    expect(fac).toEqual({ p: 7, q: 17, phi: 96 });
    const d = solveLinearCongruence(5, 1, 96).solutions[0];
    expect(d).toBe(77);
    const word = [96, 72, 86]
      .map((c) => numToChar(rsaDecryptBlock(c, d, 119).result))
      .join('');
    expect(word).toBe('YES');
  });
});

describe('Chapter 9 — Relations & Posets (Assignment 3)', () => {
  it('Q1(a): counts of relations for n=3', () => {
    const c = countRelations(3);
    expect(c.reflexive).toBe(64);
    expect(c.symmetric).toBe(64);
    expect(c.antisymmetric).toBe(216);
    expect(c.reflexiveAndSymmetric).toBe(8);
    expect(c.equivalence).toBe(5);
    expect(countRelations(4).equivalence).toBe(15);
  });

  it('Q2: M_R^2, M_R^3, transitivity, M_R^-1 and symmetric closure', () => {
    const mr = [
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
    ];
    const mr2 = booleanProduct(mr, mr);
    const mr3 = booleanProduct(mr2, mr);
    expect(mr2).toEqual([
      [0, 0, 1, 1],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
      [0, 1, 1, 0],
    ]);
    expect(mr3).toEqual([
      [1, 0, 0, 1],
      [1, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 1],
    ]);
    expect(checkRelationProperties(mr).transitive.holds).toBe(false);
    const symClosure = matrixOr(mr, matrixTranspose(mr));
    expect(checkRelationProperties(symClosure).symmetric.holds).toBe(true);
  });

  it('Q3(a): Warshall algorithm W_0..W_5', () => {
    const r = pairsToMatrix(5, [
      [1, 2],
      [2, 3],
      [3, 1],
      [3, 4],
      [4, 5],
      [5, 4],
    ]);
    const steps = warshallSteps(r);
    expect(steps).toHaveLength(6);
    expect(steps[5]).toEqual([
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1],
      [0, 0, 0, 1, 1],
    ]);
  });

  it('Q5(b) & Q6(b): Poset {3,5,9,15,24,45} and lattice {1..6}', () => {
    const poset = buildDivisorPoset([3, 5, 9, 15, 24, 45]);
    expect(poset.minimal).toEqual([3, 5]);
    expect(poset.maximal).toEqual([24, 45]);
    expect(poset.least).toBeNull();
    expect(poset.greatest).toBeNull();
    const b35 = getSubsetBounds(poset.elements, [3, 5]);
    expect(b35.upperBounds).toEqual([15, 45]);
    expect(b35.lub).toBe(15);
    const b1545 = getSubsetBounds(poset.elements, [15, 45]);
    expect(b1545.lowerBounds).toEqual([3, 5, 15]);
    expect(b1545.glb).toBe(15);
    expect(isValidTopologicalSort(poset.elements, [3, 5, 9, 15, 24, 45])).toBe(true);
    expect(isValidTopologicalSort(poset.elements, [9, 3, 5, 15, 24, 45])).toBe(false);

    const lat6 = buildDivisorPoset([1, 2, 3, 4, 5, 6]);
    expect(lat6.isLattice).toBe(false);
  });
});

describe('Chapters 10 & 11 — Graphs and Trees (Assignment 4)', () => {
  it('Q1(a): Degree sequences 5,5,4,3,2,1 vs 5,4,3,3,2,1', () => {
    expect(havelHakimiSteps([5, 5, 4, 3, 2, 1]).graphical).toBe(false);
    expect(havelHakimiSteps([5, 4, 3, 3, 2, 1]).graphical).toBe(true);
  });

  it('Q3(a): Dijkstra shortest paths from a', () => {
    const res = dijkstraSteps(ASSIGNMENT4_GRAPH, 'a');
    expect(res.distances).toEqual({ a: 0, b: 3, c: 2, d: 8, e: 10, z: 13 });
    expect(res.reconstructPath('z')).toEqual(['a', 'b', 'd', 'e', 'z']);
  });

  it('Q4(a),(c),(e): Full 5-ary tree, Prim/Kruskal MST, Prefix/Postfix', () => {
    expect(fullMaryTreeCalc(5, 'internal', 100)).toEqual({ n: 501, i: 100, l: 401 });
    expect(primSteps(ASSIGNMENT4_GRAPH, 'a').totalWeight).toBe(14);
    expect(kruskalSteps(ASSIGNMENT4_GRAPH).totalWeight).toBe(14);
    expect(preorder(ASSIGNMENT4_EXPR_TREE).join(' ')).toBe('- * ↑ + x 2 3 - y + 3 x 5');
    expect(postorder(ASSIGNMENT4_EXPR_TREE).join(' ')).toBe('x 2 + 3 ↑ y 3 x + - * 5 -');
    expect(evaluatePostfix('7 2 3 * - 4 ↑ 9 3 / +'.split(' ')).result).toBe(4);
  });
});

describe('Chapter 12 — Boolean Algebra & K-Maps', () => {
  it('builds SOP and finds optimal K-Map cover', () => {
    // F(x,y,z) = (x+y)z' -> 1 when z=0 and (x=1 or y=1) => m6(110), m4(100), m2(010)
    // In THREE_VAR_ROWS order (111, 110, 101, 100, 011, 010, 001, 000):
    const vec: Record<number, 0 | 1> = { 0: 0, 1: 0, 2: 1, 3: 0, 4: 1, 5: 0, 6: 1, 7: 0 };
    const sop = buildSumOfProducts([0, 1, 0, 1, 0, 1, 0, 0]);
    expect(sop).toBe("xyz' + xy'z' + x'yz'");
    expect(validateKmap3Group([6, 4], vec)).toEqual({
      valid: true,
      term: "xz'",
      reason: "Valid group of 2 representing xz'.",
    });
    expect(validateKmap3Group([6, 2], vec)).toEqual({
      valid: true,
      term: "yz'",
      reason: "Valid group of 2 representing yz'.",
    });
    const opt = findOptimalSop3(vec);
    const check = verifyBooleanSimplification(opt, vec);
    expect(check.equivalent).toBe(true);
    expect(check.literalCount).toBe(4);
  });
});
