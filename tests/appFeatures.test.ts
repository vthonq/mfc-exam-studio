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
import { formatRelativeTime, isInAppBrowser } from '../src/utils/browserDetect';
import { clearExamDraft, loadExamDraft, saveExamDraft } from '../src/utils/examDraft';
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

    const handoff = buildGeminiWebHandoffPrompt('mfc', 'Explain CRT step-by-step', true);
    expect(handoff).toContain('Math for Computing (MFC)');
    expect(handoff).toContain('Explain CRT step-by-step');

    const ids = GEMINI_MODEL_OPTIONS.map((m) => m.id);
    expect(ids).toContain('gemini-4-hydrogen');
    expect(ids).toContain('gemini-3.5-flash-lite');
    for (const id of ids) {
      expect(id).not.toMatch(/gemini-(1\.5|2\.0|2\.5)/);
    }
  });
});
