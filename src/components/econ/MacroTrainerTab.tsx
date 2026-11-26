import React, { useMemo, useState } from 'react';
import { CheckCircle2, Eye, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeGdpTable, computeMoneyBanking, realInterestRate } from '../../math/economics';
import { createRng, randomSeedCode } from '../../math/prng';
import type { EconTopicId } from '../../types';
import { BiText } from '../BiText';

type ArrowDir = 'up' | 'down' | 'same';

interface ShockQuizItem {
  id: string;
  topic: EconTopicId;
  chapter: string;
  shockTitle: string;
  shockTitleVi: string;
  shiftOptions: string[];
  correctShiftIdx: number;
  vars: Array<{ label: string; expected: ArrowDir }>;
  explanation: string;
  explanationVi: string;
}

const SHOCK_QUIZ: ShockQuizItem[] = [
  {
    id: 'sq-1',
    topic: 'part9',
    chapter: 'Ch. 34',
    shockTitle: 'Central Bank buys government bonds in open-market operations (Short Run)',
    shockTitleVi: 'Ngân hàng Trung ương mua trái phiếu chính phủ trên thị trường mở (Ngắn hạn)',
    shiftOptions: [
      'MS shifts RIGHT → AD shifts RIGHT',
      'MS shifts LEFT → AD shifts LEFT',
      'SRAS shifts RIGHT → LRAS shifts RIGHT',
      'MD shifts RIGHT → AD shifts LEFT',
    ],
    correctShiftIdx: 0,
    vars: [
      { label: 'Interest rate r', expected: 'down' },
      { label: 'Output Y', expected: 'up' },
      { label: 'Unemployment u', expected: 'down' },
    ],
    explanation: 'Fed buys bonds → MS ↑ → interest rate r ↓ → Investment I ↑ → AD shifts RIGHT (Y ↑, P ↑, u ↓).',
    explanationVi: 'NHTW mua trái phiếu → Cung tiền MS ↑ → r ↓ → Đầu tư I ↑ → AD dịch PHẢI (Y ↑, P ↑, thất nghiệp u ↓).',
  },
  {
    id: 'sq-2',
    topic: 'part9',
    chapter: 'Ch. 33 & 35',
    shockTitle: 'Sudden oil/energy supply spike pushes production costs up sharply (Stagflation)',
    shockTitleVi: 'Giá dầu/năng lượng tăng vọt làm chi phí sản xuất tăng mạnh',
    shiftOptions: [
      'SRAS shifts LEFT & SRPC shifts RIGHT',
      'AD shifts LEFT & SRPC shifts LEFT',
      'SRAS shifts RIGHT & AD shifts RIGHT',
      'LRAS shifts RIGHT only',
    ],
    correctShiftIdx: 0,
    vars: [
      { label: 'Price level P / π', expected: 'up' },
      { label: 'Output Y', expected: 'down' },
      { label: 'Unemployment u', expected: 'up' },
    ],
    explanation: 'Higher input costs shift SRAS LEFT (P ↑, Y ↓ — Stagflation!) and shift SRPC RIGHT (higher π AND higher u).',
    explanationVi: 'Chi phí đầu vào tăng làm SRAS dịch TRÁI (P ↑ nhưng Y ↓ — đình lạm) và SRPC dịch PHẢI.',
  },
  {
    id: 'sq-3',
    topic: 'part6',
    chapter: 'Ch. 26',
    shockTitle: 'Closed Economy: Government runs a large budget deficit (G ↑ or T ↓)',
    shockTitleVi: 'Kinh tế đóng: Chính phủ thâm hụt ngân sách (Tăng chi tiêu hoặc giảm thuế)',
    shiftOptions: [
      'Supply of Loanable Funds shifts LEFT',
      'Demand for Loanable Funds shifts RIGHT',
      'Supply of Loanable Funds shifts RIGHT',
      'Demand for Loanable Funds shifts LEFT',
    ],
    correctShiftIdx: 0,
    vars: [
      { label: 'Real interest rate r', expected: 'up' },
      { label: 'Private Investment I', expected: 'down' },
      { label: 'National Saving S', expected: 'down' },
    ],
    explanation: 'Lower public saving reduces National Saving (Loanable Funds Supply shifts LEFT) → r ↑ and crowds out private Investment I ↓.',
    explanationVi: 'Tiết kiệm công giảm kéo Cung vốn vay dịch TRÁI → lãi suất thực r ↑ và lấn át Đầu tư tư nhân I ↓.',
  },
  {
    id: 'sq-4',
    topic: 'part8',
    chapter: 'Ch. 32',
    shockTitle: 'Large Open Economy: Government budget deficit expands',
    shockTitleVi: 'Kinh tế mở quy mô lớn: Thâm hụt ngân sách chính phủ tăng',
    shiftOptions: [
      'Loanable Funds Supply LEFT → NCO falls → FX Supply LEFT',
      'FX Demand shifts LEFT → r falls',
      'NCO shifts RIGHT → NX rises',
      'AD shifts LEFT immediately in FX',
    ],
    correctShiftIdx: 0,
    vars: [
      { label: 'Net Capital Outflow NCO', expected: 'down' },
      { label: 'Real Exchange Rate ε', expected: 'up' },
      { label: 'Net Exports NX', expected: 'down' },
    ],
    explanation: 'Budget deficit pushes r ↑ → domestic assets attractive → NCO ↓ → fewer dollars supplied to FX market → ε appreciates ↑ → NX ↓ (Twin Deficits).',
    explanationVi: 'Thâm hụt ngân sách làm r ↑ → NCO ↓ → Cung nội tệ trên thị trường ngoại hối giảm → ε tăng giá ↑ → Xuất khẩu ròng NX ↓.',
  },
  {
    id: 'sq-5',
    topic: 'part8',
    chapter: 'Ch. 32',
    shockTitle: 'Government imposes an Import Quota / Tariff on foreign cars',
    shockTitleVi: 'Chính phủ áp đặt hạn ngạch hoặc thuế quan lên hàng nhập khẩu',
    shiftOptions: [
      'Net Exports Demand in FX market shifts RIGHT (ε ↑, NX unchanged!)',
      'Loanable Funds Supply shifts RIGHT',
      'NCO shifts RIGHT → NX ↑ permanently',
      'Real interest rate r rises sharply',
    ],
    correctShiftIdx: 0,
    vars: [
      { label: 'Real interest rate r', expected: 'same' },
      { label: 'Real Exchange Rate ε', expected: 'up' },
      { label: 'Net Exports NX', expected: 'same' },
    ],
    explanation: 'Import barriers shift FX Demand RIGHT → ε appreciates ↑ → domestic exports fall as imports fall → aggregate NX stays UNCHANGED because NX = NCO(r)!',
    explanationVi: 'Thuế quan làm Cầu nội tệ tăng → ε tăng giá → xuất khẩu giảm bù lại đúng phần nhập khẩu giảm → tổng NX KHÔNG ĐỔI!',
  },
  {
    id: 'sq-6',
    topic: 'part8',
    chapter: 'Ch. 32',
    shockTitle: 'Political instability triggers Capital Flight (investors pull money abroad)',
    shockTitleVi: 'Bất ổn gây hiện tượng rút vốn ra nước ngoài (Capital Flight)',
    shiftOptions: [
      'NCO shifts RIGHT → Loanable Funds Demand RIGHT & FX Supply RIGHT',
      'Loanable Funds Supply RIGHT → FX Supply LEFT',
      'FX Demand shifts RIGHT → ε appreciates',
      'MS shifts RIGHT automatically',
    ],
    correctShiftIdx: 0,
    vars: [
      { label: 'Real interest rate r', expected: 'up' },
      { label: 'Real Exchange Rate ε', expected: 'down' },
      { label: 'Net Exports NX', expected: 'up' },
    ],
    explanation: 'Capital flight shifts NCO RIGHT → raises domestic r ↑ AND floods FX market with domestic currency → ε depreciates ↓ → NX rises ↑.',
    explanationVi: 'Vốn chảy ra làm NCO tăng → r ↑ đồng thời cung nội tệ tăng làm ε mất giá ↓ → kích thích NX ↑.',
  },
];

export const MacroTrainerTab: React.FC = () => {
  const { recordEconPractice, recordMistake } = useApp();
  const [subMode, setSubMode] = useState<'shock' | 'tables'>('shock');

  // --- Mode 1: Shock Predictor ---
  const [sIdx, setSIdx] = useState(0);
  const [pickedShift, setPickedShift] = useState<number | null>(null);
  const [pickedVars, setPickedVars] = useState<Record<number, ArrowDir>>({});
  const [shockChecked, setShockChecked] = useState(false);

  // --- Mode 2: Blank T-Account & GDP Table ---
  const [tblSeed, setTblSeed] = useState('ECON26');
  const tblData = useMemo(() => {
    const rng = createRng(`econ-tbl:${tblSeed}`);
    const deposits = rng.pick([800, 1000, 1200, 2000]);
    const resRatio = rng.pick([5, 10, 20]);
    const cap = rng.pick([50, 80, 100]);
    const bank = computeMoneyBanking({
      initialDeposit: deposits,
      reserveRatioPct: resRatio,
      excessReservePct: 0,
      currencyDrainPct: 0,
      bankAssets: deposits,
      bankCapital: cap,
      moneySupplyM: deposits,
      velocityV: 4,
      realOutputY: 1000,
    });

    const p1 = rng.int(4, 6);
    const q1 = rng.int(10, 15) * 10;
    const p2 = p1 + rng.int(1, 3);
    const q2 = q1 + rng.int(2, 4) * 10;
    const nomI = rng.int(8, 12);
    const gdp = computeGdpTable(
      ['Y1 (Base)', 'Y2'],
      [{ name: 'Rice', years: [{ price: p1, qty: q1 }, { price: p2, qty: q2 }] }],
      0,
    );
    const gdpInf = Math.round(((gdp[1].gdpDeflator - 100) / 100) * 100 * 100) / 100;
    const realR = realInterestRate(nomI, gdpInf);
    return { deposits, resRatio, cap, bank, p1, q1, p2, q2, nomI, gdp, gdpInf, realR };
  }, [tblSeed]);

  const [bInputs, setBInputs] = useState<Record<string, string>>({});
  const [bChecked, setBChecked] = useState(false);
  const [bReveal, setBReveal] = useState(false);

  const cur = SHOCK_QUIZ[sIdx];
  const reqRes = Math.round(((tblData.deposits * tblData.resRatio) / 100) * 100) / 100;
  const maxLoans = Math.round((tblData.deposits - reqRes) * 100) / 100;

  const isClose = (input: string | undefined, expected: number, tol = 0.2) => {
    if (!input || input.trim() === '') return false;
    const n = Number(input);
    return Number.isFinite(n) && Math.abs(n - expected) <= tol;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Macroeconomics Interactive Exam Trainers
          </h2>
          <BiText
            en="Predict curve shifts & variable arrows before seeing the answer, plus fill-in Bank T-Account & GDP tables."
            vi="Luyện đoán chiều dịch chuyển đường cong & dấu biến số trước khi xem đáp án, kèm bài điền bảng T-Account & GDP."
            className="text-xs text-slate-500 mt-0.5"
          />
        </div>
        <div className="flex gap-1.5 text-xs">
          <button
            onClick={() => setSubMode('shock')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
              subMode === 'shock'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Shock Predictor Quiz
          </button>
          <button
            onClick={() => setSubMode('tables')}
            className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
              subMode === 'tables'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Blank T-Account &amp; GDP Drills
          </button>
        </div>
      </div>

      {/* MODE 1: SHOCK PREDICTOR */}
      {subMode === 'shock' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-emerald-600">
              Scenario {sIdx + 1} / {SHOCK_QUIZ.length} · {cur.chapter}
            </span>
            <div className="flex gap-1.5">
              {SHOCK_QUIZ.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSIdx(i);
                    setPickedShift(null);
                    setPickedVars({});
                    setShockChecked(false);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                    i === sIdx
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <BiText en={cur.shockTitle} vi={cur.shockTitleVi} className="text-base font-bold" />

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 1 — Which primary curve(s) shift?
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {cur.shiftOptions.map((opt, idx) => {
                const isCorr = idx === cur.correctShiftIdx;
                const isChosen = pickedShift === idx;
                let cls = 'border-slate-200 dark:border-slate-700 hover:border-emerald-400';
                if (shockChecked) {
                  if (isCorr) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                  else if (isChosen) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
                } else if (isChosen) {
                  cls = 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 font-semibold';
                }
                return (
                  <button
                    key={idx}
                    disabled={shockChecked}
                    onClick={() => setPickedShift(idx)}
                    className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between gap-2 cursor-pointer ${cls}`}
                  >
                    <span>
                      <strong>{String.fromCharCode(65 + idx)}.</strong> {opt}
                    </span>
                    {shockChecked && isCorr && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {shockChecked && isChosen && !isCorr && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 2 — Predict variable directions
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {cur.vars.map((v, vi) => {
                const chosen = pickedVars[vi];
                const ok = shockChecked && chosen === v.expected;
                return (
                  <div
                    key={v.label}
                    className={`p-3 rounded-xl border space-y-2 ${
                      shockChecked
                        ? ok
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{v.label}</div>
                    <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                      {(
                        [
                          { id: 'up', txt: '↑ Rise' },
                          { id: 'down', txt: '↓ Fall' },
                          { id: 'same', txt: '= Same' },
                        ] as const
                      ).map((btn) => (
                        <button
                          key={btn.id}
                          disabled={shockChecked}
                          onClick={() => setPickedVars((p) => ({ ...p, [vi]: btn.id }))}
                          className={`py-1 rounded-lg border cursor-pointer ${
                            chosen === btn.id
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {btn.txt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setShockChecked(true);
                const allOk =
                  pickedShift === cur.correctShiftIdx &&
                  cur.vars.every((v, vi) => pickedVars[vi] === v.expected);
                recordEconPractice(cur.topic, allOk);
                if (!allOk) {
                  recordMistake({
                    id: `econ-shock-${cur.id}`,
                    subject: 'econ',
                    topicLabel: `Shock Quiz · ${cur.chapter}`,
                    question: cur.shockTitle,
                    choices: cur.shiftOptions,
                    correctIndex: cur.correctShiftIdx,
                    expectedText: cur.vars.map((v) => `${v.label}: ${v.expected}`).join(' | '),
                    explanation: cur.explanation,
                    source: 'mistake',
                  });
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              Check Prediction
            </button>
            {shockChecked && (
              <button
                onClick={() => {
                  setSIdx((i) => (i + 1) % SHOCK_QUIZ.length);
                  setPickedShift(null);
                  setPickedVars({});
                  setShockChecked(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                Next Scenario →
              </button>
            )}
          </div>

          {shockChecked && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                Expected directions:{' '}
                {cur.vars
                  .map((v) => `${v.label} ${v.expected === 'up' ? '↑' : v.expected === 'down' ? '↓' : 'unchanged'}`)
                  .join(' · ')}
              </div>
              <BiText en={cur.explanation} vi={cur.explanationVi} />
            </div>
          )}
        </div>
      )}

      {/* MODE 2: BLANK T-ACCOUNT & GDP DRILLS */}
      {subMode === 'tables' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setTblSeed(randomSeedCode());
                setBInputs({});
                setBChecked(false);
                setBReveal(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Randomized Tables
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Bank T-Account Blank Drill */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-sm">1) Blank Bank Balance Sheet &amp; Multiplier (Ch. 29)</h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono">
                Given: Customer Deposits = <strong>${tblData.deposits}</strong>, Required Reserve Ratio
                R = <strong>{tblData.resRatio}%</strong>, Total Assets = <strong>${tblData.deposits}</strong>,
                Bank Capital = <strong>${tblData.cap}</strong>. (Assume 0 excess reserves &amp; 0 cash drain).
              </div>
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <label>
                  Required Reserves ($)
                  <input
                    value={bInputs.reqRes ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, reqRes: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.reqRes, reqRes)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
                <label>
                  Max Bank Loans ($)
                  <input
                    value={bInputs.loans ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, loans: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.loans, maxLoans)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
                <label>
                  Money Multiplier (1/R)
                  <input
                    value={bInputs.mult ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, mult: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.mult, tblData.bank.moneyMultiplier)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
                <label>
                  Leverage Ratio (Assets/Cap)
                  <input
                    value={bInputs.lev ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, lev: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.lev, tblData.bank.leverageRatio)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
              </div>
            </div>

            {/* GDP + Real Interest Blank Drill */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <h3 className="font-bold text-sm">2) Blank 2-Year GDP Deflator &amp; Fisher Drill (Ch. 23–24)</h3>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono">
                Rice-only economy: Y1 (Base) P=${tblData.p1}, Q={tblData.q1}; Y2 P=${tblData.p2}, Q={tblData.q2}.
                Nominal interest rate i = <strong>{tblData.nomI}%</strong>.
              </div>
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <label>
                  Y2 Nominal GDP ($)
                  <input
                    value={bInputs.nomGdp ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, nomGdp: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.nomGdp, tblData.gdp[1].nominalGdp)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
                <label>
                  Y2 Real GDP ($)
                  <input
                    value={bInputs.realGdp ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, realGdp: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.realGdp, tblData.gdp[1].realGdp)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
                <label>
                  Y2 GDP Deflator
                  <input
                    value={bInputs.def ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, def: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.def, tblData.gdp[1].gdpDeflator)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
                <label>
                  Real Interest r (%)
                  <input
                    value={bInputs.realR ?? ''}
                    onChange={(e) => setBInputs((p) => ({ ...p, realR: e.target.value }))}
                    className={`mt-1 w-full px-2.5 py-1.5 rounded border bg-white dark:bg-slate-950 ${
                      bChecked
                        ? isClose(bInputs.realR, tblData.realR)
                          ? 'border-emerald-500'
                          : 'border-rose-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setBChecked(true);
                const bankOk =
                  isClose(bInputs.reqRes, reqRes) &&
                  isClose(bInputs.loans, maxLoans) &&
                  isClose(bInputs.mult, tblData.bank.moneyMultiplier) &&
                  isClose(bInputs.lev, tblData.bank.leverageRatio);
                const gdpOk =
                  isClose(bInputs.nomGdp, tblData.gdp[1].nominalGdp) &&
                  isClose(bInputs.realGdp, tblData.gdp[1].realGdp) &&
                  isClose(bInputs.def, tblData.gdp[1].gdpDeflator) &&
                  isClose(bInputs.realR, tblData.realR);
                recordEconPractice('part7', bankOk);
                recordEconPractice('part6', gdpOk);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
            >
              Check All Cells
            </button>
            <button
              onClick={() => setBReveal((v) => !v)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> {bReveal ? 'Hide' : 'Reveal'} Solutions
            </button>
          </div>

          {bReveal && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1">
              <div>
                <strong>Bank T-Account:</strong> Required Reserves = ${reqRes} · Max Loans = ${maxLoans} ·
                Multiplier = {tblData.bank.moneyMultiplier} · Leverage = {tblData.bank.leverageRatio}×
              </div>
              <div>
                <strong>GDP &amp; Fisher:</strong> Nominal = ${tblData.gdp[1].nominalGdp} · Real = $
                {tblData.gdp[1].realGdp} · Deflator = {tblData.gdp[1].gdpDeflator} (π = {tblData.gdpInf}%) ·
                Real r = {tblData.nomI}% − {tblData.gdpInf}% = {tblData.realR}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
