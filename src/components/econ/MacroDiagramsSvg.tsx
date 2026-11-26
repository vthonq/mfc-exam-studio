import React, { useState } from 'react';
import { BiText } from '../BiText';

type LoanableScenarioId = 'saving-incentive' | 'investment-credit' | 'budget-deficit';
type MoneyScenarioId = 'fed-buy' | 'fed-sell' | 'higher-price';

const LOANABLE_SCENARIOS: Record<
  LoanableScenarioId,
  {
    id: LoanableScenarioId;
    title: string;
    shiftCurve: 'supply' | 'demand';
    dir: 1 | -1;
    outcome: string;
    outcomeVi: string;
  }
> = {
  'saving-incentive': {
    id: 'saving-incentive',
    title: 'Saving Incentive (Tax Cut on Interest / Saving)',
    shiftCurve: 'supply',
    dir: 1,
    outcome: 'Supply of loanable funds shifts RIGHT → Real interest rate r ↓, Investment I ↑ (faster long-run growth).',
    outcomeVi: 'Cung vốn vay dịch PHẢI → Lãi suất thực r ↓, Đầu tư I ↑ (tăng trưởng dài hạn nhanh hơn).',
  },
  'investment-credit': {
    id: 'investment-credit',
    title: 'Investment Tax Credit (Business Tax Incentive)',
    shiftCurve: 'demand',
    dir: 1,
    outcome: 'Demand for loanable funds shifts RIGHT → Real interest rate r ↑, Saving & Investment I ↑.',
    outcomeVi: 'Cầu vốn vay dịch PHẢI → Lãi suất thực r ↑, Tiết kiệm và Đầu tư I ↑.',
  },
  'budget-deficit': {
    id: 'budget-deficit',
    title: 'Government Budget Deficit (Crowding Out)',
    shiftCurve: 'supply',
    dir: -1,
    outcome: 'Public saving falls → Supply of loanable funds shifts LEFT → r ↑ AND private Investment I ↓ (Crowding Out!).',
    outcomeVi: 'Tiết kiệm công giảm → Cung vốn vay dịch TRÁI → r ↑ VÀ Đầu tư tư nhân I ↓ (Hiệu ứng lấn át!).',
  },
};

const MONEY_SCENARIOS: Record<
  MoneyScenarioId,
  {
    id: MoneyScenarioId;
    title: string;
    shiftCurve: 'ms' | 'md';
    dir: 1 | -1;
    outcome: string;
    outcomeVi: string;
  }
> = {
  'fed-buy': {
    id: 'fed-buy',
    title: 'Central Bank Buys Bonds (MS ↑)',
    shiftCurve: 'ms',
    dir: 1,
    outcome: 'MS shifts RIGHT → Interest rate r ↓ → Investment I ↑ & Consumption C ↑ → AD shifts RIGHT.',
    outcomeVi: 'Cung tiền MS dịch PHẢI → Lãi suất r ↓ → I ↑ & C ↑ → Tổng cầu AD dịch PHẢI.',
  },
  'fed-sell': {
    id: 'fed-sell',
    title: 'Central Bank Sells Bonds / Raises Reserve Ratio (MS ↓)',
    shiftCurve: 'ms',
    dir: -1,
    outcome: 'MS shifts LEFT → Interest rate r ↑ → Investment I ↓ → AD shifts LEFT.',
    outcomeVi: 'Cung tiền MS dịch TRÁI → Lãi suất r ↑ → Đầu tư I ↓ → Tổng cầu AD dịch TRÁI.',
  },
  'higher-price': {
    id: 'higher-price',
    title: 'Higher Price Level P ↑ (Interest-Rate Effect)',
    shiftCurve: 'md',
    dir: 1,
    outcome: 'People need more cash to buy goods → MD shifts RIGHT → r ↑ → I ↓ → Lower Quantity of Output Demanded (movement along AD).',
    outcomeVi: 'Mức giá P tăng khiến dân cần giữ nhiều tiền hơn → Cầu tiền MD dịch PHẢI → r ↑ → I ↓ (giải thích độ dốc xuống của đường AD).',
  },
};

export const LoanableFundsSvg: React.FC = () => {
  const [scen, setScen] = useState<LoanableScenarioId>('budget-deficit');
  const s = LOANABLE_SCENARIOS[scen];

  const dx = s.dir * 32;
  // Baseline S: (80, 195) to (220, 55), D: (80, 55) to (220, 195) -> E1=(150, 125)
  const e1 = { x: 150, y: 125 };
  const e2 =
    s.shiftCurve === 'supply'
      ? { x: 150 + dx / 2, y: 125 + dx / 2 }
      : { x: 150 + dx / 2, y: 125 - dx / 2 };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-bold text-sm">
          Chapter 26: Closed-Economy Market for Loanable Funds
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {(Object.keys(LOANABLE_SCENARIOS) as LoanableScenarioId[]).map((id) => (
            <button
              key={id}
              onClick={() => setScen(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                scen === id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {LOANABLE_SCENARIOS[id].title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-center">
        <svg viewBox="0 0 300 240" className="w-full max-w-sm mx-auto bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <line x1="50" y1="205" x2="270" y2="205" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="50" y1="25" x2="50" y2="205" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="15" y="34" fontSize="10" fill="#64748b" fontWeight="bold">r</text>
          <text x="160" y="226" fontSize="10" fill="#64748b" fontWeight="bold">Loanable Funds ($)</text>

          {/* Baseline Supply & Demand */}
          <line x1="80" y1="195" x2="220" y2="55" stroke="#0ea5e9" strokeWidth="2.5" />
          <text x="223" y="55" fontSize="10" fill="#0ea5e9" fontWeight="bold">S₁</text>
          <line x1="80" y1="55" x2="220" y2="195" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="223" y="195" fontSize="10" fill="#f59e0b" fontWeight="bold">D₁</text>

          {/* Shifted Curve */}
          {s.shiftCurve === 'supply' ? (
            <>
              <line
                x1={80 + dx}
                y1="195"
                x2={220 + dx}
                y2="55"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />
              <text x={223 + dx} y="55" fontSize="10" fill="#0284c7" fontWeight="bold">S₂</text>
            </>
          ) : (
            <>
              <line
                x1={80 + dx}
                y1="55"
                x2={220 + dx}
                y2="195"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />
              <text x={223 + dx} y="195" fontSize="10" fill="#d97706" fontWeight="bold">D₂</text>
            </>
          )}

          {/* Equilibrium markers */}
          <line x1="50" y1={e1.y} x2={e1.x} y2={e1.y} stroke="#94a3b8" strokeDasharray="3 3" />
          <text x="32" y={e1.y + 3} fontSize="9" fill="#64748b">r₁</text>
          <circle cx={e1.x} cy={e1.y} r="4.5" fill="#475569" />
          <text x={e1.x + 6} y={e1.y - 4} fontSize="10" fill="#475569" fontWeight="bold">E₁</text>

          <line x1="50" y1={e2.y} x2={e2.x} y2={e2.y} stroke="#10b981" strokeDasharray="3 3" />
          <text x="32" y={e2.y + 3} fontSize="9" fill="#10b981" fontWeight="bold">r₂</text>
          <circle cx={e2.x} cy={e2.y} r="5" fill="#10b981" />
          <text x={e2.x + 6} y={e2.y + 12} fontSize="10" fill="#10b981" fontWeight="bold">E₂</text>
        </svg>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
          <div className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{s.title}</div>
          <BiText en={s.outcome} vi={s.outcomeVi} className="leading-relaxed" />
        </div>
      </div>
    </div>
  );
};

export const MoneyMarketSvg: React.FC = () => {
  const [scen, setScen] = useState<MoneyScenarioId>('fed-buy');
  const s = MONEY_SCENARIOS[scen];

  const msDx = s.shiftCurve === 'ms' ? s.dir * 34 : 0;
  const mdDx = s.shiftCurve === 'md' ? s.dir * 34 : 0;
  const e1 = { x: 150, y: 125 };
  // MD line passes through (80, 55) and (220, 195): y = x - 25 (when mdDx=0). With shift: y = (x - mdDx) - 25
  const e2x = e1.x + msDx;
  const e2y = e2x - mdDx - 25;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="font-bold text-sm">
          Chapter 34: Theory of Liquidity Preference (Money Market → AD)
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {(Object.keys(MONEY_SCENARIOS) as MoneyScenarioId[]).map((id) => (
            <button
              key={id}
              onClick={() => setScen(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                scen === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {MONEY_SCENARIOS[id].title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-center">
        <svg viewBox="0 0 300 240" className="w-full max-w-sm mx-auto bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <line x1="50" y1="205" x2="270" y2="205" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="50" y1="25" x2="50" y2="205" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="15" y="34" fontSize="10" fill="#64748b" fontWeight="bold">r</text>
          <text x="140" y="226" fontSize="10" fill="#64748b" fontWeight="bold">Quantity of Money</text>

          {/* Vertical MS1 */}
          <line x1="150" y1="45" x2="150" y2="205" stroke="#0ea5e9" strokeWidth="2.5" />
          <text x="142" y="39" fontSize="10" fill="#0ea5e9" fontWeight="bold">MS₁</text>

          {/* MD1 */}
          <line x1="80" y1="55" x2="220" y2="195" stroke="#f59e0b" strokeWidth="2.5" />
          <text x="223" y="195" fontSize="10" fill="#f59e0b" fontWeight="bold">MD₁</text>

          {msDx !== 0 && (
            <>
              <line
                x1={150 + msDx}
                y1="45"
                x2={150 + msDx}
                y2="205"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />
              <text x={142 + msDx} y="39" fontSize="10" fill="#0284c7" fontWeight="bold">MS₂</text>
            </>
          )}

          {mdDx !== 0 && (
            <>
              <line
                x1={80 + mdDx}
                y1="55"
                x2={220 + mdDx}
                y2="195"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />
              <text x={223 + mdDx} y="195" fontSize="10" fill="#d97706" fontWeight="bold">MD₂</text>
            </>
          )}

          <line x1="50" y1={e1.y} x2={e1.x} y2={e1.y} stroke="#94a3b8" strokeDasharray="3 3" />
          <text x="32" y={e1.y + 3} fontSize="9" fill="#64748b">r₁</text>
          <circle cx={e1.x} cy={e1.y} r="4.5" fill="#475569" />

          <line x1="50" y1={e2y} x2={e2x} y2={e2y} stroke="#6366f1" strokeDasharray="3 3" />
          <text x="32" y={e2y + 3} fontSize="9" fill="#6366f1" fontWeight="bold">r₂</text>
          <circle cx={e2x} cy={e2y} r="5" fill="#6366f1" />
        </svg>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
          <div className="font-bold text-sm text-indigo-700 dark:text-indigo-300">{s.title}</div>
          <BiText en={s.outcome} vi={s.outcomeVi} className="leading-relaxed" />
        </div>
      </div>
    </div>
  );
};
