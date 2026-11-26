import type { ChapterId, LabTab } from '../types';

export interface AssignmentQuestion {
  id: string;
  label: string;
  title: string;
  points: number;
  prompt: string;
  promptVi: string;
  hints: string[];
  solution: string;
  solutionVi: string;
  relatedLab?: LabTab;
  relatedProofId?: string;
}

export interface AssignmentDoc {
  id: 'a1' | 'a2' | 'a3' | 'a4';
  title: string;
  titleVi: string;
  chapter: ChapterId;
  totalPoints: string;
  questions: AssignmentQuestion[];
}

export const ASSIGNMENTS: AssignmentDoc[] = [
  {
    id: 'a1',
    title: 'Assignment 1 — Logic and Proofs',
    titleVi: 'Bài tập 1 — Logic và Chứng minh',
    chapter: 'ch1',
    totalPoints: '10 points',
    questions: [
      {
        id: 'a1-q1',
        label: 'Q1 [3 pts]',
        title: 'Translating between English and Logic',
        points: 3,
        prompt: `(a) Let p: "You drive over 65 mph", q: "You get a speeding ticket". Express:
  (i) You do not drive over 65 mph.
  (ii) You drive over 65 mph, but you do not get a speeding ticket.
  (iii) You get a speeding ticket, but you do not drive over 65 mph.
  (iv) Whenever you get a speeding ticket, you are driving over 65 mph.
(b) Express airport Wi-Fi rule in terms of w (use Wi-Fi), d (pay daily fee), s (subscriber):
  "To use the wireless network in the airport you must pay the daily fee unless you are a subscriber to the service."`,
        promptVi:
          'Dịch các câu tiếng Anh sang biểu thức logic mệnh đề với p, q và w, d, s.',
        hints: [
          '"but" translates logically to conjunction ∧.',
          '"Whenever A, B" means A → B (A is sufficient for B).',
          '"d unless s" means ¬s → d ≡ d ∨ s.',
        ],
        solution: `(a)
  (i)   ¬p
  (ii)  p ∧ ¬q
  (iii) q ∧ ¬p
  (iv)  q → p   ("Whenever q, p" means q is sufficient for p.)

(b)
  w → (¬s → d)  ≡  w → (d ∨ s)
  (Equivalently: (w ∧ ¬s) → d. Note: using Wi-Fi requires that if you are not a subscriber, you pay the daily fee.)`,
        solutionVi:
          '"but" là ∧; "whenever q, p" là q → p; "trừ khi s thì phải d" là ¬s → d ≡ d ∨ s.',
        relatedLab: 'logic',
      },
      {
        id: 'a1-q2',
        label: 'Q2 [2 pts]',
        title: 'Truth Tables and Tautologies',
        points: 2,
        prompt: `(a) Use a truth table to verify the distributive law: p ∧ (q ∨ r) ≡ (p ∧ q) ∨ (p ∧ r).
(b) Show using truth tables that each conditional is a tautology:
  (i) ¬p → (p → q)
  (ii) (p ∧ q) → (p → q)
  (iii) ¬(p → q) → p`,
        promptVi:
          'Lập bảng chân trị kiểm chứng luật phân phối và 3 hằng đúng kéo theo.',
        hints: [
          'For 3 variables (p, q, r), build 2³ = 8 rows and verify the columns for both sides match on every row.',
          'For (b-i), when p is T then ¬p is F so ¬p → (...) is T; when p is F then p → q is T.',
        ],
        solution: `(a) Both p ∧ (q ∨ r) and (p ∧ q) ∨ (p ∧ r) evaluate to T in rows (T,T,T), (T,T,F), (T,F,T) and F in the remaining 5 rows — identical on all 8 rows, hence logically equivalent.

(b) Every row evaluates to T for all three formulas:
  (i)   ¬p → (p → q): only could be F if ¬p = T and (p → q) = F, impossible since ¬p = T ⇒ p = F ⇒ (p → q) = T.
  (ii)  (p ∧ q) → (p → q): when p ∧ q = T, both p, q = T, so p → q = T.
  (iii) ¬(p → q) → p: ¬(p → q) = T only when p = T and q = F; in that row the conclusion p is T.
Open the Logic Lab to fill and verify all rows interactively!`,
        solutionVi:
          'Cả 3 biểu thức ở (b) đều nhận giá trị T ở cả 4 dòng của bảng chân trị nên là hằng đúng.',
        relatedLab: 'logic',
      },
      {
        id: 'a1-q3',
        label: 'Q3 [2 pts]',
        title: 'Predicates, Quantifiers & Integer Truth Values',
        points: 2,
        prompt: `(a) Domain: all students at your school. P(x): "x speaks Russian", Q(x): "x knows C++". Express:
  (i) There is a student who can speak Russian and knows C++.
  (ii) There is a student who can speak Russian but doesn't know C++.
  (iii) Every student either can speak Russian or knows C++.
  (iv) No student can speak Russian or knows C++.
(b) Domain: all integers ℤ. Determine truth values with 1-sentence justification:
  (i) ∀n (n + 1 > n)   (ii) ∃n (2n = 3n)   (iii) ∃n (n = −n)   (iv) ∀n (3n ≤ 4n)`,
        promptVi:
          'Dịch câu chứa lượng từ và xác định chân trị trên miền số nguyên ℤ.',
        hints: [
          'For (a-iv), "No student..." means ¬∃x (P(x) ∨ Q(x)), equivalent to ∀x (¬P(x) ∧ ¬Q(x)).',
          'For (b-iv), test negative integers like n = −1!',
        ],
        solution: `(a)
  (i)   ∃x (P(x) ∧ Q(x))
  (ii)  ∃x (P(x) ∧ ¬Q(x))
  (iii) ∀x (P(x) ∨ Q(x))
  (iv)  ¬∃x (P(x) ∨ Q(x))  ≡  ∀x (¬P(x) ∧ ¬Q(x))

(b)
  (i)   TRUE — Subtracting n gives 1 > 0, which holds for every integer n.
  (ii)  TRUE — Witness n = 0 satisfies 2·0 = 0 = 3·0.
  (iii) TRUE — Witness n = 0 satisfies 0 = −0.
  (iv)  FALSE — Counterexample n = −1 gives 3(−1) = −3 > −4 = 4(−1).`,
        solutionVi:
          'Chú ý câu (b-iv) sai với mọi số nguyên âm (phản ví dụ n = −1).',
        relatedLab: 'logic',
      },
      {
        id: 'a1-q4',
        label: 'Q4 [2 pts]',
        title: 'Rules of Inference',
        points: 2,
        prompt: `(a) Show that "Randy works hard" (h), "If Randy works hard, then he is a dull boy" (h→d), and "If Randy is a dull boy, then he will not get the job" (d→¬j) imply "Randy will not get the job" (¬j).
(b) Show that "(¬r ∨ ¬f) → (s ∧ l)", "s → t", and "¬t" imply "It rained" (r). Name every rule.`,
        promptVi:
          'Áp dụng và ghi rõ tên từng quy tắc suy diễn cho hai lập luận.',
        hints: [
          'In (a), apply Modus Ponens twice.',
          'In (b), start from ¬t and s → t via Modus Tollens to get ¬s, then use Addition to get ¬s ∨ ¬l ≡ ¬(s ∧ l).',
        ],
        solution: `(a)
1. h       (Premise)
2. h → d   (Premise)
3. d       (Modus Ponens, 1 & 2)
4. d → ¬j  (Premise)
5. ¬j      (Modus Ponens, 3 & 4)

(b)
1. s → t               (Premise)
2. ¬t                  (Premise)
3. ¬s                  (Modus Tollens, 1 & 2)
4. ¬s ∨ ¬l             (Addition, 3)
5. ¬(s ∧ l)            (De Morgan's Law, 4)
6. (¬r ∨ ¬f) → (s ∧ l) (Premise)
7. ¬(¬r ∨ ¬f)          (Modus Tollens, 5 & 6)
8. r ∧ f               (De Morgan's Law & Double Negation, 7)
9. r                   (Simplification, 8)`,
        solutionVi:
          'Thực hành ghép bước và chọn tên quy tắc trong mục Proofs Trainer.',
        relatedProofId: 'proof-sailing',
      },
      {
        id: 'a1-q5',
        label: 'Q5 [1 pt — Challenge]',
        title: 'Direct, Contraposition & Contradiction Proofs',
        points: 1,
        prompt: `(a) Use a direct proof to show that the sum of two odd integers is even.
(b) Show that if n ∈ ℤ and n³ + 5 is odd, then n is even, using contraposition.
(c) Prove (b) by contradiction, and explain in 2–3 sentences the difference between (b) and (c).`,
        promptVi:
          'Chứng minh trực tiếp, phản đảo và phản chứng, đồng thời giải thích sự khác biệt.',
        hints: [
          'In (a), use two DIFFERENT integer names k and j: m = 2k+1, n = 2j+1.',
          'In (b), assume n = 2k+1 and compute (2k+1)³ + 5 = 2(4k³ + 6k² + 3k + 3).',
        ],
        solution: `(a) Let m = 2k + 1 and n = 2j + 1 (k, j ∈ ℤ). Then m + n = 2(k + j + 1), which is even since k + j + 1 ∈ ℤ.
(b) Contrapositive: if n is odd, then n³ + 5 is even. Put n = 2k + 1:
    n³ + 5 = 8k³ + 12k² + 6k + 6 = 2(4k³ + 6k² + 3k + 3), which is even.
(c) Contradiction: assume BOTH n³ + 5 is odd AND n is odd. Writing n = 2k + 1 forces n³ + 5 = 2(4k³ + 6k² + 3k + 3) to be even, contradicting that n³ + 5 is odd.
Difference: Contraposition assumes only ¬q (n odd) and directly derives ¬p (n³+5 even). Contradiction assumes both p and ¬q simultaneously and derives an impossible conflict (n³+5 both odd and even).`,
        solutionVi:
          'Luyện tập cả 3 bài chứng minh này trong Proofs Trainer.',
        relatedProofId: 'proof-n3-contraposition',
      },
    ],
  },
  {
    id: 'a2',
    title: 'Assignment 2 — Number Theory and Cryptography',
    titleVi: 'Bài tập 2 — Số học và Mật mã học',
    chapter: 'ch4',
    totalPoints: '10 pts + 1 bonus',
    questions: [
      {
        id: 'a2-q1',
        label: 'Q1 [1.5 pts]',
        title: 'Divisibility and Congruences',
        points: 1.5,
        prompt: `(a) Prove that if n is an odd integer, then n² ≡ 1 (mod 8).
(b) Prove that n³ − n is divisible by 6 for every integer n.
(c) Give an example of a, b, c and m ≥ 2 with ac ≡ bc (mod m) but a ≢ b (mod m). State a condition on c and m ensuring cancellation holds, and prove it.`,
        promptVi:
          'Chứng minh n² ≡ 1 (mod 8) với n lẻ, 6 | (n³−n), và điều kiện giản ước đồng dư.',
        hints: [
          '(a) n² − 1 = (2k+1)² − 1 = 4k(k+1), and one of k, k+1 is even.',
          '(c) Try 2·1 ≡ 2·3 (mod 4). Cancellation holds whenever gcd(c, m) = 1.',
        ],
        solution: `(a) Write n = 2k + 1. Then n² − 1 = 4k(k + 1). Since k(k + 1) is the product of two consecutive integers, it is even (2m), so n² − 1 = 8m ⇒ n² ≡ 1 (mod 8).
(b) n³ − n = (n − 1)n(n + 1). Any 3 consecutive integers include at least one multiple of 2 and one multiple of 3. Since gcd(2, 3) = 1, 6 | (n³ − n).
(c) Example: a = 1, b = 3, c = 2, m = 4: 1·2 = 2 ≡ 6 = 3·2 (mod 4), yet 1 ≢ 3 (mod 4).
Condition: gcd(c, m) = 1.
Proof: ac ≡ bc (mod m) means m | c(a − b). Since gcd(c, m) = 1, by Bézout sc + tm = 1 ⇒ s·c(a−b) + t·m(a−b) = a − b, and m divides both terms on the left, so m | (a − b), i.e. a ≡ b (mod m).`,
        solutionVi:
          'Điều kiện giản ước: gcd(c, m) = 1 (chứng minh bằng định lý Bézout).',
        relatedProofId: 'proof-odd-sq-mod8',
      },
      {
        id: 'a2-q2',
        label: 'Q2 [2 pts]',
        title: 'Binary Modular Exponentiation & Base Representations',
        points: 2,
        prompt: `(a) Find 7^644 mod 645 using binary modular exponentiation. Show the binary expansion, successive squares 7^(2^j) mod 645, and running product.
(b) Prove every positive integer is congruent modulo 9 to the sum of its decimal digits.
(c) Show "casting out nines" fails on 1234 · 5678 = 7006562 (true: 7006652) and explain why.
(d) Let b ≥ 3. Prove (121)_b is a perfect square in every base b.`,
        promptVi:
          'Tính 7^644 mod 645 bằng bình phương liên tiếp nhị phân, chứng minh quy tắc chia hết cho 9 và (121)_b là số chính phương.',
        hints: [
          '644 = 512 + 128 + 4 = (1010000100)₂, so bits j = 2, 7, 9 are 1.',
          'In (d), expand (121)_b = 1·b² + 2·b + 1 = (b + 1)².',
        ],
        solution: `(a) 644 = (1010000100)₂ = 2² + 2⁷ + 2⁹ (j = 2, 7, 9 have bit 1).
Successive squares mod 645:
  j=0: 7¹ ≡ 7
  j=1: 7² ≡ 49
  j=2 (bit=1): 7⁴ ≡ 49² = 2401 ≡ 466  | x = 466
  j=3: 7⁸ ≡ 466² ≡ 361
  j=4: 7¹⁶ ≡ 361² ≡ 31
  j=5: 7³² ≡ 31² = 961 ≡ 316
  j=6: 7⁶⁴ ≡ 316² ≡ 526
  j=7 (bit=1): 7¹²⁸ ≡ 526² ≡ 391      | x = 466·391 mod 645 = 346
  j=8: 7²⁵⁶ ≡ 391² ≡ 241
  j=9 (bit=1): 7⁵¹² ≡ 241² ≡ 31       | x = 346·31 mod 645 = 436
Answer: 7^644 mod 645 = 436.

(b) Write n = ∑ d_i 10^i. Since 10 ≡ 1 (mod 9), 10^i ≡ 1^i = 1 (mod 9), so n ≡ ∑ d_i (mod 9).
(c) 7006562 and 7006652 have the exact same digits (just 5 and 6 swapped), so both have digit sum 26 ≡ 8 (mod 9) — matching (1+2+3+4)(5+6+7+8) = 10·26 ≡ 1·8 = 8 (mod 9). Transposing digits (or any error differing by a multiple of 9) can never be detected by casting out nines.
(d) (121)_b = 1·b² + 2·b + 1 = (b + 1)², which is a perfect square for every integer b ≥ 3.`,
        solutionVi:
          'Kết quả chính xác: 7^644 mod 645 = 436. Kiểm tra từng bước trong Number Theory Lab!',
        relatedLab: 'number-theory',
      },
      {
        id: 'a2-q3',
        label: 'Q3 [2 pts]',
        title: 'Euclidean Algorithm, Bézout’s Theorem & Primality Trial Division',
        points: 2,
        prompt: `(a) Use Euclidean algorithm to find gcd(24140, 16762), express it as s·24140 + t·16762, and find lcm(24140, 16762).
(b) Prove that if gcd(a, b) = 1, a | c, and b | c, then ab | c.
(c) Show 2¹¹ − 1 = 2047 is composite, and explain how many trial divisions suffice in the worst case to test 2047 for primality.`,
        promptVi:
          'Tìm gcd(24140, 16762), hệ số Bézout s, t, lcm, và phân tích 2047.',
        hints: [
          '24140 = 1·16762 + 7378; continue until remainder 0.',
          '√2047 ≈ 45.24, so test primes ≤ 43 (there are 14 primes: 2, 3, 5, ..., 43).',
        ],
        solution: `(a) Forward divisions:
  24140 = 1·16762 + 7378
  16762 = 2·7378 + 2006
  7378  = 3·2006 + 1360
  2006  = 1·1360 + 646
  1360  = 2·646 + 68
  646   = 9·68 + 34
  68    = 2·34 + 0
So gcd(24140, 16762) = 34.
Back-substitution yields: 34 = (−234)·24140 + (337)·16762.
lcm(24140, 16762) = (24140 · 16762) / 34 = 11,901,020.

(b) sa + tb = 1 ⇒ c = sa(bv) + tb(au) = ab(sv + tu) ⇒ ab | c.
(c) 2047 = 23 · 89, so 2¹¹ − 1 is NOT prime. Since ⌊√2047⌋ = 45, worst-case trial division checks all primes ≤ 45: {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43} — 14 trial divisions.`,
        solutionVi:
          'gcd = 34 = (-234)·24140 + 337·16762; lcm = 11,901,020; 2047 = 23·89.',
        relatedLab: 'number-theory',
      },
      {
        id: 'a2-q4',
        label: 'Q4 [2 pts]',
        title: 'Linear Congruences, CRT & Fermat’s Little Theorem',
        points: 2,
        prompt: `(a) Solve 144x ≡ 4 (mod 233) by finding an inverse of 144 mod 233 via Euclidean algorithm.
(b) Solve x ≡ 2 (mod 3), x ≡ 1 (mod 4), x ≡ 3 (mod 5) using the CRT construction x = ∑ a_k M_k y_k.
(c) Use Fermat's little theorem to compute 3^302 mod 5, mod 7, mod 11, then find 3^302 mod 385 via CRT.
(d) Show 341 = 11·31 satisfies 2^340 ≡ 1 (mod 341) and explain what this implies about the converse of Fermat's Little Theorem.`,
        promptVi:
          'Giải đồng dư tuyến tính, hệ CRT và ứng dụng định lý Fermat nhỏ.',
        hints: [
          '144 and 233 are consecutive Fibonacci numbers! 144⁻¹ mod 233 = 89.',
          'Note 385 = 5 · 7 · 11, and notice 3² = 9 satisfies 9 ≡ 4 (mod 5), 2 (mod 7), 9 (mod 11)!',
        ],
        solution: `(a) Euclidean algorithm gives 89·144 − 55·233 = 1, so 144⁻¹ ≡ 89 (mod 233).
Multiply by 89: x ≡ 89 · 4 = 356 ≡ 123 (mod 233). All solutions: x = 123 + 233k (k ∈ ℤ).

(b) M = 3·4·5 = 60.
  M₁ = 20, 20y₁ ≡ 1 (mod 3) ⇒ y₁ = 2  (term: 2·20·2 = 80)
  M₂ = 15, 15y₂ ≡ 1 (mod 4) ⇒ y₂ = 3  (term: 1·15·3 = 45)
  M₃ = 12, 12y₃ ≡ 1 (mod 5) ⇒ y₃ = 3  (term: 3·12·3 = 108)
  x ≡ 80 + 45 + 108 = 233 ≡ 53 (mod 60). Check: 53 mod 3 = 2, mod 4 = 1, mod 5 = 3.

(c) By Fermat's Little Theorem:
  • mod 5: 3⁴ ≡ 1 ⇒ 3^302 = (3⁴)^75 · 3² ≡ 9 ≡ 4 (mod 5).
  • mod 7: 3⁶ ≡ 1 ⇒ 3^302 = (3⁶)^50 · 3² ≡ 9 ≡ 2 (mod 7).
  • mod 11: 3¹⁰ ≡ 1 ⇒ 3^302 = (3¹⁰)^30 · 3² ≡ 9 (mod 11).
By CRT mod 385 = 5·7·11, x ≡ 9 (mod 385) satisfies all three congruences uniquely!

(d) 2¹⁰ = 1024 = 3·341 + 1 ≡ 1 (mod 341). Raising to the 34th power gives 2^340 = (2¹⁰)^34 ≡ 1 (mod 341).
Even though 2^340 ≡ 1 (mod 341), 341 = 11·31 is composite (a base-2 pseudoprime), proving the converse of Fermat's Little Theorem is FALSE.`,
        solutionVi:
          'Kết quả: (a) x ≡ 123 (mod 233), (b) x ≡ 53 (mod 60), (c) 3^302 ≡ 9 (mod 385), (d) 341 là số giả nguyên tố cơ số 2.',
        relatedLab: 'number-theory',
      },
      {
        id: 'a2-q5',
        label: 'Q5 [2.5 pts]',
        title: 'ISBN-10 Check Digit, Affine Cipher & RSA',
        points: 2.5,
        prompt: `(a) Find smudged digit Q in ISBN-10: 0-07-8Q0008-0, and explain uniqueness.
(b) Decrypt "JFFG JF DG GAF KSHYTF" produced by affine cipher f(p) = (ap + b) mod 26 assuming F=E and G=T.
(c) Alice's RSA public key is (n, e) = (119, 5) with A=0..Z=25:
  (i) Encrypt "GO".
  (ii) Factor n, compute decryption exponent d, and decrypt ciphertext "96 72 86".
  (iii) Explain why this key is insecure and what makes real RSA keys secure.`,
        promptVi:
          'Tìm chữ số ISBN-10 bị nhòe, phá mật mã Affine và mã hóa/giải mã RSA.',
        hints: [
          'In (a), 1·0 + 2·0 + 3·7 + 4·8 + 5Q + 9·8 = 125 + 5Q ≡ 4 + 5Q ≡ 0 (mod 11).',
          'In (b), E=4→F=5 and T=19→G=6 gives 15a ≡ −1 ≡ 25 (mod 26) or (−15)a ≡ 1 (mod 26) ⇒ a = 7.',
        ],
        solution: `(a) 3·7 + 4·8 + 5Q + 9·8 = 21 + 32 + 72 + 5Q = 125 + 5Q ≡ 4 + 5Q ≡ 0 (mod 11).
So 5Q ≡ 7 ≡ 40 (mod 11) ⇒ Q = 8. Unique because 11 is prime and gcd(5, 11) = 1, so 5 is invertible mod 11.

(b) E(4) → F(5) and T(19) → G(6):
  4a + b ≡ 5 (mod 26),  19a + b ≡ 6 (mod 26).
Subtracting: 15a ≡ 1 (mod 26) ⇒ a = 7 (since 15·7 = 105 = 4·26 + 1), and b ≡ 5 − 28 ≡ 3 (mod 26).
Inverse of a=7 mod 26 is 15, so f⁻¹(c) = 15(c − 3) mod 26.
Decrypting "JFFG JF DG GAF KSHYTF" yields: "MEET ME AT THE BRIDGE".

(c)
  (i) G = 6: 6⁵ mod 119 = 7776 mod 119 = 41.  O = 14: 14⁵ mod 119 = 63. Ciphertext: 41 63.
  (ii) 119 = 7 · 17, so φ(119) = 6 · 16 = 96. Inverse of e = 5 mod 96 is d = 77 (5·77 = 385 = 4·96 + 1).
       96⁷⁷ mod 119 = 24 (Y),  72⁷⁷ mod 119 = 4 (E),  86⁷⁷ mod 119 = 18 (S) → "YES".
  (iii) Small n = 119 is factored instantaneously by trial division, and single-letter encryption leaks letter frequencies. Real RSA uses 2048+ bit primes (making factoring intractable) plus randomized padding (OAEP).`,
        solutionVi:
          'Q = 8; bản rõ Affine là "MEET ME AT THE BRIDGE"; RSA "GO" → 41 63 và 96 72 86 → "YES".',
        relatedLab: 'number-theory',
      },
      {
        id: 'a2-q6',
        label: 'Q6 [1 pt Bonus]',
        title: 'Mersenne Primes & Primes of Form 4k + 3',
        points: 1,
        prompt: `(a) Prove that if 2ⁿ − 1 is prime, then n is prime. Together with Q3(c), what does this say about Mersenne primes?
(b) Prove there are infinitely many primes of the form 4k + 3.`,
        promptVi:
          'Chứng minh số nguyên tố Mersenne đòi hỏi n nguyên tố (nhưng chiều ngược lại sai với n=11) và có vô hạn số nguyên tố dạng 4k + 3.',
        hints: [
          'For (a), factor x^s − 1 = (x − 1)(x^{s-1} + ... + 1) with x = 2^r.',
        ],
        solution: `(a) Contrapositive: if n = rs with 1 < r < n (and s > 1), set x = 2^r. Then 2ⁿ − 1 = x^s − 1 = (2^r − 1)(2^{r(s-1)} + … + 1), where both factors exceed 1, so 2ⁿ − 1 is composite. Together with Q3(c) (2¹¹ − 1 = 23·89), n being prime is NECESSARY but NOT SUFFICIENT for 2ⁿ − 1 to be prime.
(b) Suppose p₁,…,pₘ are all primes ≡ 3 (mod 4) and form N = 4p₁···pₘ − 1 ≡ 3 (mod 4). Not all prime factors of N can be ≡ 1 (mod 4), so N has a prime factor q ≡ 3 (mod 4), which cannot divide 4p₁···pₘ (else q | 1).`,
        solutionVi:
          'n nguyên tố là điều kiện CẦN nhưng KHÔNG ĐỦ để 2ⁿ − 1 là số nguyên tố (phản ví dụ n = 11 cho 2047 = 23·89).',
        relatedProofId: 'proof-inf-primes-4k3',
      },
    ],
  },
  {
    id: 'a3',
    title: 'Assignment 3 — Relations',
    titleVi: 'Bài tập 3 — Quan hệ',
    chapter: 'ch9',
    totalPoints: '10 pts + 1 bonus',
    questions: [
      {
        id: 'a3-q1',
        label: 'Q1 [1.5 pts]',
        title: 'Counting Relations & Checking Properties',
        points: 1.5,
        prompt: `(a) For |A| = n, count relations that are (i) reflexive, (ii) symmetric, (iii) antisymmetric, (iv) both reflexive & symmetric. Evaluate for n = 3.
(b) Prove or disprove: (i) R, S transitive ⇒ R ∩ S transitive; (ii) R ∪ S transitive; (iii) R symmetric ⇔ R = R⁻¹.
(c) On ℝ, x R y ⇔ |x − y| ≤ 1. Classify its four properties.`,
        promptVi:
          'Đếm số quan hệ theo tính chất và chứng minh/bác bỏ tính chất của phép toán quan hệ.',
        hints: [
          'For n=3: reflexive = 2^6 = 64, symmetric = 2^6 = 64, antisymmetric = 2^3 · 3^3 = 216, both = 2^3 = 8.',
          'For (c), test x=0, y=1, z=2 for transitivity!',
        ],
        solution: `(a) For n=3:
  (i) Reflexive: 2^(n²−n) = 2⁶ = 64
  (ii) Symmetric: 2^(n(n+1)/2) = 2⁶ = 64
  (iii) Antisymmetric: 2ⁿ · 3^(n(n−1)/2) = 8 · 27 = 216
  (iv) Reflexive & Symmetric: 2^(n(n−1)/2) = 2³ = 8

(b)
  (i) TRUE (proved in Proofs Trainer).
  (ii) FALSE: A={1,2,3}, R={(1,2)}, S={(2,3)} are transitive, R∪S is not.
  (iii) TRUE: (x,y) ∈ R ⇔ (y,x) ∈ R⁻¹; symmetry says (x,y) ∈ R ⇔ (y,x) ∈ R, so R = R⁻¹.

(c) x R y ⇔ |x − y| ≤ 1 on ℝ:
  • Reflexive: YES (|x − x| = 0 ≤ 1).
  • Symmetric: YES (|y − x| = |x − y| ≤ 1).
  • Antisymmetric: NO (0 R 1 and 1 R 0, yet 0 ≠ 1).
  • Transitive: NO (0 R 1 and 1 R 2, yet |0 − 2| = 2 > 1).`,
        solutionVi:
          'Kiểm tra tính chất và phản ví dụ ngay trong Relations Lab.',
        relatedLab: 'relations',
      },
      {
        id: 'a3-q2',
        label: 'Q2 [2 pts]',
        title: 'Matrix Representation & Boolean Products',
        points: 2,
        prompt: `Given M_R on {1, 2, 3, 4}: rows [0,1,1,0], [0,0,1,0], [0,0,0,1], [1,0,0,0].
(a) Draw the directed graph of R.
(b) Compute M_{R²} = M_R ⊙ M_R and M_{R³}, and interpret row 4, col 3 of M_{R²}.
(c) Prove R transitive ⇔ R² ⊆ R, and decide if R is transitive.
(d) Find M_{R⁻¹} and M_{R ∪ R⁻¹}.`,
        promptVi:
          'Tính tích Boolean M_R², M_R³, giải thích đường đi và tìm bao đóng đối xứng.',
        hints: [
          'Entry (4,3) of M_{R²} equals 1 because of the path 4 → 1 → 3 of length 2.',
        ],
        solution: `(b)
  M_{R²} = [[0,0,1,1], [0,0,0,1], [1,0,0,0], [0,1,1,0]]
  M_{R³} = [[1,0,0,1], [1,0,0,0], [0,1,1,0], [0,0,1,1]]
  Row 4, col 3 of M_{R²} is 1, meaning there is a directed path of length 2 from 4 to 3 (specifically 4 → 1 → 3).

(c) R² ⊆ R ⇔ whenever (a,b),(b,c)∈R we have (a,c)∈R² ⊆ R ⇔ R is transitive. Here M_{R²}[1][4] = 1 while M_R[1][4] = 0, so R² ⊈ R and R is NOT transitive.

(d) M_{R⁻¹} = (M_R)^T = [[0,0,0,1], [1,0,0,0], [1,1,0,0], [0,0,1,0]].
    M_{R ∪ R⁻¹} = M_R ∨ M_{R⁻¹} = [[0,1,1,1], [1,0,1,0], [1,1,0,1], [1,0,1,0]].`,
        solutionVi:
          'Sử dụng chế độ Assignment Preset trong Relations Lab để xem đồ thị có hướng và kiểm tra từng ô ma trận.',
        relatedLab: 'relations',
      },
      {
        id: 'a3-q3',
        label: 'Q3 [2 pts]',
        title: 'Warshall’s Algorithm & Closure Order',
        points: 2,
        prompt: `(a) Use Warshall's algorithm to find the transitive closure of R = {(1,2),(2,3),(3,1),(3,4),(4,5),(5,4)} on {1,2,3,4,5}. Show W₀,…,W₅.
(b) Explain which vertices can reach which.
(c) For R = {(1,2),(3,2)} on {1,2,3}, compare Transitive(Symmetric(R)) vs. Symmetric(Transitive(R)).`,
        promptVi:
          'Chạy thuật toán Warshall W₀…W₅ và so sánh thứ tự lấy bao đóng.',
        hints: [
          '1→2→3→1 is a 3-cycle and 3→4↔5, so {1,2,3} can reach EVERY vertex, while {4,5} can only reach {4,5}.',
        ],
        solution: `(a)–(b) In W₅:
  • Rows 1, 2, 3 are all [1, 1, 1, 1, 1]: vertices 1, 2, 3 form a directed 3-cycle and connect into 3→4↔5, so each of {1,2,3} reaches all 5 vertices.
  • Rows 4, 5 are [0, 0, 0, 1, 1]: vertices 4 and 5 only reach {4, 5}.

(c) For R = {(1,2), (3,2)}:
  • Sym(R) = {(1,2),(2,1),(3,2),(2,3)}; its transitive closure adds (1,1),(2,2),(3,3),(1,3),(3,1) — ALL 9 pairs!
  • Trans(R) = R = {(1,2),(3,2)}; its symmetric closure is {(1,2),(2,1),(3,2),(2,3)}, which is NOT transitive (has (1,2) and (2,3) without (1,3)).
  Adding the diagonal makes the first one an equivalence relation, whereas the second is still not transitive!`,
        solutionVi:
          'Chạy từng bước W₀ → W₅ trong Relations Lab để nhìn rõ các cạnh mới được thêm ở mỗi bước k.',
        relatedLab: 'relations',
      },
      {
        id: 'a3-q4',
        label: 'Q4 [2 pts]',
        title: 'Equivalence Relations & Partitions',
        points: 2,
        prompt: `(a) On ℤ × (ℤ \\ {0}), (a,b) ~ (c,d) ⇔ ad = bc. Prove equivalence relation, describe [(1,2)], and explain quotient set.
(b) On bit strings of length ≥ 3, s R t ⇔ s and t agree in their first 3 bits. Count equivalence classes.
(c) Count equivalence relations on {1,2,3,4}, and those with exactly 2 classes.
(d) Prove R₁ ∩ R₂ is an equivalence relation, and give a counterexample for R₁ ∪ R₂.`,
        promptVi:
          'Chứng minh quan hệ tương đương, đếm lớp tương đương và số phân hoạch Bell B₄.',
        hints: [
          'For (b), there are 2³ = 8 possible 3-bit prefixes.',
          'For (c), partition {1,2,3,4} into 1, 2, 3, or 4 blocks: Bell number B₄ = 15, and 2-block partitions = S(4,2) = 7.',
        ],
        solution: `(a) Proved in Proofs Trainer; [(1,2)] = {(k, 2k) : k ≠ 0} represents 1/2, and classes represent ℚ.
(b) Reflexive, symmetric, transitive follow from equality of 3-bit prefixes. Number of classes = 2³ = 8.
(c) Partitions of 4 elements by number of blocks:
  1 block: 1  |  2 blocks: C(4,1) + C(4,2)/2 = 4 + 3 = 7  |  3 blocks: C(4,2) = 6  |  4 blocks: 1.
  Total = B₄ = 1 + 7 + 6 + 1 = 15 equivalence relations (7 with exactly 2 classes).
(d) R₁ ∩ R₂ inherits reflexivity, symmetry, transitivity from R₁ and R₂. For R₁ ∪ R₂, on {1,2,3} take R₁ equating {1,2} and R₂ equating {2,3}; their union lacks (1,3).`,
        solutionVi:
          'Tổng số quan hệ tương đương trên 4 phần tử là B₄ = 15, trong đó có 7 quan hệ có đúng 2 lớp.',
        relatedProofId: 'proof-equiv-fractions',
      },
      {
        id: 'a3-q5',
        label: 'Q5 [2.5 pts]',
        title: 'Partial Orderings, Hasse Diagrams & Topological Sort',
        points: 2.5,
        prompt: `(a) Draw Hasse diagram of positive divisors of 60 ordered by divisibility. Find a longest chain and largest antichain.
(b) For poset ({3,5,9,15,24,45}, |): find minimal, maximal, greatest, least, upper bounds & LUB of {3,5}, lower bounds & GLB of {15,45}.
(c) Find a topological sort of (b).
(d) Show divisibility on ℤ \\ {0} is NOT a partial order.`,
        promptVi:
          'Vẽ biểu đồ Hasse, tìm cực tiểu/cực đại/LUB/GLB và sắp xếp topo.',
        hints: [
          '60 = 2²·3·5 has 12 divisors; max chain length is 5 (e.g. 1|2|4|12|60), max antichain size is 4 (e.g. {4, 6, 10, 15}).',
          'On ℤ \\ {0}, 2 | (−2) and (−2) | 2, violating antisymmetry.',
        ],
        solution: `(a) Divisors of 60: {1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60}.
  Longest chain (size 5): 1 ≺ 2 ≺ 4 ≺ 12 ≺ 60.
  Largest antichain (size 4): {4, 6, 10, 15} (no element divides another).
(b) For ({3, 5, 9, 15, 24, 45}, |):
  • Minimal: 3, 5   • Maximal: 24, 45   • Least / Greatest: None
  • Upper bounds of {3,5}: {15, 45},  LUB{3,5} = 15
  • Lower bounds of {15,45}: {3, 5, 15},  GLB{15,45} = 15
(c) Valid topological sort: 3, 5, 9, 15, 24, 45 (or 5, 3, 15, 9, 45, 24).
(d) Antisymmetry fails on ℤ \\ {0}: 1 | −1 and −1 | 1, yet 1 ≠ −1.`,
        solutionVi:
          'Xem biểu đồ Hasse trực quan và kiểm tra thứ tự sắp xếp topo trong Relations Lab.',
        relatedLab: 'relations',
      },
      {
        id: 'a3-q6',
        label: 'Q6 [1 pt Bonus]',
        title: 'Minimal Elements & Lattices',
        points: 1,
        prompt: `(a) Prove every finite nonempty poset has a minimal element and explain why topological sort never gets stuck.
(b) Prove (ℤ⁺, |) is a lattice (LUB = lcm, GLB = gcd) and decide whether ({1,2,3,4,5,6}, |) is a lattice.`,
        promptVi:
          'Chứng minh tồn tại phần tử tối tiểu và kiểm tra tính chất Dàn (Lattice).',
        hints: [
          'In {1,2,3,4,5,6}, check the pair {2, 3}: its upper bound is 6, what about {4, 6} or {2, 5}?',
        ],
        solution: `(a) Proved in Proofs Trainer.
(b) In (ℤ⁺, |), any common multiple of a, b is divisible by lcm(a, b), so LUB(a,b) = lcm(a,b); any common divisor divides gcd(a,b), so GLB(a,b) = gcd(a,b). Hence (ℤ⁺, |) is a lattice.
In ({1,2,3,4,5,6}, |), the pair {2, 5} (or {4, 6}) has NO upper bound in the set (lcm(2,5) = 10 ∉ S), so it is NOT a lattice.`,
        solutionVi:
          '({1,2,3,4,5,6}, |) KHÔNG phải dàn vì cặp {2, 5} không có cận trên nào thuộc tập.',
        relatedProofId: 'proof-finite-poset-minimal',
      },
    ],
  },
  {
    id: 'a4',
    title: 'Assignment 4 — Graphs and Trees',
    titleVi: 'Bài tập 4 — Đồ thị và Cây',
    chapter: 'ch10',
    totalPoints: '10 points',
    questions: [
      {
        id: 'a4-q1',
        label: 'Q1 [1.5 pts]',
        title: 'Degree Sequences, Pigeonhole & Connectivity',
        points: 1.5,
        prompt: `(a) Decide if (i) 5,5,4,3,2,1 and (ii) 5,4,3,3,2,1 are graphical.
(b) Prove every simple graph with n ≥ 2 vertices has two vertices of the same degree.
(c) Prove a simple graph with n vertices and > C(n−1, 2) edges must be connected.`,
        promptVi:
          'Kiểm tra dãy bậc Havel-Hakimi, nguyên lý Dirichlet cho bậc đỉnh và ngưỡng liên thông.',
        hints: [
          'In (a-i), a degree-5 vertex in a 6-vertex simple graph connects to ALL 5 others, so no vertex can have degree 1 if two vertices have degree 5!',
          'In (c), use contraposition: if disconnected with components of sizes k and n−k (1 ≤ k ≤ n−1), max edges is C(k,2) + C(n−k,2) ≤ C(n−1,2).',
        ],
        solution: `(a)
  (i) 5,5,4,3,2,1 is NOT graphical: two vertices of degree 5 must each be adjacent to all 5 other vertices, forcing every other vertex to have degree ≥ 2 — contradicting the degree-1 vertex (or Havel-Hakimi: 5,5,4,3,2,1 → 4,3,2,1,0 → 2,1,0,-1).
  (ii) 5,4,3,3,2,1 IS graphical (Havel-Hakimi: 4,3,2,2,1 → 2,1,1,0 → 0,0,0).

(b) Proved in Proofs Trainer.
(c) Contrapositive: if G is disconnected, split V into nonempty A (size k) and B (size n−k) with no edges between them. Max edges ≤ C(k,2) + C(n−k,2) = C(n−1,2) − (k−1)(n−1−k) ≤ C(n−1,2).`,
        solutionVi:
          'Kiểm tra thuật toán Havel-Hakimi trực tiếp trong Graphs & Trees Lab.',
        relatedLab: 'graphs-trees',
      },
      {
        id: 'a4-q2',
        label: 'Q2 [2 pts]',
        title: 'Bipartite Graphs, Hall’s Marriage & Isomorphism',
        points: 2,
        prompt: `(a) For which n is the n-cube Q_n bipartite? Give an explicit bipartition.
(b) Five women & six men:
  (i) Find a complete matching from {A,B,C,D,E} to {J,K,L,M,N,O}.
  (ii) With A→{L,M}, B→{L}, E→{M}, prove via Hall's theorem no complete matching exists and find a maximum matching.
(c) Determine whether K_{3,3} and the prism graph are isomorphic.`,
        promptVi:
          'Chứng minh Q_n là đồ thị hai phía, định lý Hall và bất biến đẳng cấu.',
        hints: [
          'In Q_n, partition bit strings by parity (even vs. odd Hamming weight).',
          'In (b-ii), take S = {A, B, E}: |S| = 3, while N(S) = {L, M} has size 2 < 3!',
        ],
        solution: `(a) Q_n is bipartite for ALL n ≥ 1 (and trivially for n=0 if one part is empty): partition vertices (n-bit strings) into V₀ (even number of 1s) and V₁ (odd number of 1s). Every edge flips 1 bit, changing parity, so every edge crosses between V₀ and V₁.

(b)
  (i) Example complete matching: Anna–Larry, Barbara–Kevin, Carol–Nick, Diane–Oscar, Elizabeth–Jason.
  (ii) Let S = {Anna, Barbara, Elizabeth}. Then |S| = 3, while N(S) = {Larry, Matt} has |N(S)| = 2 < 3, violating Hall's Marriage Theorem! Maximum matching size = 4 (e.g., B–L, E–M, C–N, D–J).

(c) NOT isomorphic: the prism graph contains triangles (3-cycles), whereas K_{3,3} is bipartite so it has no odd cycles.`,
        solutionVi:
          'Tập S = {Anna, Barbara, Elizabeth} chỉ nối với 2 người nam {Larry, Matt}, vi phạm điều kiện Hall |N(S)| ≥ |S|.',
        relatedProofId: 'proof-k33-prism',
      },
      {
        id: 'a4-q3',
        label: 'Q3 [2 pts]',
        title: 'Dijkstra’s Shortest Path, Euler & Hamilton Circuits',
        points: 2,
        prompt: `(a) Graph on {a,b,c,d,e,z} with edges ab:3, ac:2, bc:2, bd:5, cd:8, ce:10, de:2, dz:6, ez:3. Use Dijkstra's algorithm from a to find shortest distance to every vertex and shortest path a → z.
(b) When does K_{m,n} have an Euler circuit? An Euler path (no circuit)?
(c) Prove if m ≠ n, K_{m,n} has no Hamilton circuit.`,
        promptVi:
          'Chạy bảng nhãn Dijkstra từ đỉnh a và điều kiện Euler/Hamilton trên K_{m,n}.',
        hints: [
          'Order settled in Dijkstra: a(0) → c(2) → b(3) → d(8) → e(10) → z(13).',
        ],
        solution: `(a) Dijkstra from a:
  • Final shortest distances: d(a)=0, d(c)=2, d(b)=3, d(d)=8, d(e)=10, d(z)=13.
  • Shortest path a → z: a → b → d → e → z (3 + 5 + 2 + 3 = 13).

(b) In K_{m,n}, m vertices have degree n and n vertices have degree m:
  • Euler circuit: both m and n are EVEN (with m,n ≥ 2).
  • Euler path (not circuit): exactly 2 odd-degree vertices, i.e., either (m = 2 and n is odd) or (n = 2 and m is odd), OR m = n = 1 (K_{1,1}).

(c) Proved in Proofs Trainer (Hamilton circuit alternates between both parts so m = n).`,
        solutionVi:
          'Thực hành điền từng dòng bảng Dijkstra trực tiếp trong Graphs & Trees Lab!',
        relatedLab: 'graphs-trees',
      },
      {
        id: 'a4-q4',
        label: 'Q4 [2 pts]',
        title: 'Trees, Prim/Kruskal MST & Expression Notation',
        points: 2,
        prompt: `(a) How many vertices and leaves does a full 5-ary tree with 100 internal vertices have?
(b) Prove every tree with n ≥ 2 vertices has at least 2 leaves.
(c) Find an MST of the Q3(a) graph via Prim (from a) and Kruskal. Give edge order and total weight.
(d) Do Dijkstra's shortest-path edges form an MST? Explain.
(e) Write prefix & postfix for ((x + 2) ↑ 3) · (y − (3 + x)) − 5, and evaluate postfix "7 2 3 * − 4 ↑ 9 3 / +".`,
        promptVi:
          'Cây 5-phân đầy đủ, thuật toán Prim/Kruskal, và biểu thức tiền tố/hậu tố.',
        hints: [
          'n = m·i + 1 = 5·100 + 1 = 501; leaves l = (m−1)i + 1 = 401.',
          'MST picks ac(2), bc(2), de(2), ez(3), bd(5) — notice Dijkstra took ab(3) instead of bc(2) + ac(2)!',
        ],
        solution: `(a) Full 5-ary tree with i = 100: n = 5·100 + 1 = 501 vertices; l = 4·100 + 1 = 401 leaves.
(b) Proved in Proofs Trainer.
(c) Total MST weight = 14:
  • Prim from a: ac(2), bc(2), bd(5), de(2), ez(3)  [total = 14]
  • Kruskal: ac(2), bc(2), de(2), ez(3), bd(5)       [total = 14]
(d) Dijkstra's shortest-path tree uses {ac(2), ab(3), bd(5), de(2), ez(3)}, weight = 15 > 14, so NO! Shortest-path tree minimizes individual path lengths from root a, while MST minimizes the total sum of all edge weights.
(e)
  • Prefix:  - * ↑ + x 2 3 - y + 3 x 5
  • Postfix: x 2 + 3 ↑ y 3 x + - * 5 -
  • Postfix eval (7 2 3 * − 4 ↑ 9 3 / +):
      2*3=6 → 7−6=1 → 1⁴=1 → 9/3=3 → 1+3 = 4.`,
        solutionVi:
          'Tổng trọng số MST = 14 (nhẹ hơn cây đường đi ngắn nhất có tổng = 15); giá trị biểu thức hậu tố bằng 4.',
        relatedLab: 'graphs-trees',
      },
    ],
  },
];
