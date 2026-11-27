import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CHANGELOG_ENTRIES, LATEST_UPDATE_ID } from '../src/data/changelog';
import { ECON_MCQS } from '../src/data/economics';
import { KNOWLEDGE_ITEMS } from '../src/data/knowledge';
import { generateProbFinalExam, PROB_MIDTERM_MCQS } from '../src/data/probStat';
import { validateKmap3Group } from '../src/math/booleanAlgebra';
import { isAdminEmail, isUehStudentEmail } from '../src/services/firebase';
import {
  GEMINI_MODEL_OPTIONS,
  buildGeminiWebHandoffPrompt,
  buildTutorSystemPrompt,
} from '../src/services/geminiTutor';
import {
  buildSubjectKnowledgeMarkdown,
  getKnowledgeFileName,
  getMatchedKnowledgeSnippets,
} from '../src/utils/knowledgeBridge';
import { formatRelativeTime, isInAppBrowser } from '../src/utils/browserDetect';
import { buildExplainQuestionPrompt } from '../src/utils/askAiBridge';
import { clearExamDraft, loadExamDraft, saveExamDraft } from '../src/utils/examDraft';
import { buildFlashcardDeck } from '../src/utils/flashcards';
import {
  buildAiFlashcardImportPrompt,
  parseCustomCardsInput,
} from '../src/utils/customDeckParser';
import {
  DEFAULT_PALETTE,
  STUDIO_PALETTES,
  getNextPalette,
  getPaletteMeta,
  resolvePalette,
} from '../src/utils/studioTheme';
import {
  computeCombinatorics,
  computeEconQuickCalc,
  computeModularCalc,
  computeQuickOneSampleT,
  computeSampleStats,
  convertIntegerBases,
  parseNumberList,
} from '../src/utils/examCalculator';
import {
  buildSmartDrillQuestions,
  buildSmartFocusPlan,
  daysUntilExam,
} from '../src/utils/smartFocus';
import {
  buildRoomInviteUrl,
  computeMissedHeatmap,
  formatElapsed,
  generateRoomCode,
  normalizeRoomCode,
  rankRoomLeaderboard,
} from '../src/utils/studyRoomStats';
import { buildGlobalSearchItems, searchGlobalItems } from '../src/utils/searchIndex';

describe('Global Search Index', () => {
  it('indexes all 3 subjects plus the Guide and finds key concepts', () => {
    const all = buildGlobalSearchItems();
    expect(all.length).toBeGreaterThan(40);

    const warshall = searchGlobalItems('Warshall');
    expect(warshall.some((x) => x.subject === 'mfc')).toBe(true);

    const sacrifice = searchGlobalItems('Sacrifice');
    expect(sacrifice.some((x) => x.subject === 'econ')).toBe(true);

    const appD = searchGlobalItems('Appendix D');
    expect(appD.some((x) => x.subject === 'probstat' && x.route === 'tables')).toBe(true);

    const binomial = searchGlobalItems('Binomial');
    expect(binomial.some((x) => x.subject === 'probstat')).toBe(true);

    const guide = searchGlobalItems('Guide');
    expect(guide.some((x) => x.subject === 'guide')).toBe(true);

    const econGloss = all.find((x) => x.id.startsWith('econ-gloss-'));
    expect(econGloss?.query).toBe('topic=glossary');
    const probGloss = all.find((x) => x.id.startsWith('prob-gloss-'));
    expect(probGloss?.query).toBe('topic=glossary');

    expect(searchGlobalItems('Quantifier').some((x) => x.subject === 'mfc')).toBe(true);
    expect(searchGlobalItems('Shock Predictor').some((x) => x.subject === 'econ')).toBe(true);
    expect(searchGlobalItems('Loanable Funds').some((x) => x.subject === 'econ')).toBe(true);
    expect(searchGlobalItems('Money Market').some((x) => x.subject === 'econ')).toBe(true);
  });

  it('validates 3-variable K-Map implicant grouping rules accurately', () => {
    const tv: Record<number, 0 | 1> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1 };
    expect(validateKmap3Group([4, 5, 6, 7], tv).valid).toBe(true);
    expect(validateKmap3Group([4, 5, 6], tv).valid).toBe(false);
    expect(validateKmap3Group([0, 4], tv).valid).toBe(false);
  });
});

describe('Exam Auto-Save Draft Helper', () => {
  const originalStorage = globalThis.localStorage;

  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        removeItem: (k: string) => {
          store.delete(k);
        },
        clear: () => store.clear(),
        key: (i: number) => Array.from(store.keys())[i] ?? null,
        get length() {
          return store.size;
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalStorage,
    });
  });

  it('saves, loads, expires, and clears exam drafts cleanly', () => {
    saveExamDraft('test:seed1', { answers: { q1: 'A' }, secondsLeft: 1200 });
    const loaded = loadExamDraft<{ answers: Record<string, string>; secondsLeft: number }>(
      'test:seed1',
    );
    expect(loaded).not.toBeNull();
    expect(loaded?.answers.q1).toBe('A');
    expect(loaded?.secondsLeft).toBe(1200);

    // Expired draft should return null
    const expired = loadExamDraft('test:seed1', -1);
    expect(expired).toBeNull();
    expect(loadExamDraft('test:seed1')).toBeNull();

    saveExamDraft('test:seed2', { ok: true });
    clearExamDraft('test:seed2');
    expect(loadExamDraft('test:seed2')).toBeNull();
  });
});

describe('Changelog & Cross-Subject Data Integrity', () => {
  it('keeps LATEST_UPDATE_ID aligned with the newest changelog entry', () => {
    expect(CHANGELOG_ENTRIES.length).toBeGreaterThan(0);
    expect(CHANGELOG_ENTRIES[0].id).toBe(LATEST_UPDATE_ID);
    for (const entry of CHANGELOG_ENTRIES) {
      expect(entry.items.length).toBeGreaterThan(0);
      for (const it of entry.items) {
        expect(it.en.trim().length).toBeGreaterThan(0);
        expect(it.vi.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('validates every MCQ in Economics and Prob & Stat', () => {
    for (const q of [...ECON_MCQS, ...PROB_MIDTERM_MCQS]) {
      expect(q.choices.length).toBeGreaterThanOrEqual(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.choices.length);
      expect(new Set(q.choices).size).toBe(q.choices.length);
    }
  });

  it('generates valid ProbStat Final papers with balanced KaTeX $ delimiters', () => {
    for (const seed of ['SEED1', 'SEED2']) {
      const paper = generateProbFinalExam(seed);
      expect(paper).toHaveLength(5);
      for (const q of paper) {
        expect(q.numericChecks.length).toBeGreaterThan(0);
        for (const nc of q.numericChecks) {
          expect(Number.isFinite(nc.expected)).toBe(true);
        }
        const dollarCount = (q.prompt.match(/(?<!\\)\$/g) ?? []).length;
        expect(dollarCount % 2).toBe(0);
      }
    }
  });

  it('matches configured admin emails case-insensitively and rejects students', () => {
    expect(isAdminEmail('nguyenvanvietthong@gmail.com')).toBe(true);
    expect(isAdminEmail('NguyenVanVietThong@gmail.com')).toBe(true);
    expect(isAdminEmail('thongnguyen.31261028903@st.ueh.edu.vn')).toBe(true);
    expect(isAdminEmail('  THONGNGUYEN.31261028903@ST.UEH.EDU.VN  ')).toBe(true);
    expect(isAdminEmail('student@st.ueh.edu.vn')).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isUehStudentEmail('student.123@st.ueh.edu.vn')).toBe(true);
    expect(isUehStudentEmail('random@gmail.com')).toBe(false);
  });

  it('detects Zalo/Messenger webviews and formats relative timestamps cleanly', () => {
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 13) Zalo/23.0')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 [FBAN/MessengerForiOS;FBAV/420.0]')).toBe(true);
    expect(
      isInAppBrowser(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
      ),
    ).toBe(false);

    const now = 1_700_000_000_000;
    expect(formatRelativeTime(null, now)).toBe('—');
    expect(formatRelativeTime(now - 20_000, now)).toBe('Just now');
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5m ago');
    expect(formatRelativeTime({ seconds: Math.floor((now - 3 * 3600_000) / 1000) }, now)).toBe(
      '3h ago',
    );
  });

  it('ensures MFC KNOWLEDGE_ITEMS plain summaries do not leak raw LaTeX braces', () => {
    const rawLatexPattern = /\\text\{|\\frac\{|_\{|\^\{/;
    for (const item of KNOWLEDGE_ITEMS) {
      expect(rawLatexPattern.test(item.summary)).toBe(false);
      expect(rawLatexPattern.test(item.summaryVi)).toBe(false);
    }
  });

  it('builds tailored Gemini AI tutor system prompts and web handoff prompts without legacy models', () => {
    const mfcPrompt = buildTutorSystemPrompt('mfc', 'Proofs Trainer', true);
    expect(mfcPrompt).toContain('Math for Computing');
    expect(mfcPrompt).toContain('Vietnamese');
    expect(mfcPrompt).toContain('$...$');

    const econPrompt = buildTutorSystemPrompt('econ', 'Econ Simulators', false);
    expect(econPrompt).toContain('ECO101');
    expect(econPrompt).not.toContain('Tóm tắt tiếng Việt');

    const probPrompt = buildTutorSystemPrompt('probstat', 'SB Stat Tables', true);
    expect(probPrompt).toContain('SB Statistical Tables');

    const handoff = buildGeminiWebHandoffPrompt('mfc', 'Explain CRT step-by-step', true, true);
    expect(handoff).toContain('Math for Computing (MFC)');
    expect(handoff).toContain('EXAM STUDIO COURSE NOTES');
    expect(handoff).toContain('Explain CRT step-by-step');

    const handoffNoNotes = buildGeminiWebHandoffPrompt('mfc', 'Explain CRT step-by-step', true, false);
    expect(handoffNoNotes).not.toContain('EXAM STUDIO COURSE NOTES');

    const ids = GEMINI_MODEL_OPTIONS.map((m) => m.id);
    expect(ids).toContain('gemini-4-hydrogen');
    expect(ids).toContain('gemini-3.5-flash-lite');
    for (const id of ids) {
      expect(id).not.toMatch(/gemini-(1\.5|2\.0|2\.5)/);
    }
  });

  it('matches relevant course knowledge notes and exports complete .md Knowledge Packs', () => {
    const mfcHits = getMatchedKnowledgeSnippets('mfc', 'Warshall transitive closure', 3);
    expect(mfcHits.some((h) => `${h.title} ${h.block}`.toLowerCase().includes('warshall'))).toBe(true);

    const econHits = getMatchedKnowledgeSnippets('econ', 'CPI substitution bias olive oil', 3);
    expect(econHits.some((h) => h.id === 'econ-ch24')).toBe(true);

    const probHits = getMatchedKnowledgeSnippets('probstat', 'Geometric Dr. Hoang memoryless', 3);
    expect(probHits.some((h) => h.id === 'ps-ch1')).toBe(true);

    for (const subj of ['mfc', 'econ', 'probstat'] as const) {
      const md = buildSubjectKnowledgeMarkdown(subj, true);
      expect(md.length).toBeGreaterThan(1000);
      expect(md).toContain('Glossary');
      expect(getKnowledgeFileName(subj)).toMatch(/^ExamStudio-.*-Knowledge\.md$/);
    }
  });

  it('builds non-empty Formula and Glossary flashcard decks across all 3 subjects and clean Explain-with-AI prompts', () => {
    for (const subj of ['mfc', 'econ', 'probstat'] as const) {
      const formulaCards = buildFlashcardDeck(subj, 'formulas', true);
      const glossaryCards = buildFlashcardDeck(subj, 'glossary', true);
      expect(formulaCards.length).toBeGreaterThan(5);
      expect(glossaryCards.length).toBeGreaterThan(5);
      for (const c of [...formulaCards, ...glossaryCards]) {
        expect(c.front.trim().length).toBeGreaterThan(0);
        expect(c.backSummary.trim().length).toBeGreaterThan(0);
      }
    }

    const prompt = buildExplainQuestionPrompt({
      topicLabel: 'Ch. 1 · Logic',
      question: 'Negate ∀x ∃y P(x, y)',
      userAnswer: '∀x ¬∃y P(x, y)',
      expectedAnswer: '∃x ∀y ¬P(x, y)',
      explanation: 'Flip each quantifier and push negation inward.',
    });
    expect(prompt).toContain('Ch. 1 · Logic');
    expect(prompt).toContain('Negate ∀x ∃y P(x, y)');
    expect(prompt).toContain('My answer: ∀x ¬∃y P(x, y)');
    expect(prompt).toContain('Expected answer: ∃x ∀y ¬P(x, y)');
  });

  it('builds Smart Exam Focus plans & adaptive drills prioritizing Review Bank mistakes and computes Show-Your-Work Exam Calculator formulas accurately', () => {
    const now = new Date(2026, 10, 27, 10, 0, 0).getTime();
    expect(daysUntilExam('2026-11-30', now)).toBe(3);
    expect(daysUntilExam('2026-11-27', now)).toBe(0);
    expect(daysUntilExam('invalid', now)).toBeNull();

    const sampleProgress = {
      mastery: {
        ch1: { correct: 9, attempts: 10 },
        ch4: { correct: 1, attempts: 5 },
        ch9: { correct: 8, attempts: 10 },
        ch10: { correct: 7, attempts: 10 },
        ch11: { correct: 7, attempts: 10 },
        ch12: { correct: 8, attempts: 10 },
      },
      econMastery: {
        part6: { correct: 5, attempts: 5 },
        part7: { correct: 4, attempts: 5 },
        part8: { correct: 1, attempts: 5 },
        part9: { correct: 4, attempts: 5 },
      },
      probMastery: {
        'ps-ch1': { correct: 5, attempts: 5 },
        'ps-ch2': { correct: 5, attempts: 5 },
        'ps-ch3': { correct: 4, attempts: 5 },
        'ps-ch4': { correct: 0, attempts: 3 },
        'ps-ch5': { correct: 3, attempts: 5 },
      },
      completedAssignments: [],
      completedProofs: [],
      completedEconScenarios: [],
      completedProbProblems: [],
      examHistory: [],
      econExamHistory: [],
      probExamHistory: [],
      mistakes: [
        {
          id: 'm1',
          subject: 'mfc' as const,
          topicLabel: 'Ch. 4 · Mod Inverse',
          question: 'Test mistake question?',
          choices: ['A', 'B', 'C', 'D'],
          correctIndex: 1,
          explanation: 'B is right.',
          savedAtIso: '2026-11-26T00:00:00Z',
          source: 'mistake' as const,
        },
      ],
    };

    const mfcPlan = buildSmartFocusPlan('mfc', sampleProgress);
    expect(mfcPlan.weakestTopics[0].id).toBe('ch4');
    expect(mfcPlan.dueMistakesCount).toBe(1);

    const mfcDrill = buildSmartDrillQuestions('mfc', sampleProgress, 8, 'V3TEST');
    expect(mfcDrill).toHaveLength(8);
    expect(mfcDrill[0].source).toBe('mistake');

    for (const subj of ['econ', 'probstat'] as const) {
      const drill = buildSmartDrillQuestions(subj, sampleProgress, 8, 'V3TEST');
      expect(drill).toHaveLength(8);
    }

    const parsed = parseNumberList('10, 12; 14\n16');
    expect(parsed).toEqual([10, 12, 14, 16]);
    const stats = computeSampleStats(parsed);
    expect(stats.n).toBe(4);
    expect(stats.mean).toBe(13);
    expect(stats.sampleSd).toBeCloseTo(Math.sqrt(20 / 3), 5);
    expect(stats.workingLines.length).toBeGreaterThanOrEqual(4);

    const tRes = computeQuickOneSampleT(stats.mean, 10, stats.sampleSd, stats.n, 0.95);
    expect(tRes.df).toBe(3);
    expect(tRes.ciLow).toBeLessThan(stats.mean);
    expect(tRes.ciHigh).toBeGreaterThan(stats.mean);

    expect(computeCombinatorics(5, 2)).toEqual({ nCr: 10, nPr: 20, nFact: 120 });

    const modRes = computeModularCalc(7, 13, 11);
    expect(modRes.powMod).toBe(2);
    expect(modRes.gcdVal).toBe(1);
    expect(modRes.inverse).toBe(8);

    const bases = convertIntegerBases('255', 10);
    expect(bases).toEqual({ dec: '255', bin: '11111111', hex: 'FF', oct: '377' });

    const econRes = computeEconQuickCalc({
      oldVal: 100,
      newVal: 110,
      nominalRate: 8,
      inflationRate: 3,
      mpc: 0.8,
      deltaG: 20,
      reserveRatioPct: 10,
    });
    expect(econRes.pctChange).toBeCloseTo(10, 5);
    expect(econRes.realRate).toBeCloseTo(5, 5);
    expect(econRes.spendingMult).toBeCloseTo(5, 5);
    expect(econRes.adShift).toBeCloseTo(100, 5);
    expect(econRes.moneyMult).toBeCloseTo(10, 5);
  });

  it('normalizes room codes, builds room invite URLs, ranks live leaderboards, and aggregates missed-question heatmaps', () => {
    expect(normalizeRoomCode(' isb-7k2m! ')).toBe('ISB-7K2M');
    expect(generateRoomCode(() => 0.1)).toMatch(/^ISB-[A-Z2-9]{4}$/);
    expect(formatElapsed(125)).toBe('02:05');
    expect(formatElapsed(3665)).toBe('1:01:05');

    expect(
      buildRoomInviteUrl('https://vthonq.github.io/mfc-exam-studio/#/exam', {
        roomCode: 'ISB-7K2M',
        subject: 'econ',
        seed: 'ABCD',
        mode: 'final',
      }),
    ).toBe('https://vthonq.github.io/mfc-exam-studio/#/econ/exam?seed=ABCD&mode=final&room=ISB-7K2M');

    const ranked = rankRoomLeaderboard([
      {
        uid: 'u1',
        displayName: 'An',
        score: 80,
        maxScore: 100,
        pct: 80,
        elapsedSeconds: 900,
        missedLabels: ['Ch. 1', 'Ch. 4'],
      },
      {
        uid: 'u2',
        displayName: 'Binh',
        score: 80,
        maxScore: 100,
        pct: 80,
        elapsedSeconds: 600,
        missedLabels: ['Ch. 4', 'Ch. 4'],
      },
      {
        uid: 'u3',
        displayName: 'Chi',
        score: 95,
        maxScore: 100,
        pct: 95,
        elapsedSeconds: 1100,
        missedLabels: ['Ch. 9'],
      },
    ]);
    expect(ranked.map((r) => `${r.rank}:${r.uid}`)).toEqual(['1:u3', '2:u2', '3:u1']);

    const heatmap = computeMissedHeatmap(ranked);
    expect(heatmap[0]).toEqual({ label: 'Ch. 4', missCount: 2, missPct: 67 });
  });

  it('parses custom JSON, fenced markdown, and "::" line flashcard imports cleanly', () => {
    const jsonCards = parseCustomCardsInput(
      '```json\n[{"badge":"Ch. 2","front":"Memoryless?","back":"$P(X>s+t|X>s)=P(X>t)$","trap":"Only Geo & Exp"}]\n```',
      'probstat',
    );
    expect(jsonCards).toHaveLength(1);
    expect(jsonCards[0].badge).toBe('Ch. 2');
    expect(jsonCards[0].trap).toBe('Only Geo & Exp');

    const lineCards = parseCustomCardsInput(
      'Real Exchange Rate :: $\\varepsilon = (e \\cdot P) / P^*$ :: Watch foreign/domestic price\nFisher Equation :: $r = i - \\pi$',
      'econ',
    );
    expect(lineCards).toHaveLength(2);
    expect(lineCards[0].front).toBe('Real Exchange Rate');
    expect(lineCards[0].trap).toBe('Watch foreign/domestic price');
    expect(lineCards[1].subject).toBe('econ');

    const prompt = buildAiFlashcardImportPrompt('mfc', true);
    expect(prompt).toContain('Mathematics for Computing');
    expect(prompt).toContain('JSON');
  });

  it('resolves Studio 5.0 palettes, migrates legacy light/dark, and cycles cleanly', () => {
    expect(STUDIO_PALETTES).toHaveLength(4);
    expect(resolvePalette(null)).toBe(DEFAULT_PALETTE);
    expect(resolvePalette({ theme: 'light' })).toBe('paper');
    expect(resolvePalette({ theme: 'dark' })).toBe('obsidian');
    expect(resolvePalette({ palette: 'forest', theme: 'light' })).toBe('forest');

    const forestMeta = getPaletteMeta('forest');
    expect(forestMeta.theme).toBe('dark');
    expect(forestMeta.swatches).toHaveLength(3);

    expect(getNextPalette('obsidian')).toBe('paper');
    expect(getNextPalette('indigo')).toBe('obsidian');
  });
});
