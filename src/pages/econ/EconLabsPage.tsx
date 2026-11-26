import React, { useMemo, useState } from 'react';
import {
  computeCpiTable,
  computeGdpTable,
  computeMoneyBanking,
  computeMultipliers,
  computeOpenEconomy,
  computePeAndDividend,
  computeSacrificeRatio,
  computeSavingAndUnemployment,
  indexDollarValue,
  OPEN_ECON_POLICIES,
  realInterestRate,
  type OpenEconPolicyId,
} from '../../math/economics';
import type { EconLabTab } from '../../types';
import { useApp } from '../../context/AppContext';
import { AdAsSvg, MACRO_SHOCKS, type MacroShockId } from '../../components/econ/AdAsSvg';
import { TwinMarketSvg } from '../../components/econ/TwinMarketSvg';
import { BiText } from '../../components/BiText';

interface EconLabsPageProps {
  activeTab: EconLabTab;
  onSelectTab: (tab: EconLabTab) => void;
}

const TABS: Array<{ id: EconLabTab; label: string; badge: string }> = [
  { id: 'part6', label: 'Real Economy (GDP, CPI, Saving, Unemp)', badge: 'Part 6 · Ch.23–28' },
  { id: 'part7', label: 'Money, Multiplier & MV = PY', badge: 'Part 7 · Ch.29–30' },
  { id: 'part8', label: 'Open Economy & Twin Markets', badge: 'Part 8 · Ch.31–32' },
  { id: 'part9', label: 'AD–AS, Multipliers & Phillips Curve', badge: 'Part 9 · Ch.33–35' },
];

export const EconLabsPage: React.FC<EconLabsPageProps> = ({ activeTab, onSelectTab }) => {
  const { recordEconPractice } = useApp();

  // Part 6 state
  const [pA1, setPA1] = useState(10);
  const [qA1, setQA1] = useState(400);
  const [pA2, setPA2] = useState(11);
  const [qA2, setQA2] = useState(500);
  const [pB1, setPB1] = useState(2);
  const [qB1, setQB1] = useState(1000);
  const [pB2, setPB2] = useState(2.5);
  const [qB2, setQB2] = useState(1100);
  const [cpiThen, setCpiThen] = useState(100);
  const [cpiNow, setCpiNow] = useState(175);
  const [amountThen, setAmountThen] = useState(500);
  const [nomRate, setNomRate] = useState(8);
  const [infRate, setInfRate] = useState(3);

  const [macroY, setMacroY] = useState(10000);
  const [macroC, setMacroC] = useState(6000);
  const [macroG, setMacroG] = useState(1700);
  const [macroT, setMacroT] = useState(1500);
  const [stockPrice, setStockPrice] = useState(60);
  const [eps, setEps] = useState(4);
  const [divYield, setDivYield] = useState(2.5);
  const [employed, setEmployed] = useState(145);
  const [unemployed, setUnemployed] = useState(5);
  const [notInLf, setNotInLf] = useState(50);

  // Part 7 state
  const [dep, setDep] = useState(1000);
  const [resRatio, setResRatio] = useState(10);
  const [exRes, setExRes] = useState(0);
  const [currDrain, setCurrDrain] = useState(0);
  const [assets, setAssets] = useState(1000);
  const [cap, setCap] = useState(50);
  const [mSupply, setMSupply] = useState(500);
  const [vel, setVel] = useState(4);
  const [realOut, setRealOut] = useState(1000);

  // Part 8 state
  const [nomEx, setNomEx] = useState(100);
  const [domP, setDomP] = useState(2);
  const [forP, setForP] = useState(400);
  const [natS, setNatS] = useState(1200);
  const [domI, setDomI] = useState(900);
  const [openPolicy, setOpenPolicy] = useState<OpenEconPolicyId>('budget-deficit');

  // Part 9 state
  const [shock, setShock] = useState<MacroShockId>('adverse-supply');
  const [mpc, setMpc] = useState(0.8);
  const [dG, setDG] = useState(50);
  const [dT, setDT] = useState(0);
  const [infDrop, setInfDrop] = useState(4);
  const [sacRatio, setSacRatio] = useState(5);
  const [disinfYears, setDisinfYears] = useState(2);

  const gdpRows = useMemo(
    () =>
      computeGdpTable(
        ['Year 1 (Base)', 'Year 2'],
        [
          { name: 'Good A', years: [{ price: pA1, qty: qA1 }, { price: pA2, qty: qA2 }] },
          { name: 'Good B', years: [{ price: pB1, qty: qB1 }, { price: pB2, qty: qB2 }] },
        ],
        0,
      ),
    [pA1, qA1, pA2, qA2, pB1, qB1, pB2, qB2],
  );

  const cpiRows = useMemo(
    () =>
      computeCpiTable(
        ['Year 1 (Base)', 'Year 2'],
        [
          { name: 'Good A', basketQty: qA1, prices: [pA1, pA2] },
          { name: 'Good B', basketQty: qB1, prices: [pB1, pB2] },
        ],
        0,
      ),
    [pA1, qA1, pA2, pB1, qB1, pB2],
  );

  const savUnemp = useMemo(
    () =>
      computeSavingAndUnemployment({
        Y: macroY,
        C: macroC,
        G: macroG,
        T: macroT,
        employed,
        unemployed,
        notInLaborForce: notInLf,
      }),
    [macroY, macroC, macroG, macroT, employed, unemployed, notInLf],
  );

  const stockInfo = useMemo(
    () => computePeAndDividend(stockPrice, eps, divYield),
    [stockPrice, eps, divYield],
  );

  const moneyRes = useMemo(
    () =>
      computeMoneyBanking({
        initialDeposit: dep,
        reserveRatioPct: resRatio,
        excessReservePct: exRes,
        currencyDrainPct: currDrain,
        bankAssets: assets,
        bankCapital: cap,
        moneySupplyM: mSupply,
        velocityV: vel,
        realOutputY: realOut,
      }),
    [dep, resRatio, exRes, currDrain, assets, cap, mSupply, vel, realOut],
  );

  const openRes = useMemo(
    () =>
      computeOpenEconomy({
        nominalExchangeRate: nomEx,
        domesticPrice: domP,
        foreignPrice: forP,
        nationalSavingS: natS,
        domesticInvestmentI: domI,
      }),
    [nomEx, domP, forP, natS, domI],
  );

  const multRes = useMemo(() => computeMultipliers(mpc, dG, dT), [mpc, dG, dT]);
  const sacRes = useMemo(
    () => computeSacrificeRatio(infDrop, sacRatio, disinfYears),
    [infDrop, sacRatio, disinfYears],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Interactive Macroeconomics Labs</h1>
        <BiText
          en="Organized directly by Parts 6–9 of the ECO101 Final Exam syllabus (Ch. 23–26, 28–35)."
          vi="Chia đúng theo 4 phần kiến thức thi cuối kỳ Kinh tế Vĩ mô (Phần 6–9)."
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400'
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {t.badge}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'part6' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">GDP Deflator vs. CPI Basket Calculator (Ch. 23–24)</h3>
            <div className="grid sm:grid-cols-4 gap-3 text-xs">
              <label>Good A Y1 P <input type="number" value={pA1} onChange={(e) => setPA1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good A Y1 Q <input type="number" value={qA1} onChange={(e) => setQA1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good A Y2 P <input type="number" value={pA2} onChange={(e) => setPA2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good A Y2 Q <input type="number" value={qA2} onChange={(e) => setQA2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y1 P <input type="number" value={pB1} onChange={(e) => setPB1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y1 Q <input type="number" value={qB1} onChange={(e) => setQB1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y2 P <input type="number" value={pB2} onChange={(e) => setPB2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y2 Q <input type="number" value={qB2} onChange={(e) => setQB2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="font-sans font-bold text-slate-600 dark:text-slate-300 mb-1">GDP Results (Year 1 = Base)</div>
                {gdpRows.map((r) => (
                  <div key={r.yearLabel}>
                    <strong>{r.yearLabel}:</strong> Nom={r.nominalGdp} | Real={r.realGdp} | Deflator={r.gdpDeflator}
                    {r.realGrowthPct !== null && ` | g=${r.realGrowthPct}% | π=${r.inflationPct}%`}
                  </div>
                ))}
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="font-sans font-bold text-slate-600 dark:text-slate-300 mb-1">CPI Results (Year 1 Basket Fixed)</div>
                {cpiRows.map((r) => (
                  <div key={r.yearLabel}>
                    <strong>{r.yearLabel}:</strong> Cost={r.basketCost} | CPI={r.cpi}
                    {r.inflationPct !== null && ` | π=${r.inflationPct}%`}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-sm">CPI Indexing &amp; Real Rate (Ch. 24)</h3>
              <div className="grid grid-cols-3 gap-1.5">
                <label>$ Then <input type="number" value={amountThen} onChange={(e) => setAmountThen(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>CPI_T <input type="number" value={cpiThen} onChange={(e) => setCpiThen(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>CPI_now <input type="number" value={cpiNow} onChange={(e) => setCpiNow(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono">Indexed Value = <strong>${indexDollarValue(amountThen, cpiThen, cpiNow)}</strong></div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <label>Nom i% <input type="number" value={nomRate} onChange={(e) => setNomRate(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Infl π% <input type="number" value={infRate} onChange={(e) => setInfRate(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono">Real r = <strong>{realInterestRate(nomRate, infRate)}%</strong></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-sm">National Saving &amp; P/E (Ch. 26)</h3>
              <div className="grid grid-cols-2 gap-1.5">
                <label>Y <input type="number" value={macroY} onChange={(e) => setMacroY(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>C <input type="number" value={macroC} onChange={(e) => setMacroC(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>G <input type="number" value={macroG} onChange={(e) => setMacroG(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>T <input type="number" value={macroT} onChange={(e) => setMacroT(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                Priv={savUnemp.privateSaving} | Pub={savUnemp.publicSaving}<br />
                National S = I = <strong>{savUnemp.nationalSaving}</strong>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <label>Price <input type="number" value={stockPrice} onChange={(e) => setStockPrice(Number(e.target.value))} className="w-full px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>EPS <input type="number" value={eps} onChange={(e) => setEps(Number(e.target.value))} className="w-full px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Yield% <input type="number" step="0.5" value={divYield} onChange={(e) => setDivYield(Number(e.target.value))} className="w-full px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono">P/E={stockInfo.peRatio} | Div=${stockInfo.dividendPerShare}</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-sm">Labor Force &amp; Discouraged Test (Ch. 28)</h3>
              <div className="grid grid-cols-3 gap-1.5">
                <label>Employed <input type="number" value={employed} onChange={(e) => setEmployed(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Unemp <input type="number" value={unemployed} onChange={(e) => setUnemployed(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Not LF <input type="number" value={notInLf} onChange={(e) => setNotInLf(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg space-y-1">
                <div>LF = {savUnemp.laborForce} | Pop = {savUnemp.adultPop}</div>
                <div>u-rate = <strong>{savUnemp.unemploymentRate}%</strong> | LFPR = <strong>{savUnemp.lfpr}%</strong></div>
              </div>
              <button
                onClick={() => {
                  if (unemployed >= 2) {
                    setUnemployed((u) => u - 2);
                    setNotInLf((n) => n + 2);
                  }
                }}
                className="w-full py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold cursor-pointer"
              >
                Simulate 2 Workers Becoming Discouraged →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'part7' && (
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">Money Multiplier (Simple vs. Actual) &amp; Bank Leverage (Ch. 29)</h3>
            <div className="grid grid-cols-2 gap-2">
              <label>Initial Deposit / OMO $ <input type="number" value={dep} onChange={(e) => setDep(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Required Reserve rr% <input type="number" value={resRatio} onChange={(e) => setResRatio(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Excess Reserve er% <input type="number" min={0} value={exRes} onChange={(e) => setExRes(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Currency Drain cr% <input type="number" min={0} value={currDrain} onChange={(e) => setCurrDrain(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Bank Assets <input type="number" value={assets} onChange={(e) => setAssets(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Bank Capital <input type="number" value={cap} onChange={(e) => setCap(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
            </div>
            <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
              <div>Simple Multiplier (1/rr) = <strong>{moneyRes.moneyMultiplier}</strong> → Max MS = <strong>${moneyRes.maxTotalMoneyCreated}</strong></div>
              <div>Actual Multiplier (with er, cr) = <strong>{moneyRes.actualMultiplier}</strong> → Actual MS = <strong>${moneyRes.actualMoneyCreated}</strong></div>
              <div>Leverage Ratio = <strong>{moneyRes.leverageRatio}:1</strong> (asset drop &gt; {Math.round(100 / Math.max(1, moneyRes.leverageRatio))}% wipes out capital!)</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">Quantity Theory of Money: M × V = P × Y (Ch. 30)</h3>
            <div className="grid grid-cols-3 gap-2">
              <label>Money Supply M <input type="number" value={mSupply} onChange={(e) => setMSupply(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Velocity V <input type="number" value={vel} onChange={(e) => setVel(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Real Output Y <input type="number" value={realOut} onChange={(e) => setRealOut(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
            </div>
            <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
              <div>Price Level P = (M × V) / Y = <strong>{moneyRes.priceLevel}</strong></div>
              <div>Value of $1 (1/P) = <strong>{moneyRes.priceLevel > 0 ? (1 / moneyRes.priceLevel).toFixed(3) : '—'}</strong> goods</div>
              <div>Nominal GDP (P × Y) = <strong>{mSupply * vel}</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'part8' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">Chapter 32: Twin-Market Open-Economy Policy Simulator</h3>
            <div className="flex flex-wrap gap-2">
              {OPEN_ECON_POLICIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setOpenPolicy(p.id);
                    recordEconPractice('part8', true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    openPolicy === p.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>

            <TwinMarketSvg policyId={openPolicy} />

            {(() => {
              const cur = OPEN_ECON_POLICIES.find((p) => p.id === openPolicy)!;
              return (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
                  <div className="grid sm:grid-cols-4 gap-2 font-mono">
                    <div>Real Interest r: <strong>{cur.realInterestRate}</strong></div>
                    <div>NCO: <strong>{cur.nco}</strong></div>
                    <div>Real FX ε: <strong>{cur.realExchangeRate}</strong></div>
                    <div>Net Exports NX: <strong>{cur.netExports}</strong></div>
                  </div>
                  <BiText en={cur.explanation} vi={cur.explanationVi} className="text-sm pt-1" />
                </div>
              );
            })()}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm">Real Exchange Rate, PPP &amp; NCO = S − I Calculator (Ch. 31)</h3>
            <div className="flex flex-wrap gap-3">
              <label>Nominal e (foreign/$) <input type="number" value={nomEx} onChange={(e) => setNomEx(Number(e.target.value))} className="mt-1 block w-28 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Domestic P <input type="number" value={domP} onChange={(e) => setDomP(Number(e.target.value))} className="mt-1 block w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Foreign P* <input type="number" value={forP} onChange={(e) => setForP(Number(e.target.value))} className="mt-1 block w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Saving S <input type="number" value={natS} onChange={(e) => setNatS(Number(e.target.value))} className="mt-1 block w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Investment I <input type="number" value={domI} onChange={(e) => setDomI(Number(e.target.value))} className="mt-1 block w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
            </div>
            <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              Real FX ε = <strong>{openRes.realExchangeRate}</strong> | PPP Nominal e = <strong>{openRes.pppNominalRate}</strong> | NCO = NX = <strong>{openRes.nx}</strong> ({openRes.tradeStatus})
            </div>
          </div>
        </div>
      )}

      {activeTab === 'part9' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">AD–SRAS–LRAS &amp; Phillips Curve Shock Simulator (Ch. 33 &amp; 35)</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MACRO_SHOCKS) as MacroShockId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setShock(id);
                    recordEconPractice('part9', true);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    shock === id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {MACRO_SHOCKS[id].title}
                </button>
              ))}
            </div>

            <AdAsSvg shockId={shock} />

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1.5">
              <div><strong>Short Run (AD–AS):</strong> {MACRO_SHOCKS[shock].srOutcome}</div>
              <div><strong>Long-Run Self-Correction:</strong> {MACRO_SHOCKS[shock].lrAdjustment}</div>
              <div><strong>Phillips Curve (SRPC):</strong> {MACRO_SHOCKS[shock].srpcEffect}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm">Spending &amp; Tax Multiplier Calculator (Ch. 34)</h3>
              <div className="flex flex-wrap gap-3">
                <label>MPC <input type="number" step="0.05" max="0.99" min="0" value={mpc} onChange={(e) => setMpc(Number(e.target.value))} className="mt-1 block w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>ΔG ($B) <input type="number" value={dG} onChange={(e) => setDG(Number(e.target.value))} className="mt-1 block w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>ΔT ($B) <input type="number" value={dT} onChange={(e) => setDT(Number(e.target.value))} className="mt-1 block w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                Spending Mult = {multRes.spendingMultiplier} | Tax Mult = {multRes.taxMultiplier}<br />
                Total AD Shift = <strong>${multRes.totalAdShift}B</strong>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm">Disinflation Sacrifice Ratio Calculator (Ch. 35)</h3>
              <div className="flex flex-wrap gap-3">
                <label>Δπ Drop (%) <input type="number" value={infDrop} onChange={(e) => setInfDrop(Number(e.target.value))} className="mt-1 block w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Sacrifice Ratio <input type="number" value={sacRatio} onChange={(e) => setSacRatio(Number(e.target.value))} className="mt-1 block w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Years <input type="number" min={1} value={disinfYears} onChange={(e) => setDisinfYears(Number(e.target.value))} className="mt-1 block w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                Total Annual GDP Lost = <strong>{sacRes.totalGdpLossPct}%</strong> | Per Year ({disinfYears}y) = <strong>{sacRes.annualGdpLossPct}%/yr</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
