import React from 'react';
import type { Matrix01 } from '../math/relations';

interface DigraphSvgProps {
  matrix: Matrix01;
  baseMatrix?: Matrix01; // highlights edges in `matrix` not in `baseMatrix`
  labels?: string[];
}

export const DigraphSvg: React.FC<DigraphSvgProps> = ({
  matrix,
  baseMatrix,
  labels,
}) => {
  const n = matrix.length;
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = n <= 4 ? 76 : 86;

  const coords = Array.from({ length: n }, (_, i) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / n;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      label: labels?.[i] ?? String(i + 1),
    };
  });

  const nodeR = 16;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[260px] h-auto mx-auto select-none"
      aria-label="Directed graph of relation"
    >
      <defs>
        <marker
          id="arrow-norm"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-indigo-500 dark:fill-indigo-400" />
        </marker>
        <marker
          id="arrow-new"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-emerald-500" />
        </marker>
      </defs>

      {matrix.map((row, i) =>
        row.map((val, j) => {
          if (!val) return null;
          const isNew = Boolean(baseMatrix && !baseMatrix[i]?.[j]);
          const strokeClass = isNew
            ? 'stroke-emerald-500'
            : 'stroke-indigo-500 dark:stroke-indigo-400';
          const marker = isNew ? 'url(#arrow-new)' : 'url(#arrow-norm)';

          if (i === j) {
            const p = coords[i];
            const dx = p.x - cx;
            const dy = p.y - cy;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const lx = p.x + ux * 28;
            const ly = p.y + uy * 28;
            const sx = p.x + (-uy) * 11 + ux * (nodeR - 2);
            const sy = p.y + ux * 11 + uy * (nodeR - 2);
            const ex = p.x - (-uy) * 11 + ux * (nodeR - 2);
            const ey = p.y - ux * 11 + uy * (nodeR - 2);
            return (
              <path
                key={`${i}-${j}`}
                d={`M ${sx} ${sy} Q ${lx + (-uy) * 18} ${ly + ux * 18}, ${ex} ${ey}`}
                fill="none"
                strokeWidth={isNew ? 2.2 : 1.7}
                className={strokeClass}
                markerEnd={marker}
              />
            );
          }

          const a = coords[i];
          const b = coords[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const ux = dx / dist;
          const uy = dy / dist;
          const hasReverse = Boolean(matrix[j]?.[i]);
          const curveOffset = hasReverse ? 16 : 0;
          const mx = (a.x + b.x) / 2 - uy * curveOffset;
          const my = (a.y + b.y) / 2 + ux * curveOffset;

          const startX = a.x + ux * nodeR;
          const startY = a.y + uy * nodeR;
          const endX = b.x - ux * (nodeR + 2);
          const endY = b.y - uy * (nodeR + 2);

          return (
            <path
              key={`${i}-${j}`}
              d={`M ${startX} ${startY} Q ${mx} ${my}, ${endX} ${endY}`}
              fill="none"
              strokeWidth={isNew ? 2.2 : 1.7}
              strokeDasharray={isNew ? '4 2' : undefined}
              className={strokeClass}
              markerEnd={marker}
            />
          );
        }),
      )}

      {coords.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.x}
            cy={c.y}
            r={nodeR}
            className="fill-white dark:fill-slate-800 stroke-slate-700 dark:stroke-slate-300"
            strokeWidth={1.8}
          />
          <text
            x={c.x}
            y={c.y + 4}
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-800 dark:fill-slate-100"
          >
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
};
