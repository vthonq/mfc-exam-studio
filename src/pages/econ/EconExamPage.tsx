import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Clock, Copy, RefreshCw, Sparkles, Users } from 'lucide-react';
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
import { useAuth } from '../../context/AuthContext';
import { ECON_TOPIC_META, type EconTopicId } from '../../types';
import { gradeProofWithGemini, type ProofGradeResult } from '../../services/geminiGrader';
import {
  analyzeWrittenProofOffline,
  buildCopyableGradingPrompt,
  type OfflineCheckResult,
} from '../../utils/offlineProofChecker';
import { clearExamDraft, loadExamDraft, saveExamDraft } from '../../utils/examDraft';
import { buildExplainQuestionPrompt, dispatchAskAi } from '../../utils/askAiBridge';
import { dispatchOpenRoom, normalizeRoomCode } from '../../utils/studyRoomStats';
import { ExamStickyBar } from '../../components/ExamStickyBar';

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

function makeUniqueChoices(
  rng: ReturnType<typeof createRng>,
  correct: string,
  distractors: string[],
): string[] {
  const seen = new Set<string>([correct]);
  const pool: string[] = [correct];
  for (const d of distractors) {
    if (!seen.has(d)) {
      seen.add(d);
      pool.push(d);
    }
    if (pool.length === 4) break;
  }
  let bump = 1;
  while (pool.length < 4) {
    const candidate = `${correct} (alt ${bump})`;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      pool.push(candidate);
    }
    bump++;
  }
  return rng.shuffle(pool);
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
  const defChoices = makeUniqueChoices(rng, String(def), [
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
  const rChoices = makeUniqueChoices(rng, `${realR}%`, [
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

  // 3. Unemployment & National Saving (Part 6)
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
  const uChoices = makeUniqueChoices(rng, `${su.unemploymentRate}%`, [
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

  // 3b. National Saving (Part 6, Ch. 26)
  const y6 = rng.pick([9000, 10000, 12000]);
  const c6 = rng.pick([5500, 6000]);
  const g6 = rng.pick([1600, 1800]);
  const t6 = rng.pick([1400, 1500]);
  const sav6 = computeSavingAndUnemployment({
    Y: y6,
    C: c6,
    G: g6,
    T: t6,
    employed: 100,
    unemployed: 5,
    notInLaborForce: 20,
  });
  const sChoices = makeUniqueChoices(rng, `$${sav6.nationalSaving}`, [
    `$${sav6.privateSaving}`,
    `$${Math.abs(sav6.publicSaving)}`,
    `$${sav6.nationalSaving + 400}`,
  ]);
  out.push({
    id: 'calc-sav',
    topic: 'part6',
    tag: 'Ch. 26 (Calc)',
    question: `In a closed economy with GDP Y = $${y6}, Consumption C = $${c6}, Government purchases G = $${g6}, and Taxes T = $${t6}, what is National Saving S?`,
    choices: sChoices,
    correctIndex: sChoices.indexOf(`$${sav6.nationalSaving}`),
    explanation: `S = Y − C − G = ${y6} − ${c6} − ${g6} = $${sav6.nationalSaving} (Private S = $${sav6.privateSaving}, Public S = $${sav6.publicSaving}).`,
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
  const mChoices = makeUniqueChoices(rng, `$${mon.maxTotalMoneyCreated.toLocaleString()}`, [
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

  // 4b. Quantity Theory MV = PY (Part 7, Ch. 30)
  const m7 = rng.pick([600, 800, 1000]);
  const v7 = rng.pick([3, 4, 5]);
  const y7 = rng.pick([1000, 1200]);
  const qtyRes = computeMoneyBanking({
    initialDeposit: 100,
    reserveRatioPct: 10,
    bankAssets: 500,
    bankCapital: 50,
    moneySupplyM: m7,
    velocityV: v7,
    realOutputY: y7,
  });
  const qtmChoices = makeUniqueChoices(rng, String(qtyRes.priceLevel), [
    String(Math.round((qtyRes.priceLevel + 1) * 100) / 100),
    String(Math.round((m7 / y7) * 100) / 100),
    String(v7),
  ]);
  out.push({
    id: 'calc-mvpy',
    topic: 'part7',
    tag: 'Ch. 30 (Calc)',
    question: `Using the quantity equation M × V = P × Y, if Money Supply M = ${m7}, Velocity V = ${v7}, and Real GDP Y = ${y7}, what is the Price Level P?`,
    choices: qtmChoices,
    correctIndex: qtmChoices.indexOf(String(qtyRes.priceLevel)),
    explanation: `P = (M × V) / Y = (${m7} × ${v7}) / ${y7} = ${qtyRes.priceLevel}.`,
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
  const fxChoices = makeUniqueChoices(rng, String(open.realExchangeRate), [
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
  const multChoices = makeUniqueChoices(rng, `$${mult.totalAdShift}B`, [
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

  const dropInf = rng.pick([3, 4, 5]);
  const srVal = rng.pick([4, 5]);
  const sac = computeSacrificeRatio(dropInf, srVal, 1);
  const sacChoices = makeUniqueChoices(rng, `${sac.totalGdpLossPct}%`, [
    `${dropInf}%`,
    `${srVal}%`,
    `${sac.totalGdpLossPct + 5}%`,
  ]);
  out.push({
    id: 'calc-sac',
    topic: 'part9',
    tag: 'Ch. 35 (Calc)',
    question: `If the sacrifice ratio is ${srVal} and the central bank reduces inflation by ${dropInf} percentage points, total annual output (GDP) foregone equals:`,
    choices: sacChoices,
    correctIndex: sacChoices.indexOf(`${sac.totalGdpLossPct}%`),
    explanation: `Total GDP loss = Sacrifice Ratio × Δπ = ${srVal} × ${dropInf}% = ${sac.totalGdpLossPct}%.`,
  });

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

  // Use unique questions only (never duplicate MCQs)
  const mcqs: ExamMcqItem[] = combined.slice(0, targetMcqs).map((base, i) => ({
    ...base,
    id: `${base.id}-${i}`,
  }));

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
  initialRoomCode?: string;
  onSeedChange: (seed: string, mode: EconExamMode) => void;
}

interface EconExamDraft {
  seed: string;
  mode: EconExamMode;
  mcqAnswers: Record<string, number>;
  essayAnswers: Record<string, string>;
  essaySelfChecks: Record<string, Record<number, boolean>>;
  secsLeft: number;
}

export const EconExamPage: React.FC<EconExamPageProps> = ({
  initialSeed,
  initialMode,
  initialRoomCode,
  onSeedChange,
}) => {
  const { settings, addEconExamRecord, recordEconPractice, recordMistake } = useApp();
  const { firebaseUser, profile } = useAuth();
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(() =>
    initialRoomCode ? normalizeRoomCode(initialRoomCode) : null,
  );
  const [roomSyncMsg, setRoomSyncMsg] = useState<string | null>(null);
  const [initialDraft] = useState<EconExamDraft | null>(() => {
    if (initialSeed) {
      return loadExamDraft<EconExamDraft>(`econ:${initialSeed}:${initialMode || 'final'}`);
    }
    return loadExamDraft<EconExamDraft>('econ:active');
  });

  const [seed, setSeed] = useState(initialSeed || initialDraft?.seed || randomSeedCode());
  const [mode, setMode] = useState<EconExamMode>(initialMode || initialDraft?.mode || 'final');
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>(
    initialDraft?.mcqAnswers || {},
  );
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>(
    initialDraft?.essayAnswers || {},
  );
  const [essaySelfChecks, setEssaySelfChecks] = useState<Record<string, Record<number, boolean>>>(
    initialDraft?.essaySelfChecks || {},
  );
  const [offlineResults, setOfflineResults] = useState<Record<string, OfflineCheckResult>>({});
  const [aiResults, setAiResults] = useState<Record<string, ProofGradeResult>>({});
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [secsLeft, setSecsLeft] = useState(
    initialDraft?.secsLeft ?? ((initialMode || initialDraft?.mode || 'final') === 'final' ? 100 * 60 : 25 * 60),
  );
  const [draftRestored, setDraftRestored] = useState(
    Boolean(
      initialDraft &&
        (Object.keys(initialDraft.mcqAnswers || {}).length > 0 ||
          Object.keys(initialDraft.essayAnswers || {}).length > 0),
    ),
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastResult, setLastResult] = useState<{
    score: number;
    mcqEarned: number;
    mcqMax: number;
    essayEarned: number;
    essayMax: number;
    byChapter: Record<string, { earned: number; total: number }>;
  } | null>(null);

  useEffect(() => {
    setActiveRoomCode(initialRoomCode ? normalizeRoomCode(initialRoomCode) : null);
    setRoomSyncMsg(null);
  }, [initialRoomCode]);

  useEffect(() => {
    if (initialSeed && (initialSeed !== seed || (initialMode && initialMode !== mode))) {
      const m = initialMode || mode;
      const saved = loadExamDraft<EconExamDraft>(`econ:${initialSeed}:${m}`);
      setSeed(initialSeed);
      if (initialMode) setMode(initialMode);
      if (saved && (Object.keys(saved.mcqAnswers || {}).length > 0 || Object.keys(saved.essayAnswers || {}).length > 0)) {
        setMcqAnswers(saved.mcqAnswers || {});
        setEssayAnswers(saved.essayAnswers || {});
        setEssaySelfChecks(saved.essaySelfChecks || {});
        setSecsLeft(saved.secsLeft);
        setDraftRestored(true);
      } else {
        setMcqAnswers({});
        setEssayAnswers({});
        setEssaySelfChecks({});
        setDraftRestored(false);
      }
      setSubmitted(false);
    }
  }, [initialSeed, initialMode]);

  const secsLeftRef = React.useRef(secsLeft);
  secsLeftRef.current = secsLeft;
  const submitBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (submitted) return;
    if (Object.keys(mcqAnswers).length === 0 && Object.keys(essayAnswers).length === 0) return;
    const draft: EconExamDraft = {
      seed,
      mode,
      mcqAnswers,
      essayAnswers,
      essaySelfChecks,
      secsLeft: secsLeftRef.current,
    };
    saveExamDraft(`econ:${seed}:${mode}`, draft);
    saveExamDraft('econ:active', draft);
  }, [mcqAnswers, essayAnswers, essaySelfChecks, seed, mode, submitted]);

  useEffect(() => {
    if (submitted || secsLeft % 15 !== 0) return;
    if (Object.keys(mcqAnswers).length === 0 && Object.keys(essayAnswers).length === 0) return;
    const draft: EconExamDraft = { seed, mode, mcqAnswers, essayAnswers, essaySelfChecks, secsLeft };
    saveExamDraft(`econ:${seed}:${mode}`, draft);
    saveExamDraft('econ:active', draft);
  }, [secsLeft]);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setSecsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [submitted, seed, mode]);

  const { mcqs, essays } = useMemo(() => buildEco101Session(seed, mode), [seed, mode]);

  const startSession = (nextMode: EconExamMode) => {
    clearExamDraft(`econ:${seed}:${mode}`);
    clearExamDraft('econ:active');
    const s = randomSeedCode();
    setSeed(s);
    setMode(nextMode);
    setActiveRoomCode(null);
    setRoomSyncMsg(null);
    onSeedChange(s, nextMode);
    setMcqAnswers({});
    setEssayAnswers({});
    setEssaySelfChecks({});
    setOfflineResults({});
    setAiResults({});
    setAiErrors({});
    setSubmitted(false);
    setLastResult(null);
    setDraftRestored(false);
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
    let mcqEarned = 0;
    let essayEarned = 0;
    const byChapter: Record<string, { earned: number; total: number }> = {};
    const missedLabels: string[] = [];

    for (let qi = 0; qi < mcqs.length; qi++) {
      const q = mcqs[qi];
      const ok = mcqAnswers[q.id] === q.correctIndex;
      const got = ok ? ptsPerMcq : 0;
      mcqEarned += got;
      const cur = byChapter[q.topic] ?? { earned: 0, total: 0 };
      byChapter[q.topic] = { earned: cur.earned + got, total: cur.total + ptsPerMcq };
      recordEconPractice(q.topic, ok);
      if (!ok) {
        missedLabels.push(`Q${qi + 1} · ${q.tag}`);
        recordMistake({
          id: `econ-exam-${seed}-${q.id}`,
          subject: 'econ',
          topicLabel: `${ECON_TOPIC_META[q.topic].code} (${q.tag})`,
          question: q.question,
          choices: q.choices,
          correctIndex: q.correctIndex,
          userAnswerText:
            mcqAnswers[q.id] !== undefined ? q.choices[mcqAnswers[q.id]] : '(blank)',
          explanation: q.explanation,
          source: 'mistake',
        });
      }
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
      essayEarned += got;
      const cur = byChapter[es.topic] ?? { earned: 0, total: 0 };
      byChapter[es.topic] = { earned: cur.earned + got, total: cur.total + ptsPerEssay };
      recordEconPractice(es.topic, ratio >= 0.7);
    }

    const totalScore = Math.round((mcqEarned + essayEarned) * 10) / 10;
    setLastResult({
      score: totalScore,
      mcqEarned: Math.round(mcqEarned * 10) / 10,
      mcqMax: mcqWeightTotal,
      essayEarned: Math.round(essayEarned * 10) / 10,
      essayMax: mode === 'final' ? 50 : 0,
      byChapter,
    });

    clearExamDraft(`econ:${seed}:${mode}`);
    clearExamDraft('econ:active');
    setDraftRestored(false);

    addEconExamRecord({
      id: `eco101-${seed}-${Date.now()}`,
      seed,
      mode,
      score: totalScore,
      maxScore: 100,
      dateIso: new Date().toISOString(),
      byChapter,
    });

    if (activeRoomCode && firebaseUser) {
      const totalDuration = mode === 'final' ? 100 * 60 : 25 * 60;
      const elapsedSeconds = Math.max(0, totalDuration - secsLeftRef.current);
      setRoomSyncMsg('Syncing score to Study Room...');
      void import('../../services/studyRooms')
        .then(({ submitRoomResult }) =>
          submitRoomResult({
            roomCode: activeRoomCode,
            uid: firebaseUser.uid,
            displayName: profile?.displayName || firebaseUser.email || 'Student',
            score: totalScore,
            maxScore: 100,
            elapsedSeconds,
            missedLabels,
          }),
        )
        .then(() => setRoomSyncMsg(`Synced to Study Room ${activeRoomCode}!`))
        .catch(() => setRoomSyncMsg(`Could not sync to Study Room ${activeRoomCode}.`));
    }
  };

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;
  const answeredCount =
    mcqs.filter((q) => mcqAnswers[q.id] !== undefined).length +
    essays.filter((e) => (essayAnswers[e.id] ?? '').trim().length > 0).length;
  const totalCount = mcqs.length + essays.length;

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
              ? `${mcqs.length} MCQs (50%) + 4 Short-Answer Policy Questions (50%)`
              : `${mcqs.length} Unique Multiple-Choice Questions`}
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
          <button
            type="button"
            onClick={() => dispatchOpenRoom(activeRoomCode ?? undefined)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" /> {activeRoomCode ? `Room ${activeRoomCode}` : 'Study Rooms'}
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

      {activeRoomCode && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
          <span>
            Live Study Room <code className="font-mono font-bold">{activeRoomCode}</code>:{' '}
            {roomSyncMsg || 'Your score & missed MCQs sync automatically when you submit.'}
          </span>
          <button
            type="button"
            onClick={() => dispatchOpenRoom(activeRoomCode)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-bold cursor-pointer"
          >
            View Leaderboard →
          </button>
        </div>
      )}

      {draftRestored && !submitted && (
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900 dark:text-sky-200">
          <span>
            Auto-saved draft restored for Seed <code className="font-mono font-bold">{seed}</code>.
          </span>
          <button
            onClick={() => startSession(mode)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 font-semibold cursor-pointer"
          >
            Discard Draft
          </button>
        </div>
      )}

      {!submitted && secsLeft === 0 && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200">
          Time&apos;s up! Click &quot;Submit &amp; Grade ECO101 Exam&quot; below to see your score.
        </div>
      )}

      {submitted && lastResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
              ECO101 Score:{' '}
              <span className="font-mono">{lastResult.score} / 100</span>
            </div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
              Section A MCQs: {lastResult.mcqEarned}/{lastResult.mcqMax}
              {lastResult.essayMax > 0 && ` · Section B Essays: ${lastResult.essayEarned}/${lastResult.essayMax}`}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {Object.entries(lastResult.byChapter).map(([tid, st]) => (
              <span
                key={tid}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800"
              >
                {ECON_TOPIC_META[tid as EconTopicId]?.code ?? tid}: {Math.round(st.earned * 10) / 10}/{Math.round(st.total * 10) / 10}
              </span>
            ))}
          </div>
        </div>
      )}

      {!submitted && (
        <ExamStickyBar
          secondsLeft={secsLeft}
          answeredCount={answeredCount}
          totalCount={totalCount}
          accent="emerald"
          label={`Seed ${seed} · ${mode.toUpperCase()}`}
          onJumpToSubmit={() =>
            submitBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        />
      )}

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
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex flex-wrap items-start justify-between gap-2">
                  <span className="flex-1 min-w-0">{q.explanation}</span>
                  <button
                    type="button"
                    onClick={() =>
                      dispatchAskAi({
                        subject: 'econ',
                        prompt: buildExplainQuestionPrompt({
                          topicLabel: `${ECON_TOPIC_META[q.topic].code} (${q.tag})`,
                          question: q.question,
                          userAnswer: picked !== undefined ? q.choices[picked] : '(blank)',
                          expectedAnswer: q.choices[q.correctIndex],
                          explanation: q.explanation,
                        }),
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    Explain with AI
                  </button>
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
                          subject: 'econ',
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
          ref={submitBtnRef}
          onClick={submitExam}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer"
        >
          Submit &amp; Grade ECO101 Exam
        </button>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm font-bold">
          Exam graded ({lastResult ? `${lastResult.score}/100` : 'done'}) and saved to your Macro Readiness Dashboard!
        </div>
      )}
    </div>
  );
};
