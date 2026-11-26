export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  titleVi: string;
  items: Array<{ en: string; vi: string }>;
}

export const LATEST_UPDATE_ID = 'v2.7';

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: 'v2.7',
    version: 'v2.7',
    date: 'Nov 2026',
    title: 'My Gemini AI Tutor (In-App Chat, Screenshot Paste & Gemini Web Handoff)',
    titleVi: 'Trợ lý My Gemini AI ngay trên Web (Chat, Dán ảnh đề bài & Mở Gemini Web)',
    items: [
      {
        en: 'Ask My Gemini AI floating drawer across MFC, Economics & ProbStat: streaming replies, KaTeX math rendering, Ctrl+V screenshot upload & free Google AI Studio key setup/test stored only in your browser.',
        vi: 'Trợ lý My Gemini AI tích hợp sẵn (cả 3 môn): trả lời theo luồng trực tiếp, hiển thị công thức KaTeX, dán ảnh chụp đề (Ctrl+V), nhập key Google AI Studio miễn phí lưu ngay trên trình duyệt.',
      },
      {
        en: 'No API key? Click "Gemini Web ↗" inside the tutor to copy your subject-tagged prompt and open gemini.google.com directly in one click.',
        vi: 'Không cần API key? Nhấn nút "Gemini Web ↗" để tự động copy câu hỏi kèm ngữ cảnh môn học và mở ngay trang Gemini cá nhân của bạn.',
      },
    ],
  },
  {
    id: 'v2.6',
    version: 'v2.6',
    date: 'Nov 2026',
    title: 'UI 10/10 Polish: Sticky Exam HUD, Mobile Drawer & Dark Contrast',
    titleVi: 'Nâng cấp Giao diện: Thanh đếm giờ nổi, Menu Mobile & Dark Mode chuẩn',
    items: [
      {
        en: 'Sticky Floating Exam HUD across MFC, Econ & ProbStat mock exams: live urgency timer, progress bar, SB Tables shortcut & Jump to Submit.',
        vi: 'Thanh Exam HUD nổi khi làm đề thi thử (cả 3 môn): xem đồng hồ đếm ngược (<10p đổi vàng, <3p nhấp nháy đỏ), tiến độ X/Y câu & cuộn nhanh nút nộp bài.',
      },
      {
        en: 'Streamlined Desktop Sidebar (all nav items fit 768px laptop screens) + clean Mobile Header, Slide-Down Menu Drawer (with Sign Out), unique Bottom Nav labels & unified Dark Mode inputs.',
        vi: 'Sidebar gọn đẹp trên laptop 13–14" + Menu ☰ kéo thả mới trên điện thoại (đầy đủ Guide, Admin, Đăng xuất) + thanh Bottom Nav hết trùng nhãn + ô nhập Dark Mode đồng bộ.',
      },
    ],
  },
  {
    id: 'v2.5',
    version: 'v2.5',
    date: 'Nov 2026',
    title: 'MFC Step Trainers, Econ Shock Predictor & Missing Mankiw Diagrams',
    titleVi: 'Luyện điền bảng MFC, Đoán cú sốc Vĩ mô & Biểu đồ Mankiw mới',
    items: [
      {
        en: 'MFC Practice Labs → Step-by-Step Trainers: Quantifier traps, blank ExtGCD/ModExp tables, clickable Warshall W_k matrix, tree traversal & K-Map group validator.',
        vi: 'MFC → Step-by-Step Trainers: Bẫy lượng từ, điền bảng ExtGCD/ModExp, ma trận Warshall click-to-fill, duyệt cây & kiểm tra gom nhóm bìa K-Map.',
      },
      {
        en: 'Economics → Shock Predictor & Blank Tables + Closed-Economy Loanable Funds (Ch.26) & Money Market / Liquidity Preference (Ch.34) diagrams.',
        vi: 'Kinh tế → Đoán cú sốc Vĩ mô (↑/↓) + điền bảng T-Account/GDP + 2 biểu đồ mới: Loanable Funds (Lấn át) & Money Market (Ch.34).',
      },
    ],
  },
  {
    id: 'v2.4',
    version: 'v2.4',
    date: 'Nov 2026',
    title: 'Cloud Progress Sync, Faster Load & Zalo/UEH Guard',
    titleVi: 'Đồng bộ Đám mây, Tải nhanh hơn & Cảnh báo Zalo',
    items: [
      {
        en: 'Automatic Cloud Progress Sync: mastery scores, exam history & Review Bank sync across your laptop and phone.',
        vi: 'Tự động đồng bộ tiến độ lên Cloud: giữ nguyên điểm ôn tập, lịch sử thi và câu sai khi đổi máy tính / điện thoại.',
      },
      {
        en: 'Faster initial load via code-splitting + Zalo/Messenger in-app browser warning + optional @st.ueh.edu.vn Admin lock & Last Active tracking.',
        vi: 'Tách chunk giúp tải trang nhanh hơn + cảnh báo mở bằng Chrome/Safari khi nhấn link từ Zalo/Messenger + tùy chọn lọc email @st.ueh.edu.vn.',
      },
    ],
  },
  {
    id: 'v2.3',
    version: 'v2.3',
    date: 'Nov 2026',
    title: 'Class Access Security & Admin User-Cap Panel',
    titleVi: 'Bảo mật Lớp học & Admin Kiểm soát Sĩ số',
    items: [
      {
        en: 'Google Sign-In Gate with server-enforced student seat cap (Firebase Auth + Cloud Firestore Security Rules).',
        vi: 'Cổng đăng nhập Google giới hạn sĩ số trực tiếp từ server (Firebase Auth + Cloud Firestore).',
      },
      {
        en: 'Admin Panel: adjust Max Users anytime, pause/resume auto-approval, and Approve, Waitlist, Ban, or Remove accounts live.',
        vi: 'Admin Panel: thay đổi giới hạn người dùng mọi lúc, bật/tắt tự động duyệt và Approve / Waitlist / Ban từng tài khoản.',
      },
    ],
  },
  {
    id: 'v2.2',
    version: 'v2.2',
    date: 'Nov 2026',
    title: 'Class-Ready Productivity & Exam Upgrade',
    titleVi: 'Nâng cấp Toàn diện cho Lớp Học & Ôn Thi',
    items: [
      {
        en: 'Global Ctrl+K Search: jump straight to any formula, lab, proof, glossary term, or SB table across all 3 subjects.',
        vi: 'Tìm kiếm toàn cục (Ctrl+K / ⌘K): tìm nhanh công thức, lab, chứng minh, từ vựng và bảng SB ở cả 3 môn.',
      },
      {
        en: 'Mistakes & Review Bank: missed Mock Exam & Econ Drill questions are saved automatically for targeted re-practice.',
        vi: 'Kho câu sai (Review Bank): tự động lưu câu làm sai hoặc đánh dấu để luyện lại tới khi thành thạo.',
      },
      {
        en: 'Auto-Save Mock Exams: in-progress answers and timers survive accidental page refreshes across MFC, Econ, and Prob & Stat.',
        vi: 'Tự động lưu bài thi thử: giữ nguyên đáp án và đồng hồ nếu lỡ tải lại trang (F5) ở cả 3 môn.',
      },
      {
        en: 'Math & Stat Symbol Keypad + Printable A4 Cheat Sheets (Print / A4 PDF button) + Highlighted Sidebar Guide.',
        vi: 'Thanh chèn ký hiệu Toán/XSTK khi gõ tự luận, chế độ in công thức chuẩn A4 và mục Guide nổi bật trên Sidebar.',
      },
    ],
  },
  {
    id: 'v2.1',
    version: 'v2.1',
    date: 'Nov 2026',
    title: 'KaTeX Rendering Fixes & Exam Scoring Polish',
    titleVi: 'Sửa hiển thị công thức KaTeX & Bảng điểm thi thử',
    items: [
      {
        en: 'Replaced raw LaTeX text with crisp KaTeX rendering in Prob & Stat, MFC summaries, and Relations Lab.',
        vi: 'Hiển thị chuẩn công thức toán học (KaTeX) ở XSTK, tóm tắt MFC và bảng Relations/Warshall.',
      },
      {
        en: 'Added Exam Score Summary cards (section/chapter breakdown), Time-up banners, unique Econ MCQs, and subject-aware Gemini AI grading.',
        vi: 'Bổ sung bảng tổng kết điểm chi tiết theo phần/chương, cảnh báo hết giờ và AI chấm tự luận đúng ngữ cảnh từng môn.',
      },
    ],
  },
  {
    id: 'v2.0',
    version: 'v2.0',
    date: 'Nov 2026',
    title: 'Prob & Statistics + Interactive SB Tables (Appendices C-1 to F)',
    titleVi: 'Ra mắt môn Xác suất Thống kê & Bảng tra SB Tương tác',
    items: [
      {
        en: 'Full Ch. 1–5 coverage with distribution simulators, Problem Sets 1–5, A4 Formula Sheets, and 13-page interactive SB Tables with curve shading & Table Drill.',
        vi: 'Đầy đủ Chương 1–5, mô phỏng phân phối, bài tập 1–5, phiếu A4 và 13 trang Phụ lục SB (C-1 đến F) có đồ thị tô vùng & luyện tra bảng.',
      },
    ],
  },
];
