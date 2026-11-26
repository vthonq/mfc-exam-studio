import { createRng } from './prng';

export type AstNode =
  | { type: 'var'; name: string }
  | { type: 'const'; value: boolean }
  | { type: 'not'; child: AstNode }
  | { type: 'bin'; op: 'and' | 'or' | 'xor' | 'imp' | 'iff'; left: AstNode; right: AstNode };

type TokenType =
  | 'VAR'
  | 'CONST'
  | 'NOT'
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'IMP'
  | 'IFF'
  | 'LPAREN'
  | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
}

export function tokenizeLogic(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }
    if (s.slice(i, i + 3) === '<->' || s.slice(i, i + 3) === '<=>') {
      tokens.push({ type: 'IFF', value: '↔' });
      i += 3;
      continue;
    }
    if (s.slice(i, i + 2) === '->' || s.slice(i, i + 2) === '=>') {
      tokens.push({ type: 'IMP', value: '→' });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === '&&') {
      tokens.push({ type: 'AND', value: '∧' });
      i += 2;
      continue;
    }
    if (s.slice(i, i + 2) === '||') {
      tokens.push({ type: 'OR', value: '∨' });
      i += 2;
      continue;
    }
    if (ch === '¬' || ch === '!' || ch === '~') {
      tokens.push({ type: 'NOT', value: '¬' });
      i++;
      continue;
    }
    if (ch === '∧' || ch === '&' || ch === '*' || ch === '·') {
      tokens.push({ type: 'AND', value: '∧' });
      i++;
      continue;
    }
    if (ch === '∨' || ch === '|' || ch === '+') {
      tokens.push({ type: 'OR', value: '∨' });
      i++;
      continue;
    }
    if (ch === '⊕' || ch === '^') {
      tokens.push({ type: 'XOR', value: '⊕' });
      i++;
      continue;
    }
    if (ch === '→') {
      tokens.push({ type: 'IMP', value: '→' });
      i++;
      continue;
    }
    if (ch === '↔' || ch === '≡') {
      tokens.push({ type: 'IFF', value: '↔' });
      i++;
      continue;
    }
    if (ch === 'T' || ch === '1') {
      tokens.push({ type: 'CONST', value: 'T' });
      i++;
      continue;
    }
    if (ch === 'F' || ch === '0') {
      tokens.push({ type: 'CONST', value: 'F' });
      i++;
      continue;
    }
    if (/[a-z]/.test(ch)) {
      tokens.push({ type: 'VAR', value: ch });
      i++;
      continue;
    }
    throw new Error(`Unexpected symbol "${ch}" in logical expression`);
  }
  return tokens;
}

export function parseLogic(input: string): AstNode {
  const tokens = tokenizeLogic(input);
  if (tokens.length === 0) {
    throw new Error('Empty logical expression');
  }
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const consume = (): Token => tokens[pos++];

  const parseIff = (): AstNode => {
    let left = parseImp();
    while (peek()?.type === 'IFF') {
      consume();
      const right = parseImp();
      left = { type: 'bin', op: 'iff', left, right };
    }
    return left;
  };

  const parseImp = (): AstNode => {
    const left = parseOr();
    if (peek()?.type === 'IMP') {
      consume();
      const right = parseImp();
      return { type: 'bin', op: 'imp', left, right };
    }
    return left;
  };

  const parseOr = (): AstNode => {
    let left = parseXor();
    while (peek()?.type === 'OR') {
      consume();
      const right = parseXor();
      left = { type: 'bin', op: 'or', left, right };
    }
    return left;
  };

  const parseXor = (): AstNode => {
    let left = parseAnd();
    while (peek()?.type === 'XOR') {
      consume();
      const right = parseAnd();
      left = { type: 'bin', op: 'xor', left, right };
    }
    return left;
  };

  const parseAnd = (): AstNode => {
    let left = parseUnary();
    while (peek()?.type === 'AND') {
      consume();
      const right = parseUnary();
      left = { type: 'bin', op: 'and', left, right };
    }
    return left;
  };

  const parseUnary = (): AstNode => {
    if (peek()?.type === 'NOT') {
      consume();
      return { type: 'not', child: parseUnary() };
    }
    return parsePrimary();
  };

  const parsePrimary = (): AstNode => {
    const tok = peek();
    if (!tok) {
      throw new Error('Unexpected end of expression');
    }
    if (tok.type === 'VAR') {
      consume();
      return { type: 'var', name: tok.value };
    }
    if (tok.type === 'CONST') {
      consume();
      return { type: 'const', value: tok.value === 'T' };
    }
    if (tok.type === 'LPAREN') {
      consume();
      const node = parseIff();
      if (peek()?.type !== 'RPAREN') {
        throw new Error('Missing closing parenthesis ")"');
      }
      consume();
      return node;
    }
    throw new Error(`Unexpected token "${tok.value}"`);
  };

  const root = parseIff();
  if (pos < tokens.length) {
    throw new Error(`Unexpected trailing token "${tokens[pos].value}"`);
  }
  return root;
}

export function evalAst(node: AstNode, env: Record<string, boolean>): boolean {
  switch (node.type) {
    case 'var':
      return Boolean(env[node.name]);
    case 'const':
      return node.value;
    case 'not':
      return !evalAst(node.child, env);
    case 'bin': {
      const l = evalAst(node.left, env);
      const r = evalAst(node.right, env);
      switch (node.op) {
        case 'and':
          return l && r;
        case 'or':
          return l || r;
        case 'xor':
          return l !== r;
        case 'imp':
          return !l || r;
        case 'iff':
          return l === r;
      }
    }
  }
}

export function extractVars(node: AstNode, out = new Set<string>()): string[] {
  if (node.type === 'var') {
    out.add(node.name);
  } else if (node.type === 'not') {
    extractVars(node.child, out);
  } else if (node.type === 'bin') {
    extractVars(node.left, out);
    extractVars(node.right, out);
  }
  return Array.from(out).sort();
}

export interface TruthTableRow {
  env: Record<string, boolean>;
  value: boolean;
}

export interface TruthTableResult {
  vars: string[];
  rows: TruthTableRow[];
  classification: 'tautology' | 'contradiction' | 'contingency';
}

export function generateTruthTable(
  expr: string,
  varsOverride?: string[],
): TruthTableResult {
  const ast = parseLogic(expr);
  const vars = varsOverride && varsOverride.length > 0 ? varsOverride : extractVars(ast);
  const total = 1 << vars.length;
  const rows: TruthTableRow[] = [];

  for (let mask = total - 1; mask >= 0; mask--) {
    const env: Record<string, boolean> = {};
    for (let i = 0; i < vars.length; i++) {
      env[vars[i]] = Boolean((mask >> (vars.length - 1 - i)) & 1);
    }
    rows.push({ env, value: evalAst(ast, env) });
  }

  const trueCount = rows.filter((r) => r.value).length;
  const classification =
    trueCount === rows.length
      ? 'tautology'
      : trueCount === 0
        ? 'contradiction'
        : 'contingency';

  return { vars, rows, classification };
}

export function areEquivalent(exprA: string, exprB: string): {
  equivalent: boolean;
  vars: string[];
  rows: Array<{ env: Record<string, boolean>; left: boolean; right: boolean }>;
} {
  const astA = parseLogic(exprA);
  const astB = parseLogic(exprB);
  const varSet = new Set([...extractVars(astA), ...extractVars(astB)]);
  const vars = Array.from(varSet).sort();
  const total = 1 << vars.length;
  const rows: Array<{ env: Record<string, boolean>; left: boolean; right: boolean }> = [];
  let equivalent = true;

  for (let mask = total - 1; mask >= 0; mask--) {
    const env: Record<string, boolean> = {};
    for (let i = 0; i < vars.length; i++) {
      env[vars[i]] = Boolean((mask >> (vars.length - 1 - i)) & 1);
    }
    const left = evalAst(astA, env);
    const right = evalAst(astB, env);
    if (left !== right) equivalent = false;
    rows.push({ env, left, right });
  }

  return { equivalent, vars, rows };
}

export interface LogicPracticePreset {
  id: string;
  title: string;
  expr: string;
  compareExpr?: string;
  hint: string;
  hintVi: string;
}

export const LOGIC_TRUTH_TABLE_PRESETS: LogicPracticePreset[] = [
  {
    id: 'a1-dist',
    title: 'Assignment 1 Q2(a): Distributive Law',
    expr: 'p ∧ (q ∨ r)',
    compareExpr: '(p ∧ q) ∨ (p ∧ r)',
    hint: 'With 3 variables (p, q, r), there are 2^3 = 8 rows. Check every row matches on both sides.',
    hintVi: 'Với 3 biến (p, q, r), bảng chân trị có 2^3 = 8 dòng. Kiểm tra cả hai vế đều cho giá trị giống nhau ở mọi dòng.',
  },
  {
    id: 'a1-taut1',
    title: 'Assignment 1 Q2(b-i): ¬p → (p → q)',
    expr: '¬p → (p → q)',
    hint: 'An implication A → B is only False when A is True and B is False. Here, if ¬p is True then p is False, making (p → q) vacuously True.',
    hintVi: 'Phép kéo theo A → B chỉ sai khi A đúng và B sai. Khi ¬p đúng thì p sai, làm cho (p → q) đúng.',
  },
  {
    id: 'a1-taut2',
    title: 'Assignment 1 Q2(b-ii): (p ∧ q) → (p → q)',
    expr: '(p ∧ q) → (p → q)',
    hint: 'When p ∧ q is True, both p and q are True, so p → q is True.',
    hintVi: 'Khi p ∧ q đúng thì cả p và q đều đúng, nên p → q cũng đúng.',
  },
  {
    id: 'a1-taut3',
    title: 'Assignment 1 Q2(b-iii): ¬(p → q) → p',
    expr: '¬(p → q) → p',
    hint: '¬(p → q) is True only when p is True and q is False; in that row the conclusion p is True.',
    hintVi: '¬(p → q) chỉ đúng khi p đúng và q sai; ở dòng đó kết luận p cũng đúng.',
  },
  {
    id: 'demorgan-imp',
    title: 'Contrapositive Equivalence: (p → q) ≡ (¬q → ¬p)',
    expr: 'p → q',
    compareExpr: '¬q → ¬p',
    hint: 'A conditional statement is always logically equivalent to its contrapositive.',
    hintVi: 'Mệnh đề kéo theo luôn tương đương logic với mệnh đề phản đảo của nó.',
  },
];

export interface TranslationDrill {
  id: string;
  english: string;
  vietnamese: string;
  legend: string;
  expectedExpr: string;
  choices: string[];
  explanation: string;
  explanationVi: string;
}

export const TRANSLATION_DRILLS: TranslationDrill[] = [
  {
    id: 'tr-1',
    english: 'Whenever you get a speeding ticket, you are driving over 65 mph.',
    vietnamese: 'Bất cứ khi nào bạn bị phạt quá tốc độ, bạn đang lái xe quá 65 dặm/giờ.',
    legend: 'p: drive over 65 mph, q: get a speeding ticket',
    expectedExpr: 'q → p',
    choices: ['q → p', 'p → q', 'p ∧ q', '¬p → q'],
    explanation: '"Whenever q, p" means q is sufficient for p, i.e. q → p.',
    explanationVi: '"Bất cứ khi nào q thì p" nghĩa là q là điều kiện đủ của p, tức q → p.',
  },
  {
    id: 'tr-2',
    english: 'To use the airport Wi-Fi (w), you must pay the daily fee (d) unless you are a subscriber (s).',
    vietnamese: 'Để dùng Wi-Fi sân bay (w), bạn phải trả phí ngày (d) trừ khi bạn là thuê bao (s).',
    legend: 'w: use Wi-Fi, d: pay daily fee, s: subscriber',
    expectedExpr: 'w → (d ∨ s)',
    choices: ['w → (d ∨ s)', '(d ∨ s) → w', 'w → (d ∧ ¬s)', 'w ↔ (d → s)'],
    explanation: '"A only if (B unless C)" translates to A → (¬C → B) ≡ A → (B ∨ C), so w → (d ∨ s).',
    explanationVi: '"w đòi hỏi d trừ khi s" tương đương w → (¬s → d) ≡ w → (d ∨ s).',
  },
  {
    id: 'tr-3',
    english: 'No student at your school can speak Russian or knows C++.',
    vietnamese: 'Không có sinh viên nào ở trường bạn biết nói tiếng Nga hoặc biết C++.',
    legend: 'P(x): x speaks Russian, Q(x): x knows C++',
    expectedExpr: '¬∃x (P(x) ∨ Q(x))',
    choices: [
      '¬∃x (P(x) ∨ Q(x))',
      '∀x (¬P(x) ∨ ¬Q(x))',
      '∃x ¬(P(x) ∧ Q(x))',
      '∀x (P(x) → ¬Q(x))',
    ],
    explanation: 'By De Morgan for quantifiers, ¬∃x (P(x) ∨ Q(x)) ≡ ∀x (¬P(x) ∧ ¬Q(x)). Note ∀x (¬P(x) ∨ ¬Q(x)) would allow someone to know one of them!',
    explanationVi: 'Theo luật De Morgan cho lượng từ: ¬∃x (P(x) ∨ Q(x)) ≡ ∀x (¬P(x) ∧ ¬Q(x)).',
  },
  {
    id: 'tr-4',
    english: 'There is a student at your school who can speak Russian but does not know C++.',
    vietnamese: 'Có một sinh viên ở trường bạn biết nói tiếng Nga nhưng không biết C++.',
    legend: 'P(x): x speaks Russian, Q(x): x knows C++',
    expectedExpr: '∃x (P(x) ∧ ¬Q(x))',
    choices: [
      '∃x (P(x) ∧ ¬Q(x))',
      '∃x (P(x) → ¬Q(x))',
      '∀x (P(x) ∧ ¬Q(x))',
      '¬∀x (P(x) → Q(x))',
    ],
    explanation: 'Existential statements with "who ... but not ..." use conjunction ∧, whereas ¬∀x(P(x)→Q(x)) is actually equivalent! Wait: ∃x(P(x)∧¬Q(x)) is the standard direct translation.',
    explanationVi: '"Có một ... vừa P vừa không Q" dùng lượng từ tồn tại ∃x với phép hội ∧.',
  },
  {
    id: 'tr-5',
    english: 'Every integer n satisfies 3n ≤ 4n (domain: all integers ℤ).',
    vietnamese: 'Mọi số nguyên n đều thỏa 3n ≤ 4n (miền xác định: tập số nguyên ℤ).',
    legend: 'Domain = ℤ',
    expectedExpr: 'False (counterexample: n = -1)',
    choices: [
      'False (counterexample: n = -1)',
      'True (since 3 ≤ 4)',
      'False (counterexample: n = 0)',
      'True (for all n ≥ 0)',
    ],
    explanation: '3n ≤ 4n simplifies to 0 ≤ n, which fails for any negative integer such as n = -1 (since -3 > -4).',
    explanationVi: '3n ≤ 4n ⇔ n ≥ 0, sai với mọi số nguyên âm, ví dụ phản ví dụ n = -1 cho -3 ≤ -4 (sai).',
  },
  {
    id: 'tr-6',
    english: '∃n ∈ ℤ (2n = 3n) — Determine the truth value over ℤ.',
    vietnamese: '∃n ∈ ℤ (2n = 3n) — Xác định chân trị trên tập số nguyên ℤ.',
    legend: 'Domain = ℤ',
    expectedExpr: 'True (witness: n = 0)',
    choices: [
      'True (witness: n = 0)',
      'False (since 2 ≠ 3)',
      'True (for all n ∈ ℤ)',
      'False (no nonzero solution)',
    ],
    explanation: 'Taking n = 0 gives 2·0 = 0 = 3·0, so a witness exists.',
    explanationVi: 'Chọn n = 0 ta có 2·0 = 3·0 = 0, nên mệnh đề tồn tại là Đúng.',
  },
];

export function generateRandomLogicFormula(seed: string | number): {
  expr: string;
  compareExpr?: string;
  mode: 'classify' | 'equivalence';
} {
  const rng = createRng(seed);
  const templates = [
    { expr: '(p → q) ∧ (q → r)', mode: 'classify' as const },
    { expr: '((p → q) ∧ ¬q) → ¬p', mode: 'classify' as const },
    { expr: '(p ∨ q) ∧ (¬p ∨ r)', mode: 'classify' as const },
    { expr: '(p ∧ ¬p) → q', mode: 'classify' as const },
    { expr: '¬(p ∨ q)', compareExpr: '¬p ∧ ¬q', mode: 'equivalence' as const },
    { expr: 'p → (q → r)', compareExpr: '(p ∧ q) → r', mode: 'equivalence' as const },
    { expr: 'p ∨ (q ∧ r)', compareExpr: '(p ∨ q) ∧ (p ∨ r)', mode: 'equivalence' as const },
    { expr: '¬(p → q)', compareExpr: 'p ∧ ¬q', mode: 'equivalence' as const },
  ];
  return rng.pick(templates);
}
