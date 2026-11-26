import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Clock, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { createRng, randomSeedCode } from '../../math/prng';
import {
  computeCpiTable,
  computeGdpTable,
  computeMoneyBanking,
  computeMultipliers,
  computeOpenEconomy,
  computeSacrificeRatio,
  computeSavingAndUnemployment,
  realInterestRate,
} from '../../math/economics';
import { ECON_MCQS, ECON_SCENARIOS, type EconScenario } from '../../data/economics';
import { useApp } from '../../context/AppContext';
import { ECON_TOPIC_META, type EconTopicId } from '../../types';
import { gradeProofWithGemini, type ProofGradeResult } from '../../services/geminiGrader';
import {
  analyzeWrittenProofOffline,
  buildCopyableGradingPrompt,
  type OfflineCheckResult,
} from '../../utils/offlineProofChecker';

type EconExamMode = 'final' | 'quiz3' | 'quiz4' | 'quiz5';

interface ExamMcqItem {
  id: string;
  topic: EconTopicId;
  tag: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

function makeCalcMcqs(rng: ReturnType<typeof createRng>): ExamMcqItem[] {
  const out: ExamMcqItem[] = [];

  // 1. GDP Deflator (Part 6)
  const p1 = rng.int(8, 12);
  const q1 = rng.int(10, 15) * 10;
  const p2 = p1 + rng.int(2, 4);
  const q2 = q1 + rng.int(2, 5) * 10;
  const gdp = computeGdpTable(
    ['Y1', 'Y2'],
    [{ name: 'Bread', years: [{ price: p1, qty: q1 }, { price: p2, qty: q2 }] }],
    0,
  );
  const def = gdp[1].gdpDeflator;
  const defChoices = rng.shuffle([
    String(def),
    String(Math.round((def + 12) * 100) / 100),
    String(Math.round((def - 10) * 100) / 100),
    '100',
  ]);
  out.push({
    id: 'calc-gdp',
    topic: 'part6',
    tag: 'Ch. 23 (Calc)',
    question: `Only bread is produced: Year 1 (base) P=$${p1}, Q=${q1}; Year 2 P=$${p2}, Q=${q2}. What is the Year 2 GDP Deflator?`,
    choices: defChoices,
    correctIndex: defChoices.indexOf(String(def)),
    explanation: `Nominal Y2 = $${gdp[1].nominalGdp}; Real Y2 = $${gdp[1].realGdp}; Deflator = (${gdp[1].nominalGdp}/${gdp[1].realGdp})×100 = ${def}.`,
  });

  // 2. CPI & Real Interest Rate (Part 6)
  const cpiB = 100;
  const cpiN = 100 + rng.int(4, 9);
  const nomI = rng.int(7, 12);
  const cpiInf = computeCpiTable(['Y1', 'Y2'], [{ name: 'Basket', basketQty: 1, prices: [cpiB, cpiN] }], 0)[1].inflationPct!;
  const realR = realInterestRate(nomI, cpiInf);
  const rChoices = rng.shuffle([
    `${realR}%`,
    `${nomI + cpiInf}%`,
    `${realR + 2}%`,
    `${nomI}%`,
  ]);
  out.push({
    id: 'calc-cpi-r',
    topic: 'part6',
    tag: 'Ch. 24 (Calc)',
    question: `CPI rises from ${cpiB} to ${cpiN} over a year while the nominal interest rate is ${nomI}%. What is the real interest rate?`,
    choices: rChoices,
    correctIndex: rChoices.indexOf(`${realR}%`),
    explanation: `Inflation π = ${cpiInf}%, so real rate r = ${nomI}% − ${cpiInf}% = ${realR}%.`,
  });

  // 3. Unemployment Rate (Part 6)
  const emp = rng.int(14, 18) * 10;
  const unemp = rng.int(1, 3) * 10;
  const su = computeSavingAndUnemployment({
    Y: 10000,
    C: 6000,
    G: 1800,
    T: 1500,
    employed: emp,
    unemployed: unemp,
    notInLaborForce: 40,
  });
  const uChoices = rng.shuffle([
    `${su.unemploymentRate}%`,
    `${Math.round((unemp / (emp + unemp + 40)) * 10000) / 100}%`,
    `${su.lfpr}%`,
    `${Math.round((su.unemploymentRate + 4) * 100) / 100}%`,
  ]);
  out.push({
    id: 'calc-unemp',
    topic: 'part6',
    tag: 'Ch. 28 (Calc)',
    question: `An economy has ${emp}M employed, ${unemp}M unemployed, and 40M not in the labor force. What is the unemployment rate?`,
    choices: uChoices,
    correctIndex: uChoices.indexOf(`${su.unemploymentRate}%`),
    explanation: `Labor force = ${emp}+${unemp} = ${su.laborForce}M; u-rate = ${unemp}/${su.laborForce} × 100% = ${su.unemploymentRate}%.`,
  });

  // 4. Money Multiplier (Part 7)
  const rr = rng.pick([5, 10, 20]);
  const inj = rng.pick([200, 400, 1000]);
  const mon = computeMoneyBanking({
    initialDeposit: inj,
    reserveRatioPct: rr,
    bankAssets: 1000,
    bankCapital: 50,
    moneySupplyM: 500,
    velocityV: 4,
    realOutputY: 1000,
  });
  const mChoices = rng.shuffle([
    `$${mon.maxTotalMoneyCreated.toLocaleString()}`,
    `$${mon.maxNewLoans.toLocaleString()}`,
    `$${inj.toLocaleString()}`,
    `$${(mon.maxTotalMoneyCreated * 2).toLocaleString()}`,
  ]);
  out.push({
    id: 'calc-money',
    topic: 'part7',
    tag: 'Ch. 29 (Calc)',
    question: `With a ${rr}% reserve ratio (no excess reserves or cash drain), a $${inj} Fed open-market bond purchase can expand the money supply by at most:`,
    choices: mChoices,
    correctIndex: mChoices.indexOf(`$${mon.maxTotalMoneyCreated.toLocaleString()}`),
    explanation: `Multiplier = 1/${rr / 100} = ${mon.moneyMultiplier}; max money expansion = $${inj} × ${mon.moneyMultiplier} = $${mon.maxTotalMoneyCreated}.`,
  });

  // 5. Real Exchange Rate (Part 8)
  const eNom = rng.pick([80, 100, 120]);
  const pDom = rng.pick([2, 3]);
  const pFor = rng.pick([240, 300, 400]);
  const open = computeOpenEconomy({
    nominalExchangeRate: eNom,
    domesticPrice: pDom,
    foreignPrice: pFor,
    nationalSavingS: 1200,
    domesticInvestmentI: 900,
  });
  const fxChoices = rng.shuffle([
    String(open.realExchangeRate),
    String(Math.round((open.realExchangeRate + 0.45) * 100) / 100),
    String(open.pppNominalRate),
    String(Math.round((eNom / pFor) * 100) / 100),
  ]);
  out.push({
    id: 'calc-fx',
    topic: 'part8',
    tag: 'Ch. 31 (Calc)',
    question: `A good costs $${pDom} at home and ${pFor} foreign units abroad. If nominal exchange rate e = ${eNom} foreign units/$, what is the real exchange rate ε?`,
    choices: fxChoices,
    correctIndex: fxChoices.indexOf(String(open.realExchangeRate)),
    explanation: `ε = (e × P) / P* = (${eNom} × ${pDom}) / ${pFor} = ${open.realExchangeRate}.`,
  });

  // 6. Fiscal Multipliers & Sacrifice Ratio (Part 9)
  const mpc = rng.pick([0.75, 0.8]);
  const dg = rng.pick([20, 40, 50]);
  const mult = computeMultipliers(mpc, dg, 0);
  const multChoices = rng.shuffle([
    `$${mult.totalAdShift}B`,
    `$${dg}B`,
    `$${Math.round(dg * mpc * 10) / 10}B`,
    `$${Math.round(mult.totalAdShift * mpc)}B`,
  ]);
  out.push({
    id: 'calc-mult',
    topic: 'part9',
    tag: 'Ch. 34 (Calc)',
    question: `With MPC = ${mpc} (ignoring crowding out), an increase in government purchases ΔG = $${dg}B shifts Aggregate Demand right by:`,
    choices: multChoices,
    correctIndex: multChoices.indexOf(`$${mult.totalAdShift}B`),
    explanation: `Spending multiplier = 1/(1−${mpc}) = ${mult.spendingMultiplier}; AD shift = ${mult.spendingMultiplier} × $${dg}B = $${mult.totalAdShift}B.`,
  });

  const sac = computeSacrificeRatio(4, rng.pick([4, 5]), 1);
  void sac;

  return out;
}

function buildEco101Session(seed: string, mode: EconExamMode): {
  mcqs: ExamMcqItem[];
  essays: EconScenario[];
} {
  const rng = createRng(`eco101-${seed}-${mode}`);
  const calcs = makeCalcMcqs(rng);

  const filterTopics: EconTopicId[] =
    mode === 'quiz3'
      ? ['part6']
      : mode === 'quiz4'
        ? ['part7', 'part8']
        : mode === 'quiz5'
          ? ['part9']
          : ['part6', 'part7', 'part8', 'part9'];

  const staticPool: ExamMcqItem[] = ECON_MCQS.filter((m) => filterTopics.includes(m.topic)).map(
    (m) => ({
      id: m.id,
      topic: m.topic,
      tag: m.chapter,
      question: m.question,
      choices: m.choices,
      correctIndex: m.correctIndex,
      explanation: m.explanation,
    }),
  );

  const targetMcqs = mode === 'final' ? 30 : 20;
  const relevantCalcs = calcs.filter((c) => filterTopics.includes(c.topic));
  const combined = [...relevantCalcs, ...rng.shuffle(staticPool)];

  // Ensure exact target count (30 for Final, 20 for Quizzes) without duplicating until needed
  const mcqs: ExamMcqItem[] = [];
  for (let i = 0; i < targetMcqs; i++) {
    const base = combined[i % combined.length];
    mcqs.push({ ...base, id: `${base.id}-${i}` });
  }

  // Final Exam includes 4 Short-Answer questions (1 from each Part 6, 7, 8, 9)
  const essays: EconScenario[] =
    mode === 'final'
      ? (['part6', 'part7', 'part8', 'part9'] as EconTopicId[]).map((part) => {
          const candidates = ECON_SCENARIOS.filter((s) => s.topic === part);
          return rng.pick(candidates);
        })
      : [];

  return { mcqs, essays };
}

interface EconExamPageProps {
  initialSeed?: string;
  initialMode?: EconExamMode;
  onSeedChange: (seed: string, mode: EconExamMode) => void;
}

export const EconExamPage: React.FC<EconExamPageProps> = ({
  initialSeed,
  initialMode,
  onSeedChange,
}) => {
  const { settings, addEconExamRecord, recordEconPractice } = useApp();
  const [seed, setSeed] = useState(initialSeed || randomSeedCode());
  const [mode, setMode] = useState<EconExamMode>(initialMode || 'final');
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [essaySelfChecks, setEssaySelfChecks] = useState<Record<string, Record<number, boolean>>>({});
  const [offlineResults, setOfflineResults] = useState<Record<string, OfflineCheckResult>>({});
  const [aiResults, setAiResults] = useState<Record<string, ProofGradeResult>>({});
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [secsLeft, setSecsLeft] = useState(mode === 'final' ? 100 * 60 : 25 * 60);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialSeed && initialSeed !== seed) setSeed(initialSeed);
    if (initialMode && initialMode !== mode) setMode(initialMode);
  }, [initialSeed, initialMode]);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setSecsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [submitted, seed, mode]);

  const { mcqs, essays } = useMemo(() => buildEco101Session(seed, mode), [seed, mode]);

  const startSession = (nextMode: EconExamMode) => {
    const s = randomSeedCode();
    setSeed(s);
    setMode(nextMode);
    onSeedChange(s, nextMode);
    setMcqAnswers({});
    setEssayAnswers({});
    setEssaySelfChecks({});
    setOfflineResults({});
    setAiResults({});
    setAiErrors({});
    setSubmitted(false);
    setSecsLeft(nextMode === 'final' ? 100 * 60 : 25 * 60);
  };

  const copyGroupLink = async () => {
    const base = window.location.href.split('#')[0];
    await navigator.clipboard.writeText(
      `${base}#/econ/exam?seed=${encodeURIComponent(seed)}&mode=${mode}`,
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const mcqWeightTotal = mode === 'final' ? 50 : 100;
  const ptsPerMcq = mcqWeightTotal / mcqs.length;
  const ptsPerEssay = essays.length > 0 ? 50 / essays.length : 0;

  const submitExam = () => {
    setSubmitted(true);
    let score = 0;
    const byChapter: Record<string, { earned: number; total: number }> = {};

    for (const q of mcqs) {
      const ok = mcqAnswers[q.id] === q.correctIndex;
      const got = ok ? ptsPerMcq : 0;
      score += got;
      const cur = byChapter[q.topic] ?? { earned: 0, total: 0 };
      byChapter[q.topic] = { earned: cur.earned + got, total: cur.total + ptsPerMcq };
      recordEconPractice(q.topic, ok);
    }

    for (const es of essays) {
      const ai = aiResults[es.id];
      const off = offlineResults[es.id];
      const rubricChecks = essaySelfChecks[es.id] ?? {};
      const rubMax = es.rubric.reduce((s, r) => s + r.points, 0);
      const rubGot = es.rubric.reduce((s, r, idx) => s + (rubricChecks[idx] ? r.points : 0), 0);

      let ratio = 0;
      if (ai) ratio = ai.score / ai.maxScore;
      else if (rubGot > 0) ratio = rubGot / rubMax;
      else if (off) ratio = off.estimatedScore / off.maxScore;

      const got = ratio * ptsPerEssay;
      score += got;
      const cur = byChapter[es.topic] ?? { earned: 0, total: 0 };
      byChapter[es.topic] = { earned: cur.earned + got, total: cur.total + ptsPerEssay };
      recordEconPractice(es.topic, ratio >= 0.7);
    }

    addEconExamRecord({
      id: `eco101-${seed}-${Date.now()}`,
      seed,
      mode,
      score: Math.round(score * 10) / 10,
      maxScore: 100,
      dateIso: new Date().toISOString(),
      byChapter,
    });
  };

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            ECO101 Macroeconomics {mode === 'final' ? 'Final Exam (100 min)' : `Tutorial ${mode.toUpperCase()} (25 min)`}
          </h1>
          <p className="text-sm text-slate-500">
            Group Seed: <code className="font-mono font-bold text-emerald-600">{seed}</code> ·{' '}
            {mode === 'final'
              ? '30 MCQs (50%) + 4 Short-Answer Policy Questions (50%)'
              : '20 Multiple-Choice Questions'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 text-emerald-500" />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <button
            onClick={copyGroupLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> {copiedLink ? 'Link Copied!' : 'Copy Group Exam Link'}
          </button>
          {(
            [
              { id: 'final', label: 'Final (100m)' },
              { id: 'quiz3', label: 'Quiz 3 (Part 6)' },
              { id: 'quiz4', label: 'Quiz 4 (Parts 7–8)' },
              { id: 'quiz5', label: 'Quiz 5 (Part 9)' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => startSession(m.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                mode === m.id
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300 dark:border-slate-700'
              }`}
            >
              <RefreshCw className="w-3 h-3" /> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section A: Multiple Choice */}
      <div className="space-y-3">
        <h2 className="text-base font-bold">
          Section A — {mcqs.length} Multiple-Choice Questions ({mcqWeightTotal}%)
        </h2>
        {mcqs.map((q, idx) => {
          const picked = mcqAnswers[q.id];
          const ok = submitted && picked === q.correctIndex;
          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  Q{idx + 1} · {ECON_TOPIC_META[q.topic].code} ({q.tag})
                </span>
                {submitted && (
                  <span className={`font-bold ${ok ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {ok ? '✓ Correct' : `✗ Answer: ${String.fromCharCode(65 + q.correctIndex)}`}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium">{q.question}</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.choices.map((c, ci) => {
                  let cls = 'border-slate-200 dark:border-slate-700';
                  if (submitted) {
                    if (ci === q.correctIndex) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                    else if (picked === ci) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
                  } else if (picked === ci) {
                    cls = 'bg-emerald-600 text-white border-emerald-600';
                  }
                  return (
                    <button
                      key={ci}
                      disabled={submitted}
                      onClick={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: ci }))}
                      className={`p-2.5 rounded-xl border text-left text-xs cursor-pointer ${cls}`}
                    >
                      <strong>{String.fromCharCode(65 + ci)}.</strong> {c}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section B: 4 Short-Answer Questions (Final Exam only) */}
      {essays.length > 0 && (
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold">
            Section B — 4 Short-Answer / Policy Analysis Questions (50% — 12.5 pts each)
          </h2>
          {essays.map((es, idx) => {
            const off = offlineResults[es.id];
            const ai = aiResults[es.id];
            const checks = essaySelfChecks[es.id] ?? {};
            return (
              <div
                key={es.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  Short-Answer #{idx + 1} · {es.chapterLabel} · 12.5 pts
                </div>
                <h3 className="font-bold text-base">{es.title}</h3>
                <p className="text-sm">{es.prompt}</p>
                <textarea
                  value={essayAnswers[es.id] ?? ''}
                  onChange={(e) =>
                    setEssayAnswers((prev) => ({ ...prev, [es.id]: e.target.value }))
                  }
                  rows={5}
                  placeholder="Write your full economic reasoning here..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const r = analyzeWrittenProofOffline(
                        es.id,
                        essayAnswers[es.id] ?? '',
                        es.rubric,
                      );
                      setOfflineResults((prev) => ({ ...prev, [es.id]: r }));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" /> Offline Check (No Key)
                  </button>
                  <button
                    onClick={async () => {
                      const txt = buildCopyableGradingPrompt({
                        subject: 'Principles of Macroeconomics (ECO101 Final)',
                        title: es.title,
                        prompt: es.prompt,
                        studentAnswer: essayAnswers[es.id] ?? '',
                        modelSolution: es.modelSolution,
                        rubric: es.rubric,
                        bilingual: settings.lang === 'bilingual',
                      });
                      await navigator.clipboard.writeText(txt);
                      setCopiedId(es.id);
                      setTimeout(() => setCopiedId(null), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedId === es.id ? 'Copied!' : 'Copy Prompt for Free AI'}
                  </button>
                  <button
                    onClick={async () => {
                      setAiLoadingId(es.id);
                      setAiErrors((prev) => ({ ...prev, [es.id]: '' }));
                      try {
                        const res = await gradeProofWithGemini({
                          apiKey: settings.geminiKey,
                          model: settings.geminiModel,
                          prompt: es.prompt,
                          studentProof: essayAnswers[es.id] ?? '',
                          modelSolution: es.modelSolution,
                          rubric: es.rubric,
                          bilingual: settings.lang === 'bilingual',
                        });
                        setAiResults((prev) => ({ ...prev, [es.id]: res }));
                      } catch (err) {
                        setAiErrors((prev) => ({
                          ...prev,
                          [es.id]: err instanceof Error ? err.message : 'AI error',
                        }));
                      } finally {
                        setAiLoadingId(null);
                      }
                    }}
                    disabled={aiLoadingId === es.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {aiLoadingId === es.id ? 'Grading...' : 'AI Grade (API Key)'}
                  </button>
                </div>

                {off && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                    <strong>Offline Est: {off.estimatedScore}/{off.maxScore}</strong>
                    {off.missing.length > 0 && ` — Check: ${off.missing.join('; ')}`}
                  </div>
                )}
                {aiErrors[es.id] && <div className="text-xs text-rose-500">{aiErrors[es.id]}</div>}
                {ai && (
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-xs">
                    <strong>AI Score: {ai.score}/{ai.maxScore} ({ai.verdict})</strong> — {ai.improvedHint}
                  </div>
                )}

                {submitted && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-bold">Rubric Self-Check &amp; Model Solution:</div>
                    {es.rubric.map((r, ri) => (
                      <label key={ri} className="flex items-start gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(checks[ri])}
                          onChange={(e) =>
                            setEssaySelfChecks((prev) => ({
                              ...prev,
                              [es.id]: { ...(prev[es.id] ?? {}), [ri]: e.target.checked },
                            }))
                          }
                        />
                        <span>[{r.points} pt] {r.label}</span>
                      </label>
                    ))}
                    <pre className="whitespace-pre-wrap font-sans text-xs bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl">
                      {es.modelSolution}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!submitted ? (
        <button
          onClick={submitExam}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer"
        >
          Submit &amp; Grade ECO101 Exam
        </button>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm font-bold">
          Exam graded and saved to your Macro Readiness Dashboard!
        </div>
      )}
    </div>
  );
};
