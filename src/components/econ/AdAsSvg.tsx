import React from 'react';

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
    srpcEffect: 'Movement UP-LEFT along SRPC (lower unemployment, higher inflation). Later SRPC shifts RIGHT as P^e rises.',
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
    srOutcome: 'SRAS shifts LEFT → Price level P ↑ AND Output Y ↓ (Stagflation!), Unemployment u ↑.',
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

export const AdAsSvg: React.FC<{ shockId: MacroShockId }> = ({ shockId }) => {
  const s = MACRO_SHOCKS[shockId];
  const adDx = s.adShift * 34;
  const srasDy = -s.srasShift * 26; // shifting SRAS right/down means lower P at given Y

  // Intersection of baseline AD: y = 60 + 0.85*(x-60) and SRAS: y = 210 - 0.85*(x-60)
  // Baseline E1 at x=155, y=140
  const e1 = { x: 155, y: 140 };
  // Shifted AD: y = 60 + 0.85*(x - (60 + adDx))
  // Shifted SRAS: y = 210 + srasDy - 0.85*(x-60)
  // Solve 60 + 0.85*(x - 60 - adDx) = 210 + srasDy - 0.85*(x-60)
  const e2x = e1.x + adDx / 2 - srasDy / 1.7;
  const e2y = 210 + srasDy - 0.85 * (e2x - 60);

  // Phillips curve coordinates (Panel 2)
  const lrpcX = 140;
  // Baseline SRPC: y = 50 + 180 - 0.9*(x - 50) ... passes through (140, 130)
  const pc1 = { x: lrpcX, y: 130 };
  const pcShiftX = s.srasShift === -1 ? 30 : s.srasShift === 1 ? -30 : 0;
  const pcMoveX = s.adShift === 1 ? -28 : s.adShift === -1 ? 28 : pcShiftX;
  const pcMoveY = s.adShift === 1 ? -28 : s.adShift === -1 ? 28 : s.srasShift === -1 ? -24 : 24;
  const pc2 = { x: pc1.x + pcMoveX, y: pc1.y + pcMoveY };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* AD-AS Panel */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="text-xs font-bold text-center mb-1 text-slate-600 dark:text-slate-300">
          Model of Aggregate Demand &amp; Aggregate Supply
        </div>
        <svg viewBox="0 0 300 250" className="w-full max-w-[300px] mx-auto select-none">
          {/* Axes */}
          <line x1="40" y1="20" x2="40" y2="215" className="stroke-slate-400" strokeWidth="1.8" />
          <line x1="40" y1="215" x2="275" y2="215" className="stroke-slate-400" strokeWidth="1.8" />
          <text x="16" y="30" className="text-[11px] font-bold fill-slate-500">P</text>
          <text x="262" y="232" className="text-[11px] font-bold fill-slate-500">Y</text>

          {/* LRAS */}
          <line x1={e1.x} y1="25" x2={e1.x} y2="215" className="stroke-slate-700 dark:stroke-slate-200" strokeWidth="2.2" />
          <text x={e1.x - 14} y="20" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200">LRAS</text>
          <text x={e1.x - 6} y="230" className="text-[10px] font-mono fill-slate-500">Yₙ</text>

          {/* Baseline AD */}
          <line
            x1="60"
            y1="59"
            x2="250"
            y2="221"
            className={s.adShift !== 0 ? 'stroke-indigo-300' : 'stroke-indigo-600'}
            strokeWidth={s.adShift !== 0 ? 1.8 : 2.4}
            strokeDasharray={s.adShift !== 0 ? '4 3' : undefined}
          />
          <text x="242" y="208" className="text-[10px] font-bold fill-indigo-500">AD₁</text>

          {/* Shifted AD */}
          {s.adShift !== 0 && (
            <>
              <line
                x1={60 + adDx}
                y1="59"
                x2={250 + adDx}
                y2="221"
                className="stroke-indigo-600 dark:stroke-indigo-400"
                strokeWidth="2.5"
              />
              <text x={242 + adDx} y="196" className="text-[10px] font-bold fill-indigo-600 dark:fill-indigo-400">
                AD₂
              </text>
            </>
          )}

          {/* Baseline SRAS */}
          <line
            x1="60"
            y1="221"
            x2="250"
            y2="59"
            className={s.srasShift !== 0 ? 'stroke-rose-300' : 'stroke-rose-600'}
            strokeWidth={s.srasShift !== 0 ? 1.8 : 2.4}
            strokeDasharray={s.srasShift !== 0 ? '4 3' : undefined}
          />
          <text x="235" y="55" className="text-[10px] font-bold fill-rose-500">SRAS₁</text>

          {/* Shifted SRAS */}
          {s.srasShift !== 0 && (
            <>
              <line
                x1="60"
                y1={221 + srasDy}
                x2="250"
                y2={59 + srasDy}
                className="stroke-rose-600 dark:stroke-rose-400"
                strokeWidth="2.5"
              />
              <text x="215" y={52 + srasDy} className="text-[10px] font-bold fill-rose-600 dark:fill-rose-400">
                SRAS₂
              </text>
            </>
          )}

          {/* Points E1 and E2 */}
          <circle cx={e1.x} cy={e1.y} r="4.5" className="fill-slate-500" />
          <text x={e1.x + 6} y={e1.y - 6} className="text-[10px] font-bold fill-slate-500">E₁</text>

          <circle cx={e2x} cy={e2y} r="5" className="fill-emerald-600" />
          <text x={e2x + 7} y={e2y - 6} className="text-[11px] font-bold fill-emerald-600 dark:fill-emerald-400">E₂</text>
        </svg>
      </div>

      {/* Phillips Curve Panel */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="text-xs font-bold text-center mb-1 text-slate-600 dark:text-slate-300">
          Short-Run &amp; Long-Run Phillips Curve
        </div>
        <svg viewBox="0 0 300 250" className="w-full max-w-[300px] mx-auto select-none">
          <line x1="40" y1="20" x2="40" y2="215" className="stroke-slate-400" strokeWidth="1.8" />
          <line x1="40" y1="215" x2="275" y2="215" className="stroke-slate-400" strokeWidth="1.8" />
          <text x="10" y="30" className="text-[10px] font-bold fill-slate-500">Infl π</text>
          <text x="242" y="232" className="text-[10px] font-bold fill-slate-500">Unemp u</text>

          <line x1={lrpcX} y1="25" x2={lrpcX} y2="215" className="stroke-slate-700 dark:stroke-slate-200" strokeWidth="2.2" />
          <text x={lrpcX - 14} y="20" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200">LRPC</text>
          <text x={lrpcX - 6} y="230" className="text-[10px] font-mono fill-slate-500">uₙ</text>

          {/* SRPC1 */}
          <path
            d="M 70 50 Q 115 125 225 185"
            fill="none"
            className={pcShiftX !== 0 ? 'stroke-amber-300' : 'stroke-amber-600'}
            strokeWidth={pcShiftX !== 0 ? 1.8 : 2.4}
            strokeDasharray={pcShiftX !== 0 ? '4 3' : undefined}
          />
          <text x="218" y="176" className="text-[10px] font-bold fill-amber-600">SRPC₁</text>

          {pcShiftX !== 0 && (
            <>
              <path
                d={`M ${70 + pcShiftX} 50 Q ${115 + pcShiftX} 125 ${225 + pcShiftX} 185`}
                fill="none"
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeWidth="2.5"
              />
              <text x={218 + pcShiftX} y="164" className="text-[10px] font-bold fill-amber-600 dark:fill-amber-400">
                SRPC₂
              </text>
            </>
          )}

          <circle cx={pc1.x} cy={pc1.y} r="4.5" className="fill-slate-500" />
          <text x={pc1.x + 6} y={pc1.y - 6} className="text-[10px] font-bold fill-slate-500">E₁</text>

          <circle cx={pc2.x} cy={pc2.y} r="5" className="fill-emerald-600" />
          <text x={pc2.x + 7} y={pc2.y - 6} className="text-[11px] font-bold fill-emerald-600 dark:fill-emerald-400">E₂</text>
        </svg>
      </div>
    </div>
  );
};
