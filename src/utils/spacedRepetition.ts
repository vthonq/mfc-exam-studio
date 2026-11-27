import type { CustomFlashcard, SrsCardState, SrsRating } from '../types';

export const DAY_MS = 86_400_000;

export function reviewSrsCard(
  prev: SrsCardState | undefined,
  rating: SrsRating,
  nowMs = Date.now(),
): SrsCardState {
  const ease = prev?.ease ?? 2.5;
  const prevReps = prev?.reps ?? 0;
  const prevInterval = prev?.intervalDays ?? 0;

  if (rating === 'again') {
    return {
      reps: 0,
      intervalDays: 0,
      ease: Math.max(1.3, Number((ease - 0.2).toFixed(2))),
      dueAtMs: nowMs,
      lastRatedAtMs: nowMs,
    };
  }

  if (rating === 'hard') {
    const intervalDays =
      prevReps === 0 ? 0.5 : Math.max(1, Math.round(prevInterval * 1.2));
    return {
      reps: Math.max(1, prevReps),
      intervalDays,
      ease: Math.max(1.3, Number((ease - 0.15).toFixed(2))),
      dueAtMs: nowMs + Math.round(intervalDays * DAY_MS),
      lastRatedAtMs: nowMs,
    };
  }

  if (rating === 'good') {
    const reps = prevReps + 1;
    const intervalDays =
      prevReps === 0
        ? 1
        : prevReps === 1
          ? 3
          : Math.max(4, Math.round(prevInterval * ease));
    return {
      reps,
      intervalDays,
      ease,
      dueAtMs: nowMs + Math.round(intervalDays * DAY_MS),
      lastRatedAtMs: nowMs,
    };
  }

  // 'easy'
  const reps = prevReps + 1;
  const intervalDays =
    prevReps === 0 ? 4 : Math.max(4, Math.round(prevInterval * ease * 1.3));
  return {
    reps,
    intervalDays,
    ease: Math.min(2.8, Number((ease + 0.15).toFixed(2))),
    dueAtMs: nowMs + Math.round(intervalDays * DAY_MS),
    lastRatedAtMs: nowMs,
  };
}

export function isCardDue(state: SrsCardState | undefined, nowMs = Date.now()): boolean {
  if (!state) return true;
  return state.dueAtMs <= nowMs;
}

export function formatNextInterval(prev: SrsCardState | undefined, rating: SrsRating): string {
  const next = reviewSrsCard(prev, rating, 0);
  if (next.intervalDays <= 0) return 'Now';
  if (next.intervalDays < 1) return '12h';
  return `${Math.round(next.intervalDays)}d`;
}

export function serializeCustomDeckJson(cards: CustomFlashcard[]): string {
  const compact = cards.map((c) => ({
    badge: c.badge,
    front: c.front,
    back: c.back,
    ...(c.trap ? { trap: c.trap } : {}),
  }));
  return JSON.stringify(compact, null, 2);
}
