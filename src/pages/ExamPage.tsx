import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { createRng, randomSeedCode } from '../math/prng';
import { generateTruthTable } from '../math/logic';
import {
  binaryModExpSteps,
  extendedGcdSteps,
  solveCRT,
  solveIsbn10Missing,
} from '../math/numberTheory';
import {
  booleanProduct,
  buildDivisorPoset,
  countRelations,
  generateRandomRelationMatrix,
} from '../math/relations';
import {
  dijkstraSteps,
  evaluatePostfix,
  fullMaryTreeCalc,
  generateWeightedGraph,
  havelHakimiSteps,
  kruskalSteps,
} from '../math/graphsTrees';
import { generateKmapProblem } from '../math/booleanAlgebra';
import { PROOF_EXERCISES } from '../data/proofs';
import { useApp } from '../context/AppContext';
import { CHAPTER_META, type ChapterId } from '../types';
import { GraphSvg } from '../components/GraphSvg';
import { gradeProofWithGemini, type ProofGradeResult } from '../services/geminiGrader';
import {
  analyzeWrittenProofOffline,
  buildCopyableGradingPrompt,
  type OfflineCheckResult,
} from '../utils/offlineProofChecker';
import { clearExamDraft, loadExamDraft, saveExamDraft } from '../utils/examDraft';
import { MathKeypad } from '../components/MathKeypad';
import { ExamStickyBar } from '../components/ExamStickyBar';

type MfcDraftBySeed = MfcExamDraft;

interface ExamQuestion {
  id: string;
  chapter: ChapterId;
  points: number;
  title: string;
  prompt: string;
  type: 'text' | 'choice' | 'proof';
  choices?: string[];
  expected?: string;
  solutionText: string;
  graphData?: ReturnType<typeof generateWeightedGraph>;
  proofRef?: (typeof PROOF_EXERCISES)[number];
}

function generateExamFromSeed(seed: string, mode: 'full' | 'sprint'): ExamQuestion[] {
  const rng = createRng(`exam-${seed}-${mode}`);

  // Q1: Ch1 Logic classification
  const formulas = [
    '(p ∧ q) → (p → q)',
    '¬(p → q) → p',
    '(p → q) ∧ (q → r)',
    '((p → q) ∧ ¬q) → ¬p',
    '(p ∨ q) ∧ ¬p',
  ];
  const f = rng.pick(formulas);
  const tt = generateTruthTable(f);
  const q1: ExamQuestion = {
    id: 'q1',
    chapter: 'ch1',
    points: 1.5,
    title: 'Q1 — Propositional Logic Classification',
    prompt: `Construct the truth table for ${f} and classify it.`,
    type: 'choice',
    choices: ['tautology', 'contradiction', 'contingency'],
    expected: tt.classification,
    solutionText: `Truth table across ${tt.rows.length} rows evaluates to ${tt.classification.toUpperCase()}.`,
  };

  // Q2: Ch4 ModExp + ExtGCD
  const base = rng.pick([3, 5, 7, 11]);
  const exp = rng.int(65, 190);
  const mod = rng.pick([221, 299, 391, 437]);
  const me = binaryModExpSteps(base, exp, mod);

  const ga = rng.int(140, 420);
  const gb = rng.int(55, ga - 20);
  const eg = extendedGcdSteps(ga, gb);

  const q2: ExamQuestion = {
    id: 'q2',
    chapter: 'ch4',
    points: 1.5,
    title: 'Q2 — Binary Modular Exponentiation',
    prompt: `Compute ${base}^${exp} mod ${mod} using binary modular exponentiation. Enter the final integer remainder.`,
    type: 'text',
    expected: String(me.result),
    solutionText: `${exp} = (${me.binaryMsb})₂; running modular squares give ${me.result}.`,
  };

  const q3: ExamQuestion = {
    id: 'q3',
    chapter: 'ch4',
    points: 1.5,
    title: 'Q3 — GCD & CRT / ISBN-10',
    prompt: `Find gcd(${ga}, ${gb}) using the Euclidean algorithm (also verify Bézout coefficients in your work).`,
    type: 'text',
    expected: String(eg.gcd),
    solutionText: `gcd(${ga}, ${gb}) = ${eg.gcd} = (${eg.s})·${ga} + (${eg.t})·${gb}.`,
  };

  // Q4: Ch9 Relations & Posets
  const relN = rng.int(3, 4);
  const counts = countRelations(relN);
  const posetSet = rng.pick([
    [2, 3, 6, 12, 18],
    [3, 5, 9, 15, 45],
    [1, 2, 3, 4, 5, 6],
  ]);
  const poset = buildDivisorPoset(posetSet);
  const q4: ExamQuestion = {
    id: 'q4',
    chapter: 'ch9',
    points: 1.5,
    title: 'Q4 — Relations & Lattices',
    prompt: `How many equivalence relations exist on a set of ${relN} elements? (Also check: is ({${posetSet.join(',')}}, |) a lattice? It is ${poset.isLattice ? 'YES' : 'NO'}). Enter the count:`,
    type: 'text',
    expected: String(counts.equivalence),
    solutionText: `Bell number B(${relN}) = ${counts.equivalence}. Lattice: ${poset.isLattice ? 'Yes' : 'No'}.`,
  };

  // Q5: Ch10 Dijkstra
  const g = generateWeightedGraph(`${seed}-graph`);
  const dijk = dijkstraSteps(g, 'a');
  const q5: ExamQuestion = {
    id: 'q5',
    chapter: 'ch10',
    points: 1.5,
    title: 'Q5 — Dijkstra’s Shortest Path',
    prompt: `For the weighted graph below, run Dijkstra's algorithm starting at vertex a. What is the shortest distance from a to z?`,
    type: 'text',
    expected: String(dijk.distances['z']),
    graphData: g,
    solutionText: `Shortest path a → z is ${dijk.reconstructPath('z').join(' → ')} with total length ${dijk.distances['z']}.`,
  };

  // Q6: Ch11 MST & Full m-ary
  const mst = kruskalSteps(g);
  const m = rng.pick([3, 4, 5]);
  const internals = rng.int(12, 40);
  const treeCalc = fullMaryTreeCalc(m, 'internal', internals);
  const q6: ExamQuestion = {
    id: 'q6',
    chapter: 'ch11',
    points: 1.5,
    title: 'Q6 — Minimum Spanning Tree & Full m-ary Trees',
    prompt: `A full ${m}-ary tree has ${internals} internal vertices. How many LEAVES does it have? (Also verify MST weight of Q5's graph = ${mst.totalWeight}!). Enter leaf count:`,
    type: 'text',
    expected: String(treeCalc.l),
    solutionText: `Leaves l = (${m} − 1)·${internals} + 1 = ${treeCalc.l} (total vertices n = ${treeCalc.n}).`,
  };

  // Q7: Ch12 Boolean K-Map
  const kmap = generateKmapProblem(`${seed}-kmap`);
  const onesList = Object.entries(kmap.truthVector)
    .filter(([, v]) => v === 1)
    .map(([k]) => `m${k}`)
    .join(', ');
  const q7: ExamQuestion = {
    id: 'q7',
    chapter: 'ch12',
    points: 1,
    title: 'Q7 — Boolean Algebra & Karnaugh Maps',
    prompt: `How many total Boolean functions of degree 3 exist? (And note optimal K-map cover for {${onesList}} is ${kmap.optimalSop}). Enter the total count of 3-variable Boolean functions:`,
    type: 'text',
    expected: '256',
    solutionText: `2^(2³) = 2⁸ = 256 Boolean functions. Optimal SOP for {${onesList}} is ${kmap.optimalSop}.`,
  };

  // Bonus / Proof Question
  const proofPick = rng.pick(PROOF_EXERCISES);
  const qProof: ExamQuestion = {
    id: 'q8',
    chapter: proofPick.chapter,
    points: 1,
    title: `Bonus Challenge (+1 pt) — ${proofPick.title}`,
    prompt: proofPick.prompt,
    type: 'proof',
    proofRef: proofPick,
    solutionText: proofPick.modelSolution,
  };

  // Extra quick check in full mode
  if (mode === 'sprint') {
    return [q1, q2, q4, q5, q6, qProof];
  }

  // Ensure CRT / ISBN / Postfix variety in full mode
  const extraType = rng.int(0, 2);
  if (extraType === 0) {
    const crt = solveCRT([
      { a: rng.int(1, 2), m: 3 },
      { a: rng.int(1, 3), m: 4 },
      { a: rng.int(1, 4), m: 5 },
    ]);
    q3.title = 'Q3 — Chinese Remainder Theorem';
    q3.prompt = `Solve x ≡ ${crt.entries[0].a} (mod 3), x ≡ ${crt.entries[1].a} (mod 4), x ≡ ${crt.entries[2].a} (mod 5). Enter the unique solution x mod 60:`;
    q3.expected = String(crt.x);
    q3.solutionText = `M=60; CRT formula gives x ≡ ${crt.x} (mod 60).`;
  } else if (extraType === 1) {
    const rMat = generateRandomRelationMatrix(`${seed}-rel`, 4);
    const sq = booleanProduct(rMat, rMat);
    const hh = havelHakimiSteps([4, 3, 2, 2, 1]);
    q4.title = 'Q4 — Relation Composition & Degree Sequences';
    q4.prompt = `Compute entry (1, 1) of M(R²) for M(R) = ${JSON.stringify(rMat)} (0 or 1). (Note Havel-Hakimi on 4,3,2,2,1 is ${hh.graphical ? 'graphical' : 'not graphical'}).`;
    q4.expected = String(sq[0][0]);
    q4.solutionText = `M(R²)[1][1] = ${sq[0][0]}.`;
  } else {
    const pTokens = ['6', '2', '3', '*', '-', '3', '↑', '8', '2', '/', '+'];
    const ev = evaluatePostfix(pTokens);
    q6.title = 'Q6 — Postfix Evaluation';
    q6.prompt = `Evaluate the postfix expression: ${pTokens.join(' ')}`;
    q6.expected = String(ev.result);
    q6.solutionText = `2*3=6 → 6−6=0 → 0³=0 → 8/2=4 → 0+4 = ${ev.result}.`;
    const isbn = solveIsbn10Missing('0-07-8?0008-0');
    void isbn;
  }

  return [q1, q2, q3, q4, q5, q6, q7, qProof];
}

interface ExamPageProps {
  initialSeed?: string;
  onSeedChange: (seed: string) => void;
}

interface MfcExamDraft {
  seed: string;
  mode: 'full' | 'sprint';
  answers: Record<string, string>;
  proofSelfCheck: Record<string, boolean>;
  secondsLeft: number;
}

export const ExamPage: React.FC<ExamPageProps> = ({ initialSeed, onSeedChange }) => {
  const { settings, addExamRecord, recordPractice, recordMistake } = useApp();
  const [initialDraft] = useState<MfcExamDraft | null>(() => {
    if (initialSeed) {
      return (
        loadExamDraft<MfcDraftBySeed>(`mfc:${initialSeed}:full`) ??
        loadExamDraft<MfcDraftBySeed>(`mfc:${initialSeed}:sprint`) ??
        null
      );
    }
    return loadExamDraft<MfcExamDraft>('mfc:active');
  });

  const [seed, setSeed] = useState(initialSeed || initialDraft?.seed || randomSeedCode());
  const [mode, setMode] = useState<'full' | 'sprint'>(initialDraft?.mode || 'full');
  const [answers, setAnswers] = useState<Record<string, string>>(initialDraft?.answers || {});
  const [proofSelfCheck, setProofSelfCheck] = useState<Record<string, boolean>>(
    initialDraft?.proofSelfCheck || {},
  );
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialDraft?.secondsLeft ?? 90 * 60);
  const [draftRestored, setDraftRestored] = useState(
    Boolean(initialDraft && Object.keys(initialDraft.answers || {}).length > 0),
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const [aiProofGrade, setAiProofGrade] = useState<ProofGradeResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [offlineProofCheck, setOfflineProofCheck] = useState<OfflineCheckResult | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    score: number;
    maxScore: number;
    byChapter: Partial<Record<ChapterId, { earned: number; total: number }>>;
  } | null>(null);

  useEffect(() => {
    if (initialSeed && initialSeed !== seed) {
      const saved =
        loadExamDraft<MfcExamDraft>(`mfc:${initialSeed}:full`) ??
        loadExamDraft<MfcExamDraft>(`mfc:${initialSeed}:sprint`);
      setSeed(initialSeed);
      if (saved && Object.keys(saved.answers || {}).length > 0) {
        setMode(saved.mode);
        setAnswers(saved.answers);
        setProofSelfCheck(saved.proofSelfCheck || {});
        setSecondsLeft(saved.secondsLeft);
        setDraftRestored(true);
      } else {
        setAnswers({});
        setProofSelfCheck({});
        setDraftRestored(false);
      }
      setSubmitted(false);
    }
  }, [initialSeed]);

  const secondsLeftRef = React.useRef(secondsLeft);
  secondsLeftRef.current = secondsLeft;
  const submitBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (submitted) return;
    if (Object.keys(answers).length === 0 && !Object.values(proofSelfCheck).some(Boolean)) return;
    const draft: MfcExamDraft = {
      seed,
      mode,
      answers,
      proofSelfCheck,
      secondsLeft: secondsLeftRef.current,
    };
    saveExamDraft(`mfc:${seed}:${mode}`, draft);
    saveExamDraft('mfc:active', draft);
  }, [answers, proofSelfCheck, seed, mode, submitted]);

  useEffect(() => {
    if (submitted || secondsLeft % 15 !== 0) return;
    if (Object.keys(answers).length === 0 && !Object.values(proofSelfCheck).some(Boolean)) return;
    const draft: MfcExamDraft = { seed, mode, answers, proofSelfCheck, secondsLeft };
    saveExamDraft(`mfc:${seed}:${mode}`, draft);
    saveExamDraft('mfc:active', draft);
  }, [secondsLeft]);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, seed, mode]);

  const questions = useMemo(() => generateExamFromSeed(seed, mode), [seed, mode]);

  const newExam = (nextMode: 'full' | 'sprint' = mode) => {
    clearExamDraft(`mfc:${seed}:${mode}`);
    clearExamDraft('mfc:active');
    const s = randomSeedCode();
    setSeed(s);
    setMode(nextMode);
    onSeedChange(s);
    setAnswers({});
    setProofSelfCheck({});
    setSubmitted(false);
    setAiProofGrade(null);
    setAiError(null);
    setOfflineProofCheck(null);
    setLastResult(null);
    setDraftRestored(false);
    setSecondsLeft(nextMode === 'full' ? 90 * 60 : 30 * 60);
  };

  const copyGroupLink = async () => {
    try {
      const base = window.location.href.split('#')[0];
      const url = `${base}#/exam?seed=${encodeURIComponent(seed)}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const submitExam = () => {
    setSubmitted(true);
    let earned = 0;
    let max = 0;
    const byChapter: Partial<Record<ChapterId, { earned: number; total: number }>> = {};

    for (const q of questions) {
      if (q.type !== 'proof') max += q.points;
      const cur = byChapter[q.chapter] ?? { earned: 0, total: 0 };
      if (q.type !== 'proof') cur.total += q.points;

      let got = 0;
      if (q.type === 'proof') {
        if (aiProofGrade) {
          got = Math.min(q.points, (aiProofGrade.score / aiProofGrade.maxScore) * q.points);
        } else if (proofSelfCheck[q.id]) {
          got = q.points;
        }
      } else {
        const userAns = (answers[q.id] ?? '').trim();
        const ok = userAns.toLowerCase() === (q.expected ?? '').toLowerCase();
        got = ok ? q.points : 0;
        recordPractice(q.chapter, ok);
        if (!ok) {
          recordMistake({
            id: `mfc-exam-${seed}-${q.id}`,
            subject: 'mfc',
            topicLabel: `${CHAPTER_META[q.chapter].code} · ${q.title}`,
            question: q.prompt,
            choices: q.choices,
            correctIndex:
              q.type === 'choice' && q.choices && q.expected
                ? q.choices.indexOf(q.expected)
                : undefined,
            expectedText: q.expected,
            userAnswerText: userAns || '(blank)',
            explanation: q.solutionText,
            source: 'mistake',
          });
        }
      }
      earned += got;
      cur.earned += got;
      byChapter[q.chapter] = cur;
    }

    clearExamDraft(`mfc:${seed}:${mode}`);
    clearExamDraft('mfc:active');
    setDraftRestored(false);

    const roundedScore = Math.round(earned * 10) / 10;
    const roundedMax = Math.round(max * 10) / 10;
    setLastResult({ score: roundedScore, maxScore: roundedMax, byChapter });

    addExamRecord({
      id: `${seed}-${Date.now()}`,
      seed,
      mode,
      score: roundedScore,
      maxScore: roundedMax,
      dateIso: new Date().toISOString(),
      byChapter,
    });
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim().length > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mock Final Exam Simulator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Group Seed: <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{seed}</code> — Anyone opening the same seed link gets the exact same exam!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 text-indigo-500" />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <button
            onClick={copyGroupLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> {copiedLink ? 'Group Link Copied!' : 'Copy Group Exam Link'}
          </button>
          <button
            onClick={() => newExam('full')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New 90m Exam
          </button>
          <button
            onClick={() => newExam('sprint')}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
          >
            30m Sprint
          </button>
        </div>
      </div>

      {draftRestored && !submitted && (
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900 dark:text-sky-200">
          <span>
            Auto-saved draft restored for Seed <code className="font-mono font-bold">{seed}</code>.
          </span>
          <button
            onClick={() => newExam(mode)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 font-semibold cursor-pointer"
          >
            Discard Draft
          </button>
        </div>
      )}

      {!submitted && secondsLeft === 0 && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200">
          Time&apos;s up! Click &quot;Submit &amp; Grade Mock Exam&quot; below to see your score.
        </div>
      )}

      {submitted && lastResult && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-base font-extrabold text-indigo-950 dark:text-indigo-100">
              Mock Exam Score:{' '}
              <span className="font-mono">
                {lastResult.score} / {lastResult.maxScore} (
                {lastResult.maxScore > 0
                  ? Math.round((lastResult.score / lastResult.maxScore) * 100)
                  : 0}
                %)
              </span>
            </div>
            <span className="text-xs text-slate-500">Saved to Dashboard History (incl. bonus proof if checked).</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {(Object.entries(lastResult.byChapter) as Array<[ChapterId, { earned: number; total: number }]>).map(
              ([cid, st]) => (
                <span
                  key={cid}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800"
                >
                  {CHAPTER_META[cid].code}: {Math.round(st.earned * 10) / 10}/{Math.round(st.total * 10) / 10}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {!submitted && (
        <ExamStickyBar
          secondsLeft={secondsLeft}
          answeredCount={answeredCount}
          totalCount={questions.length}
          accent="indigo"
          label={`Seed ${seed} · ${mode === 'full' ? '90m Final' : '30m Sprint'}`}
          onJumpToSubmit={() =>
            submitBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        />
      )}

      <div className="space-y-4">
        {questions.map((q) => {
          const isCorrect =
            submitted &&
            q.type !== 'proof' &&
            (answers[q.id] ?? '').trim().toLowerCase() === (q.expected ?? '').toLowerCase();

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {CHAPTER_META[q.chapter].code} · {q.points} pts
                  </span>
                  <h3 className="font-bold text-base">{q.title}</h3>
                </div>
                {submitted && q.type !== 'proof' && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {isCorrect ? `✓ +${q.points} pts` : `✗ 0 / ${q.points} pts`}
                  </span>
                )}
              </div>

              <p className="text-sm">{q.prompt}</p>

              {q.graphData && <GraphSvg graph={q.graphData} />}

              {q.type === 'choice' && q.choices && (
                <div className="flex flex-wrap gap-2">
                  {q.choices.map((c) => (
                    <button
                      key={c}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: c }))}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold uppercase cursor-pointer ${
                        answers[q.id] === c
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'text' && (
                <input
                  disabled={submitted}
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Enter your final answer..."
                  className="w-full max-w-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
                />
              )}

              {q.type === 'proof' && q.proofRef && (
                <div className="space-y-2.5">
                  <MathKeypad
                    preset="mfc"
                    onInsert={(sym) => setAnswers((a) => ({ ...a, [q.id]: (a[q.id] ?? '') + sym }))}
                  />
                  <textarea
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    rows={5}
                    placeholder="Write your bonus proof here..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
                  />
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => {
                        const res = analyzeWrittenProofOffline(
                          q.proofRef!.id,
                          answers[q.id] ?? '',
                          q.proofRef!.rubric,
                        );
                        setOfflineProofCheck(res);
                        if (res.estimatedScore >= res.maxScore * 0.75) {
                          setProofSelfCheck((prev) => ({ ...prev, [q.id]: true }));
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Offline Check (No Key)
                    </button>
                    <button
                      onClick={async () => {
                        const txt = buildCopyableGradingPrompt({
                          subject: 'Mathematics for Computing',
                          title: q.proofRef!.title,
                          prompt: q.proofRef!.prompt,
                          studentAnswer: answers[q.id] ?? '',
                          modelSolution: q.proofRef!.modelSolution,
                          rubric: q.proofRef!.rubric,
                          bilingual: settings.lang === 'bilingual',
                        });
                        await navigator.clipboard.writeText(txt);
                        setCopiedPromptId(q.id);
                        setTimeout(() => setCopiedPromptId(null), 2500);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedPromptId === q.id ? 'Copied!' : 'Copy Prompt for Free AI'}
                    </button>
                    <button
                      onClick={async () => {
                        setAiLoading(true);
                        setAiError(null);
                        try {
                          const res = await gradeProofWithGemini({
                            apiKey: settings.geminiKey,
                            model: settings.geminiModel,
                            prompt: q.proofRef!.prompt,
                            studentProof: answers[q.id] ?? '',
                            modelSolution: q.proofRef!.modelSolution,
                            rubric: q.proofRef!.rubric,
                            bilingual: settings.lang === 'bilingual',
                          });
                          setAiProofGrade(res);
                        } catch (err) {
                          setAiError(err instanceof Error ? err.message : 'AI grading error');
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                      disabled={aiLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {aiLoading ? 'Grading...' : 'AI Grade (API Key)'}
                    </button>
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(proofSelfCheck[q.id])}
                        onChange={(e) =>
                          setProofSelfCheck((prev) => ({ ...prev, [q.id]: e.target.checked }))
                        }
                      />
                      Self-check (+1 bonus pt)
                    </label>
                  </div>
                  {offlineProofCheck && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs space-y-1">
                      <div>
                        <strong>
                          Offline Est: {offlineProofCheck.estimatedScore}/{offlineProofCheck.maxScore}
                        </strong>
                      </div>
                      {offlineProofCheck.missing.length > 0 && (
                        <div className="text-amber-700 dark:text-amber-300">
                          Missing/Check: {offlineProofCheck.missing.join(' · ')}
                        </div>
                      )}
                    </div>
                  )}
                  {aiError && <div className="text-xs text-rose-500">{aiError}</div>}
                  {aiProofGrade && (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-xs">
                      <strong>
                        AI Score: {aiProofGrade.score}/{aiProofGrade.maxScore} ({aiProofGrade.verdict})
                      </strong>{' '}
                      — {aiProofGrade.improvedHint}
                    </div>
                  )}
                </div>
              )}

              {submitted && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs font-mono">
                  <strong>Solution:</strong> {q.solutionText}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          ref={submitBtnRef}
          onClick={submitExam}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md cursor-pointer"
        >
          Submit &amp; Grade Mock Exam
        </button>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="text-lg font-extrabold">
            Exam Graded: {lastResult ? `${lastResult.score} / ${lastResult.maxScore} pts` : 'Saved!'}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Score saved to your Dashboard History. Review any missed algorithmic questions above and jump to the matching Lab to drill that topic.
          </p>
        </div>
      )}
    </div>
  );
};
