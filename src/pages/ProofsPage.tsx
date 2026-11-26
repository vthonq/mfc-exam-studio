import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, ClipboardCheck, Copy, Eye, Sparkles } from 'lucide-react';
import { PROOF_EXERCISES, type ParsonsStep, type ProofExercise } from '../data/proofs';
import { createRng } from '../math/prng';
import { useApp } from '../context/AppContext';
import { CHAPTER_META, type ChapterId } from '../types';
import { BiText } from '../components/BiText';
import { gradeProofWithGemini, type ProofGradeResult } from '../services/geminiGrader';
import {
  analyzeWrittenProofOffline,
  buildCopyableGradingPrompt,
  type OfflineCheckResult,
} from '../utils/offlineProofChecker';

interface ProofsPageProps {
  initialProofId?: string;
}

const SYMBOLS = ['∀', '∃', '¬', '∧', '∨', '→', '↔', '≡', '∈', '∉', '⊆', '∣', '∤', 'ℤ', 'ℕ', '⇒', '∴'];

export const ProofsPage: React.FC<ProofsPageProps> = ({ initialProofId }) => {
  const { settings, progress, recordPractice, markProofDone } = useApp();
  const [chapterFilter, setChapterFilter] = useState<'all' | ChapterId>('all');
  const [selectedId, setSelectedId] = useState<string>(
    initialProofId && PROOF_EXERCISES.some((p) => p.id === initialProofId)
      ? initialProofId
      : PROOF_EXERCISES[0].id,
  );
  const [mode, setMode] = useState<'parsons' | 'written'>('parsons');

  const proof: ProofExercise = useMemo(
    () => PROOF_EXERCISES.find((p) => p.id === selectedId) ?? PROOF_EXERCISES[0],
    [selectedId],
  );

  // Parsons builder state
  const [order, setOrder] = useState<ParsonsStep[]>(() =>
    createRng(proof.id).shuffle(proof.parsonsSteps),
  );
  const [ruleChoices, setRuleChoices] = useState<Record<string, string>>({});
  const [parsonsChecked, setParsonsChecked] = useState(false);

  // Written proof state
  const [writtenText, setWrittenText] = useState('');
  const [checkedRubric, setCheckedRubric] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<ProofGradeResult | null>(null);
  const [offlineResult, setOfflineResult] = useState<OfflineCheckResult | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  const selectProof = (next: ProofExercise) => {
    setSelectedId(next.id);
    setOrder(createRng(next.id + Date.now()).shuffle(next.parsonsSteps));
    setRuleChoices({});
    setParsonsChecked(false);
    setWrittenText('');
    setCheckedRubric({});
    setShowSolution(false);
    setAiError(null);
    setAiResult(null);
    setOfflineResult(null);
    setPromptCopied(false);
  };

  const filtered = PROOF_EXERCISES.filter(
    (p) => chapterFilter === 'all' || p.chapter === chapterFilter,
  );

  const moveStep = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= order.length) return;
    const copy = [...order];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setOrder(copy);
    setParsonsChecked(false);
  };

  const checkParsons = () => {
    setParsonsChecked(true);
    const orderOk = order.every((s, idx) => s.id === proof.parsonsSteps[idx].id);
    const rulesOk = order.every((s) => ruleChoices[s.id] === s.rule);
    const allOk = orderOk && rulesOk;
    recordPractice(proof.chapter, allOk);
    if (allOk) markProofDone(proof.id);
  };

  const handleGeminiGrade = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await gradeProofWithGemini({
        apiKey: settings.geminiKey,
        model: settings.geminiModel,
        prompt: proof.prompt,
        studentProof: writtenText,
        modelSolution: proof.modelSolution,
        rubric: proof.rubric,
        bilingual: settings.lang === 'bilingual',
      });
      setAiResult(res);
      const passed = res.score >= res.maxScore * 0.75;
      recordPractice(proof.chapter, passed);
      if (passed) markProofDone(proof.id);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Grading failed');
    } finally {
      setAiLoading(false);
    }
  };

  const rubricTotal = proof.rubric.reduce((s, r) => s + r.points, 0);
  const rubricEarned = proof.rubric.reduce(
    (s, r, idx) => s + (checkedRubric[idx] ? r.points : 0),
    0,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Proof &amp; Inference Trainer</h1>
        <BiText
          en="Master step ordering, exact rule/theorem citations, and full exam-grade written proofs."
          vi="Luyện sắp xếp bước chứng minh, chọn tên quy tắc/định lý chuẩn và tự viết bài chứng minh hoàn chỉnh."
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setChapterFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
            chapterFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          All ({PROOF_EXERCISES.length})
        </button>
        {(Object.keys(CHAPTER_META) as ChapterId[]).map((cid) => (
          <button
            key={cid}
            onClick={() => setChapterFilter(cid)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              chapterFilter === cid ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {CHAPTER_META[cid].code}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* Left list */}
        <div className="lg:col-span-4 space-y-2 max-h-[540px] overflow-y-auto pr-1">
          {filtered.map((p) => {
            const active = p.id === proof.id;
            const done = progress.completedProofs.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => selectProof(p)}
                className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>
                    {CHAPTER_META[p.chapter].code} · {p.method}
                  </span>
                  {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <div className="font-semibold text-sm mt-0.5">{p.title}</div>
              </button>
            );
          })}
        </div>

        {/* Right workspace */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {proof.method} · {proof.difficulty}
              </span>
              <h2 className="text-lg font-bold mt-1">{proof.title}</h2>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setMode('parsons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mode === 'parsons' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Guided Builder
              </button>
              <button
                onClick={() => setMode('written')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mode === 'written' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Written Proof + Rubric
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm">
            <BiText en={proof.prompt} vi={proof.promptVi} />
          </div>

          {mode === 'parsons' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                1) Reorder the steps from top to bottom. 2) Select the exact Rule / Theorem justifying each step.
              </div>
              {order.map((step, idx) => {
                const options = createRng(proof.id + step.id).shuffle([
                  step.rule,
                  ...step.distractorRules,
                ]);
                const posOk = parsonsChecked && step.id === proof.parsonsSteps[idx].id;
                const ruleOk = parsonsChecked && ruleChoices[step.id] === step.rule;
                return (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border space-y-2 ${
                      parsonsChecked
                        ? posOk && ruleOk
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-medium">{step.statement}</div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => moveStep(idx, -1)}
                          className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveStep(idx, 1)}
                          className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500">Justification:</span>
                      <select
                        value={ruleChoices[step.id] ?? ''}
                        onChange={(e) => {
                          setRuleChoices((prev) => ({ ...prev, [step.id]: e.target.value }));
                          setParsonsChecked(false);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                      >
                        <option value="">-- Choose rule / theorem --</option>
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {parsonsChecked && !ruleOk && (
                        <span className="text-xs text-rose-500">Expected: {step.rule}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={checkParsons}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Check Order &amp; Rules
                </button>
                <button
                  onClick={() => setShowSolution((s) => !s)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> {showSolution ? 'Hide' : 'Show'} Model Proof
                </button>
              </div>
            </div>
          )}

          {mode === 'written' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {SYMBOLS.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setWrittenText((t) => t + sym)}
                    className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <textarea
                value={writtenText}
                onChange={(e) => setWrittenText(e.target.value)}
                rows={7}
                placeholder="Write your full step-by-step proof here (state hypotheses, justify every deduction, and conclude cleanly)..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-mono"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const res = analyzeWrittenProofOffline(proof.id, writtenText, proof.rubric);
                    setOfflineResult(res);
                    if (res.estimatedScore >= res.maxScore * 0.75) {
                      markProofDone(proof.id);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" /> Instant Offline Check (No Key)
                </button>
                <button
                  onClick={async () => {
                    const text = buildCopyableGradingPrompt({
                      subject: 'Mathematics for Computing',
                      title: proof.title,
                      prompt: proof.prompt,
                      studentAnswer: writtenText,
                      modelSolution: proof.modelSolution,
                      rubric: proof.rubric,
                      bilingual: settings.lang === 'bilingual',
                    });
                    await navigator.clipboard.writeText(text);
                    setPromptCopied(true);
                    setTimeout(() => setPromptCopied(false), 2500);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {promptCopied ? 'Copied! Paste in ChatGPT / Gemini' : 'Copy Prompt for Free ChatGPT / Gemini'}
                </button>
                <button
                  onClick={() => setShowSolution((s) => !s)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> {showSolution ? 'Hide' : 'Reveal'} Model Solution &amp; Rubric
                </button>
                <button
                  onClick={handleGeminiGrade}
                  disabled={aiLoading}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiLoading ? 'Grading with Gemini...' : 'Grade with Gemini AI (API Key)'}
                </button>
              </div>

              {offlineResult && (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>Offline Structural Check</span>
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Est. {offlineResult.estimatedScore} / {offlineResult.maxScore} pts
                    </span>
                  </div>
                  {offlineResult.matched.length > 0 && (
                    <div className="text-emerald-700 dark:text-emerald-300">
                      <strong>Detected:</strong> {offlineResult.matched.join(' · ')}
                    </div>
                  )}
                  {offlineResult.missing.length > 0 && (
                    <div className="text-amber-700 dark:text-amber-300">
                      <strong>Check / Add:</strong> {offlineResult.missing.join(' · ')}
                    </div>
                  )}
                </div>
              )}

              {aiError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                  {aiError}
                </div>
              )}

              {aiResult && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>AI Verdict: {aiResult.verdict}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {aiResult.score} / {aiResult.maxScore} pts
                    </span>
                  </div>
                  {aiResult.strengths.length > 0 && (
                    <div>
                      <strong>Strengths:</strong> {aiResult.strengths.join('; ')}
                    </div>
                  )}
                  {aiResult.issues.length > 0 && (
                    <div className="text-rose-600 dark:text-rose-400">
                      <strong>Issues:</strong> {aiResult.issues.join('; ')}
                    </div>
                  )}
                  {aiResult.missingJustifications.length > 0 && (
                    <div>
                      <strong>Missing Justifications:</strong>{' '}
                      {aiResult.missingJustifications.join('; ')}
                    </div>
                  )}
                  <div>
                    <strong>Hint:</strong> {aiResult.improvedHint}
                  </div>
                  {aiResult.feedbackVi && (
                    <div className="text-slate-600 dark:text-slate-300 pt-1 border-t border-indigo-200 dark:border-indigo-800">
                      <strong>Nhận xét (VI):</strong> {aiResult.feedbackVi}
                    </div>
                  )}
                </div>
              )}

              {/* Offline Self-Check Rubric */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Offline Teacher Rubric Self-Check</span>
                  <span>
                    {rubricEarned} / {rubricTotal} pts
                  </span>
                </div>
                {proof.rubric.map((r, i) => (
                  <label key={i} className="flex items-start gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(checkedRubric[i])}
                      onChange={(e) => {
                        const next = { ...checkedRubric, [i]: e.target.checked };
                        setCheckedRubric(next);
                        const earned = proof.rubric.reduce(
                          (s, item, idx) => s + (next[idx] ? item.points : 0),
                          0,
                        );
                        if (earned >= rubricTotal * 0.75) {
                          markProofDone(proof.id);
                        }
                      }}
                      className="mt-0.5"
                    />
                    <span>
                      [{r.points} pt{r.points > 1 ? 's' : ''}] {r.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showSolution && (
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
              <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Verified Model Proof
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {proof.modelSolution}
              </pre>
              {settings.lang === 'bilingual' && (
                <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <strong>Ghi chú:</strong> {proof.modelSolutionVi}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
