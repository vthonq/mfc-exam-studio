import React from 'react';
import { chiSqPdf, fPdf, normalPdf, tPdf } from '../../math/probStat';

export type CurveDistribution = 'normal' | 't' | 'chisq' | 'f';
export type ShadeMode = 'zero-to-z' | 'left' | 'right' | 'two-tail' | 'between' | 'central';

interface DistributionCurveSvgProps {
  distribution: CurveDistribution;
  df?: number;
  df1?: number;
  df2?: number;
  shadeMode: ShadeMode;
  boundA?: number;
  boundB?: number;
  areaLabel?: string;
  markerLabel?: string;
  height?: number;
}

export const DistributionCurveSvg: React.FC<DistributionCurveSvgProps> = ({
  distribution,
  df = 15,
  df1 = 5,
  df2 = 10,
  shadeMode,
  boundA = 0,
  boundB = 1.96,
  areaLabel,
  markerLabel,
  height = 175,
}) => {
  const W = 460;
  const H = height;
  const padL = 32;
  const padR = 20;
  const padT = 22;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const baseY = padT + plotH;

  let xMin = -3.8;
  let xMax = 3.8;

  if (distribution === 'chisq') {
    xMin = 0;
    const mean = df;
    const sd = Math.sqrt(2 * df);
    xMax = Math.max(12, mean + 4 * sd, (boundB ?? 0) * 1.25, (boundA ?? 0) * 1.25);
  } else if (distribution === 'f') {
    xMin = 0;
    const crit = Math.max(boundA ?? 2, boundB ?? 2);
    xMax = Math.min(Math.max(5.5, crit * 1.35), 25);
  } else {
    const ext = Math.max(3.8, Math.abs(boundA ?? 0) + 0.7, Math.abs(boundB ?? 0) + 0.7);
    xMin = -Math.min(ext, 6);
    xMax = Math.min(ext, 6);
  }

  const evalPdf = (x: number): number => {
    if (distribution === 'normal') return normalPdf(x);
    if (distribution === 't') return tPdf(x, df);
    if (distribution === 'chisq') return x <= 0.02 && df <= 2 ? chiSqPdf(0.05, df) : chiSqPdf(x, df);
    return x <= 0.02 && df1 <= 2 ? fPdf(0.06, df1, df2) : fPdf(x, df1, df2);
  };

  const N = 160;
  const pts: Array<{ x: number; y: number }> = [];
  let maxY = 0;
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    const y = evalPdf(x);
    if (Number.isFinite(y)) {
      pts.push({ x, y });
      if (y > maxY) maxY = y;
    } else {
      pts.push({ x, y: 0 });
    }
  }
  if (maxY <= 0) maxY = 0.4;

  const toSx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSy = (y: number) => baseY - (y / (maxY * 1.12)) * plotH;

  const curvePath = pts
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSx(p.x).toFixed(1)} ${toSy(p.y).toFixed(1)}`)
    .join(' ');

  const isShaded = (x: number): boolean => {
    if (shadeMode === 'zero-to-z') {
      const target = Math.abs(boundB ?? boundA ?? 0);
      return x >= 0 && x <= target;
    }
    if (shadeMode === 'left') {
      return x <= boundA;
    }
    if (shadeMode === 'right') {
      return x >= boundA;
    }
    if (shadeMode === 'between' || shadeMode === 'central') {
      const lo = Math.min(boundA, boundB);
      const hi = Math.max(boundA, boundB);
      return x >= lo && x <= hi;
    }
    // two-tail
    const cutoff = Math.abs(boundA);
    return x <= -cutoff || x >= cutoff;
  };

  // Build contiguous shaded polygon segments
  const shadePolys: string[] = [];
  let currentSeg: Array<{ x: number; y: number }> = [];
  for (const p of pts) {
    if (isShaded(p.x)) {
      currentSeg.push(p);
    } else if (currentSeg.length > 0) {
      const first = currentSeg[0];
      const last = currentSeg[currentSeg.length - 1];
      const d = [
        `M ${toSx(first.x).toFixed(1)} ${baseY}`,
        ...currentSeg.map((q) => `L ${toSx(q.x).toFixed(1)} ${toSy(q.y).toFixed(1)}`),
        `L ${toSx(last.x).toFixed(1)} ${baseY} Z`,
      ].join(' ');
      shadePolys.push(d);
      currentSeg = [];
    }
  }
  if (currentSeg.length > 0) {
    const first = currentSeg[0];
    const last = currentSeg[currentSeg.length - 1];
    const d = [
      `M ${toSx(first.x).toFixed(1)} ${baseY}`,
      ...currentSeg.map((q) => `L ${toSx(q.x).toFixed(1)} ${toSy(q.y).toFixed(1)}`),
      `L ${toSx(last.x).toFixed(1)} ${baseY} Z`,
    ].join(' ');
    shadePolys.push(d);
  }

  const markers: Array<{ val: number; text: string }> = [];
  if (shadeMode === 'zero-to-z') {
    markers.push({ val: 0, text: '0' });
    markers.push({ val: Math.abs(boundB), text: Math.abs(boundB).toFixed(2) });
  } else if (shadeMode === 'left' || shadeMode === 'right') {
    if (boundA >= xMin && boundA <= xMax) {
      markers.push({ val: boundA, text: markerLabel || boundA.toFixed(2) });
    }
  } else if (shadeMode === 'two-tail') {
    const c = Math.abs(boundA);
    if (c <= xMax) {
      markers.push({ val: -c, text: (-c).toFixed(2) });
      markers.push({ val: c, text: c.toFixed(2) });
    }
  } else {
    const lo = Math.min(boundA, boundB);
    const hi = Math.max(boundA, boundB);
    if (lo >= xMin && lo <= xMax) markers.push({ val: lo, text: lo.toFixed(2) });
    if (hi >= xMin && hi <= xMax && Math.abs(hi - lo) > 0.05) {
      markers.push({ val: hi, text: hi.toFixed(2) });
    }
  }

  const ticks =
    distribution === 'normal' || distribution === 't'
      ? [-3, -2, -1, 0, 1, 2, 3].filter((t) => t >= xMin && t <= xMax)
      : [0, Math.round(xMax * 0.25), Math.round(xMax * 0.5), Math.round(xMax * 0.75), Math.round(xMax)];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[460px] mx-auto select-none"
      role="img"
      aria-label="Probability distribution curve"
    >
      {/* Shaded regions */}
      {shadePolys.map((d, idx) => (
        <path key={idx} d={d} className="fill-sky-500/35 dark:fill-sky-400/35" />
      ))}

      {/* Axis */}
      <line
        x1={padL}
        y1={baseY}
        x2={W - padR}
        y2={baseY}
        className="stroke-slate-400 dark:stroke-slate-600"
        strokeWidth={1.5}
      />

      {/* Baseline ticks */}
      {ticks.map((t) => (
        <g key={t} transform={`translate(${toSx(t)}, ${baseY})`}>
          <line y2={4} className="stroke-slate-400 dark:stroke-slate-600" strokeWidth={1} />
          <text
            y={15}
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono"
          >
            {t}
          </text>
        </g>
      ))}

      {/* PDF Curve */}
      <path
        d={curvePath}
        fill="none"
        className="stroke-sky-600 dark:stroke-sky-400"
        strokeWidth={2.4}
      />

      {/* Critical markers */}
      {markers.map((m, idx) => {
        const mx = toSx(m.val);
        return (
          <g key={idx}>
            <line
              x1={mx}
              y1={padT + 4}
              x2={mx}
              y2={baseY}
              className="stroke-amber-600 dark:stroke-amber-400"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={mx}
              y={baseY + 27}
              textAnchor="middle"
              className="fill-amber-700 dark:fill-amber-300 text-[10px] font-bold font-mono"
            >
              {m.text}
            </text>
          </g>
        );
      })}

      {/* Area Pill */}
      {areaLabel && (
        <g>
          <rect
            x={W - 168}
            y={6}
            width={154}
            height={22}
            rx={6}
            className="fill-sky-50 dark:fill-sky-950/90 stroke-sky-300 dark:stroke-sky-700"
          />
          <text
            x={W - 91}
            y={20}
            textAnchor="middle"
            className="fill-sky-800 dark:fill-sky-200 text-[11px] font-bold font-mono"
          >
            {areaLabel}
          </text>
        </g>
      )}
    </svg>
  );
};
