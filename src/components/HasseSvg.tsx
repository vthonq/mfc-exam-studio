import React from 'react';
import type { PosetAnalysis } from '../math/relations';

interface HasseSvgProps {
  poset: PosetAnalysis;
  highlightSet?: number[];
}

export const HasseSvg: React.FC<HasseSvgProps> = ({ poset, highlightSet = [] }) => {
  const byLevel = new Map<number, number[]>();
  let maxLevel = 0;
  for (const el of poset.elements) {
    const lvl = poset.levels[el] ?? 0;
    maxLevel = Math.max(maxLevel, lvl);
    const arr = byLevel.get(lvl) ?? [];
    arr.push(el);
    byLevel.set(lvl, arr);
  }

  const width = 340;
  const height = Math.max(210, (maxLevel + 1) * 58 + 32);
  const coords: Record<number, { x: number; y: number }> = {};

  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const row = byLevel.get(lvl) ?? [];
    const y = height - 28 - lvl * ((height - 56) / Math.max(1, maxLevel));
    const spacing = width / (row.length + 1);
    row.forEach((el, idx) => {
      coords[el] = { x: spacing * (idx + 1), y };
    });
  }

  const hi = new Set(highlightSet);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-[340px] h-auto mx-auto select-none"
      aria-label="Hasse diagram"
    >
      {poset.coverEdges.map((e, idx) => {
        const a = coords[e.from];
        const b = coords[e.to];
        if (!a || !b) return null;
        return (
          <line
            key={idx}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeWidth={1.8}
          />
        );
      })}
      {poset.elements.map((el) => {
        const p = coords[el];
        const isHi = hi.has(el);
        return (
          <g key={el}>
            <circle
              cx={p.x}
              cy={p.y}
              r={15}
              className={
                isHi
                  ? 'fill-amber-100 stroke-amber-500 dark:fill-amber-900/60 dark:stroke-amber-400'
                  : 'fill-white stroke-indigo-500 dark:fill-slate-800 dark:stroke-indigo-400'
              }
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              className="text-xs font-semibold fill-slate-800 dark:fill-slate-100"
            >
              {el}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
