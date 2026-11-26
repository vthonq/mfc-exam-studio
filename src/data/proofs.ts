import type { ChapterId } from '../types';

export type ProofMethod =
  | 'Rules of Inference'
  | 'Direct Proof'
  | 'Contraposition'
  | 'Contradiction'
  | 'Counterexample'
  | 'Algebraic / Counting';

export interface ParsonsStep {
  id: string;
  statement: string;
  rule: string;
  distractorRules: string[];
}

export interface ProofExercise {
  id: string;
  chapter: ChapterId;
  title: string;
  titleVi: string;
  method: ProofMethod;
  difficulty: 'Core' | 'Exam Standard' | 'Challenge';
  prompt: string;
  promptVi: string;
  parsonsSteps: ParsonsStep[];
  rubric: Array<{ label: string; points: number }>;
  modelSolution: string;
  modelSolutionVi: string;
}

export const PROOF_EXERCISES: ProofExercise[] = [
  {
    id: 'proof-randy',
    chapter: 'ch1',
    title: 'Inference Chain: Randy Works Hard',
    titleVi: 'Chuỗi suy diễn: Randy làm việc chăm chỉ',
    method: 'Rules of Inference',
    difficulty: 'Core',
    prompt:
      'Use rules of inference to show that the hypotheses "Randy works hard" (h), "If Randy works hard, then he is a dull boy" (h → d), and "If Randy is a dull boy, then he will not get the job" (d → ¬j) imply "Randy will not get the job" (¬j). Name each rule.',
    promptVi:
      'Dùng các quy tắc suy diễn chứng minh từ h, h → d và d → ¬j suy ra ¬j. Ghi rõ tên từng quy tắc.',
    parsonsSteps: [
      {
        id: 's1',
        statement: '1. h  ("Randy works hard")',
        rule: 'Premise (Hypothesis)',
        distractorRules: ['Modus Ponens', 'Simplification'],
      },
      {
        id: 's2',
        statement: '2. h → d  ("If Randy works hard, then he is a dull boy")',
        rule: 'Premise (Hypothesis)',
        distractorRules: ['Addition', 'Hypothetical Syllogism'],
      },
      {
        id: 's3',
        statement: '3. d  ("Randy is a dull boy") — from (1) and (2)',
        rule: 'Modus Ponens',
        distractorRules: ['Modus Tollens', 'Disjunctive Syllogism'],
      },
      {
        id: 's4',
        statement: '4. d → ¬j  ("If Randy is a dull boy, then he will not get the job")',
        rule: 'Premise (Hypothesis)',
        distractorRules: ['Contraposition', 'Resolution'],
      },
      {
        id: 's5',
        statement: '5. ¬j  ("Randy will not get the job") — from (3) and (4)',
        rule: 'Modus Ponens',
        distractorRules: ['Modus Tollens', 'Conjunction'],
      },
    ],
    rubric: [
      { label: 'Define propositional variables h, d, j clearly', points: 1 },
      { label: 'List all three premises explicitly', points: 1 },
      { label: 'Apply Modus Ponens twice (or Hypothetical Syllogism + Modus Ponens) with exact rule names', points: 2 },
    ],
    modelSolution: `Let h: "Randy works hard", d: "Randy is a dull boy", j: "Randy gets the job".
1. h            (Premise)
2. h → d        (Premise)
3. d            (Modus Ponens from 1, 2)
4. d → ¬j       (Premise)
5. ¬j           (Modus Ponens from 3, 4)
Therefore, Randy will not get the job.`,
    modelSolutionVi:
      'Đặt biến mệnh đề h, d, j rồi áp dụng Modus Ponens 2 lần (hoặc Tam đoạn luận giả định h → ¬j rồi Modus Ponens với h).',
  },
  {
    id: 'proof-sailing',
    chapter: 'ch1',
    title: 'Inference Chain: Sailing Race & Rain',
    titleVi: 'Chuỗi suy diễn: Cuộc đua thuyền & Trời mưa',
    method: 'Rules of Inference',
    difficulty: 'Exam Standard',
    prompt:
      'Hypotheses: "If it does not rain (¬r) or if it is not foggy (¬f), then the sailing race will be held (s) and the lifesaving demonstration will go on (l)", "If s then the trophy will be awarded (t)", and "¬t". Prove "It rained" (r).',
    promptVi:
      'Từ (¬r ∨ ¬f) → (s ∧ l), s → t và ¬t, hãy dùng quy tắc suy diễn chứng minh r ("Trời đã mưa").',
    parsonsSteps: [
      {
        id: 's1',
        statement: '1. ¬t and s → t (Premises)',
        rule: 'Premises (Hypotheses)',
        distractorRules: ['Simplification', 'De Morgan'],
      },
      {
        id: 's2',
        statement: '2. ¬s ("The sailing race was not held") — from (¬t) and (s → t)',
        rule: 'Modus Tollens',
        distractorRules: ['Modus Ponens', 'Disjunctive Syllogism'],
      },
      {
        id: 's3',
        statement: '3. ¬s ∨ ¬l — from ¬s',
        rule: 'Addition',
        distractorRules: ['Simplification', 'Conjunction'],
      },
      {
        id: 's4',
        statement: '4. ¬(s ∧ l) — equivalent to (¬s ∨ ¬l)',
        rule: "De Morgan's Law",
        distractorRules: ['Modus Tollens', 'Resolution'],
      },
      {
        id: 's5',
        statement: '5. ¬(¬r ∨ ¬f) — from (¬r ∨ ¬f) → (s ∧ l) and ¬(s ∧ l)',
        rule: 'Modus Tollens',
        distractorRules: ['Modus Ponens', 'Hypothetical Syllogism'],
      },
      {
        id: 's6',
        statement: '6. r ∧ f — from ¬(¬r ∨ ¬f)',
        rule: "De Morgan's Law + Double Negation",
        distractorRules: ['Addition', 'Disjunctive Syllogism'],
      },
      {
        id: 's7',
        statement: '7. r ("It rained") — from (r ∧ f)',
        rule: 'Simplification',
        distractorRules: ['Addition', 'Modus Ponens'],
      },
    ],
    rubric: [
      { label: 'Derive ¬s via Modus Tollens from s → t and ¬t', points: 1 },
      { label: 'Use Addition + De Morgan to obtain ¬(s ∧ l)', points: 1 },
      { label: 'Apply Modus Tollens to main conditional to get ¬(¬r ∨ ¬f)', points: 1 },
      { label: 'Apply De Morgan + Simplification to conclude r', points: 1 },
    ],
    modelSolution: `Let r: it rained, f: it was foggy, s: sailing race held, l: lifesaving demo goes on, t: trophy awarded.
1. s → t                 (Premise)
2. ¬t                    (Premise)
3. ¬s                    (Modus Tollens, 1 & 2)
4. ¬s ∨ ¬l               (Addition, 3)
5. ¬(s ∧ l)              (De Morgan's Law, 4)
6. (¬r ∨ ¬f) → (s ∧ l)   (Premise)
7. ¬(¬r ∨ ¬f)            (Modus Tollens, 5 & 6)
8. r ∧ f                 (De Morgan's Law & Double Negation, 7)
9. r                     (Simplification, 8)`,
    modelSolutionVi:
      'Bước mấu chốt là từ ¬s dùng Addition tạo ¬s ∨ ¬l ≡ ¬(s ∧ l), sau đó dùng Modus Tollens cho điều kiện đầu, rồi De Morgan và Simplification để rút ra r.',
  },
  {
    id: 'proof-sum-odds',
    chapter: 'ch1',
    title: 'Direct Proof: Sum of Two Odd Integers',
    titleVi: 'Chứng minh trực tiếp: Tổng hai số nguyên lẻ là số chẵn',
    method: 'Direct Proof',
    difficulty: 'Core',
    prompt: 'Use a direct proof to show that the sum of two odd integers is even.',
    promptVi: 'Dùng chứng minh trực tiếp để chứng minh tổng hai số nguyên lẻ là một số chẵn.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Let m and n be arbitrary odd integers.',
        rule: 'Direct Proof Setup (Universal Generalization)',
        distractorRules: ['Proof by Contradiction', 'Contraposition'],
      },
      {
        id: 's2',
        statement: 'By definition of odd, m = 2k + 1 and n = 2j + 1 for some integers k, j ∈ ℤ.',
        rule: 'Definition of Odd Integer',
        distractorRules: ['Bézout’s Theorem', 'Division Algorithm'],
      },
      {
        id: 's3',
        statement: 'Then m + n = (2k + 1) + (2j + 1) = 2k + 2j + 2 = 2(k + j + 1).',
        rule: 'Algebraic Manipulation',
        distractorRules: ['Modus Ponens', 'Induction'],
      },
      {
        id: 's4',
        statement: 'Since k + j + 1 ∈ ℤ, m + n = 2t for an integer t = k + j + 1, so m + n is even.',
        rule: 'Definition of Even Integer + Closure of ℤ',
        distractorRules: ['Contradiction', 'Counterexample'],
      },
    ],
    rubric: [
      { label: 'Use distinct integer parameters k and j (NOT the same k for both!)', points: 2 },
      { label: 'Factor out 2 cleanly: 2(k + j + 1)', points: 1 },
      { label: 'Explicitly note k + j + 1 ∈ ℤ so sum meets definition of even', points: 1 },
    ],
    modelSolution: `Suppose m and n are two odd integers.
By definition of odd integers, there exist integers k and j such that m = 2k + 1 and n = 2j + 1.
Adding them gives:
  m + n = (2k + 1) + (2j + 1) = 2(k + j + 1).
Since k and j are integers, t = k + j + 1 is also an integer.
Thus m + n = 2t, which by definition means m + n is even.`,
    modelSolutionVi:
      'Lưu ý quan trọng: phải dùng hai biến nguyên khác nhau k và j cho m = 2k + 1 và n = 2j + 1.',
  },
  {
    id: 'proof-n3-contraposition',
    chapter: 'ch1',
    title: 'Contraposition: If n³ + 5 is odd, then n is even',
    titleVi: 'Phản đảo: Nếu n³ + 5 lẻ thì n chẵn',
    method: 'Contraposition',
    difficulty: 'Exam Standard',
    prompt:
      'Prove that if n is an integer and n³ + 5 is odd, then n is even, using a proof by contraposition.',
    promptVi:
      'Chứng minh bằng phản đảo: nếu n ∈ ℤ và n³ + 5 lẻ thì n chẵn.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'We prove the contrapositive: if n is odd (not even), then n³ + 5 is even (not odd).',
        rule: 'Contrapositive Equivalence (p → q ≡ ¬q → ¬p)',
        distractorRules: ['Proof by Contradiction', 'Direct Proof'],
      },
      {
        id: 's2',
        statement: 'Assume n is odd, so n = 2k + 1 for some integer k ∈ ℤ.',
        rule: 'Definition of Odd Integer',
        distractorRules: ['Definition of Even Integer', 'Well-Ordering Principle'],
      },
      {
        id: 's3',
        statement: 'Compute n³ + 5 = (2k + 1)³ + 5 = 8k³ + 12k² + 6k + 6 = 2(4k³ + 6k² + 3k + 3).',
        rule: 'Binomial Expansion & Factoring',
        distractorRules: ['Fermat’s Little Theorem', 'Modular Inverse'],
      },
      {
        id: 's4',
        statement: 'Since 4k³ + 6k² + 3k + 3 ∈ ℤ, n³ + 5 is even. Hence the original implication holds.',
        rule: 'Definition of Even Integer',
        distractorRules: ['Contradiction', 'Resolution'],
      },
    ],
    rubric: [
      { label: 'State the contrapositive explicitly: "If n is odd, then n³ + 5 is even"', points: 1 },
      { label: 'Substitute n = 2k + 1 and expand (2k + 1)³ correctly', points: 2 },
      { label: 'Factor 2 out and conclude n³ + 5 is even', points: 1 },
    ],
    modelSolution: `The contrapositive statement is: "If n is odd, then n³ + 5 is even."
Assume n is an odd integer. Then n = 2k + 1 for some k ∈ ℤ.
Substituting into n³ + 5:
  n³ + 5 = (2k + 1)³ + 5
         = (8k³ + 12k² + 6k + 1) + 5
         = 8k³ + 12k² + 6k + 6
         = 2(4k³ + 6k² + 3k + 3).
Since 4k³ + 6k² + 3k + 3 is an integer, n³ + 5 is even.
Because the contrapositive is true, the original implication is true.`,
    modelSolutionVi:
      'Mệnh đề phản đảo là "Nếu n lẻ thì n³ + 5 chẵn". Thay n = 2k + 1 vào khai triển ta rút gọn được 2(4k³ + 6k² + 3k + 3).',
  },
  {
    id: 'proof-n3-contradiction',
    chapter: 'ch1',
    title: 'Contradiction: If n³ + 5 is odd, then n is even',
    titleVi: 'Phản chứng: Nếu n³ + 5 lẻ thì n chẵn',
    method: 'Contradiction',
    difficulty: 'Exam Standard',
    prompt:
      'Prove that if n ∈ ℤ and n³ + 5 is odd, then n is even, using a proof by contradiction, and explain the difference from contraposition.',
    promptVi:
      'Chứng minh bằng phản chứng: nếu n ∈ ℤ và n³ + 5 lẻ thì n chẵn, và nêu điểm khác biệt với phản đảo.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Assume for contradiction that BOTH n³ + 5 is odd AND n is odd (not even).',
        rule: 'Negation of Implication ¬(p → q) ≡ p ∧ ¬q',
        distractorRules: ['Contrapositive Equivalence', 'Addition'],
      },
      {
        id: 's2',
        statement: 'Since n is odd, write n = 2k + 1 for some k ∈ ℤ.',
        rule: 'Definition of Odd Integer',
        distractorRules: ['Division Algorithm', 'Modus Tollens'],
      },
      {
        id: 's3',
        statement: 'Then n³ + 5 = (2k + 1)³ + 5 = 2(4k³ + 6k² + 3k + 3), so n³ + 5 is even.',
        rule: 'Algebraic Expansion & Definition of Even',
        distractorRules: ['Bézout’s Theorem', 'Pigeonhole Principle'],
      },
      {
        id: 's4',
        statement: 'This contradicts our assumption that n³ + 5 is odd. Thus n must be even.',
        rule: 'Contradiction (r ∧ ¬r)',
        distractorRules: ['Direct Proof', 'Counterexample'],
      },
    ],
    rubric: [
      { label: 'Assume BOTH p (n³+5 odd) and ¬q (n odd)', points: 1 },
      { label: 'Show n³ + 5 is even, creating explicit contradiction with assumption', points: 2 },
      { label: 'Explain difference: contraposition assumes only ¬q and proves ¬p; contradiction assumes p ∧ ¬q and derives any contradiction', points: 1 },
    ],
    modelSolution: `Assume for contradiction that n³ + 5 is odd and n is also odd.
Since n is odd, n = 2k + 1 for some integer k, which yields:
  n³ + 5 = 2(4k³ + 6k² + 3k + 3),
showing n³ + 5 is even. This contradicts our assumption that n³ + 5 is odd. Therefore n must be even.

Difference vs. Contraposition: In contraposition we assume only ¬q (n is odd) and directly derive ¬p (n³ + 5 is even). In contradiction we assume both p and ¬q simultaneously and derive an impossible statement (here, n³ + 5 is both odd and even).`,
    modelSolutionVi:
      'Khác biệt: Phản đảo chỉ giả sử ¬q để suy trực tiếp ra ¬p; Phản chứng giả sử đồng thời p và ¬q rồi dẫn tới mâu thuẫn.',
  },
  {
    id: 'proof-odd-sq-mod8',
    chapter: 'ch4',
    title: 'Odd Square Congruence: n² ≡ 1 (mod 8)',
    titleVi: 'Bình phương số lẻ: n² ≡ 1 (mod 8)',
    method: 'Direct Proof',
    difficulty: 'Core',
    prompt: 'Prove that if n is an odd integer, then n² ≡ 1 (mod 8).',
    promptVi: 'Chứng minh rằng nếu n là số nguyên lẻ thì n² ≡ 1 (mod 8).',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Let n be an odd integer, so n = 2k + 1 for some integer k ∈ ℤ.',
        rule: 'Definition of Odd Integer',
        distractorRules: ['Fermat’s Little Theorem', 'CRT'],
      },
      {
        id: 's2',
        statement: 'Compute n² − 1 = (2k + 1)² − 1 = 4k² + 4k = 4k(k + 1).',
        rule: 'Algebraic Expansion',
        distractorRules: ['Euclidean Algorithm', 'Contradiction'],
      },
      {
        id: 's3',
        statement: 'Of the two consecutive integers k and k + 1, one is even, so k(k + 1) = 2m for some m ∈ ℤ.',
        rule: 'Parity of Consecutive Integers',
        distractorRules: ['Bézout’s Theorem', 'Induction'],
      },
      {
        id: 's4',
        statement: 'Hence n² − 1 = 4(2m) = 8m, meaning 8 | (n² − 1), i.e. n² ≡ 1 (mod 8).',
        rule: 'Definition of Congruence Modulo 8',
        distractorRules: ['Pigeonhole Principle', 'Counterexample'],
      },
    ],
    rubric: [
      { label: 'Express n = 2k + 1 and factor n² − 1 = 4k(k + 1)', points: 2 },
      { label: 'Justify why k(k + 1) is even (product of consecutive integers)', points: 1 },
      { label: 'Conclude 8 | (n² − 1) ⇒ n² ≡ 1 (mod 8)', points: 1 },
    ],
    modelSolution: `Let n be an odd integer, so n = 2k + 1 for some k ∈ ℤ.
Then n² − 1 = (2k + 1)² − 1 = 4k² + 4k = 4k(k + 1).
Because k and k + 1 are consecutive integers, at least one of them is even, so k(k + 1) = 2m for some m ∈ ℤ.
Therefore n² − 1 = 4(2m) = 8m, so 8 | (n² − 1), which means n² ≡ 1 (mod 8).`,
    modelSolutionVi:
      'Viết n = 2k + 1 ⇒ n² − 1 = 4k(k + 1). Vì k(k + 1) là tích hai số nguyên liên tiếp nên chia hết cho 2, suy ra n² − 1 chia hết cho 8.',
  },
  {
    id: 'proof-n3-n-div6',
    chapter: 'ch4',
    title: 'Divisibility: 6 | (n³ − n) for every integer n',
    titleVi: 'Tính chia hết: n³ − n chia hết cho 6 với mọi n ∈ ℤ',
    method: 'Direct Proof',
    difficulty: 'Core',
    prompt: 'Prove that n³ − n is divisible by 6 for every integer n.',
    promptVi: 'Chứng minh n³ − n chia hết cho 6 với mọi số nguyên n.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Factor the expression: n³ − n = n(n² − 1) = (n − 1)n(n + 1).',
        rule: 'Algebraic Factorization',
        distractorRules: ['Fermat’s Little Theorem', 'Contradiction'],
      },
      {
        id: 's2',
        statement: 'Among any 2 consecutive integers (e.g. n − 1, n), at least one is divisible by 2, so 2 | (n³ − n).',
        rule: 'Pigeonhole / Division Algorithm mod 2',
        distractorRules: ['Bézout’s Theorem', 'Hall’s Theorem'],
      },
      {
        id: 's3',
        statement: 'Among the 3 consecutive integers n − 1, n, n + 1, one is divisible by 3, so 3 | (n³ − n).',
        rule: 'Division Algorithm mod 3',
        distractorRules: ['Contraposition', 'Euler Circuit Theorem'],
      },
      {
        id: 's4',
        statement: 'Since gcd(2, 3) = 1, 2 | (n³ − n) and 3 | (n³ − n) imply 6 | (n³ − n).',
        rule: 'Coprime Divisibility Lemma',
        distractorRules: ['Modulus Cancellation', 'Counterexample'],
      },
    ],
    rubric: [
      { label: 'Factor n³ − n = (n − 1)n(n + 1)', points: 1 },
      { label: 'Show divisibility by 2 and by 3', points: 2 },
      { label: 'Cite gcd(2, 3) = 1 to combine into 6 | (n³ − n)', points: 1 },
    ],
    modelSolution: `Factor n³ − n = n(n² − 1) = (n − 1)n(n + 1), a product of three consecutive integers.
- By the division algorithm modulo 2, at least one of n − 1, n is even, so 2 | (n³ − n).
- By the division algorithm modulo 3, the remainders of n − 1, n, n + 1 mod 3 cover {0, 1, 2}, so one is divisible by 3, hence 3 | (n³ − n).
Since gcd(2, 3) = 1, it follows that 2·3 = 6 divides n³ − n.`,
    modelSolutionVi:
      'Phân tích n³ − n = (n − 1)n(n + 1) là tích 3 số nguyên liên tiếp nên vừa chia hết cho 2 vừa chia hết cho 3; vì gcd(2, 3) = 1 nên chia hết cho 6.',
  },
  {
    id: 'proof-coprime-ab-div-c',
    chapter: 'ch4',
    title: 'Bézout Application: gcd(a,b)=1, a|c, b|c ⇒ ab|c',
    titleVi: 'Ứng dụng Bézout: gcd(a,b)=1, a|c, b|c ⇒ ab|c',
    method: 'Direct Proof',
    difficulty: 'Exam Standard',
    prompt: 'Prove that if gcd(a, b) = 1, a | c and b | c, then ab | c. (Hint: use Bézout’s theorem.)',
    promptVi: 'Chứng minh nếu gcd(a, b) = 1, a | c và b | c thì ab | c (gợi ý: dùng định lý Bézout).',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Since gcd(a, b) = 1, by Bézout’s theorem there exist s, t ∈ ℤ such that sa + tb = 1.',
        rule: 'Bézout’s Theorem',
        distractorRules: ['Fermat’s Little Theorem', 'CRT'],
      },
      {
        id: 's2',
        statement: 'Since a | c and b | c, write c = au and c = bv for some integers u, v ∈ ℤ.',
        rule: 'Definition of Divisibility',
        distractorRules: ['Euclidean Algorithm', 'Contradiction'],
      },
      {
        id: 's3',
        statement: 'Multiply sa + tb = 1 by c: sac + tbc = c.',
        rule: 'Algebraic Manipulation',
        distractorRules: ['Modus Ponens', 'Simplification'],
      },
      {
        id: 's4',
        statement: 'Substitute c = bv in the first term and c = au in the second: s·a(bv) + t·b(au) = ab(sv + tu) = c.',
        rule: 'Substitution & Factoring',
        distractorRules: ['Induction', 'Contraposition'],
      },
      {
        id: 's5',
        statement: 'Since sv + tu ∈ ℤ, ab | c by definition of divisibility.',
        rule: 'Definition of Divisibility',
        distractorRules: ['Counterexample', 'Resolution'],
      },
    ],
    rubric: [
      { label: 'Invoke Bézout’s theorem to get sa + tb = 1', points: 1 },
      { label: 'Write c = au and c = bv cleanly', points: 1 },
      { label: 'Substitute into sac + tbc = c to factor out ab', points: 2 },
    ],
    modelSolution: `By Bézout's theorem, since gcd(a, b) = 1, there exist integers s, t such that sa + tb = 1.
Since a | c and b | c, there exist integers u, v such that c = au and c = bv.
Multiplying sa + tb = 1 by c gives:
  c = sac + tbc = sa(bv) + tb(au) = ab(sv + tu).
Since sv + tu ∈ ℤ, ab | c.`,
    modelSolutionVi:
      'Từ sa + tb = 1 nhân cả hai vế với c, rồi thế c = bv vào số hạng đầu và c = au vào số hạng sau để đặt ab làm nhân tử chung.',
  },
  {
    id: 'proof-inf-primes-4k3',
    chapter: 'ch4',
    title: 'Challenge: Infinitely Many Primes of Form 4k + 3',
    titleVi: 'Thử thách: Có vô hạn số nguyên tố dạng 4k + 3',
    method: 'Contradiction',
    difficulty: 'Challenge',
    prompt:
      'Prove that there are infinitely many primes of the form 4k + 3. (Hint: consider N = 4p₁p₂···pₘ − 1.)',
    promptVi:
      'Chứng minh có vô hạn số nguyên tố dạng 4k + 3 (xét N = 4p₁p₂···pₘ − 1).',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Suppose for contradiction there are only finitely many such primes: p₁, p₂, …, pₘ.',
        rule: 'Proof by Contradiction Assumption',
        distractorRules: ['Direct Proof', 'Contraposition'],
      },
      {
        id: 's2',
        statement: 'Define N = 4p₁p₂···pₘ − 1 (note N ≥ 4·3 − 1 = 11 > 1 and N ≡ 3 (mod 4)).',
        rule: 'Constructive Witness N',
        distractorRules: ['Fermat’s Little Theorem', 'CRT'],
      },
      {
        id: 's3',
        statement: 'Since N is odd, every prime factor of N is odd, hence either ≡ 1 or ≡ 3 (mod 4).',
        rule: 'Parity & Modulo 4 Classification',
        distractorRules: ['Bézout’s Theorem', 'Handshaking Theorem'],
      },
      {
        id: 's4',
        statement: 'A product of primes all ≡ 1 (mod 4) would be ≡ 1 (mod 4); since N ≡ 3 (mod 4), N has at least one prime factor q ≡ 3 (mod 4).',
        rule: 'Fundamental Theorem of Arithmetic + Closure mod 4',
        distractorRules: ['Addition', 'Pigeonhole Principle'],
      },
      {
        id: 's5',
        statement: 'Could q be one of p₁,…,pₘ? No, because then q | 4p₁···pₘ and q | N, forcing q | 1 — impossible.',
        rule: 'Divisibility Contradiction',
        distractorRules: ['Modus Tollens', 'Counterexample'],
      },
    ],
    rubric: [
      { label: 'Assume finite list p₁,...,pₘ and define N = 4p₁···pₘ − 1', points: 1 },
      { label: 'Show N has a prime factor q ≡ 3 (mod 4) (product of ≡1 mod 4 is ≡1 mod 4)', points: 2 },
      { label: 'Show q ∉ {p₁,...,pₘ} because otherwise q | 1', points: 1 },
    ],
    modelSolution: `Assume for contradiction there are only finitely many primes of the form 4k + 3, say p₁, …, pₘ (at least 3 is in the list, so m ≥ 1).
Let N = 4p₁p₂···pₘ − 1. Clearly N > 1 and N is odd, so all prime factors of N are odd (either ≡ 1 or ≡ 3 mod 4).
If every prime factor of N were ≡ 1 (mod 4), their product N would be ≡ 1 (mod 4); however N ≡ −1 ≡ 3 (mod 4).
Thus N must have at least one prime factor q ≡ 3 (mod 4).
If q = pᵢ for some i, then q | (4p₁···pₘ) and q | N, so q | (4p₁···pₘ − N) = 1, contradiction.
Hence q is a new prime of the form 4k + 3, contradicting completeness of the list.`,
    modelSolutionVi:
      'Giả sử chỉ có hữu hạn số nguyên tố dạng 4k + 3 là p₁,…,pₘ. Xét N = 4p₁···pₘ − 1 ≡ 3 (mod 4). N phải có ước nguyên tố q ≡ 3 (mod 4) (nếu toàn ≡ 1 mod 4 thì tích cũng ≡ 1 mod 4), nhưng q không thể nằm trong danh sách vì khi đó q | 1.',
  },
  {
    id: 'proof-rel-intersection-trans',
    chapter: 'ch9',
    title: 'Relations: R ∩ S Preserves Transitivity (while R ∪ S Fails)',
    titleVi: 'Quan hệ: R ∩ S giữ tính bắc cầu (R ∪ S thì không)',
    method: 'Direct Proof',
    difficulty: 'Core',
    prompt:
      'Prove that if R and S are transitive relations on A, then R ∩ S is transitive. Disprove by counterexample that R ∪ S is always transitive.',
    promptVi:
      'Chứng minh nếu R, S bắc cầu thì R ∩ S bắc cầu; tìm phản ví dụ cho thấy R ∪ S không nhất thiết bắc cầu.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Assume (a, b) ∈ R ∩ S and (b, c) ∈ R ∩ S for arbitrary a, b, c ∈ A.',
        rule: 'Direct Proof Setup',
        distractorRules: ['Contradiction', 'Induction'],
      },
      {
        id: 's2',
        statement: 'By definition of intersection, (a, b), (b, c) ∈ R AND (a, b), (b, c) ∈ S.',
        rule: 'Definition of Set Intersection',
        distractorRules: ['De Morgan’s Law', 'Symmetry'],
      },
      {
        id: 's3',
        statement: 'Since R and S are transitive, (a, c) ∈ R and (a, c) ∈ S, hence (a, c) ∈ R ∩ S.',
        rule: 'Transitivity of R and S',
        distractorRules: ['Antisymmetry', 'Warshall’s Algorithm'],
      },
      {
        id: 's4',
        statement: 'Counterexample for R ∪ S: on {1,2,3}, let R={(1,2)} and S={(2,3)} (both transitive). Then (1,2),(2,3) ∈ R∪S, but (1,3) ∉ R∪S.',
        rule: 'Disproof by Counterexample',
        distractorRules: ['Contraposition', 'Bézout’s Theorem'],
      },
    ],
    rubric: [
      { label: 'Prove (a,b),(b,c) ∈ R∩S ⇒ (a,c) ∈ R and (a,c) ∈ S ⇒ (a,c) ∈ R∩S', points: 2 },
      { label: 'Give explicit counterexample for R ∪ S and verify R, S are transitive while R ∪ S is not', points: 2 },
    ],
    modelSolution: `Part 1 (R ∩ S is transitive):
Suppose (a, b) ∈ R ∩ S and (b, c) ∈ R ∩ S. Then (a, b) ∈ R, (b, c) ∈ R, and (a, b) ∈ S, (b, c) ∈ S.
Because R is transitive, (a, c) ∈ R; because S is transitive, (a, c) ∈ S.
Hence (a, c) ∈ R ∩ S, proving R ∩ S is transitive.

Part 2 (R ∪ S need not be transitive):
Let A = {1, 2, 3}, R = {(1, 2)}, S = {(2, 3)}. Both R and S are vacuously transitive (neither contains pairs (x,y),(y,z)).
However, R ∪ S = {(1, 2), (2, 3)} has (1, 2) and (2, 3) without (1, 3), so R ∪ S is not transitive.`,
    modelSolutionVi:
      'Giao hai quan hệ bắc cầu luôn bắc cầu. Phản ví dụ cho phép hợp: A={1,2,3}, R={(1,2)}, S={(2,3)} đều bắc cầu (không có cặp nối tiếp), nhưng R∪S có (1,2),(2,3) mà thiếu (1,3).',
  },
  {
    id: 'proof-equiv-fractions',
    chapter: 'ch9',
    title: 'Equivalence Relation: Rationals via ad = bc',
    titleVi: 'Quan hệ tương đương: Phân số qua ad = bc',
    method: 'Direct Proof',
    difficulty: 'Exam Standard',
    prompt:
      'On ℤ × (ℤ \\ {0}), define (a, b) ~ (c, d) iff ad = bc. Prove ~ is an equivalence relation and describe [(1, 2)].',
    promptVi:
      'Trên ℤ × (ℤ \\ {0}), định nghĩa (a, b) ~ (c, d) ⇔ ad = bc. Chứng minh ~ là quan hệ tương đương và mô tả lớp [(1, 2)].',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Reflexive: For any (a, b), ab = ba, so (a, b) ~ (a, b).',
        rule: 'Check Reflexivity',
        distractorRules: ['Check Antisymmetry', 'Check Irreflexivity'],
      },
      {
        id: 's2',
        statement: 'Symmetric: If (a, b) ~ (c, d), then ad = bc, so cb = da, hence (c, d) ~ (a, b).',
        rule: 'Check Symmetry',
        distractorRules: ['Check Reflexivity', 'Contradiction'],
      },
      {
        id: 's3',
        statement: 'Transitive: Suppose ad = bc and cf = de. Multiply first by f: adf = bcf = b(de) = bde. Since d ≠ 0, cancel d to get af = be.',
        rule: 'Check Transitivity (using d ≠ 0!)',
        distractorRules: ['Modular Inverse', 'Division by Zero'],
      },
      {
        id: 's4',
        statement: 'Class [(1, 2)] = {(k, 2k) | k ∈ ℤ \\ {0}}, representing the rational number 1/2 (and all classes form ℚ).',
        rule: 'Equivalence Class Interpretation',
        distractorRules: ['Lattice Property', 'Topological Sort'],
      },
    ],
    rubric: [
      { label: 'Prove Reflexive and Symmetric cleanly', points: 1 },
      { label: 'Prove Transitive WITHOUT forgetting to invoke d ≠ 0 when canceling d!', points: 2 },
      { label: 'Describe [(1, 2)] = {(k, 2k) : k ≠ 0} and identify set of classes as ℚ', points: 1 },
    ],
    modelSolution: `1. Reflexive: ab = ba holds for all (a, b), so (a, b) ~ (a, b).
2. Symmetric: If (a, b) ~ (c, d), then ad = bc ⇒ cb = da, so (c, d) ~ (a, b).
3. Transitive: Suppose (a, b) ~ (c, d) and (c, d) ~ (e, f), so ad = bc and cf = de.
   Multiplying ad = bc by f gives adf = bcf = b(de) = bde.
   Because (c, d) ∈ ℤ × (ℤ \\ {0}), we have d ≠ 0, so canceling d gives af = be, i.e., (a, b) ~ (e, f).
Thus ~ is an equivalence relation.
[(1, 2)] = {(a, b) | 2a = b, b ≠ 0} = {(k, 2k) | k ∈ ℤ \\ {0}}, which represents the rational number 1/2. The quotient set represents ℚ.`,
    modelSolutionVi:
      'Điểm ăn điểm tối đa là ở bước Bắc cầu: phải giải thích được phép giản ước d là hợp lệ vì d ∈ ℤ \\ {0} (tức d ≠ 0).',
  },
  {
    id: 'proof-finite-poset-minimal',
    chapter: 'ch9',
    title: 'Challenge: Every Finite Nonempty Poset Has a Minimal Element',
    titleVi: 'Thử thách: Mọi poset hữu hạn khác rỗng đều có phần tử tối tiểu',
    method: 'Contradiction',
    difficulty: 'Challenge',
    prompt:
      'Prove that every finite nonempty poset (S, ≼) has at least one minimal element, and explain why topological sorting never gets stuck.',
    promptVi:
      'Chứng minh mọi poset hữu hạn khác rỗng (S, ≼) có ít nhất một phần tử tối tiểu, và giải thích vì sao thuật toán sắp xếp topo không bao giờ bị kẹt.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Pick any element a₀ ∈ S (possible since S ≠ ∅). If a₀ is minimal, we are done.',
        rule: 'Nonemptiness Assumption',
        distractorRules: ['Lattice Axiom', 'Hall’s Condition'],
      },
      {
        id: 's2',
        statement: 'Otherwise, there exists a₁ ∈ S with a₁ ≺ a₀. Repeat: if aᵢ is not minimal, pick aᵢ₊₁ ≺ aᵢ.',
        rule: 'Iterative Descent',
        distractorRules: ['Euclidean Algorithm', 'Addition'],
      },
      {
        id: 's3',
        statement: 'All elements a₀, a₁, a₂, … in this descending chain must be distinct (by antisymmetry & transitivity, aᵢ = aⱼ with i < j would imply aⱼ ≺ aⱼ, impossible).',
        rule: 'Transitivity + Antisymmetry (Irreflexivity of ≺)',
        distractorRules: ['Symmetry', 'De Morgan'],
      },
      {
        id: 's4',
        statement: 'Since S is finite, this chain of distinct elements cannot continue forever and must stop at a minimal element.',
        rule: 'Finiteness of S',
        distractorRules: ['Infinite Descent', 'Euler’s Theorem'],
      },
      {
        id: 's5',
        statement: 'In topological sort, each remaining sub-poset is still a finite nonempty poset, so a minimal element always exists to pick next.',
        rule: 'Induced Sub-poset Invariant',
        distractorRules: ['Greedy Cut Property', 'Pigeonhole Principle'],
      },
    ],
    rubric: [
      { label: 'Construct descending sequence a₀ ≻ a₁ ≻ a₂ ≻ …', points: 1 },
      { label: 'Prove all terms are distinct using transitivity & antisymmetry', points: 2 },
      { label: 'Use finiteness of S to conclude termination + connect to topological sort', points: 1 },
    ],
    modelSolution: `Because S is nonempty, pick a₀ ∈ S. If a₀ is not minimal, there exists a₁ ∈ S with a₁ ≺ a₀ (meaning a₁ ≼ a₀ and a₁ ≠ a₀).
Inductively, as long as aᵢ is not minimal, choose aᵢ₊₁ ≺ aᵢ.
By transitivity, if i < j then aⱼ ≼ aᵢ; if aⱼ = aᵢ then antisymmetry forces all intermediate elements equal, contradicting aⱼ ≺ aⱼ₋₁. Thus all elements a₀, a₁, … are distinct.
Because S is finite, the chain must terminate at some aₘ, which is minimal.
Topological sort repeatedly removes a minimal element from the remaining set; since any nonempty subset of a finite poset is again a finite nonempty poset, a minimal element is always available until all elements are output.`,
    modelSolutionVi:
      'Xây dựng dãy giảm dần a₀ ≻ a₁ ≻ … Nhờ tính bắc cầu và phản đối xứng, các phần tử trong dãy đôi một khác nhau nên vì S hữu hạn dãy phải dừng tại một phần tử tối tiểu.',
  },
  {
    id: 'proof-same-degree',
    chapter: 'ch10',
    title: 'Pigeonhole Proof: Two Vertices Have the Same Degree',
    titleVi: 'Nguyên lý Dirichlet: Luôn có hai đỉnh cùng bậc',
    method: 'Contradiction',
    difficulty: 'Exam Standard',
    prompt: 'Prove that every simple graph with n ≥ 2 vertices has at least two vertices of the same degree.',
    promptVi: 'Chứng minh mọi đơn đồ thị có n ≥ 2 đỉnh luôn có ít nhất hai đỉnh cùng bậc.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'In a simple graph on n vertices, every vertex degree lies in {0, 1, …, n − 1} (n possible values).',
        rule: 'Simple Graph Degree Bounds',
        distractorRules: ['Handshaking Theorem', 'Hall’s Theorem'],
      },
      {
        id: 's2',
        statement: 'Suppose for contradiction that all n vertices have distinct degrees; then the degrees must be all of 0, 1, …, n − 1.',
        rule: 'Pigeonhole Principle / Contradiction Assumption',
        distractorRules: ['Direct Proof', 'Induction'],
      },
      {
        id: 's3',
        statement: 'Then there is a vertex u of degree n − 1 (adjacent to every other vertex) AND a vertex v of degree 0 (isolated, adjacent to nobody).',
        rule: 'Existence of Extreme-Degree Vertices',
        distractorRules: ['Bipartiteness', 'Euler Circuit'],
      },
      {
        id: 's4',
        statement: 'Contradiction: u must be adjacent to v (since deg(u) = n − 1), yet v has no neighbors (deg(v) = 0).',
        rule: 'Contradiction',
        distractorRules: ['Contraposition', 'Triangle Inequality'],
      },
    ],
    rubric: [
      { label: 'Identify possible degrees {0, 1, …, n − 1}', points: 1 },
      { label: 'Note 0 and n − 1 cannot coexist in the same simple graph', points: 2 },
      { label: 'Apply Pigeonhole Principle to the remaining ≤ n − 1 values', points: 1 },
    ],
    modelSolution: `In a simple graph with n ≥ 2 vertices, each vertex has degree in {0, 1, …, n − 1}.
Notice that degree 0 (an isolated vertex) and degree n − 1 (a vertex adjacent to all n − 1 other vertices) cannot both occur in the same graph: if u has degree n − 1, it is adjacent to every other vertex v, so deg(v) ≥ 1.
Therefore, the n vertices can take at most n − 1 possible degree values (either {0, …, n − 2} or {1, …, n − 1}).
By the Pigeonhole Principle, at least two vertices must have the same degree.`,
    modelSolutionVi:
      'Đỉnh bậc 0 (cô lập) và đỉnh bậc n − 1 (nối tới mọi đỉnh khác) không thể cùng tồn tại, nên n đỉnh chỉ nhận tối đa n − 1 giá trị bậc khác nhau ⇒ theo nguyên lý Dirichlet có ít nhất 2 đỉnh cùng bậc.',
  },
  {
    id: 'proof-kmn-hamilton',
    chapter: 'ch10',
    title: 'Hamilton Circuit in K_{m,n} Requires m = n',
    titleVi: 'Chu trình Hamilton trong K_{m,n} đòi hỏi m = n',
    method: 'Direct Proof',
    difficulty: 'Exam Standard',
    prompt: 'Prove that if m ≠ n, then the complete bipartite graph K_{m,n} has no Hamilton circuit.',
    promptVi: 'Chứng minh rằng nếu m ≠ n thì đồ thị hai phía đầy đủ K_{m,n} không có chu trình Hamilton.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Let (V₁, V₂) be the bipartition of K_{m,n} with |V₁| = m and |V₂| = n.',
        rule: 'Bipartite Graph Definition',
        distractorRules: ['Handshaking Theorem', 'Prim’s Cut Property'],
      },
      {
        id: 's2',
        statement: 'Suppose K_{m,n} has a Hamilton circuit v₀, v₁, …, v_{m+n−1}, v₀ visiting all m + n vertices.',
        rule: 'Contradiction Assumption',
        distractorRules: ['Direct Construction', 'Pigeonhole Principle'],
      },
      {
        id: 's3',
        statement: 'Because every edge connects V₁ and V₂, the vertices on the circuit must alternate between V₁ and V₂.',
        rule: 'Bipartite Alternation Property',
        distractorRules: ['Euler Degree Condition', 'Tree Cycle Lemma'],
      },
      {
        id: 's4',
        statement: 'Since the circuit returns to v₀, it has equal numbers of vertices from V₁ and V₂, forcing m = n — contradicting m ≠ n.',
        rule: 'Counting & Contradiction',
        distractorRules: ['Hall’s Theorem', 'Havel-Hakimi'],
      },
    ],
    rubric: [
      { label: 'State bipartition |V₁| = m, |V₂| = n and every edge crosses between V₁ and V₂', points: 1 },
      { label: 'Show a Hamilton circuit alternates V₁ → V₂ → V₁ → … and returns to start', points: 2 },
      { label: 'Conclude equal vertices in both parts (m = n), contradicting m ≠ n', points: 1 },
    ],
    modelSolution: `Let V₁ and V₂ be the two parts of K_{m,n} with |V₁| = m and |V₂| = n.
Suppose K_{m,n} has a Hamilton circuit. Since every edge goes between V₁ and V₂, consecutive vertices along the circuit alternate between V₁ and V₂.
Because a Hamilton circuit visits every vertex in V₁ ∪ V₂ exactly once and returns to its starting part, the circuit must have even length and contain the exact same number of vertices from V₁ as from V₂.
Thus m = n, contradicting m ≠ n.`,
    modelSolutionVi:
      'Mọi cạnh của đồ thị hai phía đều đi giữa V₁ và V₂ nên chu trình Hamilton phải luân phiên V₁ ↔ V₂ và quay về tập xuất phát, dẫn đến số đỉnh hai bên bằng nhau (m = n).',
  },
  {
    id: 'proof-k33-prism',
    chapter: 'ch10',
    title: 'Non-Isomorphism: K_{3,3} vs. Triangular Prism Graph',
    titleVi: 'Không đẳng cấu: K_{3,3} và đồ thị Lăng trụ tam giác',
    method: 'Counterexample',
    difficulty: 'Exam Standard',
    prompt:
      'Both K_{3,3} and the triangular prism graph have 6 vertices, 9 edges, and all vertices of degree 3. Prove they are NOT isomorphic using a graph invariant.',
    promptVi:
      'Cả K_{3,3} và đồ thị lăng trụ đều có 6 đỉnh, 9 cạnh, đều bậc 3. Chứng minh chúng KHÔNG đẳng cấu bằng một bất biến đồ thị.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'An isomorphism preserves cycle lengths (in particular, existence of 3-cycles / triangles).',
        rule: 'Graph Isomorphism Invariant',
        distractorRules: ['Handshaking Theorem', 'Hall’s Theorem'],
      },
      {
        id: 's2',
        statement: 'The prism graph contains triangles (3-cycles): a₁ − a₂ − a₃ − a₁ (and b₁ − b₂ − b₃ − b₁).',
        rule: 'Inspect Prism Graph Cycles',
        distractorRules: ['Dijkstra’s Algorithm', 'Kruskal’s Algorithm'],
      },
      {
        id: 's3',
        statement: 'K_{3,3} is bipartite, so it has NO odd cycles and therefore contains ZERO triangles.',
        rule: 'Bipartite Graphs Have No Odd Cycles',
        distractorRules: ['Euler Circuit Theorem', 'Bézout’s Theorem'],
      },
      {
        id: 's4',
        statement: 'Since one graph has 3-cycles and the other does not, K_{3,3} and the prism graph are not isomorphic.',
        rule: 'Invariant Mismatch Conclusion',
        distractorRules: ['Direct Proof', 'Modus Ponens'],
      },
    ],
    rubric: [
      { label: 'Name a valid distinguishing invariant (e.g., number of 3-cycles / bipartiteness)', points: 2 },
      { label: 'Verify the prism has triangles (a₁a₂a₃) while K_{3,3} is bipartite (no odd cycles)', points: 2 },
    ],
    modelSolution: `Although both graphs have 6 vertices, 9 edges, and degree sequence (3,3,3,3,3,3), they are NOT isomorphic.
Invariant: Existence of a cycle of length 3 (a triangle), or equivalently bipartiteness.
- The prism graph contains the 3-cycle a₁ − a₂ − a₃ − a₁ (so it is not bipartite).
- K_{3,3} is bipartite, and a bipartite graph cannot contain any odd cycle, so K_{3,3} has no 3-cycles.
Because an isomorphism preserves cycle lengths, the two graphs are not isomorphic.`,
    modelSolutionVi:
      'Dù cùng số đỉnh (6), số cạnh (9) và đều bậc 3, đồ thị lăng trụ có tam giác (chu trình độ dài 3: a₁a₂a₃), còn K_{3,3} là đồ thị hai phía nên không có chu trình lẻ nào.',
  },
  {
    id: 'proof-tree-2leaves',
    chapter: 'ch11',
    title: 'Every Tree with n ≥ 2 Vertices Has at Least Two Leaves',
    titleVi: 'Mọi cây có n ≥ 2 đỉnh đều có ít nhất hai lá',
    method: 'Direct Proof',
    difficulty: 'Exam Standard',
    prompt: 'Prove that every tree with at least two vertices has at least two leaves (vertices of degree 1).',
    promptVi: 'Chứng minh rằng mọi cây có ít nhất hai đỉnh đều có ít nhất hai lá (đỉnh bậc 1).',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'Let T be a tree with n ≥ 2 vertices. Since T is connected and n ≥ 2, every vertex has deg(v) ≥ 1.',
        rule: 'Connectedness of Trees',
        distractorRules: ['Euler Circuit Theorem', 'Hall’s Condition'],
      },
      {
        id: 's2',
        statement: 'Method 1 (Longest Path): Take a longest simple path P = v₀, v₁, …, vₖ in T (k ≥ 1 since |E| = n − 1 ≥ 1).',
        rule: 'Extremal Simple Path Choice',
        distractorRules: ['Prim’s Cut Property', 'Pigeonhole Principle'],
      },
      {
        id: 's3',
        statement: 'The endpoints v₀ and vₖ cannot have any neighbor outside P (otherwise P could be extended) nor any other neighbor inside P (otherwise T would have a cycle).',
        rule: 'Maximality of P + Acyclicity of T',
        distractorRules: ['Bipartiteness', 'Contraposition'],
      },
      {
        id: 's4',
        statement: 'Thus deg(v₀) = 1 and deg(vₖ) = 1, giving at least two distinct leaves v₀ ≠ vₖ.',
        rule: 'Definition of Leaf',
        distractorRules: ['Handshaking Parity', 'Modus Tollens'],
      },
    ],
    rubric: [
      { label: 'Pick a longest simple path v₀…vₖ (with k ≥ 1 since n ≥ 2)', points: 1 },
      { label: 'Explain why v₀ and vₖ have no neighbors outside P (maximality) and none in P except v₁ / v_{k-1} (no cycles)', points: 2 },
      { label: 'Conclude v₀ and vₖ are two distinct leaves (also valid: Handshaking ∑deg = 2n−2)', points: 1 },
    ],
    modelSolution: `Let T be a tree with n ≥ 2 vertices.
Consider a longest simple path P = (v₀, v₁, …, vₖ) in T. Since T is connected and n ≥ 2, there is at least one edge, so k ≥ 1 and v₀ ≠ vₖ.
Could v₀ have any neighbor u other than v₁?
- If u ∉ P, then (u, v₀, v₁, …, vₖ) is a longer simple path, contradicting maximality of P.
- If u = vᵢ ∈ P with i ≥ 2, then (v₀, v₁, …, vᵢ, v₀) is a simple circuit, contradicting that T is a tree.
Hence deg(v₀) = 1. By the exact same reasoning, deg(vₖ) = 1. Therefore T has at least two leaves.`,
    modelSolutionVi:
      'Xét đường đi đơn dài nhất P = v₀…vₖ trong cây T. Hai đầu mút v₀, vₖ không thể nối ra ngoài P (trái tính dài nhất) và không thể nối vào đỉnh khác trong P (tạo chu trình), nên cả hai đều là lá.',
  },
  {
    id: 'proof-bool-absorption',
    chapter: 'ch12',
    title: 'Boolean Algebra Proof: Absorption Law x + xy = x',
    titleVi: 'Đại số Boolean: Chứng minh luật hấp thụ x + xy = x',
    method: 'Algebraic / Counting',
    difficulty: 'Core',
    prompt: 'Prove the Boolean absorption identity x + xy = x using the axioms/laws of Boolean algebra (without a truth table).',
    promptVi: 'Chứng minh đẳng thức hấp thụ x + xy = x chỉ bằng các tiên đề đại số Boolean.',
    parsonsSteps: [
      {
        id: 's1',
        statement: 'x + xy = x·1 + xy',
        rule: 'Identity Law (x = x·1)',
        distractorRules: ['Complement Law', 'De Morgan’s Law'],
      },
      {
        id: 's2',
        statement: '= x(1 + y)',
        rule: 'Distributive Law',
        distractorRules: ['Associative Law', 'Idempotent Law'],
      },
      {
        id: 's3',
        statement: '= x·1',
        rule: 'Domination Law (1 + y = 1)',
        distractorRules: ['Complement Law', 'Commutative Law'],
      },
      {
        id: 's4',
        statement: '= x',
        rule: 'Identity Law (x·1 = x)',
        distractorRules: ['Involution Law', 'De Morgan’s Law'],
      },
    ],
    rubric: [
      { label: 'Write x = x·1 using Identity Law', points: 1 },
      { label: 'Factor x(1 + y) using Distributive Law', points: 1 },
      { label: 'Simplify 1 + y = 1 (Domination) and x·1 = x (Identity)', points: 2 },
    ],
    modelSolution: `x + xy = x·1 + xy    (Identity law)
       = x(1 + y)    (Distributive law)
       = x·1         (Domination law: 1 + y = 1)
       = x           (Identity law)`,
    modelSolutionVi:
      'Dùng luật đơn vị x = x·1, đặt nhân tử chung x(1 + y) theo luật phân phối, sau đó áp dụng luật thống trị 1 + y = 1.',
  },
];
