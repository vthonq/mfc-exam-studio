import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BiText } from '../BiText';

type LoanableScenarioId = 'saving-incentive' | 'investment-credit' | 'budget-deficit';
type MoneyScenarioId = 'fed-buy' | 'fed-sell' | 'higher-price';
type LfKey = 'supply' | 'demand' | 'eq' | null;
type MoneyKey = 'ms' | 'md' | 'eq' | null;

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
    outcome:
      'Supply of loanable funds shifts RIGHT → Real interest rate r ↓, Investment I ↑ (faster long-run growth).',
    outcomeVi:
      'Cung vốn vay dịch PHẢI → Lãi suất thực r ↓, Đầu tư I ↑ (tăng trưởng dài hạn nhanh hơn).',
  },
  'investment-credit': {
    id: 'investment-credit',
    title: 'Investment Tax Credit (Business Tax Incentive)',
    shiftCurve: 'demand',
    dir: 1,
    outcome:
      'Demand for loanable funds shifts RIGHT → Real interest rate r ↑, Saving & Investment I ↑.',
    outcomeVi:
      'Cầu vốn vay dịch PHẢI → Lãi suất thực r ↑, Tiết kiệm và Đầu tư I ↑.',
  },
  'budget-deficit': {
    id: 'budget-deficit',
    title: 'Government Budget Deficit (Crowding Out)',
    shiftCurve: 'supply',
    dir: -1,
    outcome:
      'Public saving falls → Supply of loanable funds shifts LEFT → r ↑ AND private Investment I ↓ (Crowding Out!).',
    outcomeVi:
      'Tiết kiệm công giảm → Cung vốn vay dịch TRÁI → r ↑ VÀ Đầu tư tư nhân I ↓ (Hiệu ứng lấn át!).',
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
    outcome:
      'MS shifts RIGHT → Interest rate r ↓ → Investment I ↑ & Consumption C ↑ → AD shifts RIGHT.',
    outcomeVi:
      'Cung tiền MS dịch PHẢI → Lãi suất r ↓ → I ↑ & C ↑ → Tổng cầu AD dịch PHẢI.',
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
    outcome:
      'People need more cash to buy goods → MD shifts RIGHT → r ↑ → I ↓ → Lower Quantity of Output Demanded (movement along AD).',
    outcomeVi:
      'Mức giá P tăng khiến dân cần giữ nhiều tiền hơn → Cầu tiền MD dịch PHẢI → r ↑ → I ↓ (giải thích độ dốc xuống của đường AD).',
  },
};

function clipCenteredLine(
  xCenter: number,
  yCenter: number,
  slope: number,
  xMin = 78,
  xMax = 336,
  yMin = 38,
  yMax = 214,
): { x1: number; y1: number; x2: number; y2: number } {
  const pts = [
    xMin,
    xMax,
    xCenter + (yMin - yCenter) / slope,
    xCenter + (yMax - yCenter) / slope,
  ]
    .map((x) => ({ x, y: yCenter + slope * (x - xCenter) }))
    .filter((p) => p.x >= xMin - 0.1 && p.x <= xMax + 0.1 && p.y >= yMin - 0.1 && p.y <= yMax + 0.1)
    .sort((a, b) => a.x - b.x);
  const first = pts[0] ?? { x: xMin, y: yCenter };
  const last = pts[pts.length - 1] ?? { x: xMax, y: yCenter };
  return { x1: first.x, y1: first.y, x2: last.x, y2: last.y };
}

export const LoanableFundsSvg: React.FC = () => {
  const { settings } = useApp();
  const bilingual = settings.lang === 'bilingual';
  const [scen, setScen] = useState<LoanableScenarioId>('budget-deficit');
  const [activeKey, setActiveKey] = useState<LfKey>(null);

  const s = LOANABLE_SCENARIOS[scen];
  const dx = s.dir * 42;
  const e1 = { x: 205, y: 128 };
  const e2 =
    s.shiftCurve === 'supply'
      ? { x: 205 + dx / 2, y: 128 + 0.85 * (dx / 2) }
      : { x: 205 + dx / 2, y: 128 - 0.85 * (dx / 2) };

  const s1Line = clipCenteredLine(205, 128, -0.85);
  const s2Line = clipCenteredLine(205 + dx, 128, -0.85);
  const d1Line = clipCenteredLine(205, 128, 0.85);
  const d2Line = clipCenteredLine(205 + dx, 128, 0.85);

  const dim = (k: Exclude<LfKey, null>) =>
    activeKey && activeKey !== k ? 'opacity-20 transition-opacity duration-150' : 'transition-opacity duration-150';

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

      <div className="grid md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6">
          <svg
            viewBox="0 0 380 275"
            className="w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 select-none"
            role="img"
            aria-label="Closed-Economy Market for Loanable Funds diagram"
          >
            <defs>
              <marker id="lf-axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker id="lf-shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-emerald-600 dark:fill-emerald-400" />
              </marker>
            </defs>

            {[70, 128, 186].map((gy) => (
              <line key={gy} x1="62" y1={gy} x2="352" y2={gy} className="stroke-slate-200/75 dark:stroke-slate-800" strokeWidth="1" />
            ))}
            {[125, 205, 285].map((gx) => (
              <line key={gx} x1={gx} y1="26" x2={gx} y2="225" className="stroke-slate-200/75 dark:stroke-slate-800" strokeWidth="1" />
            ))}

            <line x1="62" y1="225" x2="62" y2="22" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.7" markerEnd="url(#lf-axis-arrow)" />
            <line x1="62" y1="225" x2="358" y2="225" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.7" markerEnd="url(#lf-axis-arrow)" />
            <text x="16" y="126" textAnchor="middle" transform="rotate(-90 16 126)" className="text-[11px] font-bold fill-slate-500 dark:fill-slate-400">
              Real Interest Rate (r)
            </text>
            <text x="208" y="264" textAnchor="middle" className="text-[11px] font-bold fill-slate-500 dark:fill-slate-400">
              Loanable Funds ($ Saving &amp; Investment)
            </text>

            {/* Supply S */}
            <g className={dim('supply')}>
              <line
                x1={s1Line.x1}
                y1={s1Line.y1}
                x2={s1Line.x2}
                y2={s1Line.y2}
                className={s.shiftCurve === 'supply' ? 'stroke-sky-400/70' : 'stroke-sky-600 dark:stroke-sky-400'}
                strokeWidth={s.shiftCurve === 'supply' ? 1.8 : 2.8}
                strokeDasharray={s.shiftCurve === 'supply' ? '6 4' : undefined}
              />
              <text x={s1Line.x2 - 2} y={s1Line.y2 - 6} className="text-[11px] font-bold fill-sky-600 dark:fill-sky-400">
                S₁
              </text>
              {s.shiftCurve === 'supply' && (
                <>
                  <line x1={s2Line.x1} y1={s2Line.y1} x2={s2Line.x2} y2={s2Line.y2} className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="2.9" />
                  <text x={s2Line.x2 - 2} y={s2Line.y2 - 6} className="text-[11px] font-extrabold fill-sky-600 dark:fill-sky-400">
                    S₂
                  </text>
                  <line
                    x1={264 + (s.dir > 0 ? 4 : -4)}
                    y1="78"
                    x2={264 + dx + (s.dir > 0 ? -5 : 5)}
                    y2="78"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="2"
                    markerEnd="url(#lf-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* Demand D */}
            <g className={dim('demand')}>
              <line
                x1={d1Line.x1}
                y1={d1Line.y1}
                x2={d1Line.x2}
                y2={d1Line.y2}
                className={s.shiftCurve === 'demand' ? 'stroke-amber-400/70' : 'stroke-amber-600 dark:stroke-amber-400'}
                strokeWidth={s.shiftCurve === 'demand' ? 1.8 : 2.8}
                strokeDasharray={s.shiftCurve === 'demand' ? '6 4' : undefined}
              />
              <text x={d1Line.x2 - 2} y={d1Line.y2 - 6} className="text-[11px] font-bold fill-amber-600 dark:fill-amber-400">
                D₁
              </text>
              {s.shiftCurve === 'demand' && (
                <>
                  <line x1={d2Line.x1} y1={d2Line.y1} x2={d2Line.x2} y2={d2Line.y2} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.9" />
                  <text x={d2Line.x2 - 2} y={d2Line.y2 - 6} className="text-[11px] font-extrabold fill-amber-600 dark:fill-amber-400">
                    D₂
                  </text>
                  <line
                    x1="150"
                    y1="82"
                    x2={150 + dx - 5}
                    y2="82"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="2"
                    markerEnd="url(#lf-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* Equilibria + Axis Projections */}
            <g className={dim('eq')}>
              <line x1="62" y1={e1.y} x2={e1.x} y2={e1.y} className="stroke-slate-400" strokeWidth="1.2" strokeDasharray="3 3" />
              <line x1={e1.x} y1={e1.y} x2={e1.x} y2="225" className="stroke-slate-400" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x="56" y={e1.y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-500">r₁</text>
              <text x={e1.x} y="241" textAnchor="middle" className="text-[10px] font-mono fill-slate-500">LF₁</text>
              <circle cx={e1.x} cy={e1.y} r="4.8" className="fill-slate-600 dark:fill-slate-300" />
              <text x={e1.x + 8} y={e1.y + 13} className="text-[10px] font-bold fill-slate-600 dark:fill-slate-300">E₁</text>

              <line x1="62" y1={e2.y} x2={e2.x} y2={e2.y} className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.3" strokeDasharray="3 3" />
              <line x1={e2.x} y1={e2.y} x2={e2.x} y2="225" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.3" strokeDasharray="3 3" />
              <text x="56" y={e2.y + 4} textAnchor="end" className="text-[10px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400">r₂</text>
              <text x={e2.x} y="241" textAnchor="middle" className="text-[10px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400">LF₂</text>
              <circle cx={e2.x} cy={e2.y} r="5.3" className="fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-slate-900" strokeWidth="1.4" />
              <text x={e2.x + 8} y={e2.y - 6} className="text-[11px] font-extrabold fill-emerald-600 dark:fill-emerald-400">E₂</text>
            </g>
          </svg>
        </div>

        <div className="md:col-span-6 space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 border border-slate-200 dark:border-slate-700/70">
            <div className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{s.title}</div>
            <BiText en={s.outcome} vi={s.outcomeVi} className="leading-relaxed" />
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Line Guide (hover or tap)
            </div>
            {(
              [
                {
                  key: 'supply' as const,
                  dot: 'bg-sky-500',
                  label: s.shiftCurve === 'supply' ? 'S₁ (dashed) → S₂ (solid Sky)' : 'S₁ (Sky)',
                  text: bilingual
                    ? 'National Saving S = Private Saving + Public Saving (T − G) (Cung vốn vay từ tiết kiệm quốc gia).'
                    : 'Supply of loanable funds comes from National Saving (private + public saving T − G).',
                },
                {
                  key: 'demand' as const,
                  dot: 'bg-amber-500',
                  label: s.shiftCurve === 'demand' ? 'D₁ (dashed) → D₂ (solid Amber)' : 'D₁ (Amber)',
                  text: bilingual
                    ? 'Investment Demand I: firms borrow more when real interest r falls (Cầu vốn vay từ doanh nghiệp muốn đầu tư).'
                    : 'Demand for loanable funds comes from firms borrowing to finance Investment (I).',
                },
                {
                  key: 'eq' as const,
                  dot: 'bg-emerald-500',
                  label: 'E₁ → E₂ (r₁→r₂, LF₁→LF₂)',
                  text: bilingual
                    ? 'Dashed curve = old; solid = new. Axes show interest rate & equilibrium saving/investment (Đường nét đứt chiếu sang r & LF).'
                    : 'Tracks how real interest rate r and total Investment (LF) adjust between E₁ and E₂.',
                },
              ] as const
            ).map((it) => (
              <button
                key={it.key}
                type="button"
                onMouseEnter={() => setActiveKey(it.key)}
                onMouseLeave={() => setActiveKey(null)}
                onClick={() => setActiveKey((cur) => (cur === it.key ? null : it.key))}
                className={`w-full text-left px-3 py-2 rounded-xl border text-[11px] flex items-start gap-2 transition-colors cursor-pointer ${
                  activeKey === it.key
                    ? 'border-emerald-400 bg-emerald-50/40 dark:bg-slate-800'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${it.dot}`} />
                <span className="text-slate-600 dark:text-slate-300 leading-snug">
                  <strong className="text-slate-900 dark:text-slate-100">{it.label}:</strong> {it.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MoneyMarketSvg: React.FC = () => {
  const { settings } = useApp();
  const bilingual = settings.lang === 'bilingual';
  const [scen, setScen] = useState<MoneyScenarioId>('fed-buy');
  const [activeKey, setActiveKey] = useState<MoneyKey>(null);

  const s = MONEY_SCENARIOS[scen];
  const msDx = s.shiftCurve === 'ms' ? s.dir * 44 : 0;
  const mdDx = s.shiftCurve === 'md' ? s.dir * 44 : 0;

  const e1 = { x: 205, y: 128 };
  const e2x = 205 + msDx;
  const e2y = 128 + 0.85 * (e2x - (205 + mdDx));

  const md1Line = clipCenteredLine(205, 128, 0.85);
  const md2Line = clipCenteredLine(205 + mdDx, 128, 0.85);

  const dim = (k: Exclude<MoneyKey, null>) =>
    activeKey && activeKey !== k ? 'opacity-20 transition-opacity duration-150' : 'transition-opacity duration-150';

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

      <div className="grid md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6">
          <svg
            viewBox="0 0 380 275"
            className="w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 select-none"
            role="img"
            aria-label="Theory of Liquidity Preference Money Market diagram"
          >
            <defs>
              <marker id="mm-axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker id="mm-shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-indigo-600 dark:fill-indigo-400" />
              </marker>
            </defs>

            {[70, 128, 186].map((gy) => (
              <line key={gy} x1="62" y1={gy} x2="352" y2={gy} className="stroke-slate-200/75 dark:stroke-slate-800" strokeWidth="1" />
            ))}
            {[125, 205, 285].map((gx) => (
              <line key={gx} x1={gx} y1="26" x2={gx} y2="225" className="stroke-slate-200/75 dark:stroke-slate-800" strokeWidth="1" />
            ))}

            <line x1="62" y1="225" x2="62" y2="22" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.7" markerEnd="url(#mm-axis-arrow)" />
            <line x1="62" y1="225" x2="358" y2="225" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.7" markerEnd="url(#mm-axis-arrow)" />
            <text x="16" y="126" textAnchor="middle" transform="rotate(-90 16 126)" className="text-[11px] font-bold fill-slate-500 dark:fill-slate-400">
              Interest Rate (r)
            </text>
            <text x="208" y="264" textAnchor="middle" className="text-[11px] font-bold fill-slate-500 dark:fill-slate-400">
              Quantity of Money (M)
            </text>

            {/* Vertical Money Supply MS */}
            <g className={dim('ms')}>
              <line
                x1="205"
                y1="38"
                x2="205"
                y2="225"
                className={msDx !== 0 ? 'stroke-sky-400/70' : 'stroke-sky-600 dark:stroke-sky-400'}
                strokeWidth={msDx !== 0 ? 1.8 : 2.8}
                strokeDasharray={msDx !== 0 ? '6 4' : undefined}
              />
              <text x="205" y="30" textAnchor="middle" className="text-[11px] font-bold fill-sky-600 dark:fill-sky-400">
                MS₁
              </text>
              {msDx !== 0 && (
                <>
                  <line x1={205 + msDx} y1="38" x2={205 + msDx} y2="225" className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="2.9" />
                  <text x={205 + msDx} y="30" textAnchor="middle" className="text-[11px] font-extrabold fill-sky-600 dark:fill-sky-400">
                    MS₂
                  </text>
                  <line
                    x1={205 + (s.dir > 0 ? 4 : -4)}
                    y1="56"
                    x2={205 + msDx + (s.dir > 0 ? -5 : 5)}
                    y2="56"
                    className="stroke-indigo-600 dark:stroke-indigo-400"
                    strokeWidth="2"
                    markerEnd="url(#mm-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* Money Demand MD */}
            <g className={dim('md')}>
              <line
                x1={md1Line.x1}
                y1={md1Line.y1}
                x2={md1Line.x2}
                y2={md1Line.y2}
                className={mdDx !== 0 ? 'stroke-amber-400/70' : 'stroke-amber-600 dark:stroke-amber-400'}
                strokeWidth={mdDx !== 0 ? 1.8 : 2.8}
                strokeDasharray={mdDx !== 0 ? '6 4' : undefined}
              />
              <text x={md1Line.x2 - 2} y={md1Line.y2 - 6} className="text-[11px] font-bold fill-amber-600 dark:fill-amber-400">
                MD₁
              </text>
              {mdDx !== 0 && (
                <>
                  <line x1={md2Line.x1} y1={md2Line.y1} x2={md2Line.x2} y2={md2Line.y2} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.9" />
                  <text x={md2Line.x2 - 2} y={md2Line.y2 - 6} className="text-[11px] font-extrabold fill-amber-600 dark:fill-amber-400">
                    MD₂
                  </text>
                  <line
                    x1="262"
                    y1="176"
                    x2={262 + mdDx - 5}
                    y2="176"
                    className="stroke-indigo-600 dark:stroke-indigo-400"
                    strokeWidth="2"
                    markerEnd="url(#mm-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* Equilibria */}
            <g className={dim('eq')}>
              <line x1="62" y1={e1.y} x2={e1.x} y2={e1.y} className="stroke-slate-400" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x="56" y={e1.y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-500">r₁</text>
              <text x={e1.x} y="241" textAnchor="middle" className="text-[10px] font-mono fill-slate-500">M₁</text>
              <circle cx={e1.x} cy={e1.y} r="4.8" className="fill-slate-600 dark:fill-slate-300" />
              <text x={e1.x + 8} y={e1.y + 13} className="text-[10px] font-bold fill-slate-600 dark:fill-slate-300">E₁</text>

              <line x1="62" y1={e2y} x2={e2x} y2={e2y} className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="1.3" strokeDasharray="3 3" />
              {msDx !== 0 && (
                <line x1={e2x} y1={e2y} x2={e2x} y2="225" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="1.3" strokeDasharray="3 3" />
              )}
              <text x="56" y={e2y + 4} textAnchor="end" className="text-[10px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400">r₂</text>
              {msDx !== 0 && (
                <text x={e2x} y="241" textAnchor="middle" className="text-[10px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400">M₂</text>
              )}
              <circle cx={e2x} cy={e2y} r="5.3" className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900" strokeWidth="1.4" />
              <text x={e2x + 8} y={e2y - 6} className="text-[11px] font-extrabold fill-indigo-600 dark:fill-indigo-400">E₂</text>
            </g>
          </svg>
        </div>

        <div className="md:col-span-6 space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 border border-slate-200 dark:border-slate-700/70">
            <div className="font-bold text-sm text-indigo-700 dark:text-indigo-300">{s.title}</div>
            <BiText en={s.outcome} vi={s.outcomeVi} className="leading-relaxed" />
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Line Guide (hover or tap)
            </div>
            {(
              [
                {
                  key: 'ms' as const,
                  dot: 'bg-sky-500',
                  label: msDx !== 0 ? 'MS₁ (dashed) → MS₂ (solid Vertical)' : 'MS₁ (Vertical Sky)',
                  text: bilingual
                    ? 'Money Supply fixed by the Central Bank, independent of interest rate r (Cung tiền thẳng đứng do NHTW kiểm soát).'
                    : 'Fixed by the Central Bank (Fed) via open-market operations; vertical because it does not depend on r.',
                },
                {
                  key: 'md' as const,
                  dot: 'bg-amber-500',
                  label: mdDx !== 0 ? 'MD₁ (dashed) → MD₂ (solid Amber)' : 'MD₁ (Amber)',
                  text: bilingual
                    ? 'Money Demand slopes down: higher r raises opportunity cost of holding cash; P ↑ shifts MD right (Cầu tiền dốc xuống).'
                    : 'Liquidity Preference: higher interest rate r raises the opportunity cost of holding cash, lowering quantity demanded.',
                },
                {
                  key: 'eq' as const,
                  dot: 'bg-indigo-500',
                  label: 'E₁ → E₂ (Interest Rate Adjustment)',
                  text: bilingual
                    ? 'Lãi suất r₂ thay đổi kéo theo Đầu tư I và dịch chuyển Tổng cầu AD ở mô hình lớn.'
                    : 'Equilibrium r₁ → r₂ changes borrowing costs, driving Investment (I) and Aggregate Demand (AD).',
                },
              ] as const
            ).map((it) => (
              <button
                key={it.key}
                type="button"
                onMouseEnter={() => setActiveKey(it.key)}
                onMouseLeave={() => setActiveKey(null)}
                onClick={() => setActiveKey((cur) => (cur === it.key ? null : it.key))}
                className={`w-full text-left px-3 py-2 rounded-xl border text-[11px] flex items-start gap-2 transition-colors cursor-pointer ${
                  activeKey === it.key
                    ? 'border-indigo-400 bg-indigo-50/40 dark:bg-slate-800'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${it.dot}`} />
                <span className="text-slate-600 dark:text-slate-300 leading-snug">
                  <strong className="text-slate-900 dark:text-slate-100">{it.label}:</strong> {it.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
