import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Copy, RefreshCw } from 'lucide-react';
import { createRng, randomSeedCode } from '../../math/prng';
import {
  computeCpiTable,
  computeGdpTable,
  computeLinearMarket,
  computeMoneyBanking,
  computeMultipliers,
  computeOpenEconomy,
  computeSavingAndUnemployment,
  realInterestRate,
} from '../../math/economics';
import { ECON_MCQS } from '../../data/economics';
import { useApp } from '../../context/AppContext';
import { ECON_TOPIC_META, type EconTopicId } from '../../types';

interface EconExamQ {
  id: string;
  topic: EconTopicId;
  points: number;
  title: string;
  prompt: string;
  type: 'numeric' | 'mcq';
  choices?: string[];
  expected: string;
  solutionText: string;
}

function buildEconExam(seed: string, mode: 'macro' | 'micro' | 'combined'): EconExamQ[] {
  const rng = createRng(`econ-${seed}-${mode}`);
  const out: EconExamQ[] = [];

  if (mode === 'macro' || mode === 'combined') {
    const p1 = rng.int(8, 12);
    const q1 = rng.int(10, 20) * 10;
    const p2 = p1 + rng.int(1, 4);
    const q2 = q1 + rng.int(2, 6) * 10;
    const gdp = computeGdpTable(
      ['Y1', 'Y2'],
      [{ name: 'Apples', years: [{ price: p1, qty: q1 }, { price: p2, qty: q2 }] }],
      0,
    );
    out.push({
      id: 'eq-gdp',
      topic: 'macro-gdp-cpi',
      points: 1.5,
      title: 'GDP Deflator Calculation (Ch. 23)',
      prompt: `An economy produces only apples: Year 1 (base) P=${p1}, Q=${q1}; Year 2 P=${p2}, Q=${q2}. Compute the Year 2 GDP Deflator (round to 2 decimals if needed).`,
      type: 'numeric',
      expected: String(gdp[1].gdpDeflator),
      solutionText: `Nominal Y2 = ${p2}·${q2} = ${gdp[1].nominalGdp}; Real Y2 = ${p1}·${q2} = ${gdp[1].realGdp}; Deflator = (${gdp[1].nominalGdp}/${gdp[1].realGdp})×100 = ${gdp[1].gdpDeflator}.`,
    });

    const cpiBase = rng.int(100, 120);
    const cpiNext = cpiBase + rng.int(10, 30);
    const cpiTab = computeCpiTable(['Y1', 'Y2'], [{ name: 'Basket', basketQty: 1, prices: [cpiBase, cpiNext] }], 0);
    const nom = rng.int(6, 11);
    const rRate = realInterestRate(nom, cpiTab[1].inflationPct!);
    out.push({
      id: 'eq-real-r',
      topic: 'macro-gdp-cpi',
      points: 1.5,
      title: 'CPI Inflation & Real Interest Rate (Ch. 24)',
      prompt: `Basket cost rises from $${cpiBase} (base year) to $${cpiNext} next year. If nominal interest rate is ${nom}%, what is the real interest rate (%)?`,
      type: 'numeric',
      expected: String(rRate),
      solutionText: `CPI inflation π = ${cpiTab[1].inflationPct}%, so r = ${nom}% − ${cpiTab[1].inflationPct}% = ${rRate}%.`,
    });

    const emp = rng.int(120, 180);
    const unemp = rng.int(8, 20);
    const su = computeSavingAndUnemployment({
      Y: 10000,
      C: 6000,
      G: 1800,
      T: 1500,
      employed: emp,
      unemployed: unemp,
      notInLaborForce: 40,
    });
    out.push({
      id: 'eq-unemp',
      topic: 'macro-growth-saving-unemp',
      points: 1.5,
      title: 'Unemployment Rate (Ch. 28)',
      prompt: `In an economy, ${emp}M people are employed, ${unemp}M are unemployed, and 40M are not in the labor force. Compute the unemployment rate (%) to 2 decimal places.`,
      type: 'numeric',
      expected: String(su.unemploymentRate),
      solutionText: `Labor force = ${emp}+${unemp} = ${su.laborForce}M; u-rate = (${unemp}/${su.laborForce})×100 = ${su.unemploymentRate}%.`,
    });

    const rr = rng.pick([5, 10, 20, 25]);
    const inj = rng.pick([200, 500, 1000]);
    const mon = computeMoneyBanking({
      initialDeposit: inj,
      reserveRatioPct: rr,
      bankAssets: 1000,
      bankCapital: 50,
      moneySupplyM: 500,
      velocityV: 4,
      realOutputY: 1000,
    });
    out.push({
      id: 'eq-money',
      topic: 'macro-money-inflation',
      points: 1.5,
      title: 'Money Multiplier (Ch. 29)',
      prompt: `With a ${rr}% reserve ratio (no excess reserves or currency drain), a $${inj} Fed open-market bond purchase can expand the money supply by up to how many dollars?`,
      type: 'numeric',
      expected: String(mon.maxTotalMoneyCreated),
      solutionText: `Multiplier = 1/0.${rr < 10 ? '0' + rr : rr} = ${mon.moneyMultiplier}; Max expansion = $${inj} × ${mon.moneyMultiplier} = $${mon.maxTotalMoneyCreated}.`,
    });

    const open = computeOpenEconomy({
      nominalExchangeRate: 100,
      domesticPrice: 2,
      foreignPrice: 400,
      nationalSavingS: rng.int(900, 1400),
      domesticInvestmentI: rng.int(700, 1000),
    });
    out.push({
      id: 'eq-open',
      topic: 'macro-open-econ',
      points: 1,
      title: 'Open-Economy Identity (Ch. 31)',
      prompt: `If National Saving S = ${open.nco + 800 > 0 ? '' : ''}... Wait: given Real Exchange Rate ε = (e×P)/P* with e=100, P=2, P*=400, compute ε:`,
      type: 'numeric',
      expected: String(open.realExchangeRate),
      solutionText: `ε = (100 × 2) / 400 = ${open.realExchangeRate}.`,
    });
    // Clean wording for eq-open
    const sVal = rng.int(1100, 1500);
    const iVal = rng.int(700, 1050);
    out[out.length - 1] = {
      id: 'eq-open',
      topic: 'macro-open-econ',
      points: 1,
      title: 'Open-Economy NCO & Net Exports (Ch. 31)',
      prompt: `An open economy has National Saving S = $${sVal}B and Domestic Investment I = $${iVal}B. What is Net Exports (NX, in $B)?`,
      type: 'numeric',
      expected: String(sVal - iVal),
      solutionText: `By S = I + NCO and NCO = NX, NX = S − I = ${sVal} − ${iVal} = $${sVal - iVal}B.`,
    };

    const mpc = rng.pick([0.75, 0.8]);
    const dg = rng.pick([20, 40, 50]);
    const mult = computeMultipliers(mpc, dg, 0);
    out.push({
      id: 'eq-mult',
      topic: 'macro-adas-policy-phillips',
      points: 1.5,
      title: 'Fiscal Spending Multiplier (Ch. 34)',
      prompt: `If MPC = ${mpc} (ignoring crowding out), an increase in government spending ΔG = $${dg}B shifts AD right by how many $B?`,
      type: 'numeric',
      expected: String(mult.totalAdShift),
      solutionText: `Multiplier = 1/(1−${mpc}) = ${mult.spendingMultiplier}; AD shift = ${mult.spendingMultiplier} × ${dg} = $${mult.totalAdShift}B.`,
    });
  }

  if (mode === 'micro' || mode === 'combined') {
    const mkt = computeLinearMarket({ a: 100, b: 2, c: 20, d: 2, tax: 4 });
    out.push({
      id: 'eq-micro-tax',
      topic: 'micro-supply-elasticity-tax',
      points: 1.5,
      title: 'Micro Equilibrium & Tax Deadweight Loss',
      prompt: `Given Qd = 100 − 2P and Qs = 20 + 2P with a $4 per-unit tax, what is the Deadweight Loss ($)?`,
      type: 'numeric',
      expected: String(mkt.dwlTax),
      solutionText: `P*=20, Q*=60; with $4 tax Qt=56, so DWL = ½ × 4 × (60 − 56) = $${mkt.dwlTax}.`,
    });
  }

  // Add seeded MCQs to bring total neatly up
  const pool = ECON_MCQS.filter((m) =>
    mode === 'macro'
      ? ECON_TOPIC_META[m.topic].scope === 'Macro Final'
      : mode === 'micro'
        ? ECON_TOPIC_META[m.topic].scope === 'Micro Midterm'
        : true,
  );
  const pickedMcqs = rng.shuffle(pool).slice(0, mode === 'micro' ? 4 : 2);
  pickedMcqs.forEach((m, idx) => {
    out.push({
      id: `eq-mcq-${idx}`,
      topic: m.topic,
      points: 1,
      title: `Concept MCQ (${m.chapter})`,
      prompt: m.question,
      type: 'mcq',
      choices: m.choices,
      expected: String(m.correctIndex),
      solutionText: m.explanation,
    });
  });

  return out;
}

interface EconExamPageProps {
  initialSeed?: string;
  onSeedChange: (seed: string) => void;
}

export const EconExamPage: React.FC<EconExamPageProps> = ({ initialSeed, onSeedChange }) => {
  const { addEconExamRecord, recordEconPractice } = useApp();
  const [seed, setSeed] = useState(initialSeed || randomSeedCode());
  const [mode, setMode] = useState<'macro' | 'micro' | 'combined'>('macro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secsLeft, setSecsLeft] = useState(60 * 60);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSeed && initialSeed !== seed) {
      setSeed(initialSeed);
      setAnswers({});
      setSubmitted(false);
    }
  }, [initialSeed]);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setSecsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [submitted, seed, mode]);

  const questions = useMemo(() => buildEconExam(seed, mode), [seed, mode]);

  const startNew = (nextMode: typeof mode) => {
    const s = randomSeedCode();
    setSeed(s);
    setMode(nextMode);
    onSeedChange(s);
    setAnswers({});
    setSubmitted(false);
    setSecsLeft(60 * 60);
  };

  const copyLink = async () => {
    const base = window.location.href.split('#')[0];
    await navigator.clipboard.writeText(`${base}#/econ/exam?seed=${encodeURIComponent(seed)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradeExam = () => {
    setSubmitted(true);
    let score = 0;
    let maxScore = 0;
    const byChapter: Record<string, { earned: number; total: number }> = {};

    for (const q of questions) {
      maxScore += q.points;
      const raw = (answers[q.id] ?? '').trim();
      const ok =
        q.type === 'numeric'
          ? Math.abs(Number(raw) - Number(q.expected)) < 0.05 && raw !== ''
          : raw === q.expected;
      const got = ok ? q.points : 0;
      score += got;
      const cur = byChapter[q.topic] ?? { earned: 0, total: 0 };
      byChapter[q.topic] = { earned: cur.earned + got, total: cur.total + q.points };
      recordEconPractice(q.topic, ok);
    }

    addEconExamRecord({
      id: `econ-${seed}-${Date.now()}`,
      seed,
      mode,
      score: Math.round(score * 10) / 10,
      maxScore: Math.round(maxScore * 10) / 10,
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
          <h1 className="text-2xl font-extrabold tracking-tight">Mock Economics Exam</h1>
          <p className="text-sm text-slate-500">
            Group Seed: <code className="font-mono font-bold text-emerald-600">{seed}</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 text-emerald-500" />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy Group Exam Link'}
          </button>
          {(['macro', 'micro', 'combined'] as const).map((m) => (
            <button
              key={m}
              onClick={() => startNew(m)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer ${
                mode === m
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300 dark:border-slate-700'
              }`}
            >
              <RefreshCw className="w-3 h-3" /> {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q) => {
          const raw = (answers[q.id] ?? '').trim();
          const ok =
            submitted &&
            (q.type === 'numeric'
              ? Math.abs(Number(raw) - Number(q.expected)) < 0.05 && raw !== ''
              : raw === q.expected);

          return (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {ECON_TOPIC_META[q.topic].code} · {q.points} pts
                  </span>
                  <h3 className="font-bold text-base">{q.title}</h3>
                </div>
                {submitted && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {ok ? `✓ +${q.points}` : `✗ 0/${q.points}`}
                  </span>
                )}
              </div>

              <p className="text-sm">{q.prompt}</p>

              {q.type === 'numeric' ? (
                <input
                  disabled={submitted}
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Enter numeric answer..."
                  className="w-full max-w-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.choices?.map((c, idx) => (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: String(idx) }))}
                      className={`p-2.5 rounded-xl border text-left text-xs cursor-pointer ${
                        answers[q.id] === String(idx)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {c}
                    </button>
                  ))}
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
          onClick={gradeExam}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer"
        >
          Submit &amp; Grade Economics Exam
        </button>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm font-bold">
          Exam graded and saved to your Economics Dashboard history!
        </div>
      )}
    </div>
  );
};
