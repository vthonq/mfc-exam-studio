import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Clock,
  Copy,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { randomSeedCode } from '../math/prng';
import {
  createStudyRoom,
  deleteStudyRoom,
  fetchStudyRoom,
  listRecentStudyRooms,
  setStudyRoomStatus,
  subscribeRoomSubmissions,
  subscribeStudyRoom,
} from '../services/studyRooms';
import { dispatchAskAi } from '../utils/askAiBridge';
import {
  buildRoomInviteUrl,
  computeMissedHeatmap,
  formatElapsed,
  normalizeRoomCode,
  rankRoomLeaderboard,
  type RoomSubmissionDoc,
  type StudyRoomDoc,
} from '../utils/studyRoomStats';
import type { EconPageRoute, PageRoute, ProbPageRoute, SubjectId } from '../types';

interface StudyRoomsModalProps {
  open: boolean;
  onClose: () => void;
  initialSubject: SubjectId;
  initialRoomCode?: string | null;
  onNavigateMfc: (route: PageRoute, query?: string) => void;
  onNavigateEcon: (route: EconPageRoute, query?: string) => void;
  onNavigateProb: (route: ProbPageRoute, query?: string) => void;
}

const MODE_OPTIONS: Record<SubjectId, Array<{ id: string; label: string }>> = {
  mfc: [
    { id: 'full', label: 'Full Final (90m)' },
    { id: 'sprint', label: '30m Sprint' },
  ],
  econ: [
    { id: 'final', label: 'ECO101 Final (100m)' },
    { id: 'quiz3', label: 'Quiz 3 (Part 6)' },
    { id: 'quiz4', label: 'Quiz 4 (Parts 7–8)' },
    { id: 'quiz5', label: 'Quiz 5 (Part 9)' },
  ],
  probstat: [
    { id: 'final', label: 'Written Final (100m · 5 Qs)' },
    { id: 'midterm', label: 'Midterm (60m · 20 MCQs)' },
  ],
};

const SUBJ_BADGE: Record<SubjectId, { label: string; cls: string }> = {
  mfc: {
    label: 'MFC',
    cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  },
  econ: {
    label: 'Economics',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  },
  probstat: {
    label: 'Prob & Stat',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300',
  },
};

export const StudyRoomsModal: React.FC<StudyRoomsModalProps> = ({
  open,
  onClose,
  initialSubject,
  initialRoomCode,
  onNavigateMfc,
  onNavigateEcon,
  onNavigateProb,
}) => {
  const { firebaseUser, profile, isAdmin } = useAuth();

  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [roomDoc, setRoomDoc] = useState<StudyRoomDoc | null>(null);
  const [submissions, setSubmissions] = useState<RoomSubmissionDoc[]>([]);

  const [recentRooms, setRecentRooms] = useState<StudyRoomDoc[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createSubject, setCreateSubject] = useState<SubjectId>(initialSubject);
  const [createMode, setCreateMode] = useState<string>(MODE_OPTIONS[initialSubject][0].id);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const loadLobby = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await listRecentStudyRooms(8);
      setRecentRooms(list);
    } catch {
      // ignore initial list failure if rules not yet created
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    setCreateSubject(initialSubject);
    setCreateMode(MODE_OPTIONS[initialSubject][0].id);
    if (initialRoomCode) {
      setActiveRoomCode(normalizeRoomCode(initialRoomCode));
    } else {
      setActiveRoomCode(null);
      void loadLobby();
    }
  }, [open, initialSubject, initialRoomCode, loadLobby]);

  useEffect(() => {
    if (!open || !activeRoomCode) return;
    setErrorMsg(null);
    setSubmissions([]);
    setRoomDoc((prev) => (prev && prev.roomCode === activeRoomCode ? prev : null));
    const unsubRoom = subscribeStudyRoom(
      activeRoomCode,
      (r) => {
        setRoomDoc(r);
        if (!r) {
          setErrorMsg(`Study room "${activeRoomCode}" no longer exists.`);
        }
      },
      (err) => setErrorMsg(err.message),
    );
    const unsubSubs = subscribeRoomSubmissions(
      activeRoomCode,
      (subs) => setSubmissions(subs),
      (err) => setErrorMsg(err.message),
    );
    return () => {
      unsubRoom();
      unsubSubs();
    };
  }, [open, activeRoomCode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const ranked = useMemo(() => rankRoomLeaderboard(submissions), [submissions]);
  const heatmap = useMemo(() => computeMissedHeatmap(submissions), [submissions]);

  if (!open) return null;

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = normalizeRoomCode(joinCodeInput);
    if (code.length < 4) {
      setErrorMsg('Enter a valid room code (at least 4 characters, e.g. ISB-7K2M).');
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const found = await fetchStudyRoom(code);
      if (!found) {
        setErrorMsg(`No study room found with code "${code}".`);
      } else {
        setActiveRoomCode(found.roomCode);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to join room.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) {
      setErrorMsg('Sign in with Google first to host a class Study Room.');
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      const created = await createStudyRoom({
        title:
          createTitle.trim() ||
          `${SUBJ_BADGE[createSubject].label} Class Session`,
        subject: createSubject,
        mode: createMode,
        seed: randomSeedCode(),
        hostUid: firebaseUser.uid,
        hostName: profile?.displayName || firebaseUser.email || 'Host',
      });
      setRoomDoc(created);
      setActiveRoomCode(created.roomCode);
      setCreateTitle('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not create study room.');
    } finally {
      setBusy(false);
    }
  };

  const openExamPaper = (room: StudyRoomDoc) => {
    const code = encodeURIComponent(room.roomCode);
    const seed = encodeURIComponent(room.seed);
    onClose();
    if (room.subject === 'mfc') {
      const modePart = room.mode === 'sprint' ? '&mode=sprint' : '';
      onNavigateMfc('exam', `seed=${seed}${modePart}&room=${code}`);
    } else if (room.subject === 'econ') {
      onNavigateEcon('exam', `seed=${seed}&mode=${encodeURIComponent(room.mode)}&room=${code}`);
    } else {
      onNavigateProb('exam', `seed=${seed}&mode=${encodeURIComponent(room.mode)}&room=${code}`);
    }
  };

  const copyInviteLink = async (room: StudyRoomDoc) => {
    try {
      const url = buildRoomInviteUrl(window.location.href, room);
      await navigator.clipboard.writeText(url);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const canManageRoom = Boolean(
    roomDoc && (isAdmin || (firebaseUser && roomDoc.hostUid === firebaseUser.uid)),
  );

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in studio-card rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Live Class Study Rooms"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {activeRoomCode && (
              <button
                type="button"
                onClick={() => {
                  setActiveRoomCode(null);
                  setRoomDoc(null);
                  setSubmissions([]);
                  setErrorMsg(null);
                  void loadLobby();
                }}
                className="p-1.5 rounded-lg border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer shrink-0"
                title="Back to Study Rooms Lobby"
                aria-label="Back to Study Rooms Lobby"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                {activeRoomCode ? roomDoc?.title || `Room ${activeRoomCode}` : 'Live Class Study Rooms'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeRoomCode
                  ? 'Real-time class leaderboard & hardest-question heatmap'
                  : 'Solve the exact same mock paper with friends & track hardest traps live'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 cursor-pointer"
            aria-label="Close Study Rooms"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {!activeRoomCode ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Join Room */}
                <form
                  onSubmit={(e) => void handleJoinByCode(e)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3"
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Join by Room Code
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Have a room code from a classmate (like <code className="font-mono">ISB-7K2M</code>)? Enter it to open the shared paper and live scoreboard.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(normalizeRoomCode(e.target.value))}
                      placeholder="ISB-7K2M"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs uppercase"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold cursor-pointer"
                    >
                      Join
                    </button>
                  </div>
                </form>

                {/* Create Room */}
                <form
                  onSubmit={(e) => void handleCreateRoom(e)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3"
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    Host a New Study Room
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800">
                    {(['mfc', 'econ', 'probstat'] as const).map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setCreateSubject(subj);
                          setCreateMode(MODE_OPTIONS[subj][0].id);
                        }}
                        className={`py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                          createSubject === subj
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {SUBJ_BADGE[subj].label}
                      </button>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <select
                      value={createMode}
                      onChange={(e) => setCreateMode(e.target.value)}
                      className="px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      {MODE_OPTIONS[createSubject].map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      placeholder="Room title (optional)..."
                      maxLength={80}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Create &amp; Open Room
                  </button>
                </form>
              </div>

              {/* Recent Rooms */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Recent Class Rooms
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadLobby()}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {loadingList ? (
                  <div className="py-6 text-center text-slate-400 inline-flex items-center justify-center gap-2 w-full">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading rooms...
                  </div>
                ) : recentRooms.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                    No active rooms yet — create the first Study Room for your group above!
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {recentRooms.map((r) => (
                      <button
                        key={r.roomCode}
                        type="button"
                        onClick={() => setActiveRoomCode(r.roomCode)}
                        className="text-left p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-indigo-400 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${SUBJ_BADGE[r.subject].cls}`}>
                              {SUBJ_BADGE[r.subject].label}
                            </span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                              {r.roomCode}
                            </span>
                            {r.status === 'closed' && (
                              <span className="text-[10px] text-amber-600 font-semibold">Closed</span>
                            )}
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white truncate">{r.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Host: {r.hostName} · Seed {r.seed}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : roomDoc ? (
            <>
              {/* Room Summary & Quick Actions */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${SUBJ_BADGE[roomDoc.subject].cls}`}>
                      {SUBJ_BADGE[roomDoc.subject].label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold">
                      {roomDoc.roomCode}
                    </span>
                    <span className="text-slate-500 font-mono">
                      Seed: {roomDoc.seed} · {roomDoc.mode.toUpperCase()}
                    </span>
                    {roomDoc.status === 'closed' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hosted by <strong>{roomDoc.hostName}</strong> · {submissions.length} participant
                    {submissions.length === 1 ? '' : 's'} submitted
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copyInviteLink(roomDoc)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedInvite ? 'Invite Copied!' : 'Copy Invite Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => openExamPaper(roomDoc)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Open Exam Paper
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {canManageRoom && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          void setStudyRoomStatus(
                            roomDoc.roomCode,
                            roomDoc.status === 'open' ? 'closed' : 'open',
                          )
                        }
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title={roomDoc.status === 'open' ? 'Close room' : 'Reopen room'}
                      >
                        {roomDoc.status === 'open' ? (
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete room ${roomDoc.roomCode}?`)) {
                            void deleteStudyRoom(roomDoc.roomCode).then(() => setActiveRoomCode(null));
                          }
                        }}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete study room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-4">
                {/* Live Leaderboard */}
                <div className="md:col-span-7 space-y-2.5">
                  <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Live Leaderboard ({ranked.length})
                  </div>

                  {ranked.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                      No scores submitted yet. Click <strong>Open Exam Paper</strong> to solve &amp; submit first!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ranked.map((row) => {
                        const isMe = Boolean(firebaseUser && row.uid === firebaseUser.uid);
                        return (
                          <div
                            key={row.uid}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                              isMe
                                ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                  row.rank === 1
                                    ? 'bg-amber-400 text-slate-950'
                                    : row.rank === 2
                                      ? 'bg-slate-300 text-slate-900'
                                      : row.rank === 3
                                        ? 'bg-amber-700 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {row.rank}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white truncate">
                                  {row.displayName}{' '}
                                  {isMe && <span className="text-[10px] text-indigo-600 dark:text-indigo-400">(You)</span>}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatElapsed(row.elapsedSeconds)} ·{' '}
                                  {row.missedLabels.length} missed
                                </div>
                              </div>
                            </div>

                            <div className="text-right font-mono shrink-0">
                              <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                                {row.pct}%
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {row.score}/{row.maxScore}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hardest-Question Heatmap */}
                <div className="md:col-span-5 space-y-2.5">
                  <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-rose-500" />
                    Hardest Questions Heatmap
                  </div>

                  {heatmap.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                      Once classmates submit, common missed topics appear here automatically.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {heatmap.slice(0, 12).map((item) => (
                        <div
                          key={item.label}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                              {item.label}
                            </span>
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                              {item.missPct}% ({item.missCount}/{submissions.length})
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-rose-500"
                              style={{ width: `${item.missPct}%` }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              dispatchAskAi({
                                subject: roomDoc.subject,
                                prompt: `In our Study Room (${roomDoc.roomCode}), ${item.missPct}% of students missed "${item.label}". Explain this concept/topic clearly, walk through the most common mistake, and give a quick exam tip.`,
                              });
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            Explain with AI
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-slate-400 inline-flex items-center justify-center gap-2 w-full">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading room {activeRoomCode}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
