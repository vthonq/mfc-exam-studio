import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  booleanProduct,
  buildDivisorPoset,
  checkRelationProperties,
  cloneMatrix,
  generateRandomRelationMatrix,
  getSubsetBounds,
  isValidTopologicalSort,
  matricesEqual,
  pairsToMatrix,
  warshallSteps,
  type Matrix01,
} from '../../math/relations';
import { randomSeedCode } from '../../math/prng';
import { useApp } from '../../context/AppContext';
import { DigraphSvg } from '../DigraphSvg';
import { HasseSvg } from '../HasseSvg';

const A3_Q2_MR: Matrix01 = [
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
  [1, 0, 0, 0],
];

const A3_Q3_WARSHALL: Matrix01 = pairsToMatrix(5, [
  [1, 2],
  [2, 3],
  [3, 1],
  [3, 4],
  [4, 5],
  [5, 4],
]);

export const RelationsLab: React.FC = () => {
  const { recordPractice } = useApp();
  const [tab, setTab] = useState<'props' | 'warshall' | 'poset'>('props');

  // Properties & Boolean product
  const [matrix, setMatrix] = useState<Matrix01>(cloneMatrix(A3_Q2_MR));
  const [userSq, setUserSq] = useState<Matrix01>(
    Array.from({ length: 4 }, () => Array(4).fill(0)),
  );
  const [sqChecked, setSqChecked] = useState(false);

  // Warshall stepper
  const [warshallBase, setWarshallBase] = useState<Matrix01>(cloneMatrix(A3_Q3_WARSHALL));
  const [stepIdx, setStepIdx] = useState(0);
  const [userWNext, setUserWNext] = useState<Matrix01>(cloneMatrix(A3_Q3_WARSHALL));
  const [wCheckMsg, setWCheckMsg] = useState<string | null>(null);

  // Poset & Topological Sort
  const [posetInput, setPosetInput] = useState('3, 5, 9, 15, 24, 45');
  const [topoGuess, setTopoGuess] = useState('3, 5, 9, 15, 24, 45');
  const [topoFeedback, setTopoFeedback] = useState<string | null>(null);

  const report = useMemo(() => checkRelationProperties(matrix), [matrix]);
  const expectedSq = useMemo(() => booleanProduct(matrix, matrix), [matrix]);
  const wSteps = useMemo(() => warshallSteps(warshallBase), [warshallBase]);

  const posetElements = useMemo(() => {
    const nums = posetInput
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);
    return nums.length >= 2 ? nums : [3, 5, 9, 15, 24, 45];
  }, [posetInput]);

  const poset = useMemo(() => buildDivisorPoset(posetElements), [posetElements]);
  const pairBounds = useMemo(() => {
    if (poset.elements.length < 2) return null;
    return getSubsetBounds(poset.elements, [poset.elements[0], poset.elements[1]]);
  }, [poset]);

  const toggleCell = (
    setter: React.Dispatch<React.SetStateAction<Matrix01>>,
    r: number,
    c: number,
  ) => {
    setter((prev) => {
      const next = cloneMatrix(prev);
      next[r][c] = next[r][c] ? 0 : 1;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'props', label: 'Properties, Digraph & M(R²)' },
          { id: 'warshall', label: 'Warshall Algorithm (W₀ → Wₙ)' },
          { id: 'poset', label: 'Hasse Diagram, Bounds & Topo Sort' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
              tab === t.id
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'props' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap justify-between gap-2">
            <div className="text-sm font-semibold">
              Click cells of M<sub>R</sub> to edit relation, inspect properties, and compute M<sub>R</sub>² = M<sub>R</sub> ⊙ M<sub>R</sub>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMatrix(cloneMatrix(A3_Q2_MR));
                  setSqChecked(false);
                }}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Assignment 3 Q2 Preset
              </button>
              <button
                onClick={() => {
                  setMatrix(generateRandomRelationMatrix(randomSeedCode(), 4));
                  setUserSq(Array.from({ length: 4 }, () => Array(4).fill(0)));
                  setSqChecked(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Random 4×4
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            <div>
              <div className="text-xs font-bold mb-2 text-slate-500">Relation Matrix M<sub>R</sub> (Editable)</div>
              <div className="inline-grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                {matrix.map((row, r) =>
                  row.map((val, c) => (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => {
                        toggleCell(setMatrix, r, c);
                        setSqChecked(false);
                      }}
                      className={`w-10 h-10 rounded-lg font-mono font-bold text-sm cursor-pointer ${
                        val
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {val}
                    </button>
                  )),
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold mb-1 text-slate-500">Live Directed Graph</div>
              <DigraphSvg matrix={matrix} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-500">Property Analysis &amp; Counterexamples</div>
              {(
                [
                  ['Reflexive', report.reflexive],
                  ['Symmetric', report.symmetric],
                  ['Antisymmetric', report.antisymmetric],
                  ['Transitive', report.transitive],
                ] as const
              ).map(([name, res]) => (
                <div
                  key={name}
                  className={`p-2 rounded-lg border ${
                    res.holds
                      ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30'
                      : 'border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30'
                  }`}
                >
                  <div className="font-semibold">
                    {name}: {res.holds ? 'YES' : 'NO'}
                  </div>
                  {res.counterexample && (
                    <div className="font-mono text-[11px] opacity-85 mt-0.5">{res.counterexample}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-wrap items-center gap-6">
            <div>
              <div className="text-xs font-bold mb-2 text-slate-500">
                Your M<sub>R</sub>² = M<sub>R</sub> ⊙ M<sub>R</sub> (Click to fill)
              </div>
              <div className="inline-grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                {userSq.map((row, r) =>
                  row.map((val, c) => {
                    const ok = sqChecked && val === expectedSq[r][c];
                    const bad = sqChecked && val !== expectedSq[r][c];
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => {
                          toggleCell(setUserSq, r, c);
                          setSqChecked(false);
                        }}
                        className={`w-10 h-10 rounded-lg font-mono font-bold text-sm cursor-pointer border ${
                          ok
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            : bad
                              ? 'bg-rose-100 border-rose-500 text-rose-900'
                              : val
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSqChecked(true);
                  recordPractice('ch9', matricesEqual(userSq, expectedSq));
                }}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer"
              >
                Check M<sub>R</sub>²
              </button>
              <button
                onClick={() => {
                  setUserSq(cloneMatrix(expectedSq));
                  setSqChecked(true);
                }}
                className="ml-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
              >
                Fill Answer
              </button>
              {sqChecked && (
                <div className="text-xs font-medium">
                  {matricesEqual(userSq, expectedSq)
                    ? '✓ Exact match!'
                    : '✗ Some entries differ — remember M(R²)[i][j] = 1 iff ∃k with M[i][k]=1 and M[k][j]=1.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'warshall' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold">
              Warshall&apos;s Algorithm Stepper (W₀ → W<sub>{warshallBase.length}</sub>)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setWarshallBase(cloneMatrix(A3_Q3_WARSHALL));
                  setStepIdx(0);
                  setUserWNext(cloneMatrix(A3_Q3_WARSHALL));
                  setWCheckMsg(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs cursor-pointer"
              >
                Assignment 3 Q3 Preset
              </button>
              <button
                onClick={() => {
                  const r = generateRandomRelationMatrix(randomSeedCode(), 4);
                  setWarshallBase(r);
                  setStepIdx(0);
                  setUserWNext(cloneMatrix(r));
                  setWCheckMsg(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs cursor-pointer"
              >
                Random 4×4
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {wSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setStepIdx(idx);
                  setUserWNext(cloneMatrix(wSteps[idx]));
                  setWCheckMsg(null);
                }}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                  stepIdx === idx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                W<sub>{idx}</sub>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                {stepIdx === 0 ? (
                  <>
                    Initial matrix W₀ = M<sub>R</sub>. Click W₁..Wₙ or advance step by step.
                  </>
                ) : (
                  <>
                    Showing W<sub>{stepIdx}</sub> (allowing intermediate vertices {`{1..${stepIdx}}`}).
                    Green edges in the digraph are newly added compared to W<sub>{stepIdx - 1}</sub>!
                  </>
                )}
              </div>
              <div
                className="inline-grid gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                style={{ gridTemplateColumns: `repeat(${warshallBase.length}, minmax(0, 1fr))` }}
              >
                {wSteps[stepIdx].map((row, r) =>
                  row.map((val, c) => {
                    const addedHere =
                      stepIdx > 0 && val === 1 && wSteps[stepIdx - 1][r][c] === 0;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`w-9 h-9 rounded-lg font-mono font-bold text-sm flex items-center justify-center ${
                          addedHere
                            ? 'bg-emerald-500 text-white'
                            : val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {val}
                      </div>
                    );
                  }),
                )}
              </div>

              {stepIdx < wSteps.length - 1 && (
                <div className="pt-2 space-y-2">
                  <div className="text-xs font-semibold">
                    Try predicting W<sub>{stepIdx + 1}</sub> (via vertex {stepIdx + 1}):
                  </div>
                  <div
                    className="inline-grid gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                    style={{ gridTemplateColumns: `repeat(${warshallBase.length}, minmax(0, 1fr))` }}
                  >
                    {userWNext.map((row, r) =>
                      row.map((val, c) => (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => toggleCell(setUserWNext, r, c)}
                          className={`w-8 h-8 rounded font-mono text-xs font-bold cursor-pointer ${
                            val
                              ? 'bg-amber-500 text-white'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {val}
                        </button>
                      )),
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        const target = wSteps[stepIdx + 1];
                        const ok = matricesEqual(userWNext, target);
                        recordPractice('ch9', ok);
                        if (ok) {
                          setStepIdx(stepIdx + 1);
                          setUserWNext(cloneMatrix(target));
                          setWCheckMsg(`✓ Correct W(${stepIdx + 1})!`);
                        } else {
                          setWCheckMsg(
                            `✗ Not quite — check entries where row ${stepIdx + 1} has 1 and column ${stepIdx + 1} has 1.`,
                          );
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Verify W<sub>{stepIdx + 1}</sub>
                    </button>
                    {wCheckMsg && <span className="ml-2 text-xs">{wCheckMsg}</span>}
                  </div>
                </div>
              )}
            </div>

            <div>
              <DigraphSvg
                matrix={wSteps[stepIdx]}
                baseMatrix={stepIdx > 0 ? wSteps[stepIdx - 1] : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'poset' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Divisor Poset Set S:</label>
              <input
                value={posetInput}
                onChange={(e) => setPosetInput(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs w-64"
              />
            </div>
            <div className="flex gap-1.5">
              {[
                { label: 'A3 Q5(b)', val: '3, 5, 9, 15, 24, 45' },
                { label: 'Divisors of 60', val: '1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60' },
                { label: '{1..6} Lattice Test', val: '1, 2, 3, 4, 5, 6' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setPosetInput(p.val);
                    setTopoGuess(p.val);
                    setTopoFeedback(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5 items-center">
            <HasseSvg poset={poset} />
            <div className="space-y-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
              <div>Minimal: {poset.minimal.join(', ')}</div>
              <div>Maximal: {poset.maximal.join(', ')}</div>
              <div>Least: {poset.least ?? 'None'} | Greatest: {poset.greatest ?? 'None'}</div>
              <div>
                Is Lattice?{' '}
                <strong className={poset.isLattice ? 'text-emerald-600' : 'text-rose-500'}>
                  {poset.isLattice
                    ? 'YES'
                    : `NO (pair {${poset.nonLatticePair?.join(', ')}} lacks unique LUB/GLB)`}
                </strong>
              </div>
              {pairBounds && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                  Bounds for {'{'}
                  {poset.elements[0]}, {poset.elements[1]}
                  {'}'}: Upper=[{pairBounds.upperBounds.join(', ')}], LUB={pairBounds.lub ?? 'None'}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold">Topological Sort Checker:</span>
            <input
              value={topoGuess}
              onChange={(e) => setTopoGuess(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs w-64"
            />
            <button
              onClick={() => {
                const order = topoGuess
                  .split(/[,\s]+/)
                  .map((s) => Number(s.trim()))
                  .filter((n) => !Number.isNaN(n));
                const ok = isValidTopologicalSort(poset.elements, order);
                recordPractice('ch9', ok);
                setTopoFeedback(
                  ok
                    ? '✓ Valid topological sort (respects all divisibility edges)!'
                    : '✗ Invalid — either missing/extra elements or a multiple appears before its divisor.',
                );
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold cursor-pointer"
            >
              Verify Order
            </button>
            {topoFeedback && <span className="text-xs">{topoFeedback}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
