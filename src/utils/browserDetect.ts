const IN_APP_UA_REGEX =
  /(Zalo|FBAN|FBAV|FBIOS|Messenger|Instagram|Line\/|BytedanceWebview|Musical_ly|TikTok|;\s*wv\))/i;

export function isInAppBrowser(ua?: string): boolean {
  const source =
    ua !== undefined ? ua : typeof navigator !== 'undefined' ? navigator.userAgent : '';
  return IN_APP_UA_REGEX.test(source);
}

export function extractMillis(ts: unknown): number | null {
  if (!ts) return null;
  if (typeof ts === 'number' && Number.isFinite(ts)) return ts;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === 'object') {
    const obj = ts as { toMillis?: () => number; seconds?: number };
    if (typeof obj.toMillis === 'function') {
      const m = obj.toMillis();
      return Number.isFinite(m) ? m : null;
    }
    if (typeof obj.seconds === 'number' && Number.isFinite(obj.seconds)) {
      return obj.seconds * 1000;
    }
  }
  return null;
}

export function formatRelativeTime(ts: unknown, nowMs: number = Date.now()): string {
  const ms = extractMillis(ts);
  if (ms === null) return '—';
  const diffSec = Math.max(0, Math.floor((nowMs - ms) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 14) return `${diffDay}d ago`;
  return new Date(ms).toLocaleDateString();
}
