import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Copy, FileText, Sparkles, Table2 } from 'lucide-react';
import { PROB_PROBLEM_SETS, type ProbProblemItem } from '../../data/probStat';
import { useApp } from '../../context/AppContext';
import { BiText } from '../../components/BiText';
import { RichMathText } from '../../components/Math';
import { gradeProofWithGemini, type ProofGradeResult } from '../../services/geminiGrader';
import {
  analyzeWrittenProofOffline,
  buildCopyableGradingPrompt,
  type OfflineCheckResult,
} from '../../utils/offlineProofChecker';
import { SbTableModal } from '../../components/probstat/SbTableModal';

export const ProbProblemsPage: React.FC = () => {
  const { settings, progress, markProbProblemDone, recordProbPractice } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'PS 1' | 'PS 2' | 'PS 3' | 'PS 4' | 'PS 5'>('ALL');
  const [expandedId, setExpandedId] = useState<string>(PROB_PROBLEM_SETS[0].id);
  const [sbOpen, setSbOpen] = useState(false);

  const [numInputs, setNumInputs] = useState<Record<string, string>>({});
  const [numResults, setNumResults] = useState<Record<string, boolean>>({});
  const [writtenDrafts, setWrittenDrafts] = useState<Record<string, string>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [showHintIdx, setShowHintIdx] = useState<Record<string, number>>({});
  const [offlineFeedback, setOfflineFeedback] = useState<Record<string, OfflineCheckResult>>({});
  const [aiFeedback, setAiFeedback] = useState<Record<string, ProofGradeResult>>({});
  const [aiError, setAiError] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visible = PROB_PROBLEM_SETS.filter((p) => filter === 'ALL' || p.psRef === filter);

  const checkNumeric = (prob: ProbProblemItem) => {
    let allOk = true;
    const nextRes: Record<string, boolean> = {};
    for (const nc of prob.numericChecks) {
      const key = `${prob.id}:${nc.id}`;
      const val = Number(numInputs[key]);
      const ok = Number.isFinite(val) && Math.abs(val - nc.expected) <= nc.tolerance;
      nextRes[key] = ok;
      if (!ok) allOk = false;
    }
    setNumResults((prev) => ({ ...prev, ...nextRes }));
    recordProbPractice(prob.topic, allOk);
    if (allOk) markProbProblemDone(prob.id);
  };

  const runOfflineCheck = (prob: ProbProblemItem) => {
    const res = analyzeWrittenProofOffline(
      prob.id,
      writtenDrafts[prob.id] ?? '',
      prob.rubric,
    );
    setOfflineFeedback((prev) => ({ ...prev, [prob.id]: res }));
    if (res.estimatedScore >= res.maxScore * 0.75) {
      markProbProblemDone(prob.id);
    }
  };

  const copyPrompt = async (prob: ProbProblemItem) => {
    const text = buildCopyableGradingPrompt({
      subject: 'Probability & Statistical Methods (UEH-ISB)',
      title: prob.title,
      prompt: prob.prompt,
      studentAnswer: writtenDrafts[prob.id] ?? '',
      modelSolution: prob.modelSolution,
      rubric: prob.rubric,
      bilingual: settings.lang === 'bilingual',
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(prob.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const runGeminiGrade = async (prob: ProbProblemItem) => {
    setAiLoading((p) => ({ ...p, [prob.id]: true }));
    setAiError((p) => ({ ...p, [prob.id]: '' }));
    try {
      const res = await gradeProofWithGemini({
        apiKey: settings.geminiKey,
        model: settings.geminiModel,
        subject: 'probstat',
        prompt: prob.prompt,
        studentProof: writtenDrafts[prob.id] ?? '',
        modelSolution: prob.modelSolution,
        rubric: prob.rubric,
        bilingual: settings.lang === 'bilingual',
      });
      setAiFeedback((p) => ({ ...p, [prob.id]: res }));
      recordProbPractice(prob.topic, res.score >= res.maxScore * 0.65);
      if (res.score >= res.maxScore * 0.7) markProbProblemDone(prob.id);
    } catch (err) {
      setAiError((p) => ({ ...p, [prob.id]: err instanceof Error ? err.message : String(err) }));
    } finally {
      setAiLoading((p) => ({ ...p, [prob.id]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            Problem Sets 1–5 Worked Studio
          </h1>
          <BiText
            en="Step-by-step practice from Dr. Hoàng’s Problem Sets 1–5. Verify numeric sub-answers, check written steps offline, or copy prompt to free ChatGPT/Gemini."
            vi="Luyện giải chi tiết từng bước các bài trọng tâm từ Bài tập 1–5. Chấm đáp số tự động và chấm bài tự luận miễn phí không cần API key."
            className="text-sm text-slate-500 mt-0.5"
          />
        </div>
        <button
          onClick={() => setSbOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Table2 className="w-4 h-4" /> Open SB Tables
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {(['ALL', 'PS 1', 'PS 2', 'PS 3', 'PS 4', 'PS 5'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filter === f
                ? 'bg-sky-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {f === 'ALL' ? `All (${PROB_PROBLEM_SETS.length})` : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((prob) => {
          const isOpen = expandedId === prob.id;
          const isDone = progress.completedProbProblems.includes(prob.id);
          const hintShown = showHintIdx[prob.id] ?? 0;
          const off = offlineFeedback[prob.id];
          const ai = aiFeedback[prob.id];

          return (
            <div
              key={prob.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isOpen ? '' : prob.id)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-[11px] font-bold">
                      {prob.psRef}
                    </span>
                  )}
                  <BiText en={prob.title} vi={prob.titleVi} className="font-bold text-sm" />
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </button>

              {isOpen && (
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="font-sans text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl mt-3 leading-relaxed">
                    <RichMathText text={prob.prompt} />
                  </div>

                  {prob.sbHint && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                      <strong>SB Table Tip:</strong> <RichMathText text={prob.sbHint} />
                    </div>
                  )}

                  {/* Quick Numerical Check */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Quick Numerical Verification
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {prob.numericChecks.map((nc) => {
                        const key = `${prob.id}:${nc.id}`;
                        const res = numResults[key];
                        return (
                          <div key={nc.id}>
                            <label className="text-[11px] text-slate-500 block mb-1">
                              <RichMathText text={nc.label} />
                            </label>
                            <input
                              type="text"
                              value={numInputs[key] ?? ''}
                              onChange={(e) => setNumInputs((p) => ({ ...p, [key]: e.target.value }))}
                              placeholder="Enter decimal..."
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white dark:bg-slate-950 ${
                                res === true
                                  ? 'border-emerald-500 ring-1 ring-emerald-500'
                                  : res === false
                                  ? 'border-rose-500 ring-1 ring-rose-500'
                                  : 'border-slate-300 dark:border-slate-700'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => checkNumeric(prob)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Check Answers
                      </button>
                      <button
                        onClick={() =>
                          setShowHintIdx((p) => ({ ...p, [prob.id]: Math.min(prob.hints.length, hintShown + 1) }))
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium cursor-pointer"
                      >
                        Next Hint ({hintShown}/{prob.hints.length})
                      </button>
                      <button
                        onClick={() => setShowSolution((p) => ({ ...p, [prob.id]: !p[prob.id] }))}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium cursor-pointer"
                      >
                        {showSolution[prob.id] ? 'Hide Solution' : 'Reveal Worked Solution'}
                      </button>
                    </div>

                    {hintShown > 0 && (
                      <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc pl-5 space-y-1">
                        {prob.hints.slice(0, hintShown).map((h, i) => (
                          <li key={i}>
                            <RichMathText text={h} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Step-by-Step Written Methodology Box */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      2. Full Written Solution Practice (Required for Final Exam Partial Credit!)
                    </div>
                    <textarea
                      rows={4}
                      value={writtenDrafts[prob.id] ?? ''}
                      onChange={(e) => setWrittenDrafts((p) => ({ ...p, [prob.id]: e.target.value }))}
                      placeholder="Write your step-by-step formulas, standardization, SB critical values, and conclusion..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => runOfflineCheck(prob)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Instant Offline Check
                      </button>
                      <button
                        onClick={() => copyPrompt(prob)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedId === prob.id ? 'Prompt Copied!' : 'Copy Prompt for Free ChatGPT / Gemini'}
                      </button>
                      {settings.geminiKey.trim() && (
                        <button
                          onClick={() => runGeminiGrade(prob)}
                          disabled={aiLoading[prob.id]}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {aiLoading[prob.id] ? 'Grading...' : 'Grade with Gemini'}
                        </button>
                      )}
                    </div>

                    {off && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                        <div className="font-bold">
                          Offline Check: {off.estimatedScore} / {off.maxScore} pts
                        </div>
                        {off.matched.length > 0 && (
                          <div className="text-emerald-700 dark:text-emerald-300">
                            Found: {off.matched.join(' · ')}
                          </div>
                        )}
                        {off.missing.length > 0 && (
                          <div className="text-amber-700 dark:text-amber-300">
                            Missing / check spelling: {off.missing.join(' · ')}
                          </div>
                        )}
                      </div>
                    )}

                    {aiError[prob.id] && (
                      <div className="text-xs text-rose-600">{aiError[prob.id]}</div>
                    )}

                    {ai && (
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
                        <div className="font-bold">
                          AI Grade: {ai.score}/{ai.maxScore} ({ai.verdict})
                        </div>
                        <div>Hint: {ai.improvedHint}</div>
                        {ai.feedbackVi && <div className="text-slate-600 dark:text-slate-300">{ai.feedbackVi}</div>}
                      </div>
                    )}
                  </div>

                  {showSolution[prob.id] && (
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 space-y-2 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-100">Official Worked Solution</div>
                      <div className="font-sans text-slate-700 dark:text-slate-200 leading-relaxed">
                        <RichMathText text={prob.modelSolution} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SbTableModal open={sbOpen} onClose={() => setSbOpen(false)} />
    </div>
  );
};
