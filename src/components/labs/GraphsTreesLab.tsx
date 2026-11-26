import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  ASSIGNMENT4_EXPR_TREE,
  ASSIGNMENT4_GRAPH,
  dijkstraSteps,
  edgeKey,
  evaluatePostfix,
  fullMaryTreeCalc,
  generateExpressionProblem,
  generateWeightedGraph,
  havelHakimiSteps,
  inorder,
  isValidMstEdgeChoice,
  kruskalSteps,
  postorder,
  preorder,
  primSteps,
  type GraphEdge,
} from '../../math/graphsTrees';
import { randomSeedCode } from '../../math/prng';
import { useApp } from '../../context/AppContext';
import { GraphSvg } from '../GraphSvg';
import { TreeSvg } from '../TreeSvg';

export const GraphsTreesLab: React.FC = () => {
  const { recordPractice } = useApp();
  const [tab, setTab] = useState<'dijkstra' | 'mst' | 'degrees' | 'trees'>('dijkstra');

  // Shared weighted graph
  const [graph, setGraph] = useState(ASSIGNMENT4_GRAPH);
  const [dijkStep, setDijkStep] = useState(0);

  // Interactive MST picker
  const [mstAlgo, setMstAlgo] = useState<'prim' | 'kruskal'>('prim');
  const [pickedEdges, setPickedEdges] = useState<GraphEdge[]>([]);
  const [mstMsg, setMstMsg] = useState<string>('Click edges on the graph in valid algorithm order!');

  // Degree sequence tester
  const [degInput, setDegInput] = useState('5, 4, 3, 3, 2, 1');

  // Trees & expressions
  const [exprState, setExprState] = useState({
    tree: ASSIGNMENT4_EXPR_TREE,
    postfixEvalTokens: '7 2 3 * - 4 ↑ 9 3 / +'.split(' '),
  });
  const [userPre, setUserPre] = useState('');
  const [userPost, setUserPost] = useState('');
  const [userEval, setUserEval] = useState('');
  const [exprChecked, setExprChecked] = useState(false);

  const [maryM, setMaryM] = useState(5);
  const [maryGiven, setMaryGiven] = useState<'internal' | 'vertices' | 'leaves'>('internal');
  const [maryVal, setMaryVal] = useState(100);

  const dijkRes = useMemo(() => dijkstraSteps(graph, 'a'), [graph]);
  const currentDijk = dijkRes.rows[Math.min(dijkStep, dijkRes.rows.length - 1)];
  const canonicalMst = useMemo(
    () => (mstAlgo === 'prim' ? primSteps(graph, 'a') : kruskalSteps(graph)),
    [graph, mstAlgo],
  );

  const hhResult = useMemo(() => {
    const nums = degInput
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    return nums.length > 0 ? havelHakimiSteps(nums) : null;
  }, [degInput]);

  const expectedPre = useMemo(() => preorder(exprState.tree).join(' '), [exprState]);
  const expectedPost = useMemo(() => postorder(exprState.tree).join(' '), [exprState]);
  const evalRes = useMemo(
    () => evaluatePostfix(exprState.postfixEvalTokens),
    [exprState],
  );

  const maryRes = useMemo(() => {
    try {
      return fullMaryTreeCalc(maryM, maryGiven, maryVal);
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid' };
    }
  }, [maryM, maryGiven, maryVal]);

  const handleEdgeClick = (edge: GraphEdge) => {
    if (pickedEdges.some((e) => edgeKey(e.u, e.v) === edgeKey(edge.u, edge.v))) return;
    if (pickedEdges.length >= graph.vertices.length - 1) return;
    const check = isValidMstEdgeChoice(graph, pickedEdges, edge, mstAlgo, 'a');
    if (check.valid) {
      const next = [...pickedEdges, edge];
      setPickedEdges(next);
      if (next.length === graph.vertices.length - 1) {
        const total = next.reduce((s, e) => s + e.w, 0);
        setMstMsg(`✓ Complete MST built! Total weight = ${total}.`);
        recordPractice('ch11', true);
      } else {
        setMstMsg(check.reason);
      }
    } else {
      setMstMsg(`✗ ${check.reason}`);
      recordPractice('ch11', false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dijkstra', label: 'Dijkstra Shortest Path' },
            { id: 'mst', label: 'Prim & Kruskal MST' },
            { id: 'degrees', label: 'Degree Sequences (Havel-Hakimi)' },
            { id: 'trees', label: 'Expression Trees & m-ary' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                tab === t.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setGraph(ASSIGNMENT4_GRAPH);
              setDijkStep(0);
              setPickedEdges([]);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs cursor-pointer"
          >
            A4 Preset Graph
          </button>
          <button
            onClick={() => {
              setGraph(generateWeightedGraph(randomSeedCode()));
              setDijkStep(0);
              setPickedEdges([]);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Random Weights
          </button>
        </div>
      </div>

      {tab === 'dijkstra' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold">
              Dijkstra&apos;s Algorithm from vertex <code className="font-mono">a</code> (Step {dijkStep} / {dijkRes.rows.length - 1})
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setDijkStep((s) => Math.max(0, s - 1))}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
              >
                Prev Step
              </button>
              <button
                onClick={() => {
                  const next = Math.min(dijkRes.rows.length - 1, dijkStep + 1);
                  setDijkStep(next);
                  if (next === dijkRes.rows.length - 1) recordPractice('ch10', true);
                }}
                className="px-2.5 py-1 rounded bg-sky-600 text-white text-xs cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>

          <GraphSvg
            graph={graph}
            settledVertices={currentDijk.settled}
            distanceLabels={currentDijk.labels}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="p-2 text-left">Step</th>
                  <th className="p-2 text-left">Settled u</th>
                  {graph.vertices.map((v) => (
                    <th key={v} className="p-2 text-center">
                      L({v})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dijkRes.rows.slice(0, dijkStep + 1).map((r) => (
                  <tr key={r.step} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2">{r.step}</td>
                    <td className="p-2 font-bold text-indigo-600 dark:text-indigo-400">
                      {r.selected}
                    </td>
                    {graph.vertices.map((v) => (
                      <td
                        key={v}
                        className={`p-2 text-center ${
                          r.settled.includes(v) ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                        }`}
                      >
                        {r.labels[v] === Infinity ? '∞' : r.labels[v]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            Shortest path a → z: <strong>{dijkRes.reconstructPath('z').join(' → ')}</strong> (length{' '}
            <strong>{dijkRes.distances['z']}</strong>)
          </div>
        </div>
      )}

      {tab === 'mst' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {(['prim', 'kruskal'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setMstAlgo(a);
                    setPickedEdges([]);
                    setMstMsg(`Switched to ${a.toUpperCase()} — click edges on the graph!`);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase cursor-pointer ${
                    mstAlgo === a ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPickedEdges([]);
                  setMstMsg('Cleared. Click the next valid edge.');
                }}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
              >
                Reset Edges
              </button>
              <button
                onClick={() => {
                  setPickedEdges(canonicalMst.edges);
                  setMstMsg(`Canonical ${mstAlgo.toUpperCase()} MST weight = ${canonicalMst.totalWeight}.`);
                }}
                className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs cursor-pointer"
              >
                Auto-Solve
              </button>
            </div>
          </div>

          <GraphSvg
            graph={graph}
            highlightedEdges={pickedEdges}
            onEdgeClick={handleEdgeClick}
          />

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
            <div className="font-semibold">{mstMsg}</div>
            <div className="font-mono">
              Chosen ({pickedEdges.length}/{graph.vertices.length - 1}):{' '}
              {pickedEdges.map((e) => `${e.u}${e.v}(${e.w})`).join(' → ') || 'None yet'}
              {pickedEdges.length > 0 &&
                ` | Sum = ${pickedEdges.reduce((s, e) => s + e.w, 0)}`}
            </div>
          </div>
        </div>
      )}

      {tab === 'degrees' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={degInput}
              onChange={(e) => setDegInput(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-sm w-60"
            />
            <button
              onClick={() => setDegInput('5, 5, 4, 3, 2, 1')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs cursor-pointer"
            >
              A4 Q1(a-i): 5,5,4,3,2,1
            </button>
            <button
              onClick={() => setDegInput('5, 4, 3, 3, 2, 1')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs cursor-pointer"
            >
              A4 Q1(a-ii): 5,4,3,3,2,1
            </button>
          </div>

          {hhResult && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded-xl text-sm font-medium ${
                  hhResult.graphical
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                {hhResult.graphical ? 'GRAPHICAL: ' : 'NOT GRAPHICAL: '}
                {hhResult.reason}
              </div>
              <div className="space-y-1 text-xs font-mono">
                {hhResult.steps.map((s, i) => (
                  <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-800/60">
                    [{s.sequence.join(', ')}] — {s.note}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'trees' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Expression Tree Traversals &amp; Postfix Evaluator</h3>
              <button
                onClick={() => {
                  setExprState(generateExpressionProblem(randomSeedCode()));
                  setUserPre('');
                  setUserPost('');
                  setUserEval('');
                  setExprChecked(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 text-xs font-semibold cursor-pointer"
              >
                New Expression
              </button>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Infix: {inorder(exprState.tree)}
            </div>
            <TreeSvg root={exprState.tree} />

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Prefix (space-separated):</label>
                <input
                  value={userPre}
                  onChange={(e) => setUserPre(e.target.value)}
                  placeholder="e.g. - * ↑ + x 2 3 ..."
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Postfix (space-separated):</label>
                <input
                  value={userPost}
                  onChange={(e) => setUserPost(e.target.value)}
                  placeholder="e.g. x 2 + 3 ↑ ..."
                  className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span>
                Evaluate Postfix:{' '}
                <code className="font-mono font-bold">
                  {exprState.postfixEvalTokens.join(' ')}
                </code>
              </span>
              <input
                value={userEval}
                onChange={(e) => setUserEval(e.target.value)}
                placeholder="Value"
                className="w-24 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono"
              />
              <button
                onClick={() => {
                  setExprChecked(true);
                  const norm = (s: string) => s.trim().replace(/\s+/g, ' ');
                  const ok =
                    norm(userPre) === expectedPre &&
                    norm(userPost) === expectedPost &&
                    Number(userEval.trim()) === evalRes.result;
                  recordPractice('ch11', ok);
                }}
                className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
              >
                Check &amp; Reveal
              </button>
            </div>

            {exprChecked && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-mono space-y-1">
                <div>Prefix: {expectedPre}</div>
                <div>Postfix: {expectedPost}</div>
                <div>Postfix Value = {evalRes.result}</div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">Full m-ary Tree Formula Calculator</h3>
            <div className="flex flex-wrap gap-3 items-center text-xs">
              <label>
                m ={' '}
                <input
                  type="number"
                  min={2}
                  value={maryM}
                  onChange={(e) => setMaryM(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono"
                />
              </label>
              <select
                value={maryGiven}
                onChange={(e) => setMaryGiven(e.target.value as typeof maryGiven)}
                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700"
              >
                <option value="internal">Internal vertices (i)</option>
                <option value="vertices">Total vertices (n)</option>
                <option value="leaves">Leaves (l)</option>
              </select>
              <input
                type="number"
                value={maryVal}
                onChange={(e) => setMaryVal(Number(e.target.value))}
                className="w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            {'error' in maryRes ? (
              <div className="text-xs text-rose-500">{maryRes.error}</div>
            ) : (
              <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                n = {maryRes.n} total vertices | i = {maryRes.i} internal | l = {maryRes.l} leaves
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
