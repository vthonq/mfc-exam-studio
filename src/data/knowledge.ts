import type { ChapterId } from '../types';

export interface KnowledgeItem {
  id: string;
  chapter: ChapterId;
  section: string;
  title: string;
  titleVi: string;
  summary: string;
  summaryVi: string;
  formulas: string[];
  example?: string;
  examTrap?: string;
  examTrapVi?: string;
  relatedLab?: string;
}

export interface GlossaryTerm {
  en: string;
  vi: string;
  chapter: ChapterId;
  note: string;
}

export const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  // ================= CHAPTER 1 =================
  {
    id: 'ch1-connectives',
    chapter: 'ch1',
    section: '1.1 – 1.2',
    title: 'Propositional Connectives & Conditional Variants',
    titleVi: 'Các phép nối logic & Các biến thể của phép kéo theo',
    summary:
      'An implication p → q is false ONLY when p is True and q is False. Related forms: Converse (q → p), Inverse (¬p → ¬q), Contrapositive (¬q → ¬p ≡ p → q). "p unless q" means ¬q → p ≡ p ∨ q.',
    summaryVi:
      'Phép kéo theo p → q chỉ sai khi p đúng và q sai. Mệnh đề đảo: q → p; phản đảo: ¬q → ¬p (luôn tương đương với p → q). "p trừ khi q" tương đương ¬q → p ≡ p ∨ q.',
    formulas: [
      'p \\to q \\equiv \\neg p \\lor q \\equiv \\neg q \\to \\neg p',
      'p \\leftrightarrow q \\equiv (p \\to q) \\land (q \\to p)',
      '\\neg(p \\to q) \\equiv p \\land \\neg q',
    ],
    examTrap:
      '"Whenever q, p" and "p if q" both translate to q → p, whereas "p only if q" translates to p → q.',
    examTrapVi:
      '"Bất cứ khi nào q thì p" và "p nếu q" dịch là q → p; còn "p chỉ khi q" mới dịch là p → q.',
    relatedLab: 'logic',
  },
  {
    id: 'ch1-equivalences',
    chapter: 'ch1',
    section: '1.3',
    title: 'Key Logical Equivalences & Tautologies',
    titleVi: 'Các tương đương logic & Hằng đúng quan trọng',
    summary:
      'A compound proposition is a tautology if it is always True, a contradiction if always False, and a contingency otherwise. Use De Morgan, Distributive, and Absorption laws to simplify expressions.',
    summaryVi:
      'Mệnh đề phức hợp là hằng đúng (tautology) nếu luôn đúng, hằng sai (contradiction) nếu luôn sai. Dùng luật De Morgan, phân phối và hấp thụ để biến đổi.',
    formulas: [
      '\\neg(p \\land q) \\equiv \\neg p \\lor \\neg q, \\quad \\neg(p \\lor q) \\equiv \\neg p \\land \\neg q',
      'p \\land (q \\lor r) \\equiv (p \\land q) \\lor (p \\land r)',
      'p \\lor (p \\land q) \\equiv p, \\quad p \\land (p \\lor q) \\equiv p',
    ],
    relatedLab: 'logic',
  },
  {
    id: 'ch1-quantifiers',
    chapter: 'ch1',
    section: '1.4 – 1.5',
    title: 'Predicates, Nested Quantifiers & Negation',
    titleVi: 'Vị từ, Lượng từ lồng nhau & Phủ định lượng từ',
    summary:
      'Universal statements ∀x P(x) take → for restricted domains: ∀x (S(x) → P(x)). Existential statements ∃x P(x) take ∧: ∃x (S(x) ∧ P(x)). Quantifier order matters: ∀x ∃y ≠ ∃y ∀x.',
    summaryVi:
      'Lượng từ với mọi ∀x thường đi với kéo theo →; lượng từ tồn tại ∃x thường đi với phép hội ∧. Thứ tự lượng từ rất quan trọng: ∀x ∃y khác ∃y ∀x.',
    formulas: [
      '\\neg \\forall x\\, P(x) \\equiv \\exists x\\, \\neg P(x)',
      '\\neg \\exists x\\, P(x) \\equiv \\forall x\\, \\neg P(x)',
      '\\neg \\forall x\\, \\exists y\\, P(x,y) \\equiv \\exists x\\, \\forall y\\, \\neg P(x,y)',
    ],
    examTrap:
      'Never write ∃x (Student(x) → KnowsCPP(x))! A non-student makes Student(x) false, making the implication vacuously true.',
    examTrapVi:
      'Không viết ∃x (Student(x) → KnowsCPP(x)) vì một đối tượng không phải sinh viên sẽ làm vế trái sai và phép kéo theo tự động đúng!',
    relatedLab: 'logic',
  },
  {
    id: 'ch1-inference-proofs',
    chapter: 'ch1',
    section: '1.6 – 1.8',
    title: 'Rules of Inference & Proof Strategies',
    titleVi: 'Quy tắc suy diễn & Các phương pháp chứng minh',
    summary:
      'Always name each inference rule on the exam: Modus Ponens (p, p→q ⊢ q), Modus Tollens (¬q, p→q ⊢ ¬p), Hypothetical Syllogism, Disjunctive Syllogism, Simplification, Addition, Resolution, and Universal/Existential Instantiation. Proof methods for p → q: Direct (assume p, deduce q), Contraposition (assume ¬q, deduce ¬p), Contradiction (assume p ∧ ¬q, derive r ∧ ¬r).',
    summaryVi:
      'Luôn ghi rõ tên quy tắc suy diễn trong bài thi. Ba chiến lược chứng minh p → q: Trực tiếp (giả sử p, suy ra q), Phản đảo (giả sử ¬q, suy ra ¬p), Phản chứng (giả sử p ∧ ¬q, suy ra mâu thuẫn).',
    formulas: [
      '\\text{Modus Ponens: } (p \\land (p \\to q)) \\to q',
      '\\text{Modus Tollens: } (\\neg q \\land (p \\to q)) \\to \\neg p',
      '\\text{Resolution: } ((p \\lor q) \\land (\\neg p \\lor r)) \\to (q \\lor r)',
    ],
    examTrap:
      'To disprove ∀x P(x), ONE counterexample suffices. Never try to "prove" a universal claim by testing a few examples.',
    examTrapVi:
      'Chỉ cần 1 phản ví dụ để bác bỏ ∀x P(x), nhưng không bao giờ được dùng vài ví dụ cụ thể để chứng minh mệnh đề ∀x.',
  },

  // ================= CHAPTER 4 =================
  {
    id: 'ch4-mod-exp',
    chapter: 'ch4',
    section: '4.1 – 4.2',
    title: 'Modular Arithmetic & Binary Modular Exponentiation',
    titleVi: 'Số học đồng dư & Lũy thừa modulo nhị phân',
    summary:
      'a ≡ b (mod m) iff m | (a − b). To compute b^n mod m, write n in binary (LSB to MSB: a_0, a_1, ...), initialize x = 1 and power = b mod m, multiply x by power whenever a_j = 1, and square power mod m at each step.',
    summaryVi:
      'a ≡ b (mod m) khi m | (a − b). Để tính b^n mod m, biểu diễn n ở hệ nhị phân, khởi tạo x = 1, power = b mod m; ở bước j nếu bit a_j = 1 thì nhân x với power (mod m), sau đó bình phương power (mod m).',
    formulas: [
      'a \\equiv b \\pmod m \\iff m \\mid (a - b)',
      'b^n \\bmod m = \\prod_{a_j = 1} \\left(b^{2^j} \\bmod m\\right) \\pmod m',
      'N = \\sum_{i=0}^{k} d_i 10^i \\equiv \\sum_{i=0}^{k} d_i \\pmod 9',
    ],
    examTrap:
      'Cancellation fails unless gcd(c, m) = 1: ac ≡ bc (mod m) only implies a ≡ b (mod m / gcd(c, m)).',
    examTrapVi:
      'Không được giản ước c trong ac ≡ bc (mod m) trừ khi gcd(c, m) = 1!',
    relatedLab: 'number-theory',
  },
  {
    id: 'ch4-gcd-bezout',
    chapter: 'ch4',
    section: '4.3',
    title: 'Primes, Euclidean Algorithm & Bézout’s Theorem',
    titleVi: 'Số nguyên tố, Thuật toán Euclid & Định lý Bézout',
    summary:
      'Every composite n has a prime factor ≤ √n. The Euclidean algorithm computes gcd(a, b) via repeated division a = bq + r. Working backwards expresses gcd(a, b) = s·a + t·b (Bézout coefficients).',
    summaryVi:
      'Mọi hợp số n đều có ước nguyên tố ≤ √n. Thuật toán Euclid chia liên tiếp để tìm gcd(a, b); thế ngược lại để tìm hệ số Bézout s, t sao cho s·a + t·b = gcd(a, b).',
    formulas: [
      '\\gcd(a, b) = s a + t b',
      '\\gcd(a, b) \\cdot \\operatorname{lcm}(a, b) = |ab|',
      '\\gcd(a, b)=1 \\land a \\mid c \\land b \\mid c \\implies ab \\mid c',
    ],
    relatedLab: 'number-theory',
  },
  {
    id: 'ch4-crt-flt',
    chapter: 'ch4',
    section: '4.4',
    title: 'Linear Congruences, CRT & Fermat’s Little Theorem',
    titleVi: 'Đồng dư tuyến tính, Định lý Số dư Trung Hoa & Fermat nhỏ',
    summary:
      'ax ≡ b (mod m) has a unique solution mod m when gcd(a, m) = 1: multiply by ā (the inverse of a mod m). For pairwise coprime m_1,...,m_k, CRT guarantees a unique solution mod M = ∏ m_k via x ≡ ∑ a_k M_k y_k (mod M) where M_k = M/m_k and M_k y_k ≡ 1 (mod m_k).',
    summaryVi:
      'Phương trình ax ≡ b (mod m) có nghiệm duy nhất mod m khi gcd(a, m) = 1 bằng cách nhân với nghịch đảo ā. Định lý Số dư Trung Hoa (CRT) giải hệ đồng dư khi các môđun đôi một nguyên tố cùng nhau.',
    formulas: [
      'x \\equiv \\sum_{k} a_k M_k y_k \\pmod M, \\quad M_k = \\frac{M}{m_k}, \\quad M_k y_k \\equiv 1 \\pmod{m_k}',
      'p \\text{ prime},\\ p \\nmid a \\implies a^{p-1} \\equiv 1 \\pmod p',
    ],
    examTrap:
      'The converse of Fermat’s Little Theorem is FALSE! Composite pseudoprimes like 341 = 11·31 satisfy 2^340 ≡ 1 (mod 341).',
    examTrapVi:
      'Đảo của định lý Fermat nhỏ là SAI! Ví dụ 341 = 11·31 là hợp số nhưng vẫn thỏa 2^340 ≡ 1 (mod 341).',
    relatedLab: 'number-theory',
  },
  {
    id: 'ch4-crypto',
    chapter: 'ch4',
    section: '4.5 – 4.6',
    title: 'ISBN-10 Check Digits, Affine Cipher & RSA',
    titleVi: 'Mã kiểm tra ISBN-10, Mật mã Affine & RSA',
    summary:
      'ISBN-10 satisfies ∑ (i = 1..10) i·xᵢ ≡ 0 (mod 11). Affine cipher encrypts p ↦ (ap + b) mod 26 (requires gcd(a, 26) = 1) and decrypts c ↦ a⁻¹(c − b) mod 26. RSA uses n = pq, φ(n) = (p−1)(q−1), ed ≡ 1 (mod φ(n)), C = Mᵉ mod n, M = Cᵈ mod n.',
    summaryVi:
      'ISBN-10 thỏa ∑ (i = 1..10) i·xᵢ ≡ 0 (mod 11). Mật mã Affine mã hóa (ap + b) mod 26 (cần gcd(a, 26) = 1). RSA chọn n = pq, d = e⁻¹ mod (p−1)(q−1).',
    formulas: [
      '\\sum_{i=1}^{10} i x_i \\equiv 0 \\pmod{11}',
      'f(p) = (ap + b) \\bmod 26, \\quad f^{-1}(c) = a^{-1}(c - b) \\bmod 26',
      'ed \\equiv 1 \\pmod{(p-1)(q-1)}, \\quad C \\equiv M^e \\pmod n, \\quad M \\equiv C^d \\pmod n',
    ],
    relatedLab: 'number-theory',
  },

  // ================= CHAPTER 9 =================
  {
    id: 'ch9-properties',
    chapter: 'ch9',
    section: '9.1 – 9.3',
    title: 'Relation Properties, Counting & Matrix Products',
    titleVi: 'Tính chất quan hệ, Đếm số quan hệ & Tích ma trận Boolean',
    summary:
      'On an n-element set: Reflexive (diagonal all 1s), Symmetric (M = Mᵀ), Antisymmetric (mᵢⱼ = 1 ∧ mⱼᵢ = 1 ⇒ i = j), Transitive (R² ⊆ R, i.e., M(R²) ≤ M(R)). Compositions use Boolean matrix multiplication ⊙.',
    summaryVi:
      'Trên tập n phần tử: Phản xạ (đường chéo chính toàn 1), Đối xứng (M = Mᵀ), Phản đối xứng (không có cặp đối xứng khác nhau), Bắc cầu (R² ⊆ R). Hợp quan hệ dùng tích Boolean ⊙.',
    formulas: [
      '\\text{Reflexive: } 2^{n^2-n}, \\quad \\text{Symmetric: } 2^{n(n+1)/2}',
      '\\text{Antisymmetric: } 2^n \\cdot 3^{n(n-1)/2}, \\quad \\text{Refl. \\& Sym.: } 2^{n(n-1)/2}',
      '(M_R \\odot M_S)_{ij} = \\bigvee_{k=1}^n (m_{ik} \\land s_{kj})',
    ],
    examTrap:
      'Antisymmetric is NOT the opposite of symmetric! A relation can be both (e.g. diagonal {(1,1),(2,2)}) or neither.',
    examTrapVi:
      'Phản đối xứng KHÔNG phải là phủ định của đối xứng! Một quan hệ có thể vừa đối xứng vừa phản đối xứng, hoặc không thỏa cả hai.',
    relatedLab: 'relations',
  },
  {
    id: 'ch9-warshall-eq',
    chapter: 'ch9',
    section: '9.4 – 9.5',
    title: 'Closures, Warshall’s Algorithm & Equivalence Classes',
    titleVi: 'Bao đóng, Thuật toán Warshall & Lớp tương đương',
    summary:
      'Warshall computes transitive closure via Wₖ[i][j] = Wₖ₋₁[i][j] ∨ (Wₖ₋₁[i][k] ∧ Wₖ₋₁[k][j]) for k = 1..n. An equivalence relation (reflexive, symmetric, transitive) partitions a set into disjoint equivalence classes; the count on n elements is the Bell number Bₙ (B₃ = 5, B₄ = 15).',
    summaryVi:
      'Thuật toán Warshall tìm bao đóng bắc cầu qua các ma trận W₀..Wₙ. Quan hệ tương đương (phản xạ, đối xứng, bắc cầu) phân hoạch tập hợp thành các lớp rời nhau (đếm bằng số Bell Bₙ).',
    formulas: [
      'w_{ij}^{[k]} = w_{ij}^{[k-1]} \\lor (w_{ik}^{[k-1]} \\land w_{kj}^{[k-1]})',
      'R \\text{ symmetric closure} = R \\cup R^{-1}',
      'B_0=1, B_1=1, B_2=2, B_3=5, B_4=15',
    ],
    examTrap:
      'Closure order matters! Symmetric(Transitive(R)) is NOT always transitive; Transitive(Symmetric(R)) plus diagonal gives an equivalence relation.',
    examTrapVi:
      'Thứ tự lấy bao đóng rất quan trọng: bao đóng đối xứng của bao đóng bắc cầu có thể mất tính bắc cầu!',
    relatedLab: 'relations',
  },
  {
    id: 'ch9-posets',
    chapter: 'ch9',
    section: '9.6',
    title: 'Partial Orders, Hasse Diagrams, Bounds & Lattices',
    titleVi: 'Thứ tự bộ phận, Biểu đồ Hasse, Cận & Dàn (Lattice)',
    summary:
      'A poset (S, ≼) is reflexive, antisymmetric, transitive. Hasse diagrams omit self-loops and transitive edges and orient edges upward. A poset is a lattice iff every pair {a, b} has both a LUB (join) and a GLB (meet).',
    summaryVi:
      'Tập thứ tự bộ phận (poset) thỏa phản xạ, phản đối xứng, bắc cầu. Biểu đồ Hasse bỏ khuyên tự thân và cạnh bắc cầu. Poset là dàn (lattice) nếu mọi cặp {a, b} đều có cận trên đúng (LUB) và cận dưới đúng (GLB).',
    formulas: [
      '\\text{In } (\\mathbb{Z}^+, \\mid): \\operatorname{lub}(a,b) = \\operatorname{lcm}(a,b), \\quad \\operatorname{glb}(a,b) = \\gcd(a,b)',
    ],
    examTrap:
      'Maximal ≠ Greatest! A poset can have multiple maximal elements and NO greatest element (e.g., 24 and 45 in {3,5,9,15,24,45}).',
    examTrapVi:
      'Phần tử tối đại (maximal) khác phần tử lớn nhất (greatest)! Có thể có nhiều phần tử tối đại mà không có phần tử lớn nhất.',
    relatedLab: 'relations',
  },

  // ================= CHAPTER 10 =================
  {
    id: 'ch10-degrees-bipartite',
    chapter: 'ch10',
    section: '10.1 – 10.3',
    title: 'Handshaking, Degree Sequences, Bipartite Graphs & Isomorphism',
    titleVi: 'Định lý bắt tay, Dãy bậc, Đồ thị hai phía & Đẳng cấu',
    summary:
      'Sum of degrees = 2|E| (even number of odd-degree vertices). Havel-Hakimi tests whether a degree sequence is graphical. A graph is bipartite iff it has no odd cycles. Hall’s Marriage Theorem: a complete matching from V₁ to V₂ exists iff |N(S)| ≥ |S| for all S ⊆ V₁. To disprove isomorphism, exhibit a differing invariant (vertices, edges, degree sequence, subgraph cycle lengths, bipartiteness).',
    summaryVi:
      'Tổng bậc bằng 2|E|. Đồ thị hai phía tương đương với không có chu trình độ dài lẻ. Định lý Hall: có cặp ghép đầy đủ từ V₁ sang V₂ khi mọi S ⊆ V₁ đều có |N(S)| ≥ |S|. Chứng minh không đẳng cấu bằng bất biến (số đỉnh, cạnh, dãy bậc, chu trình).',
    formulas: [
      '\\sum_{v \\in V} \\deg(v) = 2|E|',
      '|N(S)| \\ge |S| \\quad \\forall S \\subseteq V_1 \\text{ (Hall’s Condition)}',
      'Q_n: |V| = 2^n,\\ |E| = n 2^{n-1},\\text{ always bipartite for } n \\ge 1',
    ],
    relatedLab: 'graphs-trees',
  },
  {
    id: 'ch10-euler-hamilton-dijkstra',
    chapter: 'ch10',
    section: '10.5 – 10.6',
    title: 'Euler vs. Hamilton & Dijkstra’s Shortest Path',
    titleVi: 'Đường đi Euler / Hamilton & Thuật toán Dijkstra',
    summary:
      'Euler circuit: connected + every vertex has even degree (uses every EDGE once). Euler path (not circuit): connected + exactly 2 odd-degree vertices. Hamilton circuit visits every VERTEX once (no simple degree characterization; for K_{m,n}, requires m = n ≥ 2). Dijkstra finds shortest paths from a single source in non-negative weighted graphs.',
    summaryVi:
      'Chu trình Euler đi qua mọi CẠNH đúng 1 lần (mọi đỉnh bậc chẵn). Chu trình Hamilton đi qua mọi ĐỈNH đúng 1 lần (với K_{m,n} cần m = n ≥ 2). Dijkstra tìm đường đi ngắn nhất từ 1 đỉnh nguồn.',
    formulas: [
      'K_{m,n} \\text{ has Euler circuit} \\iff m, n \\text{ both even } (m,n \\ge 2)',
      'K_{m,n} \\text{ has Hamilton circuit} \\iff m = n \\ge 2',
    ],
    relatedLab: 'graphs-trees',
  },

  // ================= CHAPTER 11 =================
  {
    id: 'ch11-trees-traversal',
    chapter: 'ch11',
    section: '11.1 – 11.3',
    title: 'Tree Properties, Full m-ary Trees & Expression Traversals',
    titleVi: 'Tính chất cây, Cây m-phân đầy đủ & Duyệt biểu thức',
    summary:
      'A tree on n vertices is connected with no simple circuits and has exactly n − 1 edges. A full m-ary tree with i internal vertices has n = m·i + 1 total vertices and l = (m − 1)i + 1 leaves. Preorder (root, left, right) gives prefix notation; Postorder (left, right, root) gives postfix (RPN).',
    summaryVi:
      'Cây n đỉnh có đúng n − 1 cạnh và không có chu trình đơn. Cây m-phân đầy đủ có i đỉnh trong thì có n = mi + 1 đỉnh và l = (m−1)i + 1 lá. Duyệt tiền thứ tự cho tiền tố (prefix), hậu thứ tự cho hậu tố (postfix).',
    formulas: [
      '|E| = |V| - 1',
      'n = m i + 1, \\quad l = (m - 1) i + 1, \\quad n = l + i',
    ],
    relatedLab: 'graphs-trees',
  },
  {
    id: 'ch11-mst',
    chapter: 'ch11',
    section: '11.4 – 11.5',
    title: 'Spanning Trees, Prim’s & Kruskal’s MST Algorithms',
    titleVi: 'Cây khung & Thuật toán Prim / Kruskal',
    summary:
      'Prim grows a single tree from a start vertex by repeatedly adding the cheapest edge crossing the tree/non-tree cut. Kruskal sorts all edges by weight and adds the cheapest edge that does not form a cycle until n − 1 edges are chosen. A shortest-path tree (Dijkstra) minimizes root-to-v distances, NOT total edge weight (MST).',
    summaryVi:
      'Prim mở rộng một cây từ đỉnh gốc bằng cạnh nhẹ nhất nối vào đỉnh chưa thăm. Kruskal xét cạnh từ nhẹ đến nặng, chọn cạnh không tạo chu trình. Lưu ý: Cây đường đi ngắn nhất (Dijkstra) khác với Cây khung nhỏ nhất (MST)!',
    formulas: [
      '\\text{MST has } |V| - 1 \\text{ edges minimizing } \\sum_{e \\in T} w(e)',
    ],
    relatedLab: 'graphs-trees',
  },

  // ================= CHAPTER 12 =================
  {
    id: 'ch12-boolean-sop',
    chapter: 'ch12',
    section: '12.1 – 12.2',
    title: 'Boolean Identities, Duality & Sum-of-Products (DNF)',
    titleVi: 'Hằng đẳng thức Boolean, Nguyên lý đối ngẫu & Dạng tuyển chuẩn (SOP)',
    summary:
      'There are 2^{2^n} Boolean functions of degree n. The dual of an expression swaps + with · and 0 with 1. Every Boolean function has a unique Sum-of-Products expansion obtained by summing the minterms for every row where F = 1. {NAND} and {NOR} are each functionally complete.',
    summaryVi:
      'Có 2^{2^n} hàm Boolean n biến. Biểu thức đối ngẫu đổi + ↔ · và 0 ↔ 1. Dạng tổng các tích (SOP) lấy tổng các minterm tại các dòng có F = 1. Cổng {NAND} hoặc {NOR} đơn lẻ đã đầy đủ hàm.',
    formulas: [
      '\\text{Count of } n\\text{-var Boolean functions} = 2^{2^n}',
      'x \\mid y = \\overline{xy}, \\quad \\bar{x} = x \\mid x, \\quad x \\downarrow y = \\overline{x+y}',
    ],
    relatedLab: 'boolean',
  },
  {
    id: 'ch12-kmap',
    chapter: 'ch12',
    section: '12.3 – 12.4',
    title: 'Logic Gates & Karnaugh Map Minimization',
    titleVi: 'Cổng logic & Tối giản hàm bằng bìa Karnaugh (K-Map)',
    summary:
      'K-Maps order column/row labels in Gray code (11, 10, 00, 01 or 00, 01, 11, 10) so adjacent cells differ in exactly 1 variable. Cover all 1s with the fewest, largest power-of-2 rectangles (1, 2, 4, 8), wrapping around edges.',
    summaryVi:
      'Bìa Karnaugh sắp xếp theo mã Gray sao cho hai ô kề nhau (kể cả quấn biên) chỉ khác đúng 1 biến. Gom các số 1 thành hình chữ nhật kích thước lũy thừa của 2 (1, 2, 4, 8) lớn nhất và ít nhóm nhất.',
    formulas: [
      '\\text{Group of } 2^k \\text{ cells in } n\\text{-var K-map eliminates } k \\text{ variables}',
    ],
    examTrap:
      'Columns MUST follow Gray code (only 1 bit changes between neighbors), NOT binary 00, 01, 10, 11!',
    examTrapVi:
      'Các cột bắt buộc phải xếp theo mã Gray (chỉ đổi 1 bit giữa hai cột liền kề), không xếp 00, 01, 10, 11!',
    relatedLab: 'boolean',
  },
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  { en: 'Proposition', vi: 'Mệnh đề', chapter: 'ch1', note: 'Declarative sentence that is True or False' },
  { en: 'Tautology', vi: 'Hằng đúng', chapter: 'ch1', note: 'Always True under every truth assignment' },
  { en: 'Contradiction', vi: 'Hằng sai (Mâu thuẫn)', chapter: 'ch1', note: 'Always False' },
  { en: 'Contrapositive', vi: 'Mệnh đề phản đảo', chapter: 'ch1', note: '¬q → ¬p (equivalent to p → q)' },
  { en: 'Converse', vi: 'Mệnh đề đảo', chapter: 'ch1', note: 'q → p (not equivalent to p → q)' },
  { en: 'Universal Quantifier (∀)', vi: 'Lượng từ với mọi', chapter: 'ch1', note: 'Holds for every element in domain' },
  { en: 'Existential Quantifier (∃)', vi: 'Lượng từ tồn tại', chapter: 'ch1', note: 'Holds for at least one element' },
  { en: 'Rule of Inference', vi: 'Quy tắc suy diễn', chapter: 'ch1', note: 'Valid step deriving conclusion from premises' },
  { en: 'Proof by Contradiction', vi: 'Chứng minh phản chứng', chapter: 'ch1', note: 'Assume negation and derive impossibility' },
  { en: 'Counterexample', vi: 'Phản ví dụ', chapter: 'ch1', note: 'Single instance disproving a ∀ claim' },
  { en: 'Congruence (mod m)', vi: 'Đồng dư theo môđun m', chapter: 'ch4', note: 'a ≡ b (mod m) iff m | (a − b)' },
  { en: 'Greatest Common Divisor', vi: 'Ước chung lớn nhất (ƯCLN)', chapter: 'ch4', note: 'gcd(a, b)' },
  { en: 'Relatively Prime / Coprime', vi: 'Nguyên tố cùng nhau', chapter: 'ch4', note: 'gcd(a, b) = 1' },
  { en: 'Bézout Coefficients', vi: 'Hệ số Bézout', chapter: 'ch4', note: 'Integers s, t with sa + tb = gcd(a, b)' },
  { en: 'Modular Inverse', vi: 'Nghịch đảo modulo', chapter: 'ch4', note: 'a⁻¹ mod m such that a·a⁻¹ ≡ 1 (mod m)' },
  { en: 'Chinese Remainder Theorem', vi: 'Định lý Số dư Trung Hoa', chapter: 'ch4', note: 'Unique solution mod M = ∏ m_k' },
  { en: 'Fermat’s Little Theorem', vi: 'Định lý Fermat nhỏ', chapter: 'ch4', note: 'a^(p−1) ≡ 1 (mod p) for prime p ∤ a' },
  { en: 'Pseudoprime', vi: 'Số giả nguyên tố', chapter: 'ch4', note: 'Composite n passing b^(n−1) ≡ 1 (mod n)' },
  { en: 'Reflexive', vi: 'Phản xạ', chapter: 'ch9', note: '(a, a) ∈ R for all a ∈ A' },
  { en: 'Symmetric', vi: 'Đối xứng', chapter: 'ch9', note: '(a, b) ∈ R ⇒ (b, a) ∈ R' },
  { en: 'Antisymmetric', vi: 'Phản đối xứng', chapter: 'ch9', note: '(a, b) ∈ R ∧ (b, a) ∈ R ⇒ a = b' },
  { en: 'Transitive', vi: 'Bắc cầu', chapter: 'ch9', note: '(a, b) ∈ R ∧ (b, c) ∈ R ⇒ (a, c) ∈ R' },
  { en: 'Transitive Closure', vi: 'Bao đóng bắc cầu', chapter: 'ch9', note: 'Smallest transitive relation containing R' },
  { en: 'Equivalence Relation', vi: 'Quan hệ tương đương', chapter: 'ch9', note: 'Reflexive + Symmetric + Transitive' },
  { en: 'Partition', vi: 'Phân hoạch', chapter: 'ch9', note: 'Disjoint nonempty subsets covering A' },
  { en: 'Partial Order (Poset)', vi: 'Thứ tự bộ phận', chapter: 'ch9', note: 'Reflexive + Antisymmetric + Transitive' },
  { en: 'Hasse Diagram', vi: 'Biểu đồ Hasse', chapter: 'ch9', note: 'Minimal upward drawing of a finite poset' },
  { en: 'Maximal / Minimal Element', vi: 'Phần tử tối đại / tối tiểu', chapter: 'ch9', note: 'No element strictly above / below it' },
  { en: 'LUB / GLB', vi: 'Cận trên đúng / Cận dưới đúng', chapter: 'ch9', note: 'Join (sup) and Meet (inf)' },
  { en: 'Lattice', vi: 'Dàn', chapter: 'ch9', note: 'Poset where every pair has both LUB and GLB' },
  { en: 'Topological Sort', vi: 'Sắp xếp topo', chapter: 'ch9', note: 'Total order compatible with a partial order' },
  { en: 'Degree Sequence', vi: 'Dãy bậc', chapter: 'ch10', note: 'Sorted list of vertex degrees' },
  { en: 'Bipartite Graph', vi: 'Đồ thị hai phía', chapter: 'ch10', note: 'Vertices split into V₁, V₂ with no intra-edges' },
  { en: 'Complete Matching', vi: 'Cặp ghép đầy đủ', chapter: 'ch10', note: 'Matching covering every vertex in V₁' },
  { en: 'Graph Isomorphism', vi: 'Đẳng cấu đồ thị', chapter: 'ch10', note: 'Edge-preserving bijection between vertex sets' },
  { en: 'Euler Circuit / Path', vi: 'Chu trình / Đường đi Euler', chapter: 'ch10', note: 'Visits every edge exactly once' },
  { en: 'Hamilton Circuit / Path', vi: 'Chu trình / Đường đi Hamilton', chapter: 'ch10', note: 'Visits every vertex exactly once' },
  { en: 'Full m-ary Tree', vi: 'Cây m-phân đầy đủ', chapter: 'ch11', note: 'Every internal vertex has exactly m children' },
  { en: 'Preorder / Postorder', vi: 'Tiền thứ tự / Hậu thứ tự', chapter: 'ch11', note: 'Produces prefix / postfix notation' },
  { en: 'Spanning Tree', vi: 'Cây khung', chapter: 'ch11', note: 'Tree subgraph containing all vertices' },
  { en: 'Minimum Spanning Tree', vi: 'Cây khung nhỏ nhất (MST)', chapter: 'ch11', note: 'Spanning tree of minimum total edge weight' },
  { en: 'Minterm', vi: 'Minterm (Tích cực tiểu)', chapter: 'ch12', note: 'Product of all n literals equal to 1 at 1 row' },
  { en: 'Sum-of-Products (SOP)', vi: 'Dạng tổng các tích', chapter: 'ch12', note: 'Disjunctive normal form of a Boolean function' },
  { en: 'Functional Completeness', vi: 'Đầy đủ hàm', chapter: 'ch12', note: 'Operator set able to represent every Boolean fn' },
  { en: 'Karnaugh Map (K-Map)', vi: 'Bìa Karnaugh', chapter: 'ch12', note: 'Gray-code grid for minimizing Boolean SOPs' },
];
