import type { SubjectId } from '../types';

export const OPEN_ROOM_EVENT = 'exam-studio:open-room';

export function dispatchOpenRoom(roomCode?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<{ roomCode?: string }>(OPEN_ROOM_EVENT, { detail: { roomCode } }),
  );
}

export interface StudyRoomDoc {
  roomCode: string;
  title: string;
  subject: SubjectId;
  mode: string;
  seed: string;
  hostUid: string;
  hostName: string;
  status: 'open' | 'closed';
  createdAt?: unknown;
}

export interface RoomSubmissionDoc {
  uid: string;
  displayName: string;
  score: number;
  maxScore: number;
  pct: number;
  elapsedSeconds: number;
  missedLabels: string[];
  submittedAt?: unknown;
}

export interface RankedRoomSubmission extends RoomSubmissionDoc {
  rank: number;
}

export interface MissedTopicStat {
  label: string;
  missCount: number;
  missPct: number;
}

export function normalizeRoomCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '')
    .slice(0, 16);
}

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(rng = Math.random): string {
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += ROOM_ALPHABET[Math.floor(rng() * ROOM_ALPHABET.length)];
  }
  return `ISB-${suffix}`;
}

export function buildRoomInviteUrl(
  baseUrl: string,
  room: { roomCode: string; subject: SubjectId; seed: string; mode: string },
): string {
  const cleanBase = baseUrl.split('#')[0];
  const code = encodeURIComponent(normalizeRoomCode(room.roomCode));
  const seed = encodeURIComponent(room.seed);
  if (room.subject === 'mfc') {
    const modePart = room.mode === 'sprint' ? '&mode=sprint' : '';
    return `${cleanBase}#/exam?seed=${seed}${modePart}&room=${code}`;
  }
  const mode = encodeURIComponent(room.mode);
  if (room.subject === 'econ') {
    return `${cleanBase}#/econ/exam?seed=${seed}&mode=${mode}&room=${code}`;
  }
  return `${cleanBase}#/probstat/exam?seed=${seed}&mode=${mode}&room=${code}`;
}

export function rankRoomLeaderboard(submissions: RoomSubmissionDoc[]): RankedRoomSubmission[] {
  const sorted = [...submissions].sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    if (b.score !== a.score) return b.score - a.score;
    return a.elapsedSeconds - b.elapsedSeconds;
  });
  return sorted.map((s, idx) => ({ ...s, rank: idx + 1 }));
}

export function computeMissedHeatmap(submissions: RoomSubmissionDoc[]): MissedTopicStat[] {
  const total = submissions.length;
  if (total === 0) return [];
  const counts = new Map<string, number>();
  for (const sub of submissions) {
    const uniquePerStudent = new Set(
      (sub.missedLabels ?? []).map((lbl) => lbl.trim()).filter(Boolean),
    );
    for (const lbl of uniquePerStudent) {
      counts.set(lbl, (counts.get(lbl) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, missCount]) => ({
      label,
      missCount,
      missPct: Math.round((missCount / total) * 100),
    }))
    .sort((a, b) => b.missCount - a.missCount || a.label.localeCompare(b.label));
}

export function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
