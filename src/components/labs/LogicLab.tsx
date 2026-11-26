import React, { useMemo, useState } from 'react';
import { CheckCircle2, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import {
  areEquivalent,
  generateRandomLogicFormula,
  generateTruthTable,
  LOGIC_TRUTH_TABLE_PRESETS,
  TRANSLATION_DRILLS,
} from '../../math/logic';
import { randomSeedCode } from '../../math/prng';
import { useApp } from '../../context/AppContext';
import { BiText } from '../BiText';

export const LogicLab: React.FC = () => {
  const { recordPractice } = useApp();
  const [subTab, setSubTab] = useState<'truth-table' | 'translation'>('truth-table');

  // Truth table state
  const [expr, setExpr] = useState('¬p → (p → q)');
  const [compareExpr, setCompareExpr] = useState('');
  const [userOutputs, setUserOutputs] = useState<Record<number, boolean | null>>({});
  const [userCompareOutputs, setUserCompareOutputs] = useState<Record<number, boolean | null>>({});
  const [userClass, setUserClass] = useState<string>('');
  const [tableChecked, setTableChecked] = useState(false);

  // Translation quiz state
  const [drillIdx, setDrillIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const tableData = useMemo(() => {
    try {
      if (compareExpr.trim()) {
        const eq = areEquivalent(expr, compareExpr);
        return { mode: 'compare' as const, eq, error: null };
      }
      const tt = generateTruthTable(expr);
      return { mode: 'single' as const, tt, error: null };
    } catch (e) {
      return { mode: 'error' as const, error: e instanceof Error ? e.message : 'Invalid formula' };
    }
  }, [expr, compareExpr]);

  const resetInputs = () => {
    setUserOutputs({});
    setUserCompareOutputs({});
    setUserClass('');
    setTableChecked(false);
  };

  const loadPreset = (idx: number) => {
    const p = LOGIC_TRUTH_TABLE_PRESETS[idx];
    setExpr(p.expr);
    setCompareExpr(p.compareExpr ?? '');
    resetInputs();
  };

  const loadRandom = () => {
    const gen = generateRandomLogicFormula(randomSeedCode());
    setExpr(gen.expr);
    setCompareExpr(gen.compareExpr ?? '');
    resetInputs();
  };

  const insertSymbol = (sym: string) => {
    setExpr((prev) => prev + sym);
    resetInputs();
  };

  const checkTruthTable = () => {
    setTableChecked(true);
    if (tableData.mode === 'single') {
      const allRowsOk = tableData.tt.rows.every((r, i) => userOutputs[i] === r.value);
      const classOk = userClass === tableData.tt.classification;
      recordPractice('ch1', allRowsOk && classOk);
    } else if (tableData.mode === 'compare') {
      const allOk = tableData.eq.rows.every(
        (r, i) => userOutputs[i] === r.left && userCompareOutputs[i] === r.right,
      );
      const eqOk = userClass === (tableData.eq.equivalent ? 'equivalent' : 'not-equivalent');
      recordPractice('ch1', allOk && eqOk);
    }
  };

  const currentDrill = TRANSLATION_DRILLS[drillIdx];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSubTab('truth-table')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
            subTab === 'truth-table'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          Truth Table &amp; Equivalence Trainer
        </button>
        <button
          onClick={() => setSubTab('translation')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
            subTab === 'translation'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          English ↔ Logic &amp; Quantifiers
        </button>
      </div>

      {subTab === 'truth-table' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <BiText
              en="Fill every row of the truth table (T/F) just like on the exam, then classify or verify equivalence."
              vi="Điền từng ô chân trị T/F như làm bài thi tự luận, sau đó phân loại hằng đúng hoặc kiểm tra tương đương."
              className="text-sm font-medium"
            />
            <button
              onClick={loadRandom}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Random
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {LOGIC_TRUTH_TABLE_PRESETS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => loadPreset(i)}
                className="px-2.5 py-1 rounded-md text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Formula 1 (use p, q, r, ¬, ∧, ∨, →, ↔)
              </label>
              <input
                value={expr}
                onChange={(e) => {
                  setExpr(e.target.value);
                  resetInputs();
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">
                Formula 2 (optional — fill to test equivalence ≡)
              </label>
              <input
                value={compareExpr}
                onChange={(e) => {
                  setCompareExpr(e.target.value);
                  resetInputs();
                }}
                placeholder="Leave blank for single formula"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['¬', '∧', '∨', '→', '↔', '⊕', '(', ')'].map((sym) => (
              <button
                key={sym}
                onClick={() => insertSymbol(sym)}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 font-mono text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </div>

          {tableData.mode === 'error' && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm">
              {tableData.error}
            </div>
          )}

          {tableData.mode !== 'error' && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                      {(tableData.mode === 'single' ? tableData.tt.vars : tableData.eq.vars).map((v) => (
                        <th key={v} className="px-3 py-2 font-mono font-bold text-center">
                          {v}
                        </th>
                      ))}
                      <th className="px-3 py-2 font-mono font-bold text-center text-indigo-600 dark:text-indigo-400">
                        {expr}
                      </th>
                      {tableData.mode === 'compare' && (
                        <th className="px-3 py-2 font-mono font-bold text-center text-emerald-600 dark:text-emerald-400">
                          {compareExpr}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(tableData.mode === 'single' ? tableData.tt.rows : tableData.eq.rows).map(
                      (row, idx) => {
                        const vars =
                          tableData.mode === 'single' ? tableData.tt.vars : tableData.eq.vars;
                        const expectedLeft =
                          tableData.mode === 'single'
                            ? (row as { value: boolean }).value
                            : (row as { left: boolean }).left;
                        const expectedRight =
                          tableData.mode === 'compare'
                            ? (row as { right: boolean }).right
                            : false;

                        const uLeft = userOutputs[idx];
                        const uRight = userCompareOutputs[idx];
                        const leftCorrect = tableChecked && uLeft === expectedLeft;
                        const leftWrong = tableChecked && uLeft !== expectedLeft;
                        const rightCorrect = tableChecked && uRight === expectedRight;
                        const rightWrong = tableChecked && uRight !== expectedRight;

                        return (
                          <tr
                            key={idx}
                            className="border-b border-slate-100 dark:border-slate-800"
                          >
                            {vars.map((v) => (
                              <td key={v} className="px-3 py-2 font-mono text-center">
                                {row.env[v] ? 'T' : 'F'}
                              </td>
                            ))}
                            <td className="px-3 py-1.5 text-center">
                              <button
                                onClick={() =>
                                  setUserOutputs((prev) => ({
                                    ...prev,
                                    [idx]: prev[idx] === true ? false : true,
                                  }))
                                }
                                className={`w-14 py-1 rounded font-mono font-bold text-xs border cursor-pointer ${
                                  leftCorrect
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                    : leftWrong
                                      ? 'bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                                      : uLeft === undefined || uLeft === null
                                        ? 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                                        : 'bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200'
                                }`}
                              >
                                {uLeft === undefined || uLeft === null ? '?' : uLeft ? 'T' : 'F'}
                              </button>
                              {leftWrong && (
                                <span className="ml-1.5 text-xs text-rose-500 font-mono">
                                  ({expectedLeft ? 'T' : 'F'})
                                </span>
                              )}
                            </td>

                            {tableData.mode === 'compare' && (
                              <td className="px-3 py-1.5 text-center">
                                <button
                                  onClick={() =>
                                    setUserCompareOutputs((prev) => ({
                                      ...prev,
                                      [idx]: prev[idx] === true ? false : true,
                                    }))
                                  }
                                  className={`w-14 py-1 rounded font-mono font-bold text-xs border cursor-pointer ${
                                    rightCorrect
                                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                                      : rightWrong
                                        ? 'bg-rose-100 border-rose-500 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                                        : uRight === undefined || uRight === null
                                          ? 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-600'
                                          : 'bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200'
                                  }`}
                                >
                                  {uRight === undefined || uRight === null ? '?' : uRight ? 'T' : 'F'}
                                </button>
                                {rightWrong && (
                                  <span className="ml-1.5 text-xs text-rose-500 font-mono">
                                    ({expectedRight ? 'T' : 'F'})
                                  </span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Conclusion:</span>
                  {(tableData.mode === 'single'
                    ? [
                        { id: 'tautology', label: 'Tautology (Always T)' },
                        { id: 'contradiction', label: 'Contradiction (Always F)' },
                        { id: 'contingency', label: 'Contingency' },
                      ]
                    : [
                        { id: 'equivalent', label: 'Logically Equivalent (≡)' },
                        { id: 'not-equivalent', label: 'Not Equivalent' },
                      ]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setUserClass(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                        userClass === opt.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const rows =
                        tableData.mode === 'single' ? tableData.tt.rows : tableData.eq.rows;
                      const filledA: Record<number, boolean> = {};
                      const filledB: Record<number, boolean> = {};
                      rows.forEach((r, i) => {
                        if (tableData.mode === 'single') {
                          filledA[i] = (r as { value: boolean }).value;
                        } else {
                          filledA[i] = (r as { left: boolean }).left;
                          filledB[i] = (r as { right: boolean }).right;
                        }
                      });
                      setUserOutputs(filledA);
                      setUserCompareOutputs(filledB);
                      setUserClass(
                        tableData.mode === 'single'
                          ? tableData.tt.classification
                          : tableData.eq.equivalent
                            ? 'equivalent'
                            : 'not-equivalent',
                      );
                      setTableChecked(true);
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Reveal Solution
                  </button>
                  <button
                    onClick={checkTruthTable}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Check Table
                  </button>
                </div>
              </div>

              {tableChecked && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs">
                  {tableData.mode === 'single' ? (
                    <span>
                      Classification:{' '}
                      <strong className="uppercase text-indigo-600 dark:text-indigo-400">
                        {tableData.tt.classification}
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Result:{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {tableData.eq.equivalent ? 'Logically Equivalent (≡)' : 'Not Equivalent'}
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {subTab === 'translation' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Drill {drillIdx + 1} / {TRANSLATION_DRILLS.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDrillIdx((i) => (i - 1 + TRANSLATION_DRILLS.length) % TRANSLATION_DRILLS.length);
                  setSelectedChoice(null);
                }}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
              >
                Prev
              </button>
              <button
                onClick={() => {
                  setDrillIdx((i) => (i + 1) % TRANSLATION_DRILLS.length);
                  setSelectedChoice(null);
                }}
                className="px-2.5 py-1 rounded bg-indigo-600 text-white text-xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
            <BiText en={currentDrill.english} vi={currentDrill.vietnamese} className="font-medium" />
            <div className="text-xs font-mono text-slate-500">{currentDrill.legend}</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {currentDrill.choices.map((c) => {
              const isPicked = selectedChoice === c;
              const isCorrect = c === currentDrill.expectedExpr;
              let cls = 'border-slate-200 dark:border-slate-700 hover:border-indigo-400';
              if (selectedChoice) {
                if (isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                else if (isPicked) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
              }
              return (
                <button
                  key={c}
                  onClick={() => {
                    if (!selectedChoice) {
                      setSelectedChoice(c);
                      recordPractice('ch1', c === currentDrill.expectedExpr);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left font-mono text-sm flex items-center justify-between cursor-pointer ${cls}`}
                >
                  <span>{c}</span>
                  {selectedChoice && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {selectedChoice && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                </button>
              );
            })}
          </div>

          {selectedChoice && (
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-sm">
              <BiText en={currentDrill.explanation} vi={currentDrill.explanationVi} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
