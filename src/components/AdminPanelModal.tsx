import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminDeleteUser,
  adminRecountApproved,
  adminSetUserStatus,
  fetchAccessConfig,
  listAllUsers,
  updateAccessSettings,
  type UserAccessStatus,
  type UserProfileDoc,
} from '../services/accessControl';

interface AdminPanelModalProps {
  open: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ open, onClose }) => {
  const { firebaseUser, accessConfig, setAccessConfigLocal, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfileDoc[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [maxUsersInput, setMaxUsersInput] = useState<string>(
    String(accessConfig?.maxUsers ?? 50),
  );
  const [regOpen, setRegOpen] = useState<boolean>(accessConfig?.registrationOpen ?? true);
  const [filterStatus, setFilterStatus] = useState<'all' | UserAccessStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const adminEmail = firebaseUser?.email || '';

  const loadData = useCallback(async () => {
    setLoadingList(true);
    setMsg(null);
    try {
      const [cfg, allUsers] = await Promise.all([fetchAccessConfig(), listAllUsers()]);
      if (cfg) {
        setAccessConfigLocal(cfg);
        setMaxUsersInput(String(cfg.maxUsers));
        setRegOpen(cfg.registrationOpen);
      }
      setUsers(allUsers);
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoadingList(false);
    }
  }, [setAccessConfigLocal]);

  useEffect(() => {
    if (open && isAdmin) {
      void loadData();
    }
  }, [open, isAdmin, loadData]);

  const counts = useMemo(() => {
    const students = users.filter((u) => u.role !== 'admin');
    return {
      approved: students.filter((u) => u.status === 'approved').length,
      waitlist: students.filter((u) => u.status === 'waitlist').length,
      banned: students.filter((u) => u.status === 'banned').length,
      total: users.length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (filterStatus !== 'all' && u.status !== filterStatus) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, filterStatus, searchQuery]);

  if (!open || !isAdmin) return null;

  const handleSaveSettings = async (nextRegOpen = regOpen) => {
    const parsedMax = Number(maxUsersInput);
    if (!Number.isFinite(parsedMax) || parsedMax < 0) {
      setMsg({ type: 'err', text: 'Max Users must be a valid number >= 0.' });
      return;
    }
    setSavingSettings(true);
    setMsg(null);
    try {
      const nextCfg = await updateAccessSettings({
        maxUsers: parsedMax,
        registrationOpen: nextRegOpen,
        updatedBy: adminEmail,
      });
      setAccessConfigLocal(nextCfg);
      setRegOpen(nextCfg.registrationOpen);
      setMaxUsersInput(String(nextCfg.maxUsers));
      setMsg({
        type: 'ok',
        text: `Saved: Max Users = ${nextCfg.maxUsers}, Auto-Join = ${nextCfg.registrationOpen ? 'OPEN' : 'PAUSED'}.`,
      });
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRecount = async () => {
    setSavingSettings(true);
    setMsg(null);
    try {
      const n = await adminRecountApproved(adminEmail);
      await loadData();
      setMsg({ type: 'ok', text: `Synced approved student count = ${n}.` });
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleStatusChange = async (uid: string, nextStatus: UserAccessStatus) => {
    setBusyId(uid);
    setMsg(null);
    try {
      await adminSetUserStatus(uid, nextStatus, adminEmail);
      await loadData();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (u: UserProfileDoc) => {
    if (!window.confirm(`Remove user ${u.email} from Firestore? They will be treated as a new user if they sign in again.`)) {
      return;
    }
    setBusyId(u.uid);
    setMsg(null);
    try {
      await adminDeleteUser(u.uid, adminEmail);
      await loadData();
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Class Security &amp; User Limit Admin Panel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Signed in as Admin: <span className="font-mono">{adminEmail}</span> (Admins always
              bypass student seat caps)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Approved Seats
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-900 dark:text-emerald-100">
                {accessConfig?.approvedCount ?? counts.approved} / {accessConfig?.maxUsers ?? maxUsersInput}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                Waitlist
              </div>
              <div className="text-xl font-extrabold font-mono text-amber-900 dark:text-amber-100">
                {counts.waitlist}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
              <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                Banned
              </div>
              <div className="text-xl font-extrabold font-mono text-rose-900 dark:text-rose-100">
                {counts.banned}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500">Total Accounts</div>
              <div className="text-xl font-extrabold font-mono">{counts.total}</div>
            </div>
          </div>

          {/* Cap & Auto-Approve Controls */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap items-end gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Max Students Allowed
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={maxUsersInput}
                    onChange={(e) => setMaxUsersInput(e.target.value)}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-sm font-bold"
                  />
                </div>
                <button
                  onClick={() => void handleSaveSettings()}
                  disabled={savingSettings}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                >
                  Save Max Cap
                </button>
                <button
                  onClick={() => void handleSaveSettings(!regOpen)}
                  disabled={savingSettings}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                    regOpen
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                  }`}
                >
                  Auto-Approve New Users: {regOpen ? 'ON' : 'PAUSED (Manual Only)'}
                </button>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => void handleRecount()}
                  disabled={savingSettings || loadingList}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  title="Recalculate exact approved student count from user documents"
                >
                  <Users className="w-3.5 h-3.5" /> Sync Count
                </button>
                <button
                  onClick={() => void loadData()}
                  disabled={loadingList}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />{' '}
                  Refresh
                </button>
              </div>
            </div>

            {msg && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium ${
                  msg.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(
                [
                  { id: 'all', label: `All (${users.length})` },
                  { id: 'approved', label: `Approved` },
                  { id: 'waitlist', label: `Waitlist (${counts.waitlist})` },
                  { id: 'banned', label: `Banned (${counts.banned})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name or email..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px]">
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">
                        {loadingList ? 'Loading users...' : 'No matching users found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isRowAdmin = u.role === 'admin';
                      const rowBusy = busyId === u.uid;
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="p-3">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {u.displayName || 'Unnamed User'}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">{u.email}</div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                isRowAdmin
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                u.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : u.status === 'waitlist'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                              }`}
                            >
                              {u.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                              {u.status === 'waitlist' && <Clock className="w-3 h-3" />}
                              {u.status === 'banned' && <Ban className="w-3 h-3" />}
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {isRowAdmin ? (
                              <span className="text-[11px] text-slate-400 italic">Protected Admin</span>
                            ) : (
                              <div className="inline-flex flex-wrap justify-end gap-1">
                                {u.status !== 'approved' && (
                                  <button
                                    disabled={rowBusy}
                                    onClick={() => void handleStatusChange(u.uid, 'approved')}
                                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                )}
                                {u.status !== 'waitlist' && (
                                  <button
                                    disabled={rowBusy}
                                    onClick={() => void handleStatusChange(u.uid, 'waitlist')}
                                    className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    Waitlist
                                  </button>
                                )}
                                {u.status !== 'banned' && (
                                  <button
                                    disabled={rowBusy}
                                    onClick={() => void handleStatusChange(u.uid, 'banned')}
                                    className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    Ban
                                  </button>
                                )}
                                <button
                                  disabled={rowBusy}
                                  onClick={() => void handleDelete(u)}
                                  className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300 cursor-pointer disabled:opacity-50"
                                  title="Remove user document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
