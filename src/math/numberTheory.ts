import { createRng } from './prng';

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x;
}

export interface ModExpStep {
  j: number;
  bit: 0 | 1;
  powerVal: number;
  xBefore: number;
  xAfter: number;
  nextPower: number;
}

export interface ModExpResult {
  base: number;
  exp: number;
  modulus: number;
  binaryMsb: string;
  bitsLsbFirst: Array<0 | 1>;
  steps: ModExpStep[];
  result: number;
}

export function binaryModExpSteps(base: number, exp: number, modulus: number): ModExpResult {
  if (modulus <= 0) throw new Error('Modulus must be positive');
  if (exp < 0) throw new Error('Exponent must be non-negative');

  const binaryMsb = exp.toString(2);
  const bitsLsbFirst: Array<0 | 1> = [];
  let temp = exp;
  if (temp === 0) {
    bitsLsbFirst.push(0);
  } else {
    while (temp > 0) {
      bitsLsbFirst.push((temp & 1) as 0 | 1);
      temp >>= 1;
    }
  }

  let x = 1 % modulus;
  let power = mod(base, modulus);
  const steps: ModExpStep[] = [];

  for (let j = 0; j < bitsLsbFirst.length; j++) {
    const bit = bitsLsbFirst[j];
    const xBefore = x;
    if (bit === 1) {
      x = mod(x * power, modulus);
    }
    const nextPower = mod(power * power, modulus);
    steps.push({
      j,
      bit,
      powerVal: power,
      xBefore,
      xAfter: x,
      nextPower,
    });
    power = nextPower;
  }

  return {
    base,
    exp,
    modulus,
    binaryMsb,
    bitsLsbFirst,
    steps,
    result: x,
  };
}

export interface DivisionStep {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export interface ExtendedGcdResult {
  a: number;
  b: number;
  gcd: number;
  lcm: number;
  s: number;
  t: number;
  divisions: DivisionStep[];
  backSubstitutions: string[];
}

export function extendedGcdSteps(a: number, b: number): ExtendedGcdResult {
  const divisions: DivisionStep[] = [];
  let r0 = Math.abs(a);
  let r1 = Math.abs(b);

  while (r1 !== 0) {
    const quotient = Math.floor(r0 / r1);
    const remainder = r0 % r1;
    divisions.push({ dividend: r0, divisor: r1, quotient, remainder });
    r0 = r1;
    r1 = remainder;
  }

  const g = r0;
  // Extended Euclidean using standard iterative coefficients
  let oldR = Math.abs(a),
    r = Math.abs(b);
  let oldS = 1,
    s = 0;
  let oldT = 0,
    t = 1;

  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }

  const finalS = a < 0 ? -oldS : oldS;
  const finalT = b < 0 ? -oldT : oldT;

  // Build readable back-substitution lines from non-zero remainders
  const nonZeroDivs = divisions.filter((d) => d.remainder > 0);
  const backSubstitutions: string[] = [];
  if (nonZeroDivs.length > 0) {
    for (let i = nonZeroDivs.length - 1; i >= 0; i--) {
      const d = nonZeroDivs[i];
      backSubstitutions.push(
        `${d.remainder} = ${d.dividend} - ${d.quotient} · ${d.divisor}`,
      );
    }
  } else if (divisions.length > 0) {
    const d = divisions[0];
    backSubstitutions.push(`${g} = 0 · ${d.dividend} + 1 · ${d.divisor}`);
  }
  backSubstitutions.push(`${g} = (${finalS}) · ${a} + (${finalT}) · ${b}`);

  const lcm = g === 0 ? 0 : (Math.abs(a) / g) * Math.abs(b);

  return {
    a,
    b,
    gcd: g,
    lcm,
    s: finalS,
    t: finalT,
    divisions,
    backSubstitutions,
  };
}

export function modInverse(a: number, m: number): {
  exists: boolean;
  gcd: number;
  inverse: number | null;
} {
  const res = extendedGcdSteps(mod(a, m), m);
  if (res.gcd !== 1) {
    return { exists: false, gcd: res.gcd, inverse: null };
  }
  return { exists: true, gcd: 1, inverse: mod(res.s, m) };
}

export interface LinearCongruenceResult {
  a: number;
  b: number;
  m: number;
  gcd: number;
  solvable: boolean;
  inverseModReduced: number | null;
  reducedMod: number;
  baseSolution: number | null;
  solutions: number[];
}

export function solveLinearCongruence(a: number, b: number, m: number): LinearCongruenceResult {
  const g = gcd(a, m);
  if (mod(b, g) !== 0) {
    return {
      a,
      b,
      m,
      gcd: g,
      solvable: false,
      inverseModReduced: null,
      reducedMod: m,
      baseSolution: null,
      solutions: [],
    };
  }
  const a1 = mod(a, m) / g;
  const b1 = mod(b, m) / g;
  const m1 = m / g;
  const inv = modInverse(a1, m1).inverse!;
  const x0 = mod(b1 * inv, m1);
  const solutions: number[] = [];
  for (let k = 0; k < g; k++) {
    solutions.push(x0 + k * m1);
  }
  return {
    a,
    b,
    m,
    gcd: g,
    solvable: true,
    inverseModReduced: inv,
    reducedMod: m1,
    baseSolution: x0,
    solutions,
  };
}

export interface CrtEntry {
  a: number;
  m: number;
  Mk: number;
  yk: number;
  term: number;
}

export interface CrtResult {
  M: number;
  entries: CrtEntry[];
  rawSum: number;
  x: number;
}

export function solveCRT(congruences: Array<{ a: number; m: number }>): CrtResult {
  for (let i = 0; i < congruences.length; i++) {
    for (let j = i + 1; j < congruences.length; j++) {
      if (gcd(congruences[i].m, congruences[j].m) !== 1) {
        throw new Error('Moduli in CRT must be pairwise relatively prime');
      }
    }
  }
  const M = congruences.reduce((acc, c) => acc * c.m, 1);
  const entries: CrtEntry[] = congruences.map((c) => {
    const Mk = M / c.m;
    const inv = modInverse(Mk, c.m);
    if (!inv.exists || inv.inverse === null) {
      throw new Error('Failed to invert M_k modulo m_k');
    }
    const yk = inv.inverse;
    const ak = mod(c.a, c.m);
    return {
      a: ak,
      m: c.m,
      Mk,
      yk,
      term: ak * Mk * yk,
    };
  });
  const rawSum = entries.reduce((acc, e) => acc + e.term, 0);
  const x = mod(rawSum, M);
  return { M, entries, rawSum, x };
}

export function fermatReduce(base: number, exp: number, primeP: number): {
  reducedExp: number;
  quotient: number;
  result: number;
} {
  const bMod = mod(base, primeP);
  if (bMod === 0) {
    return { reducedExp: exp, quotient: 0, result: exp === 0 ? 1 : 0 };
  }
  const phi = primeP - 1;
  const quotient = Math.floor(exp / phi);
  const reducedExp = exp % phi;
  const result = binaryModExpSteps(bMod, reducedExp, primeP).result;
  return { reducedExp, quotient, result };
}

export function solveIsbn10Missing(pattern: string): {
  digits: string;
  missingIndex1Based: number;
  missingValue: string;
  weightedSumKnown: number;
} {
  const cleaned = pattern.replace(/[-\s]/g, '').toUpperCase();
  if (cleaned.length !== 10) {
    throw new Error('ISBN-10 must have exactly 10 characters');
  }
  let missingIdx = -1;
  let knownSum = 0;

  for (let i = 0; i < 10; i++) {
    const ch = cleaned[i];
    if (ch === '?' || ch === 'Q') {
      if (missingIdx !== -1) throw new Error('Only one missing digit supported');
      missingIdx = i;
    } else {
      const val = ch === 'X' && i === 9 ? 10 : Number(ch);
      if (Number.isNaN(val) || val < 0 || val > 10) {
        throw new Error(`Invalid ISBN character "${ch}"`);
      }
      knownSum += (i + 1) * val;
    }
  }
  if (missingIdx === -1) throw new Error('No missing digit marker (?) found');

  const weight = missingIdx + 1;
  const target = mod(-knownSum, 11);
  const sol = solveLinearCongruence(weight, target, 11);
  const digitNum = sol.solutions[0];
  const missingValue = digitNum === 10 ? 'X' : String(digitNum);

  return {
    digits: cleaned,
    missingIndex1Based: weight,
    missingValue,
    weightedSumKnown: knownSum,
  };
}

export function charToNum(ch: string): number {
  return ch.toUpperCase().charCodeAt(0) - 65;
}

export function numToChar(n: number): string {
  return String.fromCharCode(65 + mod(n, 26));
}

export function affineEncrypt(text: string, a: number, b: number): string {
  return text
    .toUpperCase()
    .split('')
    .map((ch) => (/[A-Z]/.test(ch) ? numToChar(a * charToNum(ch) + b) : ch))
    .join('');
}

export function affineDecrypt(text: string, a: number, b: number): {
  aInv: number;
  plaintext: string;
} {
  const inv = modInverse(a, 26);
  if (!inv.exists || inv.inverse === null) {
    throw new Error(`a=${a} is not invertible modulo 26`);
  }
  const aInv = inv.inverse;
  const plaintext = text
    .toUpperCase()
    .split('')
    .map((ch) => (/[A-Z]/.test(ch) ? numToChar(aInv * (charToNum(ch) - b)) : ch))
    .join('');
  return { aInv, plaintext };
}

export function crackAffineFromTwoPairs(
  plain1: string,
  cipher1: string,
  plain2: string,
  cipher2: string,
): { a: number; b: number; aInv: number } {
  const p1 = charToNum(plain1);
  const c1 = charToNum(cipher1);
  const p2 = charToNum(plain2);
  const c2 = charToNum(cipher2);
  const dp = mod(p1 - p2, 26);
  const dc = mod(c1 - c2, 26);
  const sol = solveLinearCongruence(dp, dc, 26);
  if (!sol.solvable || sol.solutions.length !== 1) {
    throw new Error('Could not determine a unique affine key from the given pair');
  }
  const a = sol.solutions[0];
  const b = mod(c1 - a * p1, 26);
  const aInv = modInverse(a, 26).inverse!;
  return { a, b, aInv };
}

export function factorSmallSemiprime(n: number): { p: number; q: number; phi: number } {
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      const q = n / p;
      return { p, q, phi: (p - 1) * (q - 1) };
    }
  }
  throw new Error(`${n} is prime, not a semiprime`);
}

export function rsaEncryptBlock(val: number, e: number, n: number): ModExpResult {
  return binaryModExpSteps(val, e, n);
}

export function rsaDecryptBlock(cipher: number, d: number, n: number): ModExpResult {
  return binaryModExpSteps(cipher, d, n);
}

export function generateNumberTheoryProblem(seed: string | number) {
  const rng = createRng(seed);

  // ModExp
  const modBases = [3, 5, 7, 11, 13];
  const modModuli = [257, 323, 391, 437, 551, 645];
  const modBase = rng.pick(modBases);
  const modExp = rng.int(45, 250);
  const modM = rng.pick(modModuli);

  // ExtGCD
  const gcdA = rng.int(180, 950);
  const gcdB = rng.int(75, gcdA - 15);

  // CRT (coprime moduli)
  const crtModSets = [
    [3, 5, 7],
    [3, 4, 5],
    [4, 5, 7],
    [3, 5, 11],
  ];
  const mods = rng.pick(crtModSets);
  const crtCongs = mods.map((m) => ({ a: rng.int(1, m - 1), m }));

  // Linear Congruence
  const linMod = rng.pick([13, 17, 19, 23, 29, 31, 41]);
  const linA = rng.int(3, linMod - 2);
  const linB = rng.int(1, linMod - 1);

  // RSA small keys
  const smallPrimes = [7, 11, 13, 17, 19];
  const p = rng.pick(smallPrimes);
  let q = rng.pick(smallPrimes);
  while (q === p || p * q < 55) {
    q = rng.pick(smallPrimes);
  }
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const eCandidates = [3, 5, 7, 11, 13, 17].filter((c) => gcd(c, phi) === 1);
  const e = rng.pick(eCandidates);
  const d = modInverse(e, phi).inverse!;
  const msgWord = rng.pick(['HI', 'GO', 'OK', 'CS', 'AT']);

  // ISBN-10
  const baseDigits = Array.from({ length: 9 }, () => rng.int(0, 9));
  const check = mod(
    baseDigits.reduce((acc, dig, idx) => acc + (idx + 1) * dig, 0),
    11,
  );
  const fullIsbn = [...baseDigits.map(String), check === 10 ? 'X' : String(check)];
  const hidePos = rng.int(1, 8);
  const maskedIsbn = fullIsbn.map((ch, idx) => (idx === hidePos ? '?' : ch)).join('');

  return {
    modExp: { base: modBase, exp: modExp, modulus: modM },
    extGcd: { a: gcdA, b: gcdB },
    crt: crtCongs,
    linear: { a: linA, b: linB, m: linMod },
    rsa: { p, q, n, phi, e, d, msgWord },
    isbn: {
      pattern: `${maskedIsbn.slice(0, 1)}-${maskedIsbn.slice(1, 4)}-${maskedIsbn.slice(4, 9)}-${maskedIsbn.slice(9)}`,
      answer: fullIsbn[hidePos],
    },
  };
}
