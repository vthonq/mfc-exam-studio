import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createRng, randomSeedCode } from '../../math/prng';
import { binaryModExpSteps, extendedGcdSteps } from '../../math/numberTheory';
import { generateRandomRelationMatrix, warshallSteps } from '../../math/relations';
import {
  evaluatePostfix,
  generateExpressionProblem,
  postorder,
  preorder,
  type ExprNode,
} from '../../math/graphsTrees';
import { generateKmapProblem, validateKmap3Group } from '../../math/booleanAlgebra';
import { BiText } from '../BiText';

type TrainerSubMode = 'quantifiers' | 'tables-ch4' | 'warshall' | 'trees-kmap';

interface QuantifierItem {
  id: string;
  tag: string;
  question: string;
  questionVi: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  explanationVi: string;
}

const QUANTIFIER_ITEMS: QuantifierItem[] = [
  {
    id: 'qnt-1',
    tag: 'Universal + Implication vs Conjunction',
    question:
      'Let P(x): "x is in this class" and Q(x): "x studied Discrete Math". How do you translate "Every student in this class has studied Discrete Math"?',
    questionVi:
      'Cho P(x): "x học lớp này" và Q(x): "x đã học Toán rời rạc". Dịch câu: "Mọi sinh viên trong lớp này đều đã học Toán rời rạc"?',
    choices: [
      '∀x (P(x) → Q(x))',
      '∀x (P(x) ∧ Q(x))',
      '∃x (P(x) → Q(x))',
      '∀x (Q(x) → P(x))',
    ],
    correctIndex: 0,
    explanation:
      'Universal statements with a restricted group ALWAYS use → (∀x (P(x) → Q(x))). Using ∧ wrongly claims everyone in the universe is in this class!',
    explanationVi:
      'Với lượng từ ∀ bị giới hạn tập, luôn dùng kéo theo →. Dùng ∧ sẽ sai vì khẳng định mọi người trên thế giới đều học lớp này.',
  },
  {
    id: 'qnt-2',
    tag: 'Existential + Conjunction vs Implication',
    question:
      'Using P(x): "x is in this class" and R(x): "x owns a Mac", translate "Some student in this class owns a Mac":',
    questionVi:
      'Dùng P(x): "x học lớp này" và R(x): "x có máy Mac", dịch: "Có sinh viên trong lớp này sở hữu máy Mac":',
    choices: [
      '∃x (P(x) ∧ R(x))',
      '∃x (P(x) → R(x))',
      '∀x (P(x) ∧ R(x))',
      '∃x (¬P(x) ∨ R(x))',
    ],
    correctIndex: 0,
    explanation:
      'Existential statements with a restricted group ALWAYS use ∧ (∃x (P(x) ∧ R(x))). Using → would be vacuously true if just one person is outside the class!',
    explanationVi:
      'Với ∃ luôn dùng hội ∧. Nếu dùng →, chỉ cần 1 người ngoài lớp làm P(x) sai là cả biểu thức tự động đúng!',
  },
  {
    id: 'qnt-3',
    tag: 'Negating Nested Quantifiers',
    question: 'What is the logical negation of ∀x ∃y (x + y = 0)?',
    questionVi: 'Phủ định của mệnh đề ∀x ∃y (x + y = 0) là gì?',
    choices: [
      '∃x ∀y (x + y ≠ 0)',
      '∀x ∃y (x + y ≠ 0)',
      '∃x ∃y (x + y ≠ 0)',
      '∀x ∀y (x + y ≠ 0)',
    ],
    correctIndex: 0,
    explanation: 'De Morgan for quantifiers flips each quantifier: ¬∀x ∃y P ≡ ∃x ∀y ¬P.',
    explanationVi: 'Quy tắc De Morgan đảo mọi lượng từ từ ngoài vào trong: ¬∀x ∃y P ≡ ∃x ∀y ¬P.',
  },
  {
    id: 'qnt-4',
    tag: 'Quantifier Order Swap',
    question: 'Over real numbers ℝ, which statement is TRUE while the swapped-order version is FALSE?',
    questionVi: 'Trên tập số thực ℝ, mệnh đề nào ĐÚNG còn bản đảo thứ tự lượng từ lại SAI?',
    choices: [
      '∀x ∃y (x + y = 0) is TRUE; ∃y ∀x (x + y = 0) is FALSE',
      '∃y ∀x (x + y = 0) is TRUE; ∀x ∃y (x + y = 0) is FALSE',
      'Both ∀x ∃y (x + y = 0) and ∃y ∀x (x + y = 0) are TRUE',
      'Both are FALSE over ℝ',
    ],
    correctIndex: 0,
    explanation:
      'For every x we can pick y = −x (TRUE). There is NO single fixed y that cancels every x simultaneously (FALSE).',
    explanationVi:
      'Với mỗi x luôn chọn được y = −x (ĐÚNG), nhưng không có một y cố định nào cộng mọi x đều ra 0 (SAI).',
  },
  {
    id: 'qnt-5',
    tag: 'Conditional Translation Trap',
    question: 'Which logic formula expresses "You pass ONLY IF you submit all 4 assignments" (p: pass, s: submit)?',
    questionVi: 'Biểu thức nào dịch đúng câu "Bạn qua môn CHỈ KHI bạn nộp đủ 4 bài tập" (p: qua, s: nộp)?',
    choices: ['p → s', 's → p', 'p ∧ s', '¬s ∨ ¬p'],
    correctIndex: 0,
    explanation: '"p only if s" always means p → s (s is a necessary condition for p).',
    explanationVi: '"p chỉ khi s" luôn viết là p → s (s là điều kiện cần để có p).',
  },
  {
    id: 'qnt-6',
    tag: 'Conditional Translation Trap',
    question: 'Which logic formula expresses "A connected graph has an Euler circuit IF every vertex has even degree" (c: Euler circuit, e: even degree)?',
    questionVi: 'Dịch câu "Đồ thị liên thông có chu trình Euler NẾU mọi đỉnh có bậc chẵn" (c: có chu trình Euler, e: mọi đỉnh bậc chẵn):',
    choices: ['e → c', 'c → e', 'e ⊕ c', '¬c → e'],
    correctIndex: 0,
    explanation: '"c if e" means "If e, then c", i.e. e → c (note the biconditional actually holds too for connected multigraphs!).',
    explanationVi: '"c nếu e" chính là "Nếu e thì c", viết e → c.',
  },
  {
    id: 'qnt-7',
    tag: 'Vacuous Truth in Logic',
    question: 'If domain = empty set ∅ (no elements satisfy P(x)), what is the truth value of ∀x (P(x) → Q(x))?',
    questionVi: 'Nếu không có phần tử nào thỏa P(x), giá trị chân lý của ∀x (P(x) → Q(x)) là gì?',
    choices: [
      'True (vacuously true)',
      'False',
      'Undetermined / Contradiction',
      'Depends on Q(x)',
    ],
    correctIndex: 0,
    explanation: 'When hypothesis P(x) is false, P(x) → Q(x) evaluates to True automatically (vacuous proof).',
    explanationVi: 'Khi giả thiết P(x) luôn sai, phép kéo theo P(x) → Q(x) đúng một cách rỗng (vacuously true).',
  },
  {
    id: 'qnt-8',
    tag: 'Translating "No X is Y"',
    question: 'How do you translate "No integer squared equals −1" over domain ℤ?',
    questionVi: 'Dịch câu "Không có số nguyên nào bình phương bằng −1" trên tập ℤ:',
    choices: [
      '∀x (x² ≠ −1)  [equivalently ¬∃x (x² = −1)]',
      '∃x (x² ≠ −1)',
      '¬∀x (x² = −1)',
      '∀x (x² = −1)',
    ],
    correctIndex: 0,
    explanation: '"No x satisfies P(x)" is ¬∃x P(x) ≡ ∀x ¬P(x), NOT ¬∀x P(x) (which only means "not all").',
    explanationVi: '"Không có x nào..." là ¬∃x P(x) ≡ ∀x ¬P(x), chú ý phân biệt với ¬∀x P(x) (chỉ là "không phải tất cả").',
  },
];

const GRAY_COLS = [
  { label: '00', y: 0, z: 0 },
  { label: '01', y: 0, z: 1 },
  { label: '11', y: 1, z: 1 },
  { label: '10', y: 1, z: 0 },
];

function renderTreeInline(node: ExprNode): string {
  if (!node.left && !node.right) return node.label;
  return `(${node.label}: ${node.left ? renderTreeInline(node.left) : '_'}, ${node.right ? renderTreeInline(node.right) : '_'})`;
}

export const MfcExamTrainersLab: React.FC = () => {
  const { recordPractice, recordMistake } = useApp();
  const [subMode, setSubMode] = useState<TrainerSubMode>('quantifiers');

  // --- Mode 1: Quantifiers ---
  const [qIdx, setQIdx] = useState(0);
  const [qPick, setQPick] = useState<number | null>(null);

  // --- Mode 2: Ch.4 Blank Tables (ExtGCD + ModExp) ---
  const [ch4Seed, setCh4Seed] = useState('NT2026');
  const ch4Data = useMemo(() => {
    const rng = createRng(`ch4-trainer:${ch4Seed}`);
    const a = rng.int(85, 220);
    const b = rng.int(27, Math.min(a - 12, 79));
    const gcdProb = extendedGcdSteps(a, b);
    const base = rng.pick([3, 5, 7]);
    const exp = rng.int(19, 31);
    const mod = rng.pick([11, 13, 17, 19]);
    const modProb = binaryModExpSteps(base, exp, mod);
    return { a, b, gcdProb, base, exp, mod, modProb };
  }, [ch4Seed]);

  const [gcdInputs, setGcdInputs] = useState<Record<string, string>>({});
  const [gcdChecked, setGcdChecked] = useState(false);
  const [gcdReveal, setGcdReveal] = useState(false);

  const [modInputs, setModInputs] = useState<Record<string, string>>({});
  const [modChecked, setModChecked] = useState(false);
  const [modReveal, setModReveal] = useState(false);

  // --- Mode 3: Ch.9 Warshall Blank Matrix ---
  const [warSeed, setWarSeed] = useState('WAR26');
  const [targetStep, setTargetStep] = useState<1 | 2 | 3 | 4>(4);
  const warData = useMemo(() => {
    const m0 = generateRandomRelationMatrix(`war:${warSeed}`, 4);
    const steps = warshallSteps(m0);
    return { m0, steps };
  }, [warSeed]);
  const [userMat, setUserMat] = useState<number[][]>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [warChecked, setWarChecked] = useState(false);
  const [warReveal, setWarReveal] = useState(false);

  // --- Mode 4: Ch.11-12 Trees + Interactive K-Map ---
  const [tkSeed, setTkSeed] = useState('TK26');
  const tkData = useMemo(() => {
    const expr = generateExpressionProblem(`expr:${tkSeed}`);
    const preAns = preorder(expr.tree).join(' ');
    const postAns = postorder(expr.tree).join(' ');
    const evalRes = evaluatePostfix(expr.postfixEvalTokens);
    const kmap = generateKmapProblem(`kmap:${tkSeed}`);
    return { expr, preAns, postAns, evalRes, kmap };
  }, [tkSeed]);

  const [preInput, setPreInput] = useState('');
  const [postInput, setPostInput] = useState('');
  const [evalInput, setEvalInput] = useState('');
  const [treeChecked, setTreeChecked] = useState(false);

  const [kSelected, setKSelected] = useState<number[]>([]);
  const [kVerdict, setKVerdict] = useState<{ valid: boolean; term: string; reason: string } | null>(
    null,
  );
  const [kShowOpt, setKShowOpt] = useState(false);

  const curQ = QUANTIFIER_ITEMS[qIdx];

  const resetCh4 = () => {
    setCh4Seed(randomSeedCode());
    setGcdInputs({});
    setGcdChecked(false);
    setGcdReveal(false);
    setModInputs({});
    setModChecked(false);
    setModReveal(false);
  };

  const resetWarshall = () => {
    setWarSeed(randomSeedCode());
    setUserMat([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    setWarChecked(false);
    setWarReveal(false);
  };

  const resetTreeKmap = () => {
    setTkSeed(randomSeedCode());
    setPreInput('');
    setPostInput('');
    setEvalInput('');
    setTreeChecked(false);
    setKSelected([]);
    setKVerdict(null);
    setKShowOpt(false);
  };

  const targetMatrix = warData.steps[targetStep] ?? warData.steps[warData.steps.length - 1];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              MFC Step-by-Step Blank-Table &amp; Trap Trainers
            </h2>
            <BiText
              en="Practice filling intermediate exam steps yourself (instead of only reading answers)."
              vi="Tự điền các bước trung gian như đi thi thật để tránh mất điểm oan vì sai sót tính toán."
              className="text-xs text-slate-500 mt-0.5"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(
              [
                { id: 'quantifiers', label: 'Ch.1 · Quantifier Traps' },
                { id: 'tables-ch4', label: 'Ch.4 · ExtGCD & ModExp' },
                { id: 'warshall', label: 'Ch.9 · Warshall Matrix' },
                { id: 'trees-kmap', label: 'Ch.11–12 · Trees & K-Map' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setSubMode(m.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  subMode === m.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MODE 1: QUANTIFIERS */}
      {subMode === 'quantifiers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-indigo-600">
              Question {qIdx + 1} / {QUANTIFIER_ITEMS.length} · {curQ.tag}
            </span>
            <div className="flex gap-1.5">
              {QUANTIFIER_ITEMS.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setQIdx(i);
                    setQPick(null);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    i === qIdx
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <BiText en={curQ.question} vi={curQ.questionVi} className="text-sm font-semibold" />

          <div className="grid sm:grid-cols-2 gap-2.5">
            {curQ.choices.map((ch, idx) => {
              const answered = qPick !== null;
              const isCorr = idx === curQ.correctIndex;
              const isChosen = qPick === idx;
              let cls = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400';
              if (answered) {
                if (isCorr) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                else if (isChosen) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
              }
              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => {
                    setQPick(idx);
                    const ok = idx === curQ.correctIndex;
                    recordPractice('ch1', ok);
                    if (!ok) {
                      recordMistake({
                        id: `mfc-qnt-${curQ.id}`,
                        subject: 'mfc',
                        topicLabel: `Ch. 1 · ${curQ.tag}`,
                        question: curQ.question,
                        choices: curQ.choices,
                        correctIndex: curQ.correctIndex,
                        userAnswerText: ch,
                        explanation: curQ.explanation,
                        source: 'mistake',
                      });
                    }
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-mono flex items-center justify-between gap-2 cursor-pointer ${cls}`}
                >
                  <span>
                    <strong>{String.fromCharCode(65 + idx)}.</strong> {ch}
                  </span>
                  {answered && isCorr && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {answered && isChosen && !isCorr && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {qPick !== null && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex flex-wrap items-center justify-between gap-3">
              <BiText en={curQ.explanation} vi={curQ.explanationVi} />
              <button
                onClick={() => {
                  setQIdx((i) => (i + 1) % QUANTIFIER_ITEMS.length);
                  setQPick(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold shrink-0 cursor-pointer"
              >
                Next Trap →
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CH.4 BLANK TABLES */}
      {subMode === 'tables-ch4' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={resetCh4}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Randomized Ch.4 Drills
            </button>
          </div>

          {/* Euclidean Division Blank Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">
              1) Blank Euclidean Algorithm Table: Find gcd({ch4Data.a}, {ch4Data.b})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-left text-slate-500">
                    <th className="p-2">Step</th>
                    <th className="p-2">Dividend a =</th>
                    <th className="p-2">q (quotient)</th>
                    <th className="p-2">· b +</th>
                    <th className="p-2">r (remainder)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ch4Data.gcdProb.divisions.map((st, idx) => {
                    const qKey = `q-${idx}`;
                    const rKey = `r-${idx}`;
                    const qOk = gcdChecked && Number(gcdInputs[qKey]) === st.quotient;
                    const rOk = gcdChecked && Number(gcdInputs[rKey]) === st.remainder;
                    return (
                      <tr key={idx}>
                        <td className="p-2 text-slate-400">#{idx + 1}</td>
                        <td className="p-2 font-bold">{st.dividend} =</td>
                        <td className="p-2">
                          <input
                            value={gcdInputs[qKey] ?? ''}
                            onChange={(e) =>
                              setGcdInputs((p) => ({ ...p, [qKey]: e.target.value }))
                            }
                            placeholder="q"
                            className={`w-16 px-2 py-1 rounded border bg-white dark:bg-slate-950 ${
                              gcdChecked
                                ? qOk
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </td>
                        <td className="p-2">· {st.divisor} +</td>
                        <td className="p-2">
                          <input
                            value={gcdInputs[rKey] ?? ''}
                            onChange={(e) =>
                              setGcdInputs((p) => ({ ...p, [rKey]: e.target.value }))
                            }
                            placeholder="r"
                            className={`w-16 px-2 py-1 rounded border bg-white dark:bg-slate-950 ${
                              gcdChecked
                                ? rOk
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <label className="font-mono flex items-center gap-2">
                Final gcd:
                <input
                  value={gcdInputs.gcd ?? ''}
                  onChange={(e) => setGcdInputs((p) => ({ ...p, gcd: e.target.value }))}
                  className={`w-20 px-2 py-1 rounded border bg-white dark:bg-slate-950 ${
                    gcdChecked
                      ? Number(gcdInputs.gcd) === ch4Data.gcdProb.gcd
                        ? 'border-emerald-500'
                        : 'border-rose-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </label>
              <button
                onClick={() => {
                  setGcdChecked(true);
                  const allOk =
                    Number(gcdInputs.gcd) === ch4Data.gcdProb.gcd &&
                    ch4Data.gcdProb.divisions.every(
                      (st, idx) =>
                        Number(gcdInputs[`q-${idx}`]) === st.quotient &&
                        Number(gcdInputs[`r-${idx}`]) === st.remainder,
                    );
                  recordPractice('ch4', allOk);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
              >
                Check Euclidean Table
              </button>
              <button
                onClick={() => setGcdReveal((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> {gcdReveal ? 'Hide' : 'Reveal'} Steps
              </button>
            </div>

            {gcdReveal && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-0.5">
                {ch4Data.gcdProb.divisions.map((st, idx) => (
                  <div key={idx}>
                    {st.dividend} = {st.quotient} · {st.divisor} + {st.remainder}
                  </div>
                ))}
                <div className="font-bold text-emerald-700 dark:text-emerald-300 pt-1">
                  gcd = {ch4Data.gcdProb.gcd} = ({ch4Data.gcdProb.s})·{ch4Data.a} + ({ch4Data.gcdProb.t})·{ch4Data.b}
                </div>
              </div>
            )}
          </div>

          {/* Binary Modular Exponentiation Blank Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">
              2) Binary Modular Exponentiation Table: Compute {ch4Data.base}^{ch4Data.exp} mod {ch4Data.mod}{' '}
              <span className="font-mono text-xs text-slate-500">
                (exp = ({ch4Data.modProb.binaryMsb})₂)
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-left text-slate-500">
                    <th className="p-2">Bit j</th>
                    <th className="p-2">a_j</th>
                    <th className="p-2">power mod m</th>
                    <th className="p-2">x after bit j</th>
                    <th className="p-2">next power² mod m</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ch4Data.modProb.steps.map((st) => {
                    const xKey = `x-${st.j}`;
                    const pKey = `p-${st.j}`;
                    const xOk = modChecked && Number(modInputs[xKey]) === st.xAfter;
                    const pOk = modChecked && Number(modInputs[pKey]) === st.nextPower;
                    return (
                      <tr key={st.j}>
                        <td className="p-2 text-slate-400">j={st.j}</td>
                        <td className="p-2 font-bold">{st.bit}</td>
                        <td className="p-2">{st.powerVal}</td>
                        <td className="p-2">
                          <input
                            value={modInputs[xKey] ?? ''}
                            onChange={(e) =>
                              setModInputs((p) => ({ ...p, [xKey]: e.target.value }))
                            }
                            placeholder="x"
                            className={`w-20 px-2 py-1 rounded border bg-white dark:bg-slate-950 ${
                              modChecked
                                ? xOk
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={modInputs[pKey] ?? ''}
                            onChange={(e) =>
                              setModInputs((p) => ({ ...p, [pKey]: e.target.value }))
                            }
                            placeholder="pwr²"
                            className={`w-20 px-2 py-1 rounded border bg-white dark:bg-slate-950 ${
                              modChecked
                                ? pOk
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                  : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => {
                  setModChecked(true);
                  const allOk = ch4Data.modProb.steps.every(
                    (st) =>
                      Number(modInputs[`x-${st.j}`]) === st.xAfter &&
                      Number(modInputs[`p-${st.j}`]) === st.nextPower,
                  );
                  recordPractice('ch4', allOk);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
              >
                Check ModExp Table
              </button>
              <button
                onClick={() => setModReveal((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> {modReveal ? 'Hide' : 'Reveal'} Table
              </button>
            </div>
            {modReveal && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-0.5">
                {ch4Data.modProb.steps.map((st) => (
                  <div key={st.j}>
                    j={st.j} (bit={st.bit}, power={st.powerVal}): x={st.xAfter}, nextPower={st.nextPower}
                  </div>
                ))}
                <div className="font-bold text-emerald-700 dark:text-emerald-300">
                  Final Answer = {ch4Data.modProb.result}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: CH.9 WARSHALL CLICKABLE MATRIX */}
      {subMode === 'warshall' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm">
                Warshall Transitive Closure Click-to-Fill Trainer (Ch. 9)
              </h3>
              <p className="text-xs text-slate-500">
                Given W₀ = M_R on the left, click cells on the right to build{' '}
                <strong>W{targetStep}</strong> {targetStep === 4 ? '(Transitive Closure M_R*)' : `(using intermediate vertices ≤ ${targetStep})`}.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center text-xs">
              {([1, 2, 3, 4] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setTargetStep(k);
                    setWarChecked(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer ${
                    targetStep === k
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  W{k}
                </button>
              ))}
              <button
                onClick={resetWarshall}
                className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New W₀
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 items-start">
            <div>
              <div className="text-xs font-mono font-bold mb-2 text-slate-500">
                Given W₀ = M_R (4×4)
              </div>
              <div className="inline-grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                {warData.m0.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-10 h-10 rounded-lg font-mono text-sm font-bold flex items-center justify-center ${
                        val === 1
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {val}
                    </div>
                  )),
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Your W{targetStep} (click cells to toggle 0 / 1)
                </span>
                <button
                  onClick={() => setUserMat(warData.m0.map((r) => [...r]))}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  Copy W₀ as Start
                </button>
              </div>
              <div className="inline-grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                {userMat.map((row, r) =>
                  row.map((val, c) => {
                    const expected = targetMatrix[r][c];
                    const match = val === expected;
                    let cellCls =
                      val === 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-300 dark:border-slate-700';
                    if (warChecked) {
                      cellCls = match
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                        : 'bg-rose-600 text-white ring-2 ring-rose-300';
                    }
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => {
                          setWarChecked(false);
                          setUserMat((prev) =>
                            prev.map((rr, ri) =>
                              ri === r ? rr.map((cc, ci) => (ci === c ? (cc ? 0 : 1) : cc)) : rr,
                            ),
                          );
                        }}
                        className={`w-10 h-10 rounded-lg font-mono text-sm font-bold cursor-pointer transition-colors ${cellCls}`}
                      >
                        {val}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setWarChecked(true);
                const allOk = userMat.every((row, r) =>
                  row.every((v, c) => v === targetMatrix[r][c]),
                );
                recordPractice('ch9', allOk);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
            >
              Check W{targetStep}
            </button>
            <button
              onClick={() => setWarReveal((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> {warReveal ? 'Hide' : 'Reveal'} Exact W{targetStep}
            </button>
          </div>

          {warReveal && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <div className="font-bold">Expected W{targetStep}:</div>
              {targetMatrix.map((row, r) => (
                <div key={r}>[ {row.join('  ')} ]</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 4: CH.11-12 TREES & INTERACTIVE K-MAP */}
      {subMode === 'trees-kmap' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={resetTreeKmap}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Tree &amp; K-Map
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">1) Tree Traversal &amp; Postfix Evaluation (Ch. 11)</h3>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <div>
                <strong>Expression Tree (nested):</strong> {renderTreeInline(tkData.expr.tree)}
              </div>
              <div>
                <strong>Postfix Stack Tokens to Evaluate:</strong>{' '}
                {tkData.expr.postfixEvalTokens.join(' ')}
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
              <label>
                Preorder (space-separated)
                <input
                  value={preInput}
                  onChange={(e) => setPreInput(e.target.value)}
                  placeholder="e.g. + * - x 3 ..."
                  className={`mt-1 w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-950 ${
                    treeChecked
                      ? preInput.trim() === tkData.preAns
                        ? 'border-emerald-500'
                        : 'border-rose-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </label>
              <label>
                Postorder (space-separated)
                <input
                  value={postInput}
                  onChange={(e) => setPostInput(e.target.value)}
                  placeholder="e.g. x 3 - ..."
                  className={`mt-1 w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-950 ${
                    treeChecked
                      ? postInput.trim() === tkData.postAns
                        ? 'border-emerald-500'
                        : 'border-rose-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </label>
              <label>
                Postfix Eval Numeric Result
                <input
                  value={evalInput}
                  onChange={(e) => setEvalInput(e.target.value)}
                  placeholder="Integer result..."
                  className={`mt-1 w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-950 ${
                    treeChecked
                      ? evalInput.trim() !== '' && Number(evalInput) === tkData.evalRes.result
                        ? 'border-emerald-500'
                        : 'border-rose-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              </label>
            </div>
            <button
              onClick={() => {
                setTreeChecked(true);
                const ok =
                  preInput.trim() === tkData.preAns &&
                  postInput.trim() === tkData.postAns &&
                  evalInput.trim() !== '' &&
                  Number(evalInput) === tkData.evalRes.result;
                recordPractice('ch11', ok);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
            >
              Check Tree Answers
            </button>
            {treeChecked && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-0.5">
                <div>Preorder: {tkData.preAns}</div>
                <div>Postorder: {tkData.postAns}</div>
                <div>Postfix Eval Result: {tkData.evalRes.result}</div>
              </div>
            )}
          </div>

          {/* Interactive K-Map Click-to-Group */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">
              2) Interactive 3-Variable K-Map Grouping Validator (Ch. 12)
            </h3>
            <p className="text-xs text-slate-500">
              Click 1-cells to test whether your chosen group forms a valid rectangle/wrap-around
              implicant, then check the minimal SOP!
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs font-mono border-collapse">
                <thead>
                  <tr className="text-slate-500">
                    <th className="p-2">x \ yz</th>
                    {GRAY_COLS.map((c) => (
                      <th key={c.label} className="p-2 text-center">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1].map((xVal) => (
                    <tr key={xVal}>
                      <td className="p-2 font-bold text-slate-500">x = {xVal}</td>
                      {GRAY_COLS.map((col) => {
                        const idx = (xVal << 2) | (col.y << 1) | col.z;
                        const bit = tkData.kmap.truthVector[idx];
                        const sel = kSelected.includes(idx);
                        return (
                          <td key={idx} className="p-1">
                            <button
                              onClick={() => {
                                setKVerdict(null);
                                setKSelected((prev) =>
                                  prev.includes(idx)
                                    ? prev.filter((x) => x !== idx)
                                    : [...prev, idx],
                                );
                              }}
                              className={`w-14 h-12 rounded-xl border font-bold cursor-pointer flex flex-col items-center justify-center ${
                                sel
                                  ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-300'
                                  : bit === 1
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              <span className="text-sm">{bit}</span>
                              <span className="text-[9px] opacity-70">m{idx}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => {
                  const res = validateKmap3Group(kSelected, tkData.kmap.truthVector);
                  setKVerdict(res);
                  recordPractice('ch12', res.valid);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
              >
                Validate Selected Group
              </button>
              <button
                onClick={() => {
                  setKSelected([]);
                  setKVerdict(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setKShowOpt((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> {kShowOpt ? 'Hide' : 'Reveal'} Minimal SOP
              </button>
            </div>

            {kVerdict && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  kVerdict.valid
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                {kVerdict.valid ? (
                  <span>
                    Valid implicant! Simplified product term: <strong className="font-mono">{kVerdict.term}</strong>
                  </span>
                ) : (
                  kVerdict.reason
                )}
              </div>
            )}

            {kShowOpt && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-mono">
                Optimal Minimal SOP: <strong>F(x, y, z) = {tkData.kmap.optimalSop}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
