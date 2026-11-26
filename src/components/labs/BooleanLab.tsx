import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  buildSumOfProducts,
  dualBooleanExpr,
  findOptimalSop3,
  generateKmapProblem,
  KMAP3_GRID,
  THREE_VAR_ROWS,
  validateKmap3Group,
  verifyBooleanSimplification,
} from '../../math/booleanAlgebra';
import { randomSeedCode } from '../../math/prng';
import { useApp } from '../../context/AppContext';

export const BooleanLab: React.FC = () => {
  const { recordPractice } = useApp();
  const [truthVec, setTruthVec] = useState<Record<number, 0 | 1>>({
    0: 0,
    1: 0,
    2: 1,
    3: 0,
    4: 1,
    5: 0,
    6: 1,
    7: 0,
  });

  // K-Map interactive grouping
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [savedGroups, setSavedGroups] = useState<Array<{ cells: number[]; term: string }>>([]);
  const [groupFeedback, setGroupFeedback] = useState<string | null>(null);
  const [userSop, setUserSop] = useState('');
  const [sopFeedback, setSopFeedback] = useState<string | null>(null);

  // Duality quick drill
  const [dualInput, setDualInput] = useState("x·(y + z') + 0");

  const fullSop = useMemo(
    () => buildSumOfProducts(THREE_VAR_ROWS.map((r) => truthVec[r.index])),
    [truthVec],
  );
  const optimalSop = useMemo(() => findOptimalSop3(truthVec), [truthVec]);

  const toggleCell = (idx: number) => {
    setSelectedCells((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx],
    );
  };

  const addGroup = () => {
    const res = validateKmap3Group(selectedCells, truthVec);
    setGroupFeedback(res.reason);
    if (res.valid) {
      setSavedGroups((prev) => [...prev, { cells: [...selectedCells], term: res.term }]);
      setSelectedCells([]);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm">
              Chapter 12: Truth Table, Sum-of-Products &amp; 3-Variable Karnaugh Map
            </h3>
            <p className="text-xs text-slate-500">
              Click truth-table F(x,y,z) bits to customize, or generate a random problem and simplify using the Gray-code K-Map.
            </p>
          </div>
          <button
            onClick={() => {
              const prob = generateKmapProblem(randomSeedCode());
              setTruthVec(prob.truthVector);
              setSelectedCells([]);
              setSavedGroups([]);
              setGroupFeedback(null);
              setUserSop('');
              setSopFeedback(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New K-Map Problem
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Truth table */}
          <div>
            <div className="text-xs font-bold mb-2 text-slate-500">
              Truth Table (Click F column to toggle 0/1)
            </div>
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="p-1.5">x</th>
                  <th className="p-1.5">y</th>
                  <th className="p-1.5">z</th>
                  <th className="p-1.5">Minterm</th>
                  <th className="p-1.5">F</th>
                </tr>
              </thead>
              <tbody>
                {THREE_VAR_ROWS.map((r) => (
                  <tr key={r.index} className="border-b border-slate-100 dark:border-slate-800 text-center">
                    <td className="p-1.5">{r.x}</td>
                    <td className="p-1.5">{r.y}</td>
                    <td className="p-1.5">{r.z}</td>
                    <td className="p-1.5 text-slate-500">{r.minterm}</td>
                    <td className="p-1.5">
                      <button
                        onClick={() => {
                          setTruthVec((prev) => ({
                            ...prev,
                            [r.index]: prev[r.index] ? 0 : 1,
                          }));
                          setSavedGroups([]);
                          setSelectedCells([]);
                          setSopFeedback(null);
                        }}
                        className={`w-8 py-0.5 rounded font-bold cursor-pointer ${
                          truthVec[r.index]
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {truthVec[r.index]}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs font-mono">
              Canonical SOP (DNF): <strong>{fullSop}</strong>
            </div>
          </div>

          {/* K-Map Grid */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500">
              3-Variable K-Map (Gray Code Columns yz: 11, 10, 00, 01)
            </div>
            <div className="overflow-x-auto">
              <table className="border-collapse font-mono text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-slate-400">x \ yz</th>
                    <th className="p-2">11 (yz)</th>
                    <th className="p-2">10 (yz&apos;)</th>
                    <th className="p-2">00 (y&apos;z&apos;)</th>
                    <th className="p-2">01 (y&apos;z)</th>
                  </tr>
                </thead>
                <tbody>
                  {KMAP3_GRID.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="p-2 font-bold text-center">{rIdx === 0 ? '1 (x)' : "0 (x')"}</td>
                      {row.map((cell) => {
                        const val = truthVec[cell.idx];
                        const isPicked = selectedCells.includes(cell.idx);
                        const inSaved = savedGroups.some((g) => g.cells.includes(cell.idx));
                        return (
                          <td key={cell.idx} className="p-1">
                            <button
                              onClick={() => toggleCell(cell.idx)}
                              className={`w-14 h-12 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isPicked
                                  ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/50 ring-2 ring-amber-400'
                                  : inSaved
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                                    : val === 1
                                      ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/40'
                                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                              }`}
                            >
                              <span className="text-sm font-bold">{val}</span>
                              <span className="text-[10px] opacity-60">m{cell.idx}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={addGroup}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold cursor-pointer"
              >
                Group Selected Cells
              </button>
              <button
                onClick={() => {
                  setSelectedCells([]);
                  setSavedGroups([]);
                  setGroupFeedback(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs cursor-pointer"
              >
                Clear Groups
              </button>
            </div>
            {groupFeedback && <div className="text-xs">{groupFeedback}</div>}
            {savedGroups.length > 0 && (
              <div className="text-xs font-mono p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                Your K-Map Sum: <strong>{savedGroups.map((g) => g.term).join(' + ')}</strong>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-xs font-semibold block">
                Enter Final Simplified SOP (use x, y, z, &apos;, +):
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  value={userSop}
                  onChange={(e) => setUserSop(e.target.value)}
                  placeholder="e.g. xz' + yz'"
                  className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
                />
                <button
                  onClick={() => {
                    const res = verifyBooleanSimplification(userSop, truthVec);
                    if (!res.equivalent) {
                      setSopFeedback(`✗ ${res.error}`);
                      recordPractice('ch12', false);
                    } else {
                      const isMin = res.literalCount <= res.optimalLiteralCount;
                      recordPractice('ch12', true);
                      setSopFeedback(
                        isMin
                          ? `✓ Equivalent AND Minimal (${res.literalCount} literals)! Optimal: ${optimalSop}`
                          : `✓ Equivalent (${res.literalCount} literals), though you can simplify further to ${res.optimalLiteralCount} literals (${optimalSop}).`,
                      );
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Verify Expression
                </button>
              </div>
              {sopFeedback && <div className="text-xs">{sopFeedback}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
        <h3 className="font-bold text-sm">Principle of Duality Helper</h3>
        <div className="flex flex-wrap gap-3 items-center text-xs">
          <input
            value={dualInput}
            onChange={(e) => setDualInput(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono w-64"
          />
          <span className="font-mono">
            Dual: <strong className="text-violet-600 dark:text-violet-400">{dualBooleanExpr(dualInput)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
