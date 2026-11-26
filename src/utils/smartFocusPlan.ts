import {
  CHAPTER_META,
  ECON_TOPIC_META,
  PROB_TOPIC_META,
  type ChapterId,
  type ChapterMastery,
  type EconTopicId,
  type ProbTopicId,
  type ProgressState,
  type SubjectId,
} from '../types';

export const OPEN_FOCUS_EVENT = 'exam-studio:open-focus';

export function dispatchOpenFocus(subject?: SubjectId): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ subject?: SubjectId }>(OPEN_FOCUS_EVENT, { detail: { subject } }),
  );
}

export function daysUntilExam(dateIso?: string, nowMs = Date.now()): number | null {
  if (!dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso.trim())) return null;
  const [y, m, d] = dateIso.trim().split('-').map(Number);
  const targetMidnight = new Date(y, m - 1, d).getTime();
  const nowDate = new Date(nowMs);
  const todayMidnight = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
  ).getTime();
  return Math.round((targetMidnight - todayMidnight) / 86_400_000);
}

export interface WeakTopicSummary {
  id: string;
  code: string;
  title: string;
  pct: number;
  attempts: number;
}

export interface SmartFocusPlan {
  weakestTopics: WeakTopicSummary[];
  dueMistakesCount: number;
  summaryEn: string;
  summaryVi: string;
}

function rankMastery<T extends string>(
  ids: readonly T[],
  map: Partial<Record<T, ChapterMastery>>,
  getMeta: (id: T) => { code: string; title: string },
): WeakTopicSummary[] {
  return ids
    .map((id) => {
      const m = map[id] ?? { correct: 0, attempts: 0 };
      const pct = m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0;
      const meta = getMeta(id);
      return {
        id,
        code: meta.code,
        title: meta.title,
        pct,
        attempts: m.attempts,
      };
    })
    .sort((a, b) => a.pct - b.pct || a.attempts - b.attempts);
}

export function buildSmartFocusPlan(subject: SubjectId, progress: ProgressState): SmartFocusPlan {
  const dueMistakes = progress.mistakes.filter(
    (m) => m.subject === subject && Boolean(m.choices?.length) && m.correctIndex !== undefined,
  );

  let ranked: WeakTopicSummary[] = [];
  if (subject === 'mfc') {
    ranked = rankMastery(
      Object.keys(CHAPTER_META) as ChapterId[],
      progress.mastery,
      (id) => ({ code: CHAPTER_META[id].code, title: CHAPTER_META[id].title }),
    );
  } else if (subject === 'econ') {
    ranked = rankMastery(
      Object.keys(ECON_TOPIC_META) as EconTopicId[],
      progress.econMastery,
      (id) => ({ code: ECON_TOPIC_META[id].code, title: ECON_TOPIC_META[id].title }),
    );
  } else {
    ranked = rankMastery(
      Object.keys(PROB_TOPIC_META) as ProbTopicId[],
      progress.probMastery,
      (id) => ({ code: PROB_TOPIC_META[id].code, title: PROB_TOPIC_META[id].title }),
    );
  }

  const top = ranked[0];
  const topLabel = top ? `${top.code} (${top.attempts > 0 ? `${top.pct}%` : 'not yet drilled'})` : '';
  const summaryEn =
    dueMistakes.length > 0
      ? `Prioritizing ${dueMistakes.length} Review Bank mistake${dueMistakes.length > 1 ? 's' : ''} + weakest area: ${topLabel}.`
      : `Targeted 8-question drill prioritizing your weakest area: ${topLabel}.`;
  const summaryVi =
    dueMistakes.length > 0
      ? `Ưu tiên ${dueMistakes.length} câu sai trong Review Bank + phần yếu nhất: ${topLabel}.`
      : `Luyện tập trung 8 câu nhắm đúng phần yếu nhất của bạn: ${topLabel}.`;

  return {
    weakestTopics: ranked,
    dueMistakesCount: dueMistakes.length,
    summaryEn,
    summaryVi,
  };
}
