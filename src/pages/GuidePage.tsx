import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  Compass,
  Lightbulb,
  Scale,
  Settings,
  Table2,
  TrendingUp,
} from 'lucide-react';
import type { EconPageRoute, PageRoute, ProbPageRoute } from '../types';
import { RichMathText } from '../components/Math';

interface GuidePageProps {
  onNavigateMfc: (route: PageRoute, query?: string) => void;
  onNavigateEcon: (route: EconPageRoute, query?: string) => void;
  onNavigateProb: (route: ProbPageRoute, query?: string) => void;
}

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const GuidePage: React.FC<GuidePageProps> = ({
  onNavigateMfc,
  onNavigateEcon,
  onNavigateProb,
}) => {
  return (
    <div className="space-y-6">
      {/* Header + Quick Jump */}
      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/70 bg-gradient-to-br from-amber-50 via-white to-sky-50 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 mb-2">
              <Compass className="w-3.5 h-3.5" />
              HƯỚNG DẪN SỬ DỤNG NHANH
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Guide — Cách dùng Exam Studio Hub cho cả 3 môn
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Tóm tắt ngắn gọn từng mục trên web để bạn vào thẳng đúng công cụ cần ôn.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => scrollToSection('guide-mfc')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" /> MFC
            </button>
            <button
              onClick={() => scrollToSection('guide-econ')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Economics
            </button>
            <button
              onClick={() => scrollToSection('guide-probstat')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 cursor-pointer flex items-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Prob &amp; Stat
            </button>
          </div>
        </div>
      </div>

      {/* 1. Common Tools */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Settings className="w-4 h-4 text-slate-500" />
          1. Công cụ chung (Sidebar &amp; Cài đặt)
        </h2>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
          <li>
            <strong>Select Subject:</strong> Chuyển nhanh giữa 3 môn (<code className="font-mono text-xs">Math for Computing</code>,{' '}
            <code className="font-mono text-xs">Principles of Econ</code>, <code className="font-mono text-xs">Prob &amp; Statistics</code>) ở menu trái hoặc thanh trên cùng điện thoại.
          </li>
          <li>
            <strong>🌐 EN + VI / EN Only, ☀️/🌙, Share Study App URL:</strong> Bật/tắt phụ đề tiếng Việt, đổi chế độ Sáng/Tối và sao chép link web.
          </li>
          <li>
            <strong>Settings (⚙️) — 3 cách chấm tự luận:</strong>{' '}
            <code className="font-mono text-xs">Instant Offline Check</code> (chấm nhanh không cần mạng),{' '}
            <code className="font-mono text-xs">Copy Prompt</code> (dán vào ChatGPT/Gemini miễn phí), hoặc dán{' '}
            <code className="font-mono text-xs">Gemini API Key</code> (chọn <code className="font-mono text-xs">Gemini 4 Hydrogen / Argon / Carbon</code>).
          </li>
          <li>
            <strong>Sao lưu tiến độ:</strong> Dùng <code className="font-mono text-xs">Export JSON</code> /{' '}
            <code className="font-mono text-xs">Import JSON</code> / <code className="font-mono text-xs">Reset Progress</code> vì điểm và lịch sử chỉ lưu cục bộ trên trình duyệt.
          </li>
        </ul>
      </section>

      {/* 2. MFC */}
      <section
        id="guide-mfc"
        className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-5 space-y-3 scroll-mt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Scale className="w-4 h-4" />
            2. Môn 1: Math for Computing (MFC)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onNavigateMfc('labs')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              Mở Practice Labs <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateMfc('proofs')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              Proofs Trainer <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateMfc('exam')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
            >
              Mock Final Exam <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Dashboard (Tổng quan)</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Xem điểm thành thạo từng chương &amp; lịch sử thi thử.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Practice Labs (5 tab)</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Logic &amp; Truth Tables (Ch.1), Number Theory &amp; Crypto (Ch.4), Relations &amp; Posets (Ch.9), Graphs &amp; Trees (Ch.10–11), Boolean &amp; K-Maps (Ch.12).
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Proofs Trainer (Luyện chứng minh)</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Luyện chứng minh Toán rời rạc với 3 chế độ chấm (Offline / Copy Prompt / Gemini API).</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Assignments 1–4 &amp; Knowledge Base</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Ôn và đánh dấu xong 4 bộ assignment; tra tóm tắt &amp; từ điển từng chương.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 sm:col-span-2">
            <div className="font-semibold text-slate-900 dark:text-white">Mock Final Exam (Thi thử cuối kỳ)</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Thi thử bấm giờ theo mã <code className="font-mono">Seed</code>; nộp bài để xem bảng tổng kết điểm theo từng chương &amp; chấm câu chứng minh.</div>
          </div>
        </div>
      </section>

      {/* 3. Economics */}
      <section
        id="guide-econ"
        className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 p-5 space-y-3 scroll-mt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-4 h-4" />
              3. Môn 2: Principles of Economics (Macro Final — ECO101)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trọng tâm ôn thi cuối kỳ Kinh tế Vĩ mô (Mankiw Part 6–9, Ch.23–35).
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onNavigateEcon('labs')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer flex items-center gap-1"
            >
              Mở Econ Simulators <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateEcon('exam')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
            >
              Mock Econ Exam <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Econ Dashboard</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Theo dõi tiến độ Part 6–9 &amp; vào nhanh từng chủ đề.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Econ Simulators (4 tab)</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              <RichMathText text="Part 6 (GDP, CPI, lãi suất thực, tiết kiệm, thất nghiệp); Part 7 (Số nhân tiền, đòn bẩy, $MV = PY$); Part 8 (Kinh tế mở, đồ thị Twin Markets); Part 9 (Đồ thị AD–AS, số nhân MPC, Phillips Curve)." />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">MCQs &amp; Policy Drills</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Luyện trắc nghiệm và tự luận phân tích chính sách kèm chấm bài.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Cheat Sheets &amp; Mock Econ Exam</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Công thức vĩ mô &amp; từ điển; thi thử <code className="font-mono">Final / Quiz 3–5</code> theo <code className="font-mono">Seed</code> (thang /100, tách Phần A/B &amp; từng Part).</div>
          </div>
        </div>
      </section>

      {/* 4. Prob & Statistics */}
      <section
        id="guide-probstat"
        className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-slate-900 p-5 space-y-3 scroll-mt-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold flex items-center gap-2 text-sky-700 dark:text-sky-300">
            <BarChart3 className="w-4 h-4" />
            4. Môn 3: Prob &amp; Statistics (Ch.1–5 · SB)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onNavigateProb('tables')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer flex items-center gap-1"
            >
              <Table2 className="w-3.5 h-3.5" /> Mở SB Stat Tables
            </button>
            <button
              onClick={() => onNavigateProb('labs')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 cursor-pointer flex items-center gap-1"
            >
              Stat Simulators <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateProb('exam')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 cursor-pointer flex items-center gap-1"
            >
              Mock Prob Exam <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Prob Dashboard &amp; Formula Sheets</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Theo dõi tiến độ Ch.1–5; xem phiếu công thức A4 &amp; từ vựng Anh–Việt.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Stat Simulators (4 tab)</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Rời rạc (Ch.1), Liên tục Normal/Exp/Gamma (Ch.2), Bảng đồng thời 2 biến (Ch.3), CI / Kiểm định / Power (Ch.4–5).</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Problem Sets 1–5</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Luyện bài tập tự luận Chương 1–5, có kiểm tra đáp án số &amp; bài giải.</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">Mock Prob Exam</div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">2 chế độ: <strong>Midterm</strong> (60p, 20 MCQ) &amp; <strong>Final</strong> (100p, 5 tự luận Ch.1–5); có nút mở bảng SB ngay trong bài thi.</div>
          </div>
        </div>

        <div className="rounded-xl border border-sky-200 dark:border-sky-800/70 bg-sky-50/70 dark:bg-sky-950/30 p-3.5 space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wide text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5" />
            Mẹo dùng nhanh SB Stat Tables (13 trang Phụ lục, tr. 767–779 — có đồ thị &amp; Table Drill)
          </div>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li>
              <strong>App. C-1 (tr. 767):</strong>{' '}
              <RichMathText text="Tra $P(0 \le Z \le z)$ hoặc nhập diện tích để tra ngược ra $z$." />
            </li>
            <li>
              <strong>App. C-2 (tr. 768–769):</strong>{' '}
              <RichMathText text="Tra tích lũy $\Phi(z) = P(Z \le z)$ (trái / phải / giữa / chế độ raw nhập $X, \mu, \sigma$) + tra ngược từ xác suất ra $z$." />
            </li>
            <li>
              <strong>App. D (tr. 770):</strong>{' '}
              <RichMathText text="Student's $t$ — chọn d.f. (gồm cả $\infty$) &amp; cột 1-tail/2-tail/CI; nhập $t_{\text{obs}}$ để xem khoảng p-value." />
            </li>
            <li>
              <strong>App. E (tr. 771):</strong>{' '}
              <RichMathText text="Chi-Square $\chi^2$ — tra 1 mốc hoặc bật chế độ CI để tô sáng cùng lúc 2 mốc đuôi cho khoảng tin cậy $\sigma^2$." />
            </li>
            <li>
              <strong>App. F (tr. 772–779):</strong>{' '}
              <RichMathText text="Phân phối $F$ — chọn $\alpha$ ($0.10, 0.05, 0.025, 0.01$), df1 (cột) và df2 (hàng)." />
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Quick study tips */}
      <section className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-bold text-slate-900 dark:text-white">Mẹo ôn thi nhanh</div>
          <p>
            1) Xem <strong>Knowledge / Cheat Sheets / Formula Sheets</strong> → 2) Tập trên{' '}
            <strong>Labs / SB Stat Tables</strong> → 3) Thi thử <strong>Mock Exam</strong> bấm giờ (chia sẻ mã{' '}
            <code className="font-mono text-xs">Seed</code> để thi cùng bạn) &amp; nhớ <strong>Export JSON</strong> định kỳ.
          </p>
        </div>
      </section>
    </div>
  );
};
