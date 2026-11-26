import React, { useState } from 'react';
import { CheckCircle2, ClipboardCheck, Copy, Eye, Sparkles, XCircle } from 'lucide-react';
import { ECON_MCQS, ECON_SCENARIOS } from '../../data/economics';
import { ECON_TOPIC_META, type EconTopicId } from '../../types';
import { useApp } from '../../context/AppContext';
import { BiText } from '../../components/BiText';
import { gradeProofWithGemini, type ProofGradeResult } from '../../services/geminiGrader';
import {
  analyzeWrittenProofOffline,
  buildCopyableGradingPrompt,
  type OfflineCheckResult,
} from '../../utils/offlineProofChecker';

export const EconDrillPage: React.FC = () => {
  const { settings, progress, recordEconPractice, markEconScenarioDone } = useApp();
  const [mode, setMode] = useState<'mcq' | 'policy'>('mcq');
  const [partFilter, setPartFilter] = useState<'all' | EconTopicId>('all');
  const [picked, setPicked] = useState<Record<string, number>>({});

  // Policy essay state
  const [scenId, setScenId] = useState(ECON_SCENARIOS[0].id);
  const [answerText, setAnswerText] = useState('');
  const [showModel, setShowModel] = useState(false);
  const [rubricChecks, setRubricChecks] = useState<Record<number, boolean>>({});
  const [offlineCheck, setOfflineCheck] = useState<OfflineCheckResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<ProofGradeResult | null>(null);

  const mcqs = ECON_MCQS.filter((m) => partFilter === 'all' || m.topic === partFilter);
  const curScen = ECON_SCENARIOS.find((s) => s.id === scenId) ?? ECON_SCENARIOS[0];

  const selectScenario = (id: string) => {
    setScenId(id);
    setAnswerText('');
    setShowModel(false);
    setRubricChecks({});
    setOfflineCheck(null);
    setAiError(null);
    setAiResult(null);
    setCopied(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Macroeconomics Testbank &amp; Policy Essay Trainer
          </h1>
          <BiText
            en="Practice ISB handbook MCQs across all 12 Macro Final chapters plus all 8 Short-Answer Policy Dilemma essays."
            vi="Luyện trắc nghiệm đủ 12 chương Vĩ mô cuối kỳ và 8 bài tự luận phân tích chính sách có chấm điểm không cần API key."
            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('mcq')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              mode === 'mcq' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            MCQ Bank ({ECON_MCQS.length})
          </button>
          <button
            onClick={() => setMode('policy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              mode === 'policy' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Short-Answer Essays ({ECON_SCENARIOS.length})
          </button>
        </div>
      </div>

      {mode === 'mcq' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setPartFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                partFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              All Parts ({ECON_MCQS.length})
            </button>
            {(['part6', 'part7', 'part8', 'part9'] as EconTopicId[]).map((tid) => (
              <button
                key={tid}
                onClick={() => setPartFilter(tid)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  partFilter === tid ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {ECON_TOPIC_META[tid].code}
              </button>
            ))}
          </div>

          {mcqs.map((m, qIdx) => {
            const userChoice = picked[m.id];
            const answered = userChoice !== undefined;
            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  #{qIdx + 1} · {ECON_TOPIC_META[m.topic].code} ({m.chapter})
                </div>
                <BiText en={m.question} vi={m.questionVi} className="text-sm font-semibold" />

                <div className="grid sm:grid-cols-2 gap-2">
                  {m.choices.map((c, idx) => {
                    const isCorrect = idx === m.correctIndex;
                    const isPicked = userChoice === idx;
                    let cls = 'border-slate-200 dark:border-slate-700 hover:border-emerald-400';
                    if (answered) {
                      if (isCorrect) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                      else if (isPicked) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!answered) {
                            setPicked((prev) => ({ ...prev, [m.id]: idx }));
                            recordEconPractice(m.topic, idx === m.correctIndex);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between gap-2 cursor-pointer ${cls}`}
                      >
                        <span>
                          <strong>{String.fromCharCode(65 + idx)}.</strong> {c}
                        </span>
                        {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {answered && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {answered && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <BiText en={m.explanation} vi={m.explanationVi} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {mode === 'policy' && (
        <div className="grid lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {ECON_SCENARIOS.map((s) => {
              const done = progress.completedEconScenarios.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => selectScenario(s.id)}
                  className={`w-full text-left p-3 rounded-xl border cursor-pointer ${
                    s.id === curScen.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{s.chapterLabel}</span>
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="font-semibold text-sm mt-0.5">{s.title}</div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold">{curScen.title}</h2>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm">
              <BiText en={curScen.prompt} vi={curScen.promptVi} />
            </div>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              placeholder="Write your step-by-step macroeconomic analysis (curves shifted, equilibrium changes, and policy trade-offs)..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const res = analyzeWrittenProofOffline(curScen.id, answerText, curScen.rubric);
                  setOfflineCheck(res);
                  if (res.estimatedScore >= res.maxScore * 0.75) {
                    markEconScenarioDone(curScen.id);
                    recordEconPractice(curScen.topic, true);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-3.5 h-3.5" /> Instant Offline Check (No Key)
              </button>
              <button
                onClick={async () => {
                  const txt = buildCopyableGradingPrompt({
                    subject: 'Principles of Macroeconomics (ECO101)',
                    title: curScen.title,
                    prompt: curScen.prompt,
                    studentAnswer: answerText,
                    modelSolution: curScen.modelSolution,
                    rubric: curScen.rubric,
                    bilingual: settings.lang === 'bilingual',
                  });
                  await navigator.clipboard.writeText(txt);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="px-3.5 py-2 rounded-xl border border-emerald-400 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied! Paste in ChatGPT / Gemini' : 'Copy Prompt for Free ChatGPT / Gemini'}
              </button>
              <button
                onClick={() => setShowModel((s) => !s)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> {showModel ? 'Hide' : 'Show'} Model Answer
              </button>
              <button
                onClick={async () => {
                  setAiLoading(true);
                  setAiError(null);
                  try {
                    const res = await gradeProofWithGemini({
                      apiKey: settings.geminiKey,
                      model: settings.geminiModel,
                      prompt: curScen.prompt,
                      studentProof: answerText,
                      modelSolution: curScen.modelSolution,
                      rubric: curScen.rubric,
                      bilingual: settings.lang === 'bilingual',
                    });
                    setAiResult(res);
                    if (res.score >= res.maxScore * 0.75) {
                      markEconScenarioDone(curScen.id);
                      recordEconPractice(curScen.topic, true);
                    }
                  } catch (e) {
                    setAiError(e instanceof Error ? e.message : 'Grading failed');
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? 'Grading...' : 'AI Grade (API Key)'}
              </button>
            </div>

            {offlineCheck && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs space-y-1">
                <div className="font-bold">
                  Offline Structural Est: {offlineCheck.estimatedScore} / {offlineCheck.maxScore}
                </div>
                {offlineCheck.matched.length > 0 && (
                  <div className="text-emerald-700 dark:text-emerald-300">
                    <strong>Detected:</strong> {offlineCheck.matched.join(' · ')}
                  </div>
                )}
                {offlineCheck.missing.length > 0 && (
                  <div className="text-amber-700 dark:text-amber-300">
                    <strong>Check / Add:</strong> {offlineCheck.missing.join(' · ')}
                  </div>
                )}
              </div>
            )}

            {aiError && <div className="text-xs text-rose-500">{aiError}</div>}
            {aiResult && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-xs space-y-1">
                <div className="font-bold">
                  AI Verdict: {aiResult.verdict} ({aiResult.score}/{aiResult.maxScore})
                </div>
                <div>{aiResult.improvedHint}</div>
                {aiResult.feedbackVi && <div>{aiResult.feedbackVi}</div>}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
              <div className="font-bold">Self-Check Rubric</div>
              {curScen.rubric.map((r, i) => (
                <label key={i} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(rubricChecks[i])}
                    onChange={(e) => {
                      const next = { ...rubricChecks, [i]: e.target.checked };
                      setRubricChecks(next);
                      const sum = curScen.rubric.reduce((s, item, idx) => s + (next[idx] ? item.points : 0), 0);
                      const tot = curScen.rubric.reduce((s, item) => s + item.points, 0);
                      if (sum >= tot * 0.75) markEconScenarioDone(curScen.id);
                    }}
                  />
                  <span>[{r.points} pt] {r.label}</span>
                </label>
              ))}
            </div>

            {showModel && (
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2 text-xs">
                <div className="font-bold uppercase text-emerald-700 dark:text-emerald-300">Model Answer</div>
                <pre className="whitespace-pre-wrap font-sans leading-relaxed">{curScen.modelSolution}</pre>
                {settings.lang === 'bilingual' && (
                  <div className="pt-1 border-t border-emerald-200 dark:border-emerald-800 text-slate-600 dark:text-slate-300">
                    <strong>Tóm tắt (VI):</strong> {curScen.modelSolutionVi}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
