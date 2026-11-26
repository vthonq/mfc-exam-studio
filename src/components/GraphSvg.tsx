import React from 'react';
import { edgeKey, type GraphEdge, type WeightedGraph } from '../math/graphsTrees';

interface GraphSvgProps {
  graph: WeightedGraph;
  highlightedEdges?: GraphEdge[];
  settledVertices?: string[];
  distanceLabels?: Record<string, number>;
  onEdgeClick?: (edge: GraphEdge) => void;
}

export const GraphSvg: React.FC<GraphSvgProps> = ({
  graph,
  highlightedEdges = [],
  settledVertices = [],
  distanceLabels,
  onEdgeClick,
}) => {
  const hiKeys = new Set(highlightedEdges.map((e) => edgeKey(e.u, e.v)));
  const settled = new Set(settledVertices);

  return (
    <svg
      viewBox="0 0 520 290"
      className="w-full max-w-[520px] h-auto mx-auto select-none"
      aria-label="Weighted graph"
    >
      {graph.edges.map((e) => {
        const p1 = graph.positions[e.u];
        const p2 = graph.positions[e.v];
        const isHi = hiKeys.has(edgeKey(e.u, e.v));
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        return (
          <g
            key={edgeKey(e.u, e.v)}
            onClick={onEdgeClick ? () => onEdgeClick(e) : undefined}
            className={onEdgeClick ? 'cursor-pointer' : undefined}
          >
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              strokeWidth={isHi ? 4.2 : 2.2}
              className={
                isHi
                  ? 'stroke-emerald-500'
                  : 'stroke-slate-300 dark:stroke-slate-600 hover:stroke-indigo-400'
              }
            />
            <rect
              x={mx - 11}
              y={my - 10}
              width={22}
              height={18}
              rx={5}
              className={
                isHi
                  ? 'fill-emerald-100 stroke-emerald-500 dark:fill-emerald-950 dark:stroke-emerald-400'
                  : 'fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600'
              }
              strokeWidth={1.2}
            />
            <text
              x={mx}
              y={my + 3}
              textAnchor="middle"
              className={`text-[11px] font-bold ${
                isHi
                  ? 'fill-emerald-700 dark:fill-emerald-300'
                  : 'fill-slate-700 dark:fill-slate-200'
              }`}
            >
              {e.w}
            </text>
          </g>
        );
      })}

      {graph.vertices.map((v) => {
        const p = graph.positions[v];
        const isSettled = settled.has(v);
        const dist = distanceLabels?.[v];
        return (
          <g key={v}>
            <circle
              cx={p.x}
              cy={p.y}
              r={18}
              className={
                isSettled
                  ? 'fill-indigo-600 stroke-indigo-300'
                  : 'fill-white stroke-slate-700 dark:fill-slate-800 dark:stroke-slate-300'
              }
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              className={`text-sm font-bold ${
                isSettled ? 'fill-white' : 'fill-slate-800 dark:fill-slate-100'
              }`}
            >
              {v}
            </text>
            {dist !== undefined && (
              <text
                x={p.x}
                y={p.y - 23}
                textAnchor="middle"
                className="text-[11px] font-mono font-semibold fill-indigo-600 dark:fill-indigo-300"
              >
                {dist === Infinity ? '∞' : dist}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
