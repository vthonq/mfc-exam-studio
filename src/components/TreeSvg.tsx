import React from 'react';
import type { ExprNode } from '../math/graphsTrees';

interface TreeSvgProps {
  root: ExprNode;
}

interface PositionedNode {
  label: string;
  x: number;
  y: number;
  isLeaf: boolean;
  children: PositionedNode[];
}

function layoutTree(node: ExprNode): { root: PositionedNode; width: number; height: number } {
  let leafIndex = 0;
  let maxDepth = 0;

  const visit = (n: ExprNode, depth: number): PositionedNode => {
    maxDepth = Math.max(maxDepth, depth);
    const isLeaf = !n.left && !n.right;
    if (isLeaf) {
      const x = 36 + leafIndex * 46;
      leafIndex++;
      return { label: n.label, x, y: 28 + depth * 52, isLeaf: true, children: [] };
    }
    const kids: PositionedNode[] = [];
    if (n.left) kids.push(visit(n.left, depth + 1));
    if (n.right) kids.push(visit(n.right, depth + 1));
    const avgX = kids.reduce((s, c) => s + c.x, 0) / kids.length;
    return { label: n.label, x: avgX, y: 28 + depth * 52, isLeaf: false, children: kids };
  };

  const root = visit(node, 0);
  return {
    root,
    width: Math.max(240, leafIndex * 46 + 26),
    height: (maxDepth + 1) * 52 + 12,
  };
}

export const TreeSvg: React.FC<TreeSvgProps> = ({ root }) => {
  const { root: laidOut, width, height } = layoutTree(root);

  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const nodes: PositionedNode[] = [];
  const collect = (n: PositionedNode) => {
    nodes.push(n);
    for (const c of n.children) {
      edges.push({ x1: n.x, y1: n.y, x2: c.x, y2: c.y });
      collect(c);
    }
  };
  collect(laidOut);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-[440px] h-auto mx-auto select-none"
      aria-label="Expression tree"
    >
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth={1.8}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r={15}
            className={
              n.isLeaf
                ? 'fill-sky-50 stroke-sky-500 dark:fill-sky-950 dark:stroke-sky-400'
                : 'fill-indigo-600 stroke-indigo-400'
            }
            strokeWidth={1.8}
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            className={`text-xs font-bold ${
              n.isLeaf ? 'fill-slate-800 dark:fill-slate-100' : 'fill-white'
            }`}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
};
