const DRAFT_PREFIX = 'exam_studio_draft_v1:';
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface StoredDraft<T> {
  savedAt: number;
  data: T;
}

export function saveExamDraft<T>(key: string, data: T): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const payload: StoredDraft<T> = {
      savedAt: Date.now(),
      data,
    };
    localStorage.setItem(`${DRAFT_PREFIX}${key}`, JSON.stringify(payload));
  } catch {
    // ignore quota or storage unavailability
  }
}

export function loadExamDraft<T>(
  key: string,
  maxAgeMs: number = DEFAULT_MAX_AGE_MS,
): T | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft<T>> | null;
    if (!parsed || typeof parsed.savedAt !== 'number' || !('data' in parsed)) {
      return null;
    }
    if (Date.now() - parsed.savedAt > maxAgeMs) {
      localStorage.removeItem(`${DRAFT_PREFIX}${key}`);
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

export function clearExamDraft(key: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(`${DRAFT_PREFIX}${key}`);
  } catch {
    // ignore storage errors
  }
}
