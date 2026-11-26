import React, { useMemo, useState } from 'react';
import {
  computeComparativeAdvantage,
  computeCpiTable,
  computeGdpTable,
  computeLinearMarket,
  computeMidpointElasticity,
  computeMoneyBanking,
  computeMonopolyLinear,
  computeMultipliers,
  computeOpenEconomy,
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
import { SupplyDemandSvg } from '../../components/econ/SupplyDemandSvg';
import { BiText } from '../../components/BiText';

interface EconLabsPageProps {
  activeTab: EconLabTab;
  onSelectTab: (tab: EconLabTab) => void;
}

const TABS: Array<{ id: EconLabTab; label: string; badge: string }> = [
  { id: 'gdp-cpi', label: 'GDP, CPI & Unemployment', badge: 'Ch. 23–24, 28' },
  { id: 'money-saving', label: 'Saving, Money & Fisher', badge: 'Ch. 26, 29–30' },
  { id: 'open-econ', label: 'Open Economy & Twin Markets', badge: 'Ch. 31–32' },
  { id: 'adas-phillips', label: 'AD–AS, Multipliers & Phillips', badge: 'Ch. 33–35' },
  { id: 'micro', label: 'Micro: S/D, Tax, Elasticity & Monopoly', badge: 'Micro Ch. 3–15' },
];

export const EconLabsPage: React.FC<EconLabsPageProps> = ({ activeTab, onSelectTab }) => {
  const { recordEconPractice } = useApp();

  // Tab 1: GDP & CPI
  const [pPizza1, setPPizza1] = useState(10);
  const [qPizza1, setQPizza1] = useState(400);
  const [pPizza2, setPPizza2] = useState(11);
  const [qPizza2, setQPizza2] = useState(500);
  const [pCoffee1, setPCoffee1] = useState(2);
  const [qCoffee1, setQCoffee1] = useState(1000);
  const [pCoffee2, setPCoffee2] = useState(2.5);
  const [qCoffee2, setQCoffee2] = useState(1100);
  const [cpiThen, setCpiThen] = useState(100);
  const [cpiNow, setCpiNow] = useState(175);
  const [amountThen, setAmountThen] = useState(500);
  const [nomRate, setNomRate] = useState(8);
  const [infRate, setInfRate] = useState(3);

  // Tab 2: Saving, Unemp & Money
  const [macroY, setMacroY] = useState(10000);
  const [macroC, setMacroC] = useState(6000);
  const [macroG, setMacroG] = useState(1700);
  const [macroT, setMacroT] = useState(1500);
  const [employed, setEmployed] = useState(145);
  const [unemployed, setUnemployed] = useState(5);
  const [notInLf, setNotInLf] = useState(50);

  const [dep, setDep] = useState(1000);
  const [resRatio, setResRatio] = useState(10);
  const [assets, setAssets] = useState(1000);
  const [cap, setCap] = useState(50);
  const [mSupply, setMSupply] = useState(500);
  const [vel, setVel] = useState(4);
  const [realOut, setRealOut] = useState(1000);

  // Tab 3: Open Economy
  const [nomEx, setNomEx] = useState(100);
  const [domP, setDomP] = useState(2);
  const [forP, setForP] = useState(400);
  const [natS, setNatS] = useState(1200);
  const [domI, setDomI] = useState(900);
  const [openPolicy, setOpenPolicy] = useState<OpenEconPolicyId>('budget-deficit');

  // Tab 4: AD-AS + Multipliers + Phillips
  const [shock, setShock] = useState<MacroShockId>('adverse-supply');
  const [mpc, setMpc] = useState(0.75);
  const [dG, setDG] = useState(20);
  const [dT, setDT] = useState(0);

  // Tab 5: Micro
  const [a, setA] = useState(100);
  const [b, setB] = useState(2);
  const [c, setC] = useState(20);
  const [d, setD] = useState(2);
  const [tax, setTax] = useState(4);
  const [p1, setP1] = useState(4);
  const [q1, setQ1] = useState(120);
  const [p2, setP2] = useState(6);
  const [q2, setQ2] = useState(80);
  const [monoA, setMonoA] = useState(100);
  const [monoB, setMonoB] = useState(1);
  const [monoMc, setMonoMc] = useState(20);
  const [monoFc, setMonoFc] = useState(100);
  const [aG1, setAG1] = useState(8);
  const [aG2, setAG2] = useState(32);
  const [bG1, setBG1] = useState(24);
  const [bG2, setBG2] = useState(48);

  const gdpRows = useMemo(
    () =>
      computeGdpTable(
        ['Year 1 (Base)', 'Year 2'],
        [
          { name: 'Good A', years: [{ price: pPizza1, qty: qPizza1 }, { price: pPizza2, qty: qPizza2 }] },
          { name: 'Good B', years: [{ price: pCoffee1, qty: qCoffee1 }, { price: pCoffee2, qty: qCoffee2 }] },
        ],
        0,
      ),
    [pPizza1, qPizza1, pPizza2, qPizza2, pCoffee1, qCoffee1, pCoffee2, qCoffee2],
  );

  const cpiRows = useMemo(
    () =>
      computeCpiTable(
        ['Year 1 (Base)', 'Year 2'],
        [
          { name: 'Good A', basketQty: qPizza1, prices: [pPizza1, pPizza2] },
          { name: 'Good B', basketQty: qCoffee1, prices: [pCoffee1, pCoffee2] },
        ],
        0,
      ),
    [pPizza1, qPizza1, pPizza2, pCoffee1, qCoffee1, pCoffee2],
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

  const moneyRes = useMemo(
    () =>
      computeMoneyBanking({
        initialDeposit: dep,
        reserveRatioPct: resRatio,
        bankAssets: assets,
        bankCapital: cap,
        moneySupplyM: mSupply,
        velocityV: vel,
        realOutputY: realOut,
      }),
    [dep, resRatio, assets, cap, mSupply, vel, realOut],
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
  const marketRes = useMemo(() => computeLinearMarket({ a, b, c, d, tax }), [a, b, c, d, tax]);
  const elastRes = useMemo(() => computeMidpointElasticity(p1, q1, p2, q2), [p1, q1, p2, q2]);
  const monoRes = useMemo(() => computeMonopolyLinear(monoA, monoB, monoMc, monoFc), [monoA, monoB, monoMc, monoFc]);
  const tradeRes = useMemo(
    () =>
      computeComparativeAdvantage({
        personAName: 'Country A',
        personBName: 'Country B',
        good1Name: 'Meat',
        good2Name: 'Potatoes',
        aGood1Max: aG1,
        aGood2Max: aG2,
        bGood1Max: bG1,
        bGood2Max: bG2,
      }),
    [aG1, aG2, bG1, bG2],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Interactive Economics Labs</h1>
        <BiText
          en="Experiment with live macroeconomic & microeconomic models, curve shifters, and step-by-step calculators."
          vi="Thử nghiệm trực tiếp các mô hình Kinh tế Vĩ mô & Vi mô, dịch chuyển đường và máy tính từng bước."
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

      {activeTab === 'gdp-cpi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">Nominal GDP, Real GDP, GDP Deflator &amp; CPI Basket Simulator</h3>
            <div className="grid sm:grid-cols-4 gap-3 text-xs">
              <label>Good A Y1 P <input type="number" value={pPizza1} onChange={(e) => setPPizza1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good A Y1 Q <input type="number" value={qPizza1} onChange={(e) => setQPizza1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good A Y2 P <input type="number" value={pPizza2} onChange={(e) => setPPizza2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good A Y2 Q <input type="number" value={qPizza2} onChange={(e) => setQPizza2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y1 P <input type="number" value={pCoffee1} onChange={(e) => setPCoffee1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y1 Q <input type="number" value={qCoffee1} onChange={(e) => setQCoffee1(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y2 P <input type="number" value={pCoffee2} onChange={(e) => setPCoffee2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Good B Y2 Q <input type="number" value={qCoffee2} onChange={(e) => setQCoffee2(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
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
                    {r.inflationPct !== null && ` | CPI Inflation=${r.inflationPct}%`}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
              <h3 className="font-bold text-sm">Dollar Indexing &amp; Real Interest Rate</h3>
              <div className="flex flex-wrap gap-2">
                <label>Amount $ <input type="number" value={amountThen} onChange={(e) => setAmountThen(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>CPI_T <input type="number" value={cpiThen} onChange={(e) => setCpiThen(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>CPI_now <input type="number" value={cpiNow} onChange={(e) => setCpiNow(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono">Equivalent Today: <strong>${indexDollarValue(amountThen, cpiThen, cpiNow)}</strong></div>
              <div className="flex flex-wrap gap-2 pt-2">
                <label>Nominal i% <input type="number" value={nomRate} onChange={(e) => setNomRate(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Inflation π% <input type="number" value={infRate} onChange={(e) => setInfRate(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono">Real Interest r = i − π = <strong>{realInterestRate(nomRate, infRate)}%</strong></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
              <h3 className="font-bold text-sm">Labor Force &amp; Unemployment Rate (Ch. 28)</h3>
              <div className="flex flex-wrap gap-2">
                <label>Employed <input type="number" value={employed} onChange={(e) => setEmployed(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Unemployed <input type="number" value={unemployed} onChange={(e) => setUnemployed(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Not in LF <input type="number" value={notInLf} onChange={(e) => setNotInLf(Number(e.target.value))} className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
                <div>Labor Force = {savUnemp.laborForce} | Adult Pop = {savUnemp.adultPop}</div>
                <div>Unemployment Rate = <strong>{savUnemp.unemploymentRate}%</strong> | LFPR = <strong>{savUnemp.lfpr}%</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'money-saving' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm">National Saving &amp; Budget Identities (Ch. 26)</h3>
            <div className="grid grid-cols-2 gap-2">
              <label>GDP (Y) <input type="number" value={macroY} onChange={(e) => setMacroY(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Consumption (C) <input type="number" value={macroC} onChange={(e) => setMacroC(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Gov Purchases (G) <input type="number" value={macroG} onChange={(e) => setMacroG(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Taxes (T) <input type="number" value={macroT} onChange={(e) => setMacroT(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
            </div>
            <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
              <div>Private Saving (Y−T−C) = {savUnemp.privateSaving}</div>
              <div>Public Saving (T−G) = {savUnemp.publicSaving} ({savUnemp.budgetStatus})</div>
              <div>National Saving S = I = <strong>{savUnemp.nationalSaving}</strong></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm">Money Multiplier, Leverage &amp; MV = PY (Ch. 29–30)</h3>
            <div className="grid grid-cols-2 gap-2">
              <label>Initial Deposit <input type="number" value={dep} onChange={(e) => setDep(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Reserve Ratio % <input type="number" value={resRatio} onChange={(e) => setResRatio(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Bank Assets <input type="number" value={assets} onChange={(e) => setAssets(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Bank Capital <input type="number" value={cap} onChange={(e) => setCap(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Money M <input type="number" value={mSupply} onChange={(e) => setMSupply(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Velocity V <input type="number" value={vel} onChange={(e) => setVel(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>Real Y <input type="number" value={realOut} onChange={(e) => setRealOut(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
            </div>
            <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
              <div>Multiplier (1/R) = <strong>{moneyRes.moneyMultiplier}</strong> | Max Money = <strong>${moneyRes.maxTotalMoneyCreated}</strong> (New Loans: ${moneyRes.maxNewLoans})</div>
              <div>Leverage Ratio = {moneyRes.leverageRatio}:1 | Quantity Theory Price P = MV/Y = <strong>{moneyRes.priceLevel}</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'open-econ' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">Chapter 32: Twin-Market Open-Economy Policy Simulator</h3>
            <div className="flex flex-wrap gap-2">
              {OPEN_ECON_POLICIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setOpenPolicy(p.id);
                    recordEconPractice('macro-open-econ', true);
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
              Real FX ε = {openRes.realExchangeRate} | PPP Nominal e = {openRes.pppNominalRate} | NCO = NX = {openRes.nx} ({openRes.tradeStatus})
            </div>
          </div>
        </div>
      )}

      {activeTab === 'adas-phillips' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">AD–SRAS–LRAS &amp; Phillips Curve Shock Simulator (Ch. 33 &amp; 35)</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(MACRO_SHOCKS) as MacroShockId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setShock(id);
                    recordEconPractice('macro-adas-policy-phillips', true);
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

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm">Fiscal Spending &amp; Tax Multiplier Calculator (Ch. 34)</h3>
            <div className="flex flex-wrap gap-3">
              <label>MPC (0–0.99) <input type="number" step="0.05" max="0.99" min="0" value={mpc} onChange={(e) => setMpc(Number(e.target.value))} className="mt-1 block w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>ΔG ($B) <input type="number" value={dG} onChange={(e) => setDG(Number(e.target.value))} className="mt-1 block w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              <label>ΔT ($B) <input type="number" value={dT} onChange={(e) => setDT(Number(e.target.value))} className="mt-1 block w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
            </div>
            <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              Spending Multiplier = {multRes.spendingMultiplier} | Tax Multiplier = {multRes.taxMultiplier} | Net AD Shift = <strong>${multRes.totalAdShift}B</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'micro' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm">Linear Supply/Demand, Surplus, Per-Unit Tax &amp; DWL (Micro Ch. 4, 6–8)</h3>
            <div className="grid md:grid-cols-2 gap-5 items-center">
              <div className="space-y-3 text-xs">
                <div className="font-mono">Qd = {a} − {b}P | Qs = {c} + {d}P | Tax t = ${tax}</div>
                <div className="grid grid-cols-3 gap-2">
                  <label>a <input type="number" value={a} onChange={(e) => setA(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                  <label>b <input type="number" min={1} value={b} onChange={(e) => setB(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                  <label>c <input type="number" value={c} onChange={(e) => setC(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                  <label>d <input type="number" min={1} value={d} onChange={(e) => setD(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                  <label>Tax t <input type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))} className="mt-1 w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                </div>
                <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
                  <div>No-Tax Equilibrium: P*={marketRes.eqPrice}, Q*={marketRes.eqQty} (CS={marketRes.csNoTax}, PS={marketRes.psNoTax})</div>
                  {tax > 0 && (
                    <div>With Tax ${tax}: Pb={marketRes.pbTax}, Ps={marketRes.psTax}, Qt={marketRes.qTax}, TaxRev=${marketRes.taxRevenue}, DWL=<strong>${marketRes.dwlTax}</strong></div>
                  )}
                </div>
              </div>
              <SupplyDemandSvg a={a} b={b} c={c} d={d} tax={tax} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-sm">Midpoint Elasticity (Ch. 5)</h4>
              <div className="grid grid-cols-2 gap-2">
                <label>P₁ <input type="number" value={p1} onChange={(e) => setP1(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Q₁ <input type="number" value={q1} onChange={(e) => setQ1(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>P₂ <input type="number" value={p2} onChange={(e) => setP2(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>Q₂ <input type="number" value={q2} onChange={(e) => setQ2(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                |Ed| = <strong>{elastRes.elasticityAbs}</strong> ({elastRes.classification})<br />
                TR: {elastRes.tr1} → {elastRes.tr2} (Δ={elastRes.trDelta})
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-sm">Monopoly (P=a−bQ, Ch. 15)</h4>
              <div className="grid grid-cols-2 gap-2">
                <label>a <input type="number" value={monoA} onChange={(e) => setMonoA(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>b <input type="number" min={1} value={monoB} onChange={(e) => setMonoB(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>MC <input type="number" value={monoMc} onChange={(e) => setMonoMc(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>FC <input type="number" value={monoFc} onChange={(e) => setMonoFc(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                Comp: Q={monoRes.qComp}, P={monoRes.pComp}<br />
                Mono: Q={monoRes.qMono}, P={monoRes.pMono}, π={monoRes.profitMono}, DWL=<strong>{monoRes.dwl}</strong>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-sm">Comparative Adv. (Ch. 3)</h4>
              <div className="grid grid-cols-2 gap-2">
                <label>A Meat <input type="number" min={1} value={aG1} onChange={(e) => setAG1(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>A Pot <input type="number" min={1} value={aG2} onChange={(e) => setAG2(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>B Meat <input type="number" min={1} value={bG1} onChange={(e) => setBG1(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
                <label>B Pot <input type="number" min={1} value={bG2} onChange={(e) => setBG2(Number(e.target.value))} className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono" /></label>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg">
                Meat CompAdv: <strong>{tradeRes.compAdvGood1}</strong><br />
                Potatoes CompAdv: <strong>{tradeRes.compAdvGood2}</strong><br />
                Trade range: {tradeRes.tradeRangeGood1}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
