import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { OpenEconPolicyId } from '../../math/economics';

type TwinLegendKey = 'saving' | 'lf-demand' | 'nco' | 'fx-demand' | 'eq' | null;

function clipTwinLine(
  xCenter: number,
  yCenter: number,
  slope: number,
  xMin = 60,
  xMax = 242,
  yMin = 30,
  yMax = 182,
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

export const TwinMarketSvg: React.FC<{ policyId: OpenEconPolicyId }> = ({ policyId }) => {
  const { settings } = useApp();
  const bilingual = settings.lang === 'bilingual';
  const [activeKey, setActiveKey] = useState<TwinLegendKey>(null);

  const isDeficit = policyId === 'budget-deficit';
  const isQuota = policyId === 'import-quota';
  const isFlight = policyId === 'capital-flight';

  const dim = (key: Exclude<TwinLegendKey, null>) =>
    activeKey && activeKey !== key ? 'opacity-20 transition-opacity duration-150' : 'transition-opacity duration-150';

  // Panel 1: Loanable Funds (center 150, 112)
  const lfS1 = clipTwinLine(150, 112, -0.85);
  const lfS2 = clipTwinLine(150 - 38, 112, -0.85);
  const lfD1 = clipTwinLine(150, 112, 0.85);
  const lfD2 = clipTwinLine(150 + 38, 112, 0.85);
  const lfE1 = { x: 150, y: 112 };
  const lfE2 = isDeficit ? { x: 131, y: 96 } : isFlight ? { x: 169, y: 96 } : null;

  // Panel 2: NCO (center 150, 112)
  const nco1 = clipTwinLine(150, 112, 0.85);
  const nco2 = clipTwinLine(150 + 54, 112, 0.85);
  const ncoE1 = { x: 150, y: 112 };
  // r2 corresponds to y = 96
  const ncoE2 = isDeficit
    ? { x: 150 + (96 - 112) / 0.85, y: 96 }
    : isFlight
      ? { x: 204 + (96 - 112) / 0.85, y: 96 }
      : null;

  // Panel 3: FX Market (center 150, 112)
  const fxS1x = 150;
  const fxS2x = isDeficit ? 120 : isFlight ? 182 : 150;
  const fxD1 = clipTwinLine(150, 112, 0.85);
  const fxD2 = clipTwinLine(150 + 38, 112, 0.85);
  const fxE1 = { x: 150, y: 112 };
  const fxE2 = isDeficit
    ? { x: 120, y: 112 + 0.85 * (120 - 150) }
    : isFlight
      ? { x: 182, y: 112 + 0.85 * (182 - 150) }
      : isQuota
        ? { x: 150, y: 112 + 0.85 * (150 - 188) }
        : null;

  const legendItems: Array<{
    key: Exclude<TwinLegendKey, null>;
    swatch: string;
    label: string;
    desc: string;
  }> = [
    {
      key: 'saving',
      swatch: 'bg-emerald-600 dark:bg-emerald-400',
      label: 'S (National Saving — Panel 1)',
      desc: bilingual
        ? 'Supply of loanable funds (Cung vốn vay từ tiết kiệm quốc gia; thâm hụt ngân sách làm S dịch TRÁI).'
        : 'Supply of loanable funds (public + private saving). Budget deficits reduce saving and shift S left.',
    },
    {
      key: 'lf-demand',
      swatch: 'bg-indigo-600 dark:bg-indigo-400',
      label: 'D = I + NCO (Loanable Funds Demand — Panel 1)',
      desc: bilingual
        ? 'Cầu vốn vay gồm Đầu tư trong nước I và Dòng vốn ra ròng NCO.'
        : 'Demand for loanable funds (domestic investment + net capital outflow). Capital flight shifts D right.',
    },
    {
      key: 'nco',
      swatch: 'bg-amber-600 dark:bg-amber-400',
      label: 'NCO Curve (Panel 2) = S in FX (Panel 3)',
      desc: bilingual
        ? 'Đường NCO nối hai thị trường: NCO(r) xác định cung nội tệ đổi ngoại tệ ở Panel 3.'
        : 'Links Panels 1 & 3: higher real rate r lowers NCO (movement along NCO), whereas capital flight shifts NCO & FX Supply right.',
    },
    {
      key: 'fx-demand',
      swatch: 'bg-sky-600 dark:bg-sky-400',
      label: 'D = NX (FX Demand — Panel 3)',
      desc: bilingual
        ? 'Cầu nội tệ từ xuất khẩu ròng NX; thuế quan/hạn ngạch nhập khẩu đẩy D dịch PHẢI nhưng không đổi NX.'
        : 'Demand for domestic currency to buy net exports. Import quotas shift D right → appreciation e ↑, leaving NX unchanged.',
    },
    {
      key: 'eq',
      swatch: 'bg-rose-600 dark:bg-rose-400',
      label: 'Dashed → Solid & E₁ → E₂',
      desc: bilingual
        ? 'Nét đứt là đường cũ, nét liền là đường mới; dấu chấm rực sáng là điểm cân bằng E₂ (r₂, NCO₂, e₂).'
        : 'Dashed curve = original position; bold solid = shifted curve. E₁ → E₂ tracks real rate r, NCO, and exchange rate e.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Loanable Funds */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="text-xs font-bold text-center text-slate-700 dark:text-slate-200">
            1. Market for Loanable Funds
          </div>
          <svg viewBox="0 0 280 235" className="w-full max-w-[300px] mx-auto select-none" role="img" aria-label="Loanable Funds panel">
            <defs>
              <marker id="tm-axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker id="tm-shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-rose-600 dark:fill-rose-400" />
              </marker>
            </defs>

            {[62, 112, 162].map((gy) => (
              <line key={gy} x1="48" y1={gy} x2="255" y2={gy} className="stroke-slate-200/80 dark:stroke-slate-800" strokeWidth="1" />
            ))}

            <line x1="48" y1="194" x2="48" y2="20" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.6" markerEnd="url(#tm-axis-arrow)" />
            <line x1="48" y1="194" x2="262" y2="194" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.6" markerEnd="url(#tm-axis-arrow)" />
            <text x="14" y="108" textAnchor="middle" transform="rotate(-90 14 108)" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400">
              Real Rate (r)
            </text>
            <text x="155" y="224" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400">
              Loanable Funds
            </text>

            {/* Saving S */}
            <g className={dim('saving')}>
              <line
                x1={lfS1.x1}
                y1={lfS1.y1}
                x2={lfS1.x2}
                y2={lfS1.y2}
                className={isDeficit ? 'stroke-emerald-400/70' : 'stroke-emerald-600 dark:stroke-emerald-400'}
                strokeWidth={isDeficit ? 1.6 : 2.6}
                strokeDasharray={isDeficit ? '5 3' : undefined}
              />
              <text x={lfS1.x2 - 2} y={lfS1.y2 - 5} className="text-[10px] font-bold fill-emerald-600 dark:fill-emerald-400">
                S₁
              </text>
              {isDeficit && (
                <>
                  <line x1={lfS2.x1} y1={lfS2.y1} x2={lfS2.x2} y2={lfS2.y2} className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2.8" />
                  <text x={lfS2.x2 - 2} y={lfS2.y2 - 5} className="text-[10px] font-extrabold fill-emerald-600 dark:fill-emerald-400">
                    S₂
                  </text>
                  <line x1="198" y1="70" x2="168" y2="70" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.8" markerEnd="url(#tm-shift-arrow)" />
                </>
              )}
            </g>

            {/* Demand D */}
            <g className={dim('lf-demand')}>
              <line
                x1={lfD1.x1}
                y1={lfD1.y1}
                x2={lfD1.x2}
                y2={lfD1.y2}
                className={isFlight ? 'stroke-indigo-400/70' : 'stroke-indigo-600 dark:stroke-indigo-400'}
                strokeWidth={isFlight ? 1.6 : 2.6}
                strokeDasharray={isFlight ? '5 3' : undefined}
              />
              <text x={lfD1.x2 - 2} y={lfD1.y2 - 5} className="text-[10px] font-bold fill-indigo-600 dark:fill-indigo-400">
                D₁
              </text>
              {isFlight && (
                <>
                  <line x1={lfD2.x1} y1={lfD2.y1} x2={lfD2.x2} y2={lfD2.y2} className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.8" />
                  <text x={lfD2.x2 - 2} y={lfD2.y2 - 5} className="text-[10px] font-extrabold fill-indigo-600 dark:fill-indigo-400">
                    D₂
                  </text>
                  <line x1="186" y1="142" x2="216" y2="142" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.8" markerEnd="url(#tm-shift-arrow)" />
                </>
              )}
            </g>

            {/* Equilibria */}
            <g className={dim('eq')}>
              <line x1="48" y1={lfE1.y} x2={lfE1.x} y2={lfE1.y} className="stroke-slate-400" strokeWidth="1.1" strokeDasharray="3 3" />
              <text x="42" y={lfE1.y + 4} textAnchor="end" className="text-[9px] font-mono fill-slate-500">r₁</text>
              <circle cx={lfE1.x} cy={lfE1.y} r="4" className="fill-slate-600 dark:fill-slate-300" />
              <text x={lfE1.x + 6} y={lfE1.y + 12} className="text-[9px] font-bold fill-slate-600 dark:fill-slate-300">E₁</text>

              {lfE2 ? (
                <>
                  <line x1="48" y1={lfE2.y} x2={lfE2.x} y2={lfE2.y} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.2" strokeDasharray="3 3" />
                  <line x1={lfE2.x} y1={lfE2.y} x2={lfE2.x} y2="194" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="42" y={lfE2.y + 4} textAnchor="end" className="text-[9px] font-mono font-bold fill-rose-600 dark:fill-rose-400">r₂</text>
                  <circle cx={lfE2.x} cy={lfE2.y} r="4.8" className="fill-rose-600 dark:fill-rose-400 stroke-white dark:stroke-slate-900" strokeWidth="1.3" />
                  <text x={lfE2.x + 6} y={lfE2.y - 5} className="text-[10px] font-extrabold fill-rose-600 dark:fill-rose-400">E₂</text>
                </>
              ) : (
                <text x="150" y="207" textAnchor="middle" className="text-[9px] font-semibold fill-slate-400">
                  No shift in Panel 1
                </text>
              )}
            </g>
          </svg>
        </div>

        {/* Panel 2: NCO */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="text-xs font-bold text-center text-slate-700 dark:text-slate-200">
            2. Net Capital Outflow (NCO)
          </div>
          <svg viewBox="0 0 280 235" className="w-full max-w-[300px] mx-auto select-none" role="img" aria-label="Net Capital Outflow panel">
            <defs>
              <marker id="tm2-axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker id="tm2-shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-rose-600 dark:fill-rose-400" />
              </marker>
            </defs>

            {[62, 112, 162].map((gy) => (
              <line key={gy} x1="48" y1={gy} x2="255" y2={gy} className="stroke-slate-200/80 dark:stroke-slate-800" strokeWidth="1" />
            ))}

            <line x1="48" y1="194" x2="48" y2="20" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.6" markerEnd="url(#tm2-axis-arrow)" />
            <line x1="48" y1="194" x2="262" y2="194" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.6" markerEnd="url(#tm2-axis-arrow)" />
            <text x="14" y="108" textAnchor="middle" transform="rotate(-90 14 108)" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400">
              Real Rate (r)
            </text>
            <text x="155" y="224" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400">
              Net Capital Outflow (NCO)
            </text>

            <g className={dim('nco')}>
              <line
                x1={nco1.x1}
                y1={nco1.y1}
                x2={nco1.x2}
                y2={nco1.y2}
                className={isFlight ? 'stroke-amber-400/70' : 'stroke-amber-600 dark:stroke-amber-400'}
                strokeWidth={isFlight ? 1.6 : 2.6}
                strokeDasharray={isFlight ? '5 3' : undefined}
              />
              <text x={nco1.x2 - 4} y={nco1.y2 - 5} textAnchor="end" className="text-[10px] font-bold fill-amber-600 dark:fill-amber-400">
                NCO₁
              </text>

              {isFlight && (
                <>
                  <line x1={nco2.x1} y1={nco2.y1} x2={nco2.x2} y2={nco2.y2} className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.8" />
                  <text x={nco2.x2 - 2} y={nco2.y2 - 5} textAnchor="end" className="text-[10px] font-extrabold fill-amber-600 dark:fill-amber-400">
                    NCO₂
                  </text>
                  <line x1="184" y1="140" x2="226" y2="140" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.8" markerEnd="url(#tm2-shift-arrow)" />
                </>
              )}
            </g>

            <g className={dim('eq')}>
              <line x1="48" y1={ncoE1.y} x2={ncoE1.x} y2={ncoE1.y} className="stroke-slate-400" strokeWidth="1.1" strokeDasharray="3 3" />
              <line x1={ncoE1.x} y1={ncoE1.y} x2={ncoE1.x} y2="194" className="stroke-slate-400" strokeWidth="1.1" strokeDasharray="3 3" />
              <text x="42" y={ncoE1.y + 4} textAnchor="end" className="text-[9px] font-mono fill-slate-500">r₁</text>
              <text x={ncoE1.x} y="207" textAnchor="middle" className="text-[9px] font-mono fill-slate-500">NCO₁</text>
              <circle cx={ncoE1.x} cy={ncoE1.y} r="4" className="fill-slate-600 dark:fill-slate-300" />
              <text x={ncoE1.x + 6} y={ncoE1.y + 12} className="text-[9px] font-bold fill-slate-600 dark:fill-slate-300">E₁</text>

              {ncoE2 ? (
                <>
                  <line x1="48" y1={ncoE2.y} x2={ncoE2.x} y2={ncoE2.y} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.2" strokeDasharray="3 3" />
                  <line x1={ncoE2.x} y1={ncoE2.y} x2={ncoE2.x} y2="194" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="42" y={ncoE2.y + 4} textAnchor="end" className="text-[9px] font-mono font-bold fill-rose-600 dark:fill-rose-400">r₂</text>
                  <text x={ncoE2.x} y="207" textAnchor="middle" className="text-[9px] font-mono font-bold fill-rose-600 dark:fill-rose-400">NCO₂</text>
                  <circle cx={ncoE2.x} cy={ncoE2.y} r="4.8" className="fill-rose-600 dark:fill-rose-400 stroke-white dark:stroke-slate-900" strokeWidth="1.3" />
                  <text x={ncoE2.x + 6} y={ncoE2.y - 5} className="text-[10px] font-extrabold fill-rose-600 dark:fill-rose-400">E₂</text>
                </>
              ) : (
                <text x="202" y="207" textAnchor="middle" className="text-[9px] font-semibold fill-slate-400">
                  NCO unchanged
                </text>
              )}
            </g>
          </svg>
        </div>

        {/* Panel 3: Foreign-Currency Exchange */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="text-xs font-bold text-center text-slate-700 dark:text-slate-200">
            3. Foreign-Currency Exchange
          </div>
          <svg viewBox="0 0 280 235" className="w-full max-w-[300px] mx-auto select-none" role="img" aria-label="Foreign Currency Exchange panel">
            <defs>
              <marker id="tm3-axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker id="tm3-shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-rose-600 dark:fill-rose-400" />
              </marker>
            </defs>

            {[62, 112, 162].map((gy) => (
              <line key={gy} x1="48" y1={gy} x2="255" y2={gy} className="stroke-slate-200/80 dark:stroke-slate-800" strokeWidth="1" />
            ))}

            <line x1="48" y1="194" x2="48" y2="20" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.6" markerEnd="url(#tm3-axis-arrow)" />
            <line x1="48" y1="194" x2="262" y2="194" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.6" markerEnd="url(#tm3-axis-arrow)" />
            <text x="14" y="108" textAnchor="middle" transform="rotate(-90 14 108)" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400">
              Real Exchange Rate (e)
            </text>
            <text x="155" y="224" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400">
              Quantity of Dollars ($ FX)
            </text>

            {/* Supply S = NCO */}
            <g className={dim('nco')}>
              <line
                x1={fxS1x}
                y1="30"
                x2={fxS1x}
                y2="194"
                className={isDeficit || isFlight ? 'stroke-amber-400/70' : 'stroke-amber-600 dark:stroke-amber-400'}
                strokeWidth={isDeficit || isFlight ? 1.6 : 2.6}
                strokeDasharray={isDeficit || isFlight ? '5 3' : undefined}
              />
              <text x={fxS1x + 4} y="34" className="text-[10px] font-bold fill-amber-600 dark:fill-amber-400">
                S₁
              </text>
              {(isDeficit || isFlight) && (
                <>
                  <line x1={fxS2x} y1="30" x2={fxS2x} y2="194" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2.8" />
                  <text x={fxS2x + (isDeficit ? -14 : 4)} y="34" className="text-[10px] font-extrabold fill-amber-600 dark:fill-amber-400">
                    S₂
                  </text>
                  <line
                    x1={fxS1x + (isFlight ? 4 : -4)}
                    y1="52"
                    x2={fxS2x + (isFlight ? -4 : 4)}
                    y2="52"
                    className="stroke-rose-600 dark:stroke-rose-400"
                    strokeWidth="1.8"
                    markerEnd="url(#tm3-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* Demand D = NX */}
            <g className={dim('fx-demand')}>
              <line
                x1={fxD1.x1}
                y1={fxD1.y1}
                x2={fxD1.x2}
                y2={fxD1.y2}
                className={isQuota ? 'stroke-sky-400/70' : 'stroke-sky-600 dark:stroke-sky-400'}
                strokeWidth={isQuota ? 1.6 : 2.6}
                strokeDasharray={isQuota ? '5 3' : undefined}
              />
              <text x={fxD1.x2 - 2} y={fxD1.y2 - 5} textAnchor="end" className="text-[10px] font-bold fill-sky-600 dark:fill-sky-400">
                D₁
              </text>
              {isQuota && (
                <>
                  <line x1={fxD2.x1} y1={fxD2.y1} x2={fxD2.x2} y2={fxD2.y2} className="stroke-sky-600 dark:stroke-sky-400" strokeWidth="2.8" />
                  <text x={fxD2.x2 - 2} y={fxD2.y2 - 5} textAnchor="end" className="text-[10px] font-extrabold fill-sky-600 dark:fill-sky-400">
                    D₂
                  </text>
                  <line x1="186" y1="142" x2="216" y2="142" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.8" markerEnd="url(#tm3-shift-arrow)" />
                </>
              )}
            </g>

            <g className={dim('eq')}>
              <line x1="48" y1={fxE1.y} x2={fxE1.x} y2={fxE1.y} className="stroke-slate-400" strokeWidth="1.1" strokeDasharray="3 3" />
              <text x="42" y={fxE1.y + 4} textAnchor="end" className="text-[9px] font-mono fill-slate-500">e₁</text>
              <circle cx={fxE1.x} cy={fxE1.y} r="4" className="fill-slate-600 dark:fill-slate-300" />
              <text x={fxE1.x + 6} y={fxE1.y + 12} className="text-[9px] font-bold fill-slate-600 dark:fill-slate-300">E₁</text>

              {fxE2 && (
                <>
                  <line x1="48" y1={fxE2.y} x2={fxE2.x} y2={fxE2.y} className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="42" y={fxE2.y + 4} textAnchor="end" className="text-[9px] font-mono font-bold fill-rose-600 dark:fill-rose-400">e₂</text>
                  <circle cx={fxE2.x} cy={fxE2.y} r="4.8" className="fill-rose-600 dark:fill-rose-400 stroke-white dark:stroke-slate-900" strokeWidth="1.3" />
                  <text x={fxE2.x + 6} y={fxE2.y - 5} className="text-[10px] font-extrabold fill-rose-600 dark:fill-rose-400">E₂</text>
                </>
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Unified Interactive Line Guide for Twin Markets */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            What Each Line Means (Hover or tap to highlight across all 3 panels)
          </span>
          {activeKey && (
            <button
              type="button"
              onClick={() => setActiveKey(null)}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Show all lines
            </button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {legendItems.map((item) => {
            const isSel = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onMouseEnter={() => setActiveKey(item.key)}
                onMouseLeave={() => setActiveKey(null)}
                onClick={() => setActiveKey((cur) => (cur === item.key ? null : item.key))}
                className={`text-left px-3 py-2 rounded-xl border text-[11px] flex items-start gap-2 transition-colors cursor-pointer ${
                  isSel
                    ? 'border-indigo-400 bg-white dark:bg-slate-800 shadow-2xs'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white/75 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/60'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${item.swatch}`} />
                <span className="leading-snug text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-slate-100 block">{item.label}</strong>
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
