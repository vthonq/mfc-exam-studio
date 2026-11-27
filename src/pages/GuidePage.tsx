import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookmarkCheck,
  Calculator,
  Compass,
  Keyboard,
  Layers,
  Lightbulb,
  Scale,
  Search,
  Sparkles,
  Table2,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RichMathText } from '../components/Math';
import { dispatchAskAi } from '../utils/askAiBridge';
import { dispatchOpenFocus } from '../utils/smartFocusPlan';
import { dispatchOpenRoom } from '../utils/studyRoomStats';
import type { EconPageRoute, PageRoute, ProbPageRoute } from '../types';

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
  const { settings } = useApp();
  const bi = settings.lang === 'bilingual';

  return (
    <div className="space-y-6">
      {/* Header + Quick Jump */}
      <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/80 via-white to-sky-50/70 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950">
              <Compass className="w-3.5 h-3.5" />
              {bi ? 'HƯỚNG DẪN ĐẦY ĐỦ · STUDIO 5.0' : 'COMPLETE GUIDE · STUDIO 5.0'}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {bi
                ? 'Hướng dẫn dùng toàn bộ tính năng Exam Studio Hub (3 Môn)'
                : 'Complete Guide to Exam Studio Hub (MFC · Econ · ProbStat)'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Cập nhật Studio 5.0: Top Command Bar, 4 bảng màu (Obsidian, Paper, Forest, Indigo), Study Rooms thi nhóm trực tiếp, Smart Focus Drill, Exam Calc, Flashcards & My Deck, AI Tutor (có Key & No-Key) cùng 3 phòng lab.'
                : 'Updated Studio 5.0 walkthrough: Top Command Bar + 4 live palettes, Live Study Rooms, Smart Focus Drills, Show-Your-Work Exam Calc, Quick & Custom Flashcards, Built-in Gemini AI & Auto-Fill, plus all 3 course studios.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => scrollToSection('guide-tools')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 cursor-pointer"
          >
            1. Power Tools
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('guide-ai')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200 cursor-pointer"
          >
            2. AI Tutor &amp; Web Handoff
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('guide-mfc')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white cursor-pointer flex items-center gap-1"
          >
            <Scale className="w-3.5 h-3.5" /> MFC
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('guide-econ')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white cursor-pointer flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Economics
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('guide-probstat')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white cursor-pointer flex items-center gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5" /> ProbStat
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('guide-playbook')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 cursor-pointer"
          >
            Playbook &amp; Shortcuts
          </button>
        </div>
      </div>

      {/* 1. Studio Power Tools */}
      <section
        id="guide-tools"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 scroll-mt-28 md:scroll-mt-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {bi
              ? '1. Bộ Công Cụ Ôn Thi Toàn Cục (Sidebar Tools & Thanh Nổi)'
              : '1. Studio-Wide Power Tools (Sidebar Tools & Floating Dock)'}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => dispatchOpenRoom()}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              {bi ? 'Mở Study Rooms →' : 'Open Study Rooms →'}
            </button>
            <button
              type="button"
              onClick={() => dispatchOpenFocus()}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              {bi ? 'Chạy Smart Focus →' : 'Start Smart Focus →'}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
            <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 shrink-0" />
              Live Class Study Rooms (v4.0)
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Tạo phòng với mã (VD: ISB-7K2M) để cả nhóm làm chung 1 đề Mock Exam. Tự đồng bộ điểm lên Bảng xếp hạng trực tiếp + xem biểu đồ những câu cả lớp sai nhiều nhất.'
                : 'Host or join a shared room code (e.g. ISB-7K2M) so everyone takes the same paper, syncing live ranks, completion times & hardest-question miss heatmaps.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
            <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 shrink-0" />
              Exam Countdown &amp; Smart Focus (v3.0)
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Đặt ngày thi ngay trên Dashboard từng môn (đồng bộ Cloud), giữ chuỗi Study Streak và luyện bài tập 8 câu tự nhắm vào câu sai trong Review Bank & chương yếu nhất.'
                : 'Set target exam dates on each dashboard, track your study streak, and launch 8-question drills that prioritize Review Bank retries and weakest chapters.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calculator className="w-4 h-4 shrink-0 text-slate-500" />
              Show-Your-Work Exam Calc (v3.0)
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Nút "Calc" ở góc dưới phải: tính x̄, s², s, kiểm định t, CI, C(n,r) cho XSTK; a^b mod m, gcd, nghịch đảo, đổi cơ số cho MFC; % đổi, Fisher r & số nhân cho Kinh tế + Copy từng bước.'
                : 'Docked "Calc" pill at bottom-right: Sample stats/t-test/CI/nCr (ProbStat), mod-exp/gcd/inverse/bases (MFC), % change/Fisher/multipliers (Econ) with Copy Steps.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
            <div className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 shrink-0" />
              Flashcards &amp; My Custom Deck (v4.1)
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Ôn nhanh công thức, bẫy thi & thuật ngữ EN–VI (Space để lật thẻ). Tab "My Deck" cho phép tự thêm hoặc dán JSON / "Front :: Back" từ slide giảng viên (đồng bộ Cloud).'
                : 'Flip-card recall for formulas, exam traps & EN–VI glossary. Use "My Deck" to add or bulk-import AI JSON / "Front :: Back" cards from your own notes.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
            <div className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 shrink-0" />
              Review Bank &amp; Ctrl+K Search
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Câu làm sai khi thi thử tự lưu vào Review Bank để làm lại tới khi thành thạo. Nhấn Ctrl+K (⌘K) bất cứ lúc nào để nhảy nhanh tới mọi công thức, lab hoặc bảng SB.'
                : 'Missed mock exam & drill questions save automatically into Review Bank until mastered. Press Ctrl+K / ⌘K anytime to jump to any topic or SB Table.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-1">
            <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Search className="w-4 h-4 shrink-0" />
              Cloud Sync, Offline PWA &amp; A4 Print
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Tiến độ, câu sai, ngày thi & Custom Deck tự đồng bộ qua tài khoản Google. Hỗ trợ cài đặt thành App (PWA) & lưu cache offline, kèm Print / A4 PDF phiếu công thức.'
                : 'Mastery, mistakes, exam dates & custom cards sync automatically via Google Sign-In. Installable PWA with offline cache + clean Print / A4 PDF formula sheets.'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. My Gemini AI & No-Key AI */}
      <section
        id="guide-ai"
        className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 p-5 space-y-3 scroll-mt-28 md:scroll-mt-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-4 h-4" />
            {bi
              ? '2. Trợ Lý AI: Có API Key Miễn Phí HOẶC Không Cần Key (No-Key)'
              : '2. Built-In AI Tutor: Free BYOK Key OR No-Key Web Handoff'}
          </h2>
          <button
            type="button"
            onClick={() =>
              dispatchAskAi({
                prompt: bi
                  ? 'Hãy tóm tắt 3 bẫy thi hay gặp nhất trong môn tôi đang xem và cho 1 ví dụ nhanh.'
                  : 'Summarize the top 3 exam traps in my current subject with one quick practice example.',
              })
            }
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {bi ? 'Mở My Gemini AI ngay →' : 'Open My Gemini AI →'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/50 border border-indigo-200/70 dark:border-indigo-800/60 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              Tab 1 · In-App Chat (API Key)
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Dán key miễn phí từ Google AI Studio (chỉ lưu trong trình duyệt của bạn). Hỗ trợ trả lời theo luồng, công thức KaTeX & dán ảnh chụp đề bài (Ctrl+V).'
                : 'Paste your free Google AI Studio key (stored strictly in your browser). Streams step-by-step KaTeX explanations & accepts Ctrl+V problem screenshots.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/50 border border-indigo-200/70 dark:border-indigo-800/60 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              Tab 2 · No-Key Web + Auto-Fill
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Không có key? Tab Web Gemini tự kẹp ghi chú & công thức môn khớp câu hỏi vào prompt, mở ChatGPT / Claude tự điền sẵn (Auto-Fill), hoặc tải file .md cả môn để thả vào Gemini Web.'
                : 'No key needed: attaches matching syllabus formulas automatically, pre-fills ChatGPT or Claude via 1-click Auto-Fill, or exports the full subject .md pack for Gemini Web.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-950/50 border border-indigo-200/70 dark:border-indigo-800/60 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">
              1-Click &quot;Explain with AI&quot;
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {bi
                ? 'Xuất hiện ngay trên từng câu sau khi nộp bài Mock Exam, trong Review Bank, Flashcards, Smart Focus và Study Room Heatmap — bấm 1 chạm là chép đủ đề bài, đáp án của bạn & lời giải sang AI.'
                : 'Built right into submitted Mock Exam cards, Review Bank mistakes, Flashcards, Smart Focus & Study Room Heatmaps to send full question context in 1 click.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. MFC */}
      <section
        id="guide-mfc"
        className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-5 space-y-3 scroll-mt-28 md:scroll-mt-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Scale className="w-4 h-4" />
            3. Math for Computing (MFC · Ch. 1, 4, 9–12)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onNavigateMfc('labs')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              Practice Labs <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateMfc('labs', 'tab=trainers')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 cursor-pointer flex items-center gap-1"
            >
              Step Trainers <ArrowRight className="w-3 h-3" />
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
        <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">
              Practice Labs (6 Tabs · incl. Step Trainers)
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Logic &amp; Truth Tables (Ch. 1), Number Theory/RSA (Ch. 4), Relations/Warshall &amp; Posets (Ch. 9), Graphs/Dijkstra/Kruskal/Trees (Ch. 10–11), Boolean K-Maps (Ch. 12) + <strong>Step Trainers</strong> điền từng ô ExtGCD, ModExp, ma trận W_k &amp; kiểm tra gom nhóm K-Map.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">
              Proofs Trainer · Assignments 1–4 · Knowledge Base
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Chấm bài chứng minh 3 chế độ (Offline Check / Copy Prompt / Gemini API), đánh dấu 4 bộ Assignment mẫu, tra cứu tóm tắt công thức, bẫy lượng từ &amp; in A4 PDF.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 sm:col-span-2">
            <div className="font-semibold text-slate-900 dark:text-white">
              Mock Final Exam (90m Final / 30m Sprint · Sticky HUD + Auto-Save)
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Thi theo <code className="font-mono">Seed</code> nhóm hoặc đồng bộ vào <strong>Study Room</strong>; nộp bài xem điểm tách từng chương và dùng <strong>Explain with AI</strong> ngay trên từng câu.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Economics */}
      <section
        id="guide-econ"
        className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 p-5 space-y-3 scroll-mt-28 md:scroll-mt-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-4 h-4" />
              4. Principles of Economics (Macro Final · ECO101 Parts 6–9)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mankiw Ch. 23–26, 28–35 · {bi ? '40% Final Exam (30 MCQ + 4 Tự luận chính sách)' : '30 MCQs (50%) + 4 Short-Answer Policy Essays (50%)'}.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onNavigateEcon('labs')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer flex items-center gap-1"
            >
              Econ Simulators <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateEcon('labs', 'tab=trainer')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer flex items-center gap-1"
            >
              Shock Trainer <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigateEcon('exam')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
            >
              Mock Econ Exam <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">
              Econ Simulators (5 Tabs) + Interactive Line Guides (v2.10)
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              <RichMathText text="Part 6 (GDP, CPI, Loanable Funds SVG); Part 7 (Money Multiplier, $MV = PY$); Part 8 (Twin Markets 3-Panel SVG); Part 9 (AD–AS & Phillips Curve SVG + Money Market SVG); Tab 5 (Shock Predictor ↑/↓ & Blank Tables). Mọi hình vẽ đều có bảng **Line Guide** (chạm/rê chuột để làm nổi bật đường và xem giải thích EN+VI)." />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">
              42 MCQs · 8 Policy Essays · Cheat Sheets &amp; Mock Exam
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Luyện trắc nghiệm &amp; tự luận phân tích chính sách, in A4 công thức Part 6–9, và làm đề <code className="font-mono">Final (100m)</code> hoặc <code className="font-mono">Quiz 3–5</code> đồng bộ Study Room.
            </div>
          </div>
        </div>
      </section>

      {/* 5. Prob & Statistics */}
      <section
        id="guide-probstat"
        className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-slate-900 p-5 space-y-3 scroll-mt-28 md:scroll-mt-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold flex items-center gap-2 text-sky-700 dark:text-sky-300">
            <BarChart3 className="w-4 h-4" />
            5. Prob &amp; Statistics (UEH-ISB · Ch. 1–5 + SB Tables)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onNavigateProb('tables')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer flex items-center gap-1 font-bold"
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

        <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">
              Stat Simulators (4 Tabs) &amp; Problem Sets 1–5
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Rời rạc (Ch. 1), Liên tục (Ch. 2), Bảng đồng thời 2 biến (Ch. 3), CI / Kiểm định giả thuyết / Power (Ch. 4–5) kèm bài tập tự luận Chương 1–5 &amp; phiếu in A4.
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="font-semibold text-slate-900 dark:text-white">
              Mock Prob Exam (Written Final 100m · Midterm 60m)
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Chấm tự động kết quả số + từ khóa phương pháp luận, mở nhanh <strong>SB Tables</strong> &amp; <strong>Exam Calc</strong> ngay khi làm bài, nộp lên <strong>Study Room</strong>.
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-sky-200 dark:border-sky-800/70 bg-sky-50/70 dark:bg-sky-950/30 p-3.5 space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wide text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
            <BookMarked className="w-3.5 h-3.5" />
            SB Stat Tables (13 trang Phụ lục C-1 đến F · Đồ thị có chú thích đường/vùng &amp; Table Drill)
          </div>
          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <li>
              <strong>App. C-1 (p.767):</strong>{' '}
              <RichMathText text="Tra $P(0 \le Z \le z)$ hoặc nhập diện tích để tra ngược ra $z$." />
            </li>
            <li>
              <strong>App. C-2 (p.768–769):</strong>{' '}
              <RichMathText text="Tra tích lũy $\Phi(z) = P(Z \le z)$ (trái / phải / giữa / nhập $X, \mu, \sigma$) + tra ngược ra $z$." />
            </li>
            <li>
              <strong>App. D (p.770):</strong>{' '}
              <RichMathText text="Student's $t$ — chọn d.f. &amp; cột 1-tail/2-tail/CI; nhập $t_{\text{obs}}$ để xem khoảng $p$-value." />
            </li>
            <li>
              <strong>App. E (p.771) &amp; App. F (p.772–779):</strong>{' '}
              <RichMathText text="Chi-Square $\chi^2$ (hỗ trợ 2 mốc đuôi cho CI $\sigma^2$) và phân phối $F$ theo $\alpha$, $df_1$, $df_2$." />
            </li>
          </ul>
        </div>
      </section>

      {/* 6. Playbook & Shortcuts */}
      <section
        id="guide-playbook"
        className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 p-5 space-y-3 scroll-mt-28 md:scroll-mt-20"
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              {bi ? '6. Quy trình ôn thi 5 bước hiệu quả nhất' : '6. Recommended 5-Step Exam Week Playbook'}
            </div>
            <p className="leading-relaxed">
              1) Set your <strong>Exam Date</strong> on the Dashboard → 2) Run a daily{' '}
              <strong>Smart Focus Drill</strong> + <strong>Flashcards / My Deck</strong> (5–10 mins) →
              3) Practice weak steps in <strong>Labs / Line Guides / SB Tables</strong> → 4) Take a
              timed <strong>Mock Exam</strong> inside a class <strong>Study Room</strong> (keep{' '}
              <strong>Exam Calc</strong> open for intermediate steps) → 5) Use{' '}
              <strong>Explain with AI</strong> on missed items in <strong>Review Bank</strong> or
              your Room Heatmap.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-amber-200/70 dark:border-amber-800/50 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
            <Keyboard className="w-3.5 h-3.5" /> Shortcuts:
          </span>
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 font-mono">
            Ctrl/⌘+K · Global Search
          </span>
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 font-mono">
            Ctrl/⌘+B · Toggle Sidebar
          </span>
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 font-mono">
            Space · Flip Flashcard
          </span>
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 font-mono">
            Ctrl+V · Paste Image in AI
          </span>
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 font-mono">
            Esc · Close Modal/Drawer
          </span>
        </div>
      </section>
    </div>
  );
};
