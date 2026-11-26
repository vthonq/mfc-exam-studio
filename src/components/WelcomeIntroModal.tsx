import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FlaskConical,
  Scale,
  Search,
  Sparkles,
  Table2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { SubjectId } from '../types';

export const INTRO_SEEN_KEY = 'exam_studio_intro_seen_v1';

interface WelcomeIntroModalProps {
  open: boolean;
  onClose: () => void;
  activeSubject: SubjectId;
  onSelectSubject: (subject: SubjectId) => void;
  onOpenGuide: () => void;
  onOpenTutor: () => void;
}

const SUBJECT_CARDS: Array<{
  id: SubjectId;
  title: string;
  tag: string;
  descEn: string;
  descVi: string;
  icon: React.ComponentType<{ className?: string }>;
  activeCls: string;
  badgeCls: string;
}> = [
  {
    id: 'mfc',
    title: 'Math for Computing',
    tag: 'MFC · Ch. 1, 4, 9–12',
    descEn: 'Logic, Number Theory, Relations, Dijkstra/MST, K-Maps & Proofs Trainer.',
    descVi: 'Logic, Số học, Quan hệ, Đồ thị, Bìa K-Map & Luyện chứng minh.',
    icon: Scale,
    activeCls:
      'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/25',
    badgeCls: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    id: 'econ',
    title: 'Principles of Econ',
    tag: 'ECO101 · Parts 6–9',
    descEn: 'GDP/CPI, Loanable Funds, Money & MV=PY, Open-Economy & AD–AS Shocks.',
    descVi: 'GDP/CPI, Vốn vay, Tiền tệ, Kinh tế mở & Cú sốc AD–AS / Phillips.',
    icon: TrendingUp,
    activeCls:
      'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-500/25',
    badgeCls: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'probstat',
    title: 'Prob & Statistics',
    tag: 'Ch. 1–5 · SB Tables',
    descEn: 'Distributions, 13-page Interactive SB Tables (C-1 to F), CIs & Tests.',
    descVi: 'Phân phối, 13 trang Phụ lục SB tương tác, Ước lượng & Kiểm định.',
    icon: BarChart3,
    activeCls:
      'border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 ring-2 ring-sky-500/25',
    badgeCls: 'text-sky-700 dark:text-sky-300',
  },
];

export const WelcomeIntroModal: React.FC<WelcomeIntroModalProps> = ({
  open,
  onClose,
  activeSubject,
  onSelectSubject,
  onOpenGuide,
  onOpenTutor,
}) => {
  const { settings, setLang } = useApp();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const bilingual = settings.lang === 'bilingual';

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="animate-fade-in bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Exam Studio Hub"
      >
        {/* Top Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="./logo.gif"
              alt="Exam Studio Logo"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/40 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <div className="font-extrabold text-base tracking-tight truncate">
                Welcome to Exam Studio Hub
              </div>
              <div className="text-xs text-indigo-100 truncate">
                {bilingual
                  ? 'Giới thiệu nhanh Web Ôn Thi 3 Môn UEH-ISB (3 bước)'
                  : 'Quick 3-Step Tour of Your 3-Subject Exam Prep Studio'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setLang(bilingual ? 'en' : 'bilingual')}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold cursor-pointer transition-colors"
              title="Toggle EN + VI / EN Only"
            >
              {bilingual ? '🌐 EN+VI' : '🌐 EN'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 cursor-pointer transition-colors"
              aria-label="Close Welcome Intro"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {bilingual
                    ? '1. Chọn môn bạn muốn ôn trước / Pick Your Active Subject'
                    : '1. Everything Organized Into 3 Focused Studios'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {bilingual
                    ? 'Bạn có thể chuyển nhanh giữa 3 môn bất cứ lúc nào trên Sidebar (hoặc thanh trên cùng trên điện thoại). Nhấn thử một môn bên dưới để bắt đầu:'
                    : 'Switch effortlessly between all 3 courses anytime from the sidebar. Click a subject below to jump right in:'}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {SUBJECT_CARDS.map((card) => {
                  const Icon = card.icon;
                  const active = activeSubject === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => onSelectSubject(card.id)}
                      className={`text-left rounded-2xl border p-4 space-y-2 transition-all cursor-pointer ${
                        active
                          ? card.activeCls
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Icon className={`w-5 h-5 ${card.badgeCls}`} />
                        {active && (
                          <CheckCircle2 className={`w-4 h-4 ${card.badgeCls} shrink-0`} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {card.title}
                        </div>
                        <div className={`text-[10px] font-mono font-semibold ${card.badgeCls}`}>
                          {card.tag}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {bilingual ? card.descVi : card.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {bilingual
                    ? '2. Học qua Thực hành, Tra bảng & Đọc nhanh A4'
                    : '2. Learn by Doing: Interactive Labs, Tables & A4 Notes'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {bilingual
                    ? 'Không chỉ đọc lý thuyết khô khan — mọi thuật toán, đường cong vĩ mô và bảng tra xác suất đều chạy tương tác từng bước:'
                    : 'Designed around actual UEH-ISB exam formats so you practice the exact steps graded on paper:'}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Step-by-Step Exam Trainers
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {bilingual
                        ? 'Tự điền bảng ExtGCD/ModExp, click ma trận Warshall W_k, kiểm tra gom nhóm K-Map, đoán chiều cú sốc Vĩ mô (↑/↓) và điền bảng GDP.'
                        : 'Fill blank ExtGCD/ModExp tables, click Warshall W_k cells, validate K-Map groups, and drill Mankiw Macro Shocks & T-Accounts.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Table2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      13-Page Interactive SB Tables &amp; Curve Graphs
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {bilingual
                        ? 'Tra trực tiếp Phụ lục C-1 đến F có đồ thị tô vùng Z/t/χ² + luyện tra bảng ngược, kèm biểu đồ AD–AS, Loanable Funds và Twin Markets.'
                        : 'Shaded Normal/t/χ² SB Appendices C-1 through F with reverse lookup + interactive Mankiw macro diagrams.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Global Search (Ctrl+K) &amp; Printable A4 Cheat Sheets
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {bilingual
                        ? 'Nhấn Ctrl+K (⌘K) để nhảy tới mọi công thức/bẫy thi, hoặc bấm Print / A4 PDF trong Knowledge Base để xuất phiếu ôn thi chuẩn A4.'
                        : 'Press Ctrl+K / ⌘K to jump straight to any formula or trap across all 3 subjects, and print clean A4 PDF formula sheets.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {bilingual
                    ? '3. Thi thử cùng Nhóm, Lưu câu sai & Trợ lý AI'
                    : '3. Group Mock Exams, Mistakes Bank & Built-In AI'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {bilingual
                    ? 'Luyện thi như thật với đồng hồ nổi, đồng bộ tiến độ qua Google Account và hỏi AI bất cứ lúc nào:'
                    : 'Simulate real exam conditions, keep mistakes automatically organized, and study with your own AI:'}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Seeded Group Mock Exams + Sticky Timer HUD
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {bilingual
                        ? 'Gửi link Seed để cả nhóm giải chung một đề thi ngẫu nhiên y hệt nhau; bài làm & đồng hồ tự động lưu nếu lỡ tải lại trang.'
                        : 'Share a Group Seed link so everyone solves the exact same generated exam paper, with auto-save drafts and a sticky timer HUD.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <BookmarkCheck className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Auto Review Bank &amp; Cloud Progress Sync
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {bilingual
                        ? 'Câu làm sai được lưu vào mục Review để làm lại đến khi đúng; tiến độ được đồng bộ lên Cloud giữa máy tính và điện thoại.'
                        : 'Missed exam & drill questions land in your Review Bank automatically, while mastery & history sync across devices.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-sky-50/80 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-200 dark:border-indigo-800/70">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-indigo-950 dark:text-indigo-100">
                      My Gemini AI (Key or No-Key Web Handoff)
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {bilingual
                        ? 'Dùng API key miễn phí (lưu tại trình duyệt) để chat & dán ảnh (Ctrl+V), hoặc dùng tab No-Key (Web Gemini / Auto-Fill ChatGPT & Claude) đính kèm sẵn công thức của web!'
                        : 'Chat & paste screenshots (Ctrl+V) in-app with your free Google AI Studio key, OR use the No-Key Web tab (Gemini / Auto-Fill ChatGPT & Claude) with website notes attached!'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGuide();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Open Full Guide (VI)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTutor();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Try My Gemini AI →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            Skip Intro
          </button>

          {/* Progress Dots */}
          <div className="flex items-center gap-1.5" aria-label="Intro step indicator">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                aria-label={`Step ${i + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  step === i
                    ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(2, s + 1))}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs cursor-pointer"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer"
              >
                Start Studying
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
