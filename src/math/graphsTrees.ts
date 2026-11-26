import { createRng } from './prng';

export interface GraphEdge {
  u: string;
  v: string;
  w: number;
}

export interface WeightedGraph {
  vertices: string[];
  edges: GraphEdge[];
  positions: Record<string, { x: number; y: number }>;
}

export interface HavelHakimiStep {
  sequence: number[];
  removedDegree: number;
  note: string;
}

export function havelHakimiSteps(rawSeq: number[]): {
  graphical: boolean;
  reason: string;
  steps: HavelHakimiStep[];
  constructedEdges?: Array<[number, number]>;
} {
  const seq = [...rawSeq].sort((a, b) => b - a);
  const sum = seq.reduce((a, b) => a + b, 0);
  if (seq.some((d) => d < 0 || d >= seq.length)) {
    return {
      graphical: false,
      reason: `Invalid degree: every vertex degree in a simple graph on ${seq.length} vertices must satisfy 0 ≤ d ≤ ${seq.length - 1}.`,
      steps: [{ sequence: seq, removedDegree: -1, note: 'Degree out of range [0, n-1]' }],
    };
  }
  if (sum % 2 !== 0) {
    return {
      graphical: false,
      reason: `Sum of degrees is ${sum} (odd), violating the Handshaking Theorem (∑ deg(v) = 2|E|).`,
      steps: [{ sequence: seq, removedDegree: -1, note: `Odd degree sum = ${sum}` }],
    };
  }

  const steps: HavelHakimiStep[] = [];
  let cur = [...seq];

  while (true) {
    cur.sort((a, b) => b - a);
    if (cur.every((x) => x === 0)) {
      steps.push({ sequence: [...cur], removedDegree: 0, note: 'All zeros reached → Graphical!' });
      break;
    }
    const d = cur.shift()!;
    if (d > cur.length) {
      steps.push({
        sequence: [d, ...cur],
        removedDegree: d,
        note: `Cannot subtract 1 from ${d} remaining elements (only ${cur.length} available).`,
      });
      return {
        graphical: false,
        reason: `Havel-Hakimi failed when reducing degree ${d} across only ${cur.length} remaining vertices.`,
        steps,
      };
    }
    for (let i = 0; i < d; i++) {
      cur[i] -= 1;
      if (cur[i] < 0) {
        steps.push({
          sequence: [...cur],
          removedDegree: d,
          note: 'Negative degree produced → Not graphical.',
        });
        return {
          graphical: false,
          reason: 'Havel-Hakimi produced a negative degree, so no simple graph exists.',
          steps,
        };
      }
    }
    steps.push({
      sequence: [...cur].sort((a, b) => b - a),
      removedDegree: d,
      note: `Removed ${d}, subtracted 1 from the next ${d} largest degrees, and re-sorted.`,
    });
  }

  // Construct an explicit simple graph when graphical
  const nodes = rawSeq.map((deg, idx) => ({ id: idx, deg }));
  const constructedEdges: Array<[number, number]> = [];
  while (true) {
    nodes.sort((a, b) => b.deg - a.deg || a.id - b.id);
    if (nodes[0].deg === 0) break;
    const top = nodes.shift()!;
    for (let i = 0; i < top.deg; i++) {
      nodes[i].deg -= 1;
      constructedEdges.push([top.id, nodes[i].id]);
    }
  }

  return {
    graphical: true,
    reason: 'Sequence reduces to all zeros by Havel-Hakimi, so a simple graph exists.',
    steps,
    constructedEdges,
  };
}

export interface DijkstraRow {
  step: number;
  selected: string;
  selectedDist: number;
  labels: Record<string, number>;
  parent: Record<string, string | null>;
  settled: string[];
}

export function dijkstraSteps(graph: WeightedGraph, start: string) {
  const dist: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const settled = new Set<string>();
  const rows: DijkstraRow[] = [];

  for (const v of graph.vertices) {
    dist[v] = v === start ? 0 : Infinity;
    parent[v] = null;
  }

  const adj: Record<string, Array<{ to: string; w: number }>> = {};
  for (const v of graph.vertices) adj[v] = [];
  for (const e of graph.edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    adj[e.v].push({ to: e.u, w: e.w });
  }

  rows.push({
    step: 0,
    selected: '-',
    selectedDist: 0,
    labels: { ...dist },
    parent: { ...parent },
    settled: [],
  });

  for (let iter = 1; iter <= graph.vertices.length; iter++) {
    let u: string | null = null;
    let best = Infinity;
    for (const v of graph.vertices) {
      if (!settled.has(v) && dist[v] < best) {
        best = dist[v];
        u = v;
      }
    }
    if (!u) break;
    settled.add(u);

    for (const { to, w } of adj[u]) {
      if (!settled.has(to) && dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        parent[to] = u;
      }
    }

    rows.push({
      step: iter,
      selected: u,
      selectedDist: best,
      labels: { ...dist },
      parent: { ...parent },
      settled: Array.from(settled),
    });
  }

  const reconstructPath = (target: string): string[] => {
    const path: string[] = [];
    let cur: string | null = target;
    while (cur) {
      path.unshift(cur);
      cur = parent[cur] ?? null;
    }
    return path[0] === start ? path : [];
  };

  return { rows, distances: dist, parent, reconstructPath };
}

export function edgeKey(u: string, v: string): string {
  return u < v ? `${u}-${v}` : `${v}-${u}`;
}

export function primSteps(graph: WeightedGraph, start: string): {
  edges: GraphEdge[];
  totalWeight: number;
} {
  const visited = new Set<string>([start]);
  const chosen: GraphEdge[] = [];
  let totalWeight = 0;

  while (visited.size < graph.vertices.length) {
    const candidates = graph.edges
      .filter((e) => (visited.has(e.u) && !visited.has(e.v)) || (visited.has(e.v) && !visited.has(e.u)))
      .sort((a, b) => a.w - b.w || edgeKey(a.u, a.v).localeCompare(edgeKey(b.u, b.v)));
    if (candidates.length === 0) break;
    const best = candidates[0];
    chosen.push(best);
    totalWeight += best.w;
    visited.add(best.u);
    visited.add(best.v);
  }

  return { edges: chosen, totalWeight };
}

export function kruskalSteps(graph: WeightedGraph): {
  edges: GraphEdge[];
  totalWeight: number;
} {
  const parent: Record<string, string> = {};
  for (const v of graph.vertices) parent[v] = v;
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));

  const sorted = [...graph.edges].sort(
    (a, b) => a.w - b.w || edgeKey(a.u, a.v).localeCompare(edgeKey(b.u, b.v)),
  );
  const chosen: GraphEdge[] = [];
  let totalWeight = 0;

  for (const e of sorted) {
    const ru = find(e.u);
    const rv = find(e.v);
    if (ru !== rv) {
      parent[ru] = rv;
      chosen.push(e);
      totalWeight += e.w;
      if (chosen.length === graph.vertices.length - 1) break;
    }
  }

  return { edges: chosen, totalWeight };
}

export function isValidMstEdgeChoice(
  graph: WeightedGraph,
  chosenSoFar: GraphEdge[],
  candidate: GraphEdge,
  algo: 'prim' | 'kruskal',
  startVertex: string,
): { valid: boolean; reason: string } {
  if (algo === 'prim') {
    const treeVertices = new Set<string>([startVertex]);
    for (const e of chosenSoFar) {
      treeVertices.add(e.u);
      treeVertices.add(e.v);
    }
    const crossesCut =
      (treeVertices.has(candidate.u) && !treeVertices.has(candidate.v)) ||
      (treeVertices.has(candidate.v) && !treeVertices.has(candidate.u));
    if (!crossesCut) {
      return {
        valid: false,
        reason: `Edge ${candidate.u}-${candidate.v} must connect the current Prim tree (${Array.from(treeVertices).join(', ')}) to a new vertex without forming a cycle.`,
      };
    }
    const minCutWeight = Math.min(
      ...graph.edges
        .filter((e) => (treeVertices.has(e.u) && !treeVertices.has(e.v)) || (treeVertices.has(e.v) && !treeVertices.has(e.u)))
        .map((e) => e.w),
    );
    if (candidate.w > minCutWeight) {
      return {
        valid: false,
        reason: `Edge ${candidate.u}-${candidate.v} has weight ${candidate.w}, but a lighter cut edge of weight ${minCutWeight} is available.`,
      };
    }
    return { valid: true, reason: `Valid Prim step (weight ${candidate.w}).` };
  }

  // Kruskal
  const uf: Record<string, string> = {};
  for (const v of graph.vertices) uf[v] = v;
  const find = (x: string): string => (uf[x] === x ? x : (uf[x] = find(uf[x])));
  for (const e of chosenSoFar) {
    const ru = find(e.u);
    const rv = find(e.v);
    if (ru !== rv) uf[ru] = rv;
  }
  if (find(candidate.u) === find(candidate.v)) {
    return {
      valid: false,
      reason: `Adding ${candidate.u}-${candidate.v} would create a cycle!`,
    };
  }
  const chosenSet = new Set(chosenSoFar.map((e) => edgeKey(e.u, e.v)));
  const minAvail = Math.min(
    ...graph.edges
      .filter((e) => !chosenSet.has(edgeKey(e.u, e.v)) && find(e.u) !== find(e.v))
      .map((e) => e.w),
  );
  if (candidate.w > minAvail) {
    return {
      valid: false,
      reason: `Edge ${candidate.u}-${candidate.v} has weight ${candidate.w}, but a lighter non-cycle edge of weight ${minAvail} remains.`,
    };
  }
  return { valid: true, reason: `Valid Kruskal step (weight ${candidate.w}).` };
}

export const ASSIGNMENT4_GRAPH: WeightedGraph = {
  vertices: ['a', 'b', 'c', 'd', 'e', 'z'],
  edges: [
    { u: 'a', v: 'b', w: 3 },
    { u: 'a', v: 'c', w: 2 },
    { u: 'b', v: 'c', w: 2 },
    { u: 'b', v: 'd', w: 5 },
    { u: 'c', v: 'd', w: 8 },
    { u: 'c', v: 'e', w: 10 },
    { u: 'd', v: 'e', w: 2 },
    { u: 'd', v: 'z', w: 6 },
    { u: 'e', v: 'z', w: 3 },
  ],
  positions: {
    a: { x: 65, y: 145 },
    b: { x: 185, y: 65 },
    c: { x: 185, y: 225 },
    d: { x: 335, y: 65 },
    e: { x: 335, y: 225 },
    z: { x: 455, y: 145 },
  },
};

export function generateWeightedGraph(seed: string | number): WeightedGraph {
  const rng = createRng(seed);
  const weights = Array.from({ length: 9 }, () => rng.int(1, 11));
  return {
    vertices: ['a', 'b', 'c', 'd', 'e', 'z'],
    edges: ASSIGNMENT4_GRAPH.edges.map((e, idx) => ({ ...e, w: weights[idx] })),
    positions: ASSIGNMENT4_GRAPH.positions,
  };
}

export interface ExprNode {
  label: string;
  left?: ExprNode;
  right?: ExprNode;
}

export function preorder(node: ExprNode): string[] {
  const out = [node.label];
  if (node.left) out.push(...preorder(node.left));
  if (node.right) out.push(...preorder(node.right));
  return out;
}

export function inorder(node: ExprNode): string {
  if (!node.left && !node.right) return node.label;
  return `(${inorder(node.left!)} ${node.label} ${inorder(node.right!)})`;
}

export function postorder(node: ExprNode): string[] {
  const out: string[] = [];
  if (node.left) out.push(...postorder(node.left));
  if (node.right) out.push(...postorder(node.right));
  out.push(node.label);
  return out;
}

export function evaluatePostfix(tokens: string[]): {
  result: number;
  steps: Array<{ token: string; stackAfter: number[] }>;
} {
  const stack: number[] = [];
  const steps: Array<{ token: string; stackAfter: number[] }> = [];

  for (const tok of tokens) {
    if (/^-?\d+(\.\d+)?$/.test(tok)) {
      stack.push(Number(tok));
    } else {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) {
        throw new Error(`Invalid postfix expression near "${tok}"`);
      }
      let res = 0;
      if (tok === '+') res = a + b;
      else if (tok === '-') res = a - b;
      else if (tok === '*' || tok === '·') res = a * b;
      else if (tok === '/') res = a / b;
      else if (tok === '^' || tok === '↑') res = a ** b;
      else throw new Error(`Unknown operator "${tok}"`);
      stack.push(res);
    }
    steps.push({ token: tok, stackAfter: [...stack] });
  }

  if (stack.length !== 1) {
    throw new Error('Malformed postfix expression: leftover stack items');
  }
  return { result: stack[0], steps };
}

export function fullMaryTreeCalc(
  m: number,
  given: 'internal' | 'vertices' | 'leaves',
  val: number,
): { n: number; i: number; l: number } {
  if (m < 2) throw new Error('m must be >= 2');
  let i = 0;
  if (given === 'internal') i = val;
  else if (given === 'vertices') i = (val - 1) / m;
  else i = (val - 1) / (m - 1);

  if (!Number.isInteger(i) || i < 0) {
    throw new Error('Value does not correspond to a valid full m-ary tree');
  }
  return {
    n: m * i + 1,
    i,
    l: (m - 1) * i + 1,
  };
}

export const ASSIGNMENT4_EXPR_TREE: ExprNode = {
  label: '-',
  left: {
    label: '*',
    left: {
      label: '↑',
      left: {
        label: '+',
        left: { label: 'x' },
        right: { label: '2' },
      },
      right: { label: '3' },
    },
    right: {
      label: '-',
      left: { label: 'y' },
      right: {
        label: '+',
        left: { label: '3' },
        right: { label: 'x' },
      },
    },
  },
  right: { label: '5' },
};

export function generateExpressionProblem(seed: string | number): {
  tree: ExprNode;
  postfixEvalTokens: string[];
} {
  const rng = createRng(seed);
  const op1 = rng.pick(['+', '-']);
  const op2 = rng.pick(['+', '*']);
  const a = String(rng.int(2, 6));
  const b = String(rng.int(1, 5));

  const tree: ExprNode = {
    label: rng.pick(['+', '-']),
    left: {
      label: '*',
      left: {
        label: op1,
        left: { label: 'x' },
        right: { label: a },
      },
      right: {
        label: op2,
        left: { label: 'y' },
        right: { label: b },
      },
    },
    right: {
      label: '↑',
      left: { label: 'z' },
      right: { label: '2' },
    },
  };

  const p1 = rng.int(4, 9);
  const p2 = rng.int(2, 4);
  const p3 = rng.int(1, 3);
  const p4 = rng.int(2, 3);
  const postfixEvalTokens = [
    String(p1),
    String(p2),
    String(p3),
    '*',
    '-',
    String(p4),
    '↑',
    String(rng.int(4, 12)),
    '2',
    '/',
    '+',
  ];

  return { tree, postfixEvalTokens };
}
