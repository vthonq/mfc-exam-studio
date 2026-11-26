import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Clock, Copy, RefreshCw, Sparkles, Table2 } from 'lucide-react';
import { createRng, randomSeedCode } from '../../math/prng';
import {
  PROB_MIDTERM_MCQS,
  generateProbFinalExam,
  type FinalWrittenQuestion,
  type ProbMcqItem,
} from '../../data/probStat';
import { useApp } from '../../context/AppContext';
import { PROB_TOPIC_META, type ProbTopicId } from '../../types';
import { gradeProofWithGemini, type ProofGradeResult } from '../../services/geminiGrader';
import {
  analyzeWrittenProofOffline,
  buildCopyableGradingPrompt,
  type OfflineCheckResult,
} from '../../utils/offlineProofChecker';
import { SbTableModal } from '../../components/probstat/SbTableModal';
import { RichMathText } from '../../components/Math';
import { clearExamDraft, loadExamDraft, saveExamDraft } from '../../utils/examDraft';
import { buildExplainQuestionPrompt, dispatchAskAi } from '../../utils/askAiBridge';
import { MathKeypad } from '../../components/MathKeypad';
import { ExamStickyBar } from '../../components/ExamStickyBar';

type ProbExamMode = 'final' | 'midterm';

interface ProbExamDraft {
  seed: string;
  mode: ProbExamMode;
  started: boolean;
  mcqAnswers: Record<string, number>;
  numInputs: Record<string, string>;
  writtenAnswers: Record<string, string>;
  secondsLeft: number;
}

interface ProbExamPageProps {
  initialSeed?: string;
  initialMode?: ProbExamMode;
  onSeedChange: (seed: string, mode: ProbExamMode) => void;
}

export const ProbExamPage: React.FC<ProbExamPageProps> = ({
  initialSeed,
  initialMode,
  onSeedChange,
}) => {
  const { settings, addProbExamRecord, recordProbPractice, recordMistake } = useApp();
  const [initialDraft] = useState<ProbExamDraft | null>(() => {
    if (initialSeed) {
      return loadExamDraft<ProbExamDraft>(
        `probstat:${initialSeed}:${initialMode || 'final'}`,
      );
    }
    return loadExamDraft<ProbExamDraft>('probstat:active');
  });

  const [seedInput, setSeedInput] = useState(initialSeed || initialDraft?.seed || 'STAT26');
  const [activeSeed, setActiveSeed] = useState(initialSeed || initialDraft?.seed || 'STAT26');
  const [mode, setMode] = useState<ProbExamMode>(initialMode || initialDraft?.mode || 'final');
  const [sbOpen, setSbOpen] = useState(false);

  const [started, setStarted] = useState(Boolean(initialDraft?.started));
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    initialDraft?.secondsLeft ??
      ((initialMode || initialDraft?.mode || 'final') === 'final' ? 100 * 60 : 60 * 60),
  );
  const [draftRestored, setDraftRestored] = useState(Boolean(initialDraft?.started));

  // Midterm MCQ answers
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>(
    initialDraft?.mcqAnswers || {},
  );

  // Final Written answers & grading states
  const [numInputs, setNumInputs] = useState<Record<string, string>>(
    initialDraft?.numInputs || {},
  );
  const [writtenAnswers, setWrittenAnswers] = useState<Record<string, string>>(
    initialDraft?.writtenAnswers || {},
  );
  const [offlineResults, setOfflineResults] = useState<Record<string, OfflineCheckResult>>({});
  const [aiResults, setAiResults] = useState<Record<string, ProofGradeResult>>({});
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [lastResult, setLastResult] = useState<{
    score: number;
    maxScore: number;
    byChapter: Record<string, { earned: number; total: number }>;
  } | null>(null);

  useEffect(() => {
    if (initialSeed) {
      setSeedInput(initialSeed);
      setActiveSeed(initialSeed);
    }
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialSeed, initialMode]);

  const midtermPaper: ProbMcqItem[] = useMemo(() => {
    const rng = createRng(`probstat-midterm:${activeSeed}`);
    return rng.shuffle(PROB_MIDTERM_MCQS).slice(0, 20).map((q) => {
      const idxOrder = rng.shuffle([0, 1, 2, 3]);
      return {
        ...q,
        choices: idxOrder.map((i) => q.choices[i]),
        correctIndex: idxOrder.indexOf(q.correctIndex),
      };
    });
  }, [activeSeed]);

  const finalPaper: FinalWrittenQuestion[] = useMemo(
    () => generateProbFinalExam(activeSeed),
    [activeSeed],
  );

  const secondsLeftRef = React.useRef(secondsLeft);
  secondsLeftRef.current = secondsLeft;
  const submitBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!started || submitted) return;
    const draft: ProbExamDraft = {
      seed: activeSeed,
      mode,
      started,
      mcqAnswers,
      numInputs,
      writtenAnswers,
      secondsLeft: secondsLeftRef.current,
    };
    saveExamDraft(`probstat:${activeSeed}:${mode}`, draft);
    saveExamDraft('probstat:active', draft);
  }, [started, submitted, activeSeed, mode, mcqAnswers, numInputs, writtenAnswers]);

  useEffect(() => {
    if (!started || submitted || secondsLeft % 15 !== 0) return;
    const draft: ProbExamDraft = {
      seed: activeSeed,
      mode,
      started,
      mcqAnswers,
      numInputs,
      writtenAnswers,
      secondsLeft,
    };
    saveExamDraft(`probstat:${activeSeed}:${mode}`, draft);
    saveExamDraft('probstat:active', draft);
  }, [secondsLeft]);

  useEffect(() => {
    if (!started || submitted) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, submitted]);

  const startPaper = (nextSeed: string, nextMode: ProbExamMode) => {
    clearExamDraft(`probstat:${activeSeed}:${mode}`);
    clearExamDraft('probstat:active');
    const clean = nextSeed.trim().toUpperCase() || randomSeedCode();
    setSeedInput(clean);
    setActiveSeed(clean);
    setMode(nextMode);
    setStarted(true);
    setSubmitted(false);
    setDraftRestored(false);
    setSecondsLeft(nextMode === 'final' ? 100 * 60 : 60 * 60);
    setMcqAnswers({});
    setNumInputs({});
    setWrittenAnswers({});
    setOfflineResults({});
    setAiResults({});
    setAiErrors({});
    setLastResult(null);
    onSeedChange(clean, nextMode);
  };

  const copyShareUrl = async () => {
    try {
      const base = window.location.href.split('#')[0];
      const url = `${base}#/probstat/exam?seed=${encodeURIComponent(activeSeed)}&mode=${mode}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const submitExam = () => {
    setSubmitted(true);
    clearExamDraft(`probstat:${activeSeed}:${mode}`);
    clearExamDraft('probstat:active');
    setDraftRestored(false);
    if (mode === 'midterm') {
      let score = 0;
      const byChapter: Record<string, { earned: number; total: number }> = {};
      for (const q of midtermPaper) {
        if (!byChapter[q.topic]) byChapter[q.topic] = { earned: 0, total: 0 };
        byChapter[q.topic].total += 1;
        const ok = mcqAnswers[q.id] === q.correctIndex;
        if (ok) {
          score += 1;
          byChapter[q.topic].earned += 1;
        } else {
          recordMistake({
            id: `ps-mid-${q.id}`,
            subject: 'probstat',
            topicLabel: `${PROB_TOPIC_META[q.topic].code} · ${PROB_TOPIC_META[q.topic].title}`,
            question: q.question,
            choices: q.choices,
            correctIndex: q.correctIndex,
            userAnswerText:
              mcqAnswers[q.id] !== undefined ? q.choices[mcqAnswers[q.id]] : '(blank)',
            explanation: q.explanation,
            source: 'mistake',
          });
        }
        recordProbPractice(q.topic, ok);
      }
      setLastResult({ score, maxScore: midtermPaper.length, byChapter });
      addProbExamRecord({
        id: `ps-mid-${Date.now()}`,
        seed: activeSeed,
        mode: 'Midterm (20 MCQ)',
        score,
        maxScore: midtermPaper.length,
        dateIso: new Date().toISOString(),
        byChapter,
      });
    } else {
      // Evaluate numeric sub-checks + offline methodology across 5 questions (100 pts)
      const nextOffline: Record<string, OfflineCheckResult> = {};
      let earnedTotal = 0;
      const byChapter: Record<string, { earned: number; total: number }> = {};
      for (const q of finalPaper) {
        const off = analyzeWrittenProofOffline(q.id, writtenAnswers[q.id] ?? '', q.rubric);
        nextOffline[q.id] = off;
        let numHits = 0;
        for (const nc of q.numericChecks) {
          const val = Number(numInputs[`${q.id}:${nc.id}`]);
          if (Number.isFinite(val) && Math.abs(val - nc.expected) <= nc.tolerance) numHits += 1;
        }
        const numRatio = q.numericChecks.length > 0 ? numHits / q.numericChecks.length : 1;
        const methRatio = off.maxScore > 0 ? off.estimatedScore / off.maxScore : 0;
        const qEarned = Math.round((numRatio * 10 + methRatio * 10) * 10) / 10;
        earnedTotal += qEarned;
        byChapter[q.topic] = { earned: qEarned, total: 20 };
        recordProbPractice(q.topic, qEarned >= 13);
        if (qEarned < 13) {
          recordMistake({
            id: `ps-fin-${activeSeed}-${q.id}`,
            subject: 'probstat',
            topicLabel: q.title,
            question: q.prompt,
            expectedText: q.numericChecks.map((nc) => `${nc.label}: ${nc.expected}`).join(' | '),
            explanation: q.modelSolution,
            source: 'mistake',
          });
        }
      }
      const roundedScore = Math.round(earnedTotal);
      setOfflineResults(nextOffline);
      setLastResult({ score: roundedScore, maxScore: 100, byChapter });
      addProbExamRecord({
        id: `ps-fin-${Date.now()}`,
        seed: activeSeed,
        mode: 'Final (5 Written Qs)',
        score: roundedScore,
        maxScore: 100,
        dateIso: new Date().toISOString(),
        byChapter,
      });
    }
  };

  const runSingleGeminiGrade = async (q: FinalWrittenQuestion) => {
    setAiLoading((p) => ({ ...p, [q.id]: true }));
    setAiErrors((p) => ({ ...p, [q.id]: '' }));
    try {
      const res = await gradeProofWithGemini({
        apiKey: settings.geminiKey,
        model: settings.geminiModel,
        subject: 'probstat',
        prompt: q.prompt,
        studentProof: writtenAnswers[q.id] ?? '',
        modelSolution: q.modelSolution,
        rubric: q.rubric,
        bilingual: settings.lang === 'bilingual',
      });
      setAiResults((p) => ({ ...p, [q.id]: res }));
    } catch (err) {
      setAiErrors((p) => ({ ...p, [q.id]: err instanceof Error ? err.message : String(err) }));
    } finally {
      setAiLoading((p) => ({ ...p, [q.id]: false }));
    }
  };

  const copyPromptForQ = async (q: FinalWrittenQuestion) => {
    const text = buildCopyableGradingPrompt({
      subject: 'Probability & Statistical Methods Final Exam (UEH-ISB)',
      title: q.title,
      prompt: q.prompt,
      studentAnswer: writtenAnswers[q.id] ?? '',
      modelSolution: q.modelSolution,
      rubric: q.rubric,
      bilingual: settings.lang === 'bilingual',
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(q.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answeredCount =
    mode === 'midterm'
      ? midtermPaper.filter((q) => mcqAnswers[q.id] !== undefined).length
      : finalPaper.filter(
          (q) =>
            (writtenAnswers[q.id] ?? '').trim().length > 0 ||
            q.numericChecks.some((nc) => (numInputs[`${q.id}:${nc.id}`] ?? '').trim().length > 0),
        ).length;
  const totalCount = mode === 'midterm' ? midtermPaper.length : finalPaper.length;

  return (
    <div className="space-y-5">
      {/* Control Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-sky-600" />
              Probability &amp; Statistics Official Exam Simulator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Share the exact Seed URL so your entire group gets the exact same exam paper.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSbOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <Table2 className="w-4 h-4" /> Open SB Tables
            </button>
            <button
              onClick={copyShareUrl}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> {linkCopied ? 'Exam Link Copied!' : 'Share Group Exam Link'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Exam Mode</label>
            <div className="flex gap-1.5">
              <button
                onClick={() => startPaper(seedInput, 'final')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  mode === 'final' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Written Final (100m · 5 Qs)
              </button>
              <button
                onClick={() => startPaper(seedInput, 'midterm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  mode === 'midterm' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Midterm (60m · 20 MCQs)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Group Seed Code</label>
            <div className="flex gap-1.5">
              <input
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value.toUpperCase())}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs w-32"
              />
              <button
                onClick={() => startPaper(randomSeedCode(), mode)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                title="Random Seed"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New
              </button>
              <button
                onClick={() => startPaper(seedInput, mode)}
                className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold cursor-pointer"
              >
                {started ? 'Restart' : 'Start Timed Exam'}
              </button>
            </div>
          </div>

          {started && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 font-mono text-sm font-bold text-amber-800 dark:text-amber-300">
              <Clock className="w-4 h-4" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Timer & Submitted Score Banners */}
      {draftRestored && started && !submitted && (
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900 dark:text-sky-200">
          <span>
            Auto-saved draft restored for Seed <code className="font-mono font-bold">{activeSeed}</code>.
          </span>
          <button
            onClick={() => startPaper(activeSeed, mode)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 font-semibold cursor-pointer"
          >
            Reset / Clear Draft
          </button>
        </div>
      )}

      {started && !submitted && secondsLeft === 0 && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200">
          Time&apos;s up! Review your answers and click &quot;Submit &amp; Grade Exam&quot; below.
        </div>
      )}

      {submitted && lastResult && (
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-extrabold text-base text-sky-900 dark:text-sky-100">
              {mode === 'midterm' ? 'Midterm Score:' : 'Estimated Final Score:'}{' '}
              <span className="font-mono">
                {lastResult.score} / {lastResult.maxScore} (
                {Math.round((lastResult.score / lastResult.maxScore) * 100)}%)
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {mode === 'final'
                ? 'Combines auto-graded numeric answers + offline step checkpoints. Use Copy Prompt or AI Grade for deep methodology feedback.'
                : 'Saved to dashboard mastery & exam history.'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            {Object.entries(lastResult.byChapter).map(([tid, st]) => (
              <span
                key={tid}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800"
              >
                {PROB_TOPIC_META[tid as ProbTopicId]?.code ?? tid}: {st.earned}/{st.total}
              </span>
            ))}
          </div>
        </div>
      )}

      {started && !submitted && (
        <ExamStickyBar
          secondsLeft={secondsLeft}
          answeredCount={answeredCount}
          totalCount={totalCount}
          accent="sky"
          label={`Seed ${activeSeed} · ${mode === 'final' ? 'Final' : 'Midterm'}`}
          onJumpToSubmit={() =>
            submitBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          extraAction={
            <button
              type="button"
              onClick={() => setSbOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <Table2 className="w-3.5 h-3.5" /> SB Tables
            </button>
          }
        />
      )}

      {/* Exam Paper Body */}
      {started && mode === 'midterm' && (
        <div className="space-y-4">
          {midtermPaper.map((q, idx) => {
            const chosen = mcqAnswers[q.id];
            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-sky-600">
                    Q{idx + 1} · {PROB_TOPIC_META[q.topic].code}
                  </span>
                  <span>{q.tag}</span>
                </div>
                <p className="text-sm font-semibold">
                  <RichMathText text={q.question} />
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {q.choices.map((ch, ci) => {
                    const picked = chosen === ci;
                    const isCorrect = ci === q.correctIndex;
                    return (
                      <button
                        key={ci}
                        disabled={submitted}
                        onClick={() => setMcqAnswers((p) => ({ ...p, [q.id]: ci }))}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          submitted
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
                              : picked
                              ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                              : 'border-slate-200 dark:border-slate-800 opacity-75'
                            : picked
                            ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {String.fromCharCode(65 + ci)}. <RichMathText text={ch} />
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <strong>Explanation:</strong> <RichMathText text={q.explanation} />
                      {settings.lang === 'bilingual' && (
                        <div className="mt-0.5 text-slate-500">
                          <RichMathText text={q.explanationVi} />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        dispatchAskAi({
                          subject: 'probstat',
                          prompt: buildExplainQuestionPrompt({
                            topicLabel: `${PROB_TOPIC_META[q.topic].code} (${q.tag})`,
                            question: q.question,
                            userAnswer: chosen !== undefined ? q.choices[chosen] : '(blank)',
                            expectedAnswer: q.choices[q.correctIndex],
                            explanation: q.explanation,
                          }),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      Explain with AI
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {started && mode === 'final' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            <strong>Official UEH-ISB Grading Policy:</strong> Show full step-by-step formulas, SB Table lookups, and intermediate calculations. Correct final numbers WITHOUT supporting methodology receive zero credit on the written exam!
          </div>

          {finalPaper.map((q) => {
            const off = offlineResults[q.id];
            const ai = aiResults[q.id];
            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-sm text-sky-700 dark:text-sky-300">{q.title}</span>
                  <span className="text-xs font-mono text-amber-600">
                    20 pts · <RichMathText text={q.sbTableHint} />
                  </span>
                </div>
                <div className="font-sans text-sm bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl leading-relaxed">
                  <RichMathText text={q.prompt} />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {q.numericChecks.map((nc) => {
                    const key = `${q.id}:${nc.id}`;
                    const raw = numInputs[key] ?? '';
                    const val = Number(raw);
                    const ok =
                      submitted &&
                      raw.trim() !== '' &&
                      Number.isFinite(val) &&
                      Math.abs(val - nc.expected) <= nc.tolerance;
                    return (
                      <div key={nc.id}>
                        <label className="text-[11px] text-slate-500 block mb-1">
                          <RichMathText text={nc.label} />
                        </label>
                        <input
                          type="text"
                          value={raw}
                          onChange={(e) => setNumInputs((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder="Final value..."
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white dark:bg-slate-950 ${
                            submitted
                              ? ok
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                                : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        />
                        {submitted && !ok && (
                          <div className="text-[10px] font-mono text-emerald-600 mt-0.5">
                            Ans: {nc.expected}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <MathKeypad
                  preset="probstat"
                  onInsert={(sym) =>
                    setWrittenAnswers((p) => ({ ...p, [q.id]: (p[q.id] ?? '') + sym }))
                  }
                />
                <textarea
                  rows={4}
                  value={writtenAnswers[q.id] ?? ''}
                  onChange={(e) => setWrittenAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="Write your full step-by-step methodology, pivots, SB critical values, and conclusions..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                />

                {submitted && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyPromptForQ(q)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedId === q.id ? 'Copied!' : 'Copy Prompt for Free ChatGPT / Gemini'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatchAskAi({
                            subject: 'probstat',
                            prompt: buildExplainQuestionPrompt({
                              topicLabel: q.title,
                              question: q.prompt,
                              userAnswer: q.numericChecks
                                .map((nc) => `${nc.label}: ${numInputs[`${q.id}:${nc.id}`] || '(blank)'}`)
                                .join(', '),
                              expectedAnswer: q.numericChecks
                                .map((nc) => `${nc.label}: ${nc.expected}`)
                                .join(', '),
                              explanation: q.modelSolution,
                            }),
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Explain with AI
                      </button>
                      {settings.geminiKey.trim() && (
                        <button
                          onClick={() => runSingleGeminiGrade(q)}
                          disabled={aiLoading[q.id]}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {aiLoading[q.id] ? 'Grading...' : 'AI Grade Solution'}
                        </button>
                      )}
                    </div>

                    {off && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs">
                        <strong>Methodology Checkpoint Match:</strong> {off.estimatedScore}/{off.maxScore}
                        {off.missing.length > 0 && ` · Missing: ${off.missing.join(' | ')}`}
                      </div>
                    )}
                    {aiErrors[q.id] && <div className="text-xs text-rose-600">{aiErrors[q.id]}</div>}
                    {ai && (
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-xs">
                        <strong>AI Verdict:</strong> {ai.score}/{ai.maxScore} ({ai.verdict}) — {ai.improvedHint}
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-xs">
                      <div className="font-bold mb-1">Full Reference Solution:</div>
                      <div className="font-sans leading-relaxed">
                        <RichMathText text={q.modelSolution} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {started && !submitted && (
        <div className="flex justify-end">
          <button
            ref={submitBtnRef}
            onClick={submitExam}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer shadow-md"
          >
            Submit &amp; Grade Exam
          </button>
        </div>
      )}

      <SbTableModal open={sbOpen} onClose={() => setSbOpen(false)} />
    </div>
  );
};
