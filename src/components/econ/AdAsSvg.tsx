import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export type MacroShockId =
  | 'expansion-ad'
  | 'contraction-ad'
  | 'adverse-supply'
  | 'positive-supply';

export interface MacroShockInfo {
  id: MacroShockId;
  title: string;
  titleVi: string;
  adShift: number; // -1 left, 0 none, +1 right
  srasShift: number; // -1 left, 0 none, +1 right
  srOutcome: string;
  lrAdjustment: string;
  srpcEffect: string;
}

export const MACRO_SHOCKS: Record<MacroShockId, MacroShockInfo> = {
  'expansion-ad': {
    id: 'expansion-ad',
    title: 'Expansionary Fiscal / Monetary Policy (G ↑, T ↓, or MS ↑)',
    titleVi: 'Chính sách tài khóa / tiền tệ mở rộng (Cầu tăng)',
    adShift: 1,
    srasShift: 0,
    srOutcome: 'AD shifts RIGHT → Price level P ↑, Output Y ↑ (above Y_n), Unemployment u ↓.',
    lrAdjustment:
      'In the Long Run, higher expected price level P^e raises wages/costs → SRAS shifts LEFT back to LRAS (Y returns to Y_n, P rises further).',
    srpcEffect:
      'Movement UP-LEFT along SRPC (lower unemployment, higher inflation). Later SRPC shifts RIGHT as P^e rises.',
  },
  'contraction-ad': {
    id: 'contraction-ad',
    title: 'Recession / Contractionary Policy (C ↓, I ↓, or Fed sells bonds)',
    titleVi: 'Suy thoái / Thắt chặt tiền tệ hoặc tài khóa (Cầu giảm)',
    adShift: -1,
    srasShift: 0,
    srOutcome: 'AD shifts LEFT → Price level P ↓, Output Y ↓ (recession), Unemployment u ↑.',
    lrAdjustment:
      'Without policy, lower expected prices eventually reduce wages → SRAS shifts RIGHT back to LRAS at a lower P.',
    srpcEffect: 'Movement DOWN-RIGHT along SRPC (higher unemployment, lower inflation).',
  },
  'adverse-supply': {
    id: 'adverse-supply',
    title: 'Adverse Supply Shock / Oil Spike (Stagflation)',
    titleVi: 'Cú sốc cung bất lợi / Giá dầu tăng (Lạm phát đình trệ)',
    adShift: 0,
    srasShift: -1,
    srOutcome:
      'SRAS shifts LEFT → Price level P ↑ AND Output Y ↓ (Stagflation!), Unemployment u ↑.',
    lrAdjustment:
      'Policymakers face a trade-off: boosting AD fixes Y but pushes P even higher; doing nothing lets recession slowly pull wages down.',
    srpcEffect: 'SRPC shifts RIGHT (worse trade-off: BOTH inflation AND unemployment rise!).',
  },
  'positive-supply': {
    id: 'positive-supply',
    title: 'Favorable Supply Shock / Lower Input Costs',
    titleVi: 'Cú sốc cung tích cực / Giảm chi phí đầu vào',
    adShift: 0,
    srasShift: 1,
    srOutcome: 'SRAS shifts RIGHT → Price level P ↓ AND Output Y ↑, Unemployment u ↓.',
    lrAdjustment: 'Lower P^e keeps costs low until wages adjust.',
    srpcEffect: 'SRPC shifts LEFT (favorable: lower inflation AND lower unemployment!).',
  },
};

type AdLegendKey = 'lras' | 'sras' | 'ad' | 'eq' | null;
type PcLegendKey = 'lrpc' | 'srpc' | 'eq' | null;

function clipLineSegment(
  xCenter: number,
  yCenter: number,
  slope: number,
  xMin = 80,
  xMax = 336,
  yMin = 42,
  yMax = 218,
): { x1: number; y1: number; x2: number; y2: number } {
  // Parametric form: y = yCenter + slope * (x - xCenter)
  const xs = [
    xMin,
    xMax,
    xCenter + (yMin - yCenter) / slope,
    xCenter + (yMax - yCenter) / slope,
  ]
    .map((x) => ({ x, y: yCenter + slope * (x - xCenter) }))
    .filter((p) => p.x >= xMin - 0.1 && p.x <= xMax + 0.1 && p.y >= yMin - 0.1 && p.y <= yMax + 0.1)
    .sort((a, b) => a.x - b.x);

  const first = xs[0] ?? { x: xMin, y: yCenter };
  const last = xs[xs.length - 1] ?? { x: xMax, y: yCenter };
  return { x1: first.x, y1: first.y, x2: last.x, y2: last.y };
}

function buildSrpcPath(centerX: number, baseY = 132): string {
  const pts: string[] = [];
  for (let d = -92; d <= 92; d += 8) {
    const x = centerX + d;
    const y = baseY + 0.72 * d - 0.0022 * d * d;
    if (x >= 76 && x <= 338 && y >= 38 && y <= 220) {
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  return pts.join(' ');
}

function evalSrpcY(x: number, centerX: number, baseY = 132): number {
  const d = x - centerX;
  return baseY + 0.72 * d - 0.0022 * d * d;
}

export const AdAsSvg: React.FC<{ shockId: MacroShockId }> = ({ shockId }) => {
  const { settings } = useApp();
  const bilingual = settings.lang === 'bilingual';
  const [activeAdKey, setActiveAdKey] = useState<AdLegendKey>(null);
  const [activePcKey, setActivePcKey] = useState<PcLegendKey>(null);

  const s = MACRO_SHOCKS[shockId];
  const e1 = { x: 205, y: 132 };
  const adDx = s.adShift * 42;
  const srasDx = s.srasShift * 42;

  // AD: y = 132 + 0.8*(x - (205 + adDx)); SRAS: y = 132 - 0.8*(x - (205 + srasDx))
  const e2 = {
    x: 205 + (adDx + srasDx) / 2,
    y: 132 + 0.8 * ((srasDx - adDx) / 2),
  };

  const ad1 = clipLineSegment(205, 132, 0.8);
  const ad2 = clipLineSegment(205 + adDx, 132, 0.8);
  const sras1 = clipLineSegment(205, 132, -0.8);
  const sras2 = clipLineSegment(205 + srasDx, 132, -0.8);

  // Phillips curve coordinates (Panel 2)
  const pc1 = { x: 205, y: 132 };
  const pcShiftX = s.srasShift === -1 ? 48 : s.srasShift === 1 ? -48 : 0;
  const pc2X = s.adShift === 1 ? 160 : s.adShift === -1 ? 250 : s.srasShift === -1 ? 228 : 182;
  const pc2 = { x: pc2X, y: evalSrpcY(pc2X, 205 + pcShiftX) };

  const dimAd = (key: Exclude<AdLegendKey, null>) =>
    activeAdKey && activeAdKey !== key ? 'opacity-20 transition-opacity duration-150' : 'transition-opacity duration-150';
  const dimPc = (key: Exclude<PcLegendKey, null>) =>
    activePcKey && activePcKey !== key ? 'opacity-20 transition-opacity duration-150' : 'transition-opacity duration-150';

  const adLegendItems: Array<{
    key: Exclude<AdLegendKey, null>;
    swatch: 'lras' | 'sras' | 'ad' | 'eq';
    label: string;
    desc: string;
  }> = [
    {
      key: 'lras',
      swatch: 'lras',
      label: 'LRAS (Vertical Slate)',
      desc: bilingual
        ? 'Long-run aggregate supply at natural output Yₙ (Tổng cung dài hạn ở mức sản lượng tự nhiên Yₙ).'
        : 'Long-run potential output Yₙ determined by resources & technology (independent of price level P).',
    },
    {
      key: 'sras',
      swatch: 'sras',
      label: s.srasShift !== 0 ? 'SRAS₁ (dashed) → SRAS₂ (solid Rose)' : 'SRAS₁ (Rose)',
      desc: bilingual
        ? 'Short-run aggregate supply; sticky wages make it upward-sloping (Tổng cung ngắn hạn dốc lên; cú sốc cung làm dịch chuyển đường này).'
        : 'Short-run supply (upward-sloping due to sticky wages/prices). Supply/cost shocks shift SRAS.',
    },
    {
      key: 'ad',
      swatch: 'ad',
      label: s.adShift !== 0 ? 'AD₁ (dashed) → AD₂ (solid Indigo)' : 'AD₁ (Indigo)',
      desc: bilingual
        ? 'Aggregate demand Y = C + I + G + NX (Tổng cầu dốc xuống; chính sách G, T, MS làm dịch chuyển AD).'
        : 'Aggregate demand (C + I + G + NX). Fiscal/monetary stimulus or spending shocks shift AD.',
    },
    {
      key: 'eq',
      swatch: 'eq',
      label: 'E₁ (old) → E₂ (new equilibrium)',
      desc: bilingual
        ? 'Dashed drop-lines compare before (P₁, Yₙ) vs after (P₂, Y₂) (Đường nét đứt chiếu sang 2 trục để so sánh P và Y).'
        : 'Dotted projection lines project before (P₁, Yₙ) and after (P₂, Y₂) directly onto both axes.',
    },
  ];

  const pcLegendItems: Array<{
    key: Exclude<PcLegendKey, null>;
    swatch: 'lrpc' | 'srpc' | 'eq';
    label: string;
    desc: string;
  }> = [
    {
      key: 'lrpc',
      swatch: 'lrpc',
      label: 'LRPC (Vertical Slate)',
      desc: bilingual
        ? 'Natural rate of unemployment uₙ in the long run (Đường Phillips dài hạn tại thất nghiệp tự nhiên uₙ).'
        : 'Long-run natural unemployment uₙ — inflation and unemployment are unrelated in the long run.',
    },
    {
      key: 'srpc',
      swatch: 'srpc',
      label: pcShiftX !== 0 ? 'SRPC₁ (dashed) → SRPC₂ (solid Amber)' : 'SRPC₁ (Amber curve)',
      desc: bilingual
        ? pcShiftX !== 0
          ? 'Supply shock shifts SRPC itself, changing inflation & unemployment together (Cú sốc cung làm dịch chuyển cả đường SRPC).'
          : 'Short-run trade-off between inflation π & unemployment u (Cú sốc cầu AD chỉ làm trượt dọc trên SRPC₁).'
        : pcShiftX !== 0
          ? 'Short-run Phillips Curve shifts when input costs or expected inflation change.'
          : 'Short-run inverse trade-off between π and u; AD shocks cause movement ALONG this fixed curve.',
    },
    {
      key: 'eq',
      swatch: 'eq',
      label: 'E₁ → E₂ (Short-Run Outcome)',
      desc: bilingual
        ? 'Track (π₁, uₙ) moving to (π₂, u₂) on the axes (So sánh lạm phát π và thất nghiệp u trước & sau cú sốc).'
        : 'Dashed axis projections show whether inflation π and unemployment u rose or fell.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <span className="w-5 border-t-2 border-dashed border-slate-500 inline-block" />
            Old curve / Projection
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <span className="w-5 border-t-[3px] border-indigo-500 inline-block" />
            Active / New curve
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
            E₁ →
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            E₂
          </span>
        </div>
        <span className="text-slate-500 dark:text-slate-400">
          Hover or tap any legend item below to isolate that line
        </span>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        {/* Panel 1: AD-AS */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold text-center text-slate-700 dark:text-slate-200">
            1. Model of Aggregate Demand &amp; Aggregate Supply
          </div>
          <svg viewBox="0 0 380 280" className="w-full max-w-[390px] mx-auto select-none" role="img" aria-label="Aggregate Demand and Aggregate Supply diagram">
            <defs>
              <marker id="adas-axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker id="adas-shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-emerald-600 dark:fill-emerald-400" />
              </marker>
            </defs>

            {/* Subtle Reference Grid */}
            {[72, 132, 192].map((gy) => (
              <line key={`gy-${gy}`} x1="62" y1={gy} x2="352" y2={gy} className="stroke-slate-200/80 dark:stroke-slate-800" strokeWidth="1" />
            ))}
            {[125, 205, 285].map((gx) => (
              <line key={`gx-${gx}`} x1={gx} y1="28" x2={gx} y2="230" className="stroke-slate-200/80 dark:stroke-slate-800" strokeWidth="1" />
            ))}

            {/* Axes */}
            <line x1="62" y1="230" x2="62" y2="22" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.8" markerEnd="url(#adas-axis-arrow)" />
            <line x1="62" y1="230" x2="358" y2="230" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.8" markerEnd="url(#adas-axis-arrow)" />
            <text x="16" y="132" textAnchor="middle" transform="rotate(-90 16 132)" className="text-[11px] font-bold fill-slate-600 dark:fill-slate-300">
              Price Level (P)
            </text>
            <text x="207" y="270" textAnchor="middle" className="text-[11px] font-bold fill-slate-600 dark:fill-slate-300">
              Real GDP / Output (Y)
            </text>

            {/* LRAS */}
            <g className={dimAd('lras')}>
              <line x1={e1.x} y1="36" x2={e1.x} y2="230" className="stroke-slate-700 dark:stroke-slate-200" strokeWidth="2.4" />
              <text x={e1.x} y="27" textAnchor="middle" className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200">
                LRAS
              </text>
            </g>

            {/* AD1 Baseline & AD2 Shifted */}
            <g className={dimAd('ad')}>
              <line
                x1={ad1.x1}
                y1={ad1.y1}
                x2={ad1.x2}
                y2={ad1.y2}
                className={s.adShift !== 0 ? 'stroke-indigo-400/70 dark:stroke-indigo-400/50' : 'stroke-indigo-600 dark:stroke-indigo-400'}
                strokeWidth={s.adShift !== 0 ? 1.8 : 2.8}
                strokeDasharray={s.adShift !== 0 ? '6 4' : undefined}
              />
              <text x={ad1.x2 - 4} y={ad1.y2 - 7} textAnchor="end" className="text-[11px] font-bold fill-indigo-600 dark:fill-indigo-400">
                AD₁
              </text>

              {s.adShift !== 0 && (
                <>
                  <line
                    x1={ad2.x1}
                    y1={ad2.y1}
                    x2={ad2.x2}
                    y2={ad2.y2}
                    className="stroke-indigo-600 dark:stroke-indigo-400"
                    strokeWidth="2.9"
                  />
                  <text
                    x={ad2.x2 - 2}
                    y={ad2.y2 + 13}
                    textAnchor="middle"
                    className="text-[11px] font-extrabold fill-indigo-600 dark:fill-indigo-400"
                  >
                    AD₂
                  </text>
                  <line
                    x1={142 + (s.adShift > 0 ? 4 : -4)}
                    y1="78"
                    x2={142 + adDx + (s.adShift > 0 ? -5 : 5)}
                    y2="78"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="2"
                    markerEnd="url(#adas-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* SRAS1 Baseline & SRAS2 Shifted */}
            <g className={dimAd('sras')}>
              <line
                x1={sras1.x1}
                y1={sras1.y1}
                x2={sras1.x2}
                y2={sras1.y2}
                className={s.srasShift !== 0 ? 'stroke-rose-400/70 dark:stroke-rose-400/50' : 'stroke-rose-600 dark:stroke-rose-400'}
                strokeWidth={s.srasShift !== 0 ? 1.8 : 2.8}
                strokeDasharray={s.srasShift !== 0 ? '6 4' : undefined}
              />
              <text x={sras1.x2 - 4} y={sras1.y2 - 7} textAnchor="end" className="text-[11px] font-bold fill-rose-600 dark:fill-rose-400">
                SRAS₁
              </text>

              {s.srasShift !== 0 && (
                <>
                  <line
                    x1={sras2.x1}
                    y1={sras2.y1}
                    x2={sras2.x2}
                    y2={sras2.y2}
                    className="stroke-rose-600 dark:stroke-rose-400"
                    strokeWidth="2.9"
                  />
                  <text
                    x={sras2.x2 - 2}
                    y={sras2.y2 - 7}
                    textAnchor="middle"
                    className="text-[11px] font-extrabold fill-rose-600 dark:fill-rose-400"
                  >
                    SRAS₂
                  </text>
                  <line
                    x1={272 + (s.srasShift > 0 ? 4 : -4)}
                    y1="78"
                    x2={272 + srasDx + (s.srasShift > 0 ? -5 : 5)}
                    y2="78"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="2"
                    markerEnd="url(#adas-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* Equilibrium Points + Axis Projections */}
            <g className={dimAd('eq')}>
              <line x1="62" y1={e1.y} x2={e1.x} y2={e1.y} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x="56" y={e1.y + 4} textAnchor="end" className="text-[10px] font-mono font-semibold fill-slate-500 dark:fill-slate-400">
                P₁
              </text>
              <text x={e1.x} y="246" textAnchor="middle" className="text-[10px] font-mono font-semibold fill-slate-600 dark:fill-slate-300">
                Yₙ
              </text>

              <line x1="62" y1={e2.y} x2={e2.x} y2={e2.y} className="stroke-emerald-600/80 dark:stroke-emerald-400/80" strokeWidth="1.3" strokeDasharray="3 3" />
              <line x1={e2.x} y1={e2.y} x2={e2.x} y2="230" className="stroke-emerald-600/80 dark:stroke-emerald-400/80" strokeWidth="1.3" strokeDasharray="3 3" />
              <text x="56" y={e2.y + 4} textAnchor="end" className="text-[10px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400">
                P₂
              </text>
              <text x={e2.x} y="246" textAnchor="middle" className="text-[10px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400">
                Y₂
              </text>

              <circle cx={e1.x} cy={e1.y} r="5" className="fill-slate-600 dark:fill-slate-300 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
              <text x={e1.x + 8} y={e1.y + 14} className="text-[10px] font-bold fill-slate-600 dark:fill-slate-300">
                E₁
              </text>

              <circle cx={e2.x} cy={e2.y} r="5.5" className="fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
              <text x={e2.x + 8} y={e2.y - 6} className="text-[11px] font-extrabold fill-emerald-600 dark:fill-emerald-400">
                E₂
              </text>
            </g>
          </svg>

          {/* Interactive Line Guide for AD-AS */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Line Guide (hover or tap)
            </div>
            <div className="grid gap-1.5">
              {adLegendItems.map((item) => {
                const isSel = activeAdKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => setActiveAdKey(item.key)}
                    onMouseLeave={() => setActiveAdKey(null)}
                    onClick={() => setActiveAdKey((cur) => (cur === item.key ? null : item.key))}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-[11px] flex items-start gap-2 transition-colors cursor-pointer ${
                      isSel
                        ? 'border-indigo-400 bg-white dark:bg-slate-800 shadow-2xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="mt-1 shrink-0 flex items-center">
                      {item.swatch === 'lras' && <span className="w-4 h-0.5 bg-slate-700 dark:bg-slate-200 inline-block" />}
                      {item.swatch === 'sras' && <span className="w-4 h-0.5 bg-rose-600 dark:bg-rose-400 inline-block" />}
                      {item.swatch === 'ad' && <span className="w-4 h-0.5 bg-indigo-600 dark:bg-indigo-400 inline-block" />}
                      {item.swatch === 'eq' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block" />}
                    </span>
                    <span className="leading-snug text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">{item.label}:</strong> {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel 2: Phillips Curve */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="text-xs font-bold text-center text-slate-700 dark:text-slate-200">
            2. Short-Run &amp; Long-Run Phillips Curve
          </div>
          <svg viewBox="0 0 380 280" className="w-full max-w-[390px] mx-auto select-none" role="img" aria-label="Phillips Curve diagram">
            <defs>
              <marker id="pc-axis-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-400 dark:fill-slate-500" />
              </marker>
              <marker id="pc-shift-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-emerald-600 dark:fill-emerald-400" />
              </marker>
            </defs>

            {/* Subtle Reference Grid */}
            {[72, 132, 192].map((gy) => (
              <line key={`pc-gy-${gy}`} x1="62" y1={gy} x2="352" y2={gy} className="stroke-slate-200/80 dark:stroke-slate-800" strokeWidth="1" />
            ))}
            {[125, 205, 285].map((gx) => (
              <line key={`pc-gx-${gx}`} x1={gx} y1="28" x2={gx} y2="230" className="stroke-slate-200/80 dark:stroke-slate-800" strokeWidth="1" />
            ))}

            {/* Axes */}
            <line x1="62" y1="230" x2="62" y2="22" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.8" markerEnd="url(#pc-axis-arrow)" />
            <line x1="62" y1="230" x2="358" y2="230" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.8" markerEnd="url(#pc-axis-arrow)" />
            <text x="16" y="132" textAnchor="middle" transform="rotate(-90 16 132)" className="text-[11px] font-bold fill-slate-600 dark:fill-slate-300">
              Inflation Rate (π)
            </text>
            <text x="207" y="270" textAnchor="middle" className="text-[11px] font-bold fill-slate-600 dark:fill-slate-300">
              Unemployment Rate (u)
            </text>

            {/* LRPC */}
            <g className={dimPc('lrpc')}>
              <line x1={pc1.x} y1="36" x2={pc1.x} y2="230" className="stroke-slate-700 dark:stroke-slate-200" strokeWidth="2.4" />
              <text x={pc1.x} y="27" textAnchor="middle" className="text-[11px] font-bold fill-slate-700 dark:fill-slate-200">
                LRPC
              </text>
            </g>

            {/* SRPC1 & SRPC2 */}
            <g className={dimPc('srpc')}>
              <path
                d={buildSrpcPath(205)}
                fill="none"
                className={pcShiftX !== 0 ? 'stroke-amber-400/70 dark:stroke-amber-400/50' : 'stroke-amber-600 dark:stroke-amber-400'}
                strokeWidth={pcShiftX !== 0 ? 1.8 : 2.8}
                strokeDasharray={pcShiftX !== 0 ? '6 4' : undefined}
              />
              <text x="275" y="198" className="text-[11px] font-bold fill-amber-600 dark:fill-amber-400">
                SRPC₁
              </text>

              {pcShiftX !== 0 && (
                <>
                  <path
                    d={buildSrpcPath(205 + pcShiftX)}
                    fill="none"
                    className="stroke-amber-600 dark:stroke-amber-400"
                    strokeWidth="2.9"
                  />
                  <text x={275 + pcShiftX} y="168" className="text-[11px] font-extrabold fill-amber-600 dark:fill-amber-400">
                    SRPC₂
                  </text>
                  <line
                    x1={155 + (pcShiftX > 0 ? 4 : -4)}
                    y1="82"
                    x2={155 + pcShiftX + (pcShiftX > 0 ? -5 : 5)}
                    y2="82"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="2"
                    markerEnd="url(#pc-shift-arrow)"
                  />
                </>
              )}
            </g>

            {/* Points + Axis Projections */}
            <g className={dimPc('eq')}>
              <line x1="62" y1={pc1.y} x2={pc1.x} y2={pc1.y} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x="56" y={pc1.y + 4} textAnchor="end" className="text-[10px] font-mono font-semibold fill-slate-500 dark:fill-slate-400">
                π₁
              </text>
              <text x={pc1.x} y="246" textAnchor="middle" className="text-[10px] font-mono font-semibold fill-slate-600 dark:fill-slate-300">
                uₙ
              </text>

              <line x1="62" y1={pc2.y} x2={pc2.x} y2={pc2.y} className="stroke-emerald-600/80 dark:stroke-emerald-400/80" strokeWidth="1.3" strokeDasharray="3 3" />
              <line x1={pc2.x} y1={pc2.y} x2={pc2.x} y2="230" className="stroke-emerald-600/80 dark:stroke-emerald-400/80" strokeWidth="1.3" strokeDasharray="3 3" />
              <text x="56" y={pc2.y + 4} textAnchor="end" className="text-[10px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400">
                π₂
              </text>
              <text x={pc2.x} y="246" textAnchor="middle" className="text-[10px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400">
                u₂
              </text>

              {pcShiftX === 0 && (
                <line
                  x1={pc1.x}
                  y1={pc1.y}
                  x2={pc2.x + (pc2.x < pc1.x ? 7 : -7)}
                  y2={pc2.y + (pc2.y < pc1.y ? 6 : -6)}
                  className="stroke-emerald-600 dark:stroke-emerald-400"
                  strokeWidth="1.8"
                  markerEnd="url(#pc-shift-arrow)"
                />
              )}

              <circle cx={pc1.x} cy={pc1.y} r="5" className="fill-slate-600 dark:fill-slate-300 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
              <text x={pc1.x + 8} y={pc1.y + 14} className="text-[10px] font-bold fill-slate-600 dark:fill-slate-300">
                E₁
              </text>

              <circle cx={pc2.x} cy={pc2.y} r="5.5" className="fill-emerald-600 dark:fill-emerald-400 stroke-white dark:stroke-slate-900" strokeWidth="1.5" />
              <text x={pc2.x + 8} y={pc2.y - 6} className="text-[11px] font-extrabold fill-emerald-600 dark:fill-emerald-400">
                E₂
              </text>
            </g>
          </svg>

          {/* Interactive Line Guide for Phillips Curve */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Line Guide (hover or tap)
            </div>
            <div className="grid gap-1.5">
              {pcLegendItems.map((item) => {
                const isSel = activePcKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => setActivePcKey(item.key)}
                    onMouseLeave={() => setActivePcKey(null)}
                    onClick={() => setActivePcKey((cur) => (cur === item.key ? null : item.key))}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-[11px] flex items-start gap-2 transition-colors cursor-pointer ${
                      isSel
                        ? 'border-amber-400 bg-white dark:bg-slate-800 shadow-2xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="mt-1 shrink-0 flex items-center">
                      {item.swatch === 'lrpc' && <span className="w-4 h-0.5 bg-slate-700 dark:bg-slate-200 inline-block" />}
                      {item.swatch === 'srpc' && <span className="w-4 h-0.5 bg-amber-600 dark:bg-amber-400 inline-block" />}
                      {item.swatch === 'eq' && <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block" />}
                    </span>
                    <span className="leading-snug text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">{item.label}:</strong> {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
