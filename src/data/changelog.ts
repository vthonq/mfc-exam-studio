export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  titleVi: string;
  items: Array<{ en: string; vi: string }>;
}

export const LATEST_UPDATE_ID = 'v4.1';

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: 'v4.1',
    version: 'v4.1',
    date: 'Nov 2026',
    title: 'Rebuilt Study Guide (v4.1), Custom Flashcard Decks & Dashboard Room Shortcuts',
    titleVi: 'Làm Mới Toàn Bộ Trang Guide, Tự Nhập Bộ Thẻ Flashcards & Mở Nhanh Study Room',
    items: [
      {
        en: 'Rebuilt the entire Study Guide & 3-Step Tour to cover Live Study Rooms, Smart Focus Drills, Show-Your-Work Exam Calc, Line Guides, Flashcards, and AI Tutor workflows with 1-click launchers.',
        vi: 'Viết lại toàn bộ trang Guide & Tour chào mừng để hướng dẫn đầy đủ Study Rooms, Smart Focus, Exam Calc, Line Guides, Flashcards và AI Tutor kèm nút mở nhanh 1 chạm.',
      },
      {
        en: 'Added cloud-synced "My Deck" custom flashcards inside FlashcardsModal supporting quick single-card entry, AI JSON / "Front :: Back" bulk import, and a 1-click Study Rooms button on every Dashboard.',
        vi: 'Thêm tab "My Deck" trong Flashcards để tự tạo hoặc dán hàng loạt thẻ ghi chú (JSON từ AI hoặc "Front :: Back") đồng bộ Cloud + nút vào Study Room ngay trên mỗi Dashboard.',
      },
    ],
  },
  {
    id: 'v4.0',
    version: 'v4.0',
    date: 'Nov 2026',
    title: 'Live Class Study Rooms, Leaderboards & Hardest-Question Heatmap',
    titleVi: 'Phòng Thi Nhóm Trực Tiếp (Study Rooms), Bảng Xếp Hạng & Câu Sai Nhiều Nhất',
    items: [
      {
        en: 'Host or join a Live Study Room (code like ISB-7K2M) across MFC, Economics, and ProbStat — every classmate solves the exact same seeded paper.',
        vi: 'Tạo hoặc vào Phòng Học Nhóm trực tiếp (mã như ISB-7K2M) cho cả 3 môn MFC, Kinh tế & XSTK — cả nhóm giải chung đề và tự động đồng bộ điểm.',
      },
      {
        en: 'Real-time Firestore Leaderboard ranked by accuracy & speed, plus a Hardest-Question Heatmap showing which questions tripped up the group with 1-click "Explain with AI".',
        vi: 'Bảng xếp hạng theo thời gian thực + Biểu đồ câu bị sai nhiều nhất trong phòng kèm nút 1-click "Explain with AI" để cả nhóm ôn lại ngay.',
      },
    ],
  },
  {
    id: 'v3.1',
    version: 'v3.1',
    date: 'Nov 2026',
    title: 'Faster Load (-155 kB), True Offline PWA Cache & Mobile Polish',
    titleVi: 'Tải Trang Nhanh Hơn (-155 kB), Hỗ Trợ Học Offline PWA & Tối Ưu Mobile',
    items: [
      {
        en: 'Split smart-drill bank loading cleanly out of the initial JS bundle (~34% smaller main script for faster page loads).',
        vi: 'Tách dữ liệu bài tập thông minh khỏi gói khởi động chính giúp tải trang nhanh hơn rõ rệt trên mạng yếu và điện thoại.',
      },
      {
        en: 'Added a production Service Worker (public/sw.js) with network-first HTML updates and cached static assets so installed/mobile sessions keep working even on weak campus Wi-Fi, plus refined 375px mobile wrapping.',
        vi: 'Thêm Service Worker (sw.js) lưu bộ nhớ đệm thông minh để web mở nhanh & học mượt khi Wi-Fi trường yếu, đồng thời chỉnh gọn bố cục màn hình nhỏ.',
      },
    ],
  },
  {
    id: 'v3.0',
    version: 'v3.0',
    date: 'Nov 2026',
    title: 'Smart Exam Countdown, Adaptive Focus Drills & Exam Calculator',
    titleVi: 'Đếm Ngược Ngày Thi, Luyện Tập Trung Thông Minh & Máy Tính Giải Bước',
    items: [
      {
        en: 'Set Final Exam dates per subject (cloud-synced) with Study Streak tracking + a 1-click "Smart Focus Drill" that automatically targets your Review Bank mistakes and weakest chapters.',
        vi: 'Đặt ngày thi cuối kỳ cho từng môn (đồng bộ Cloud), theo dõi chuỗi ngày ôn thi & chế độ "Smart Focus Drill" tự động gom câu sai và chương yếu nhất để luyện lại.',
      },
      {
        en: 'Added a docked "Show-Your-Work" Exam Calculator (Sample Stats/t-Test/CI/nCr for ProbStat, Modular Power/GCD/Inverse/Bases for MFC, % Change/Fisher/Multipliers for Econ) with 1-click Copy Steps.',
        vi: 'Thêm Máy tính "Exam Calc" tích hợp (Thống kê mẫu/Kiểm định t/CI/Tổ hợp cho XSTK, Lũy thừa mod/GCD/Nghịch đảo/Đổi cơ số cho MFC, %/Fisher/Số nhân cho Kinh tế) kèm nút chép từng bước giải.',
      },
    ],
  },
  {
    id: 'v2.10',
    version: 'v2.10',
    date: 'Nov 2026',
    title: 'Clearer Economic & Stat Figures with Interactive Line Guides',
    titleVi: 'Làm Rõ Biểu Đồ Kinh Tế & XSTK Kèm Giải Thích Từng Đường Tương Tác',
    items: [
      {
        en: 'Redesigned AD–AS, Phillips Curve, Loanable Funds, Money Market, and Open-Economy Twin Markets figures with wider spacing, non-clipped curves, consistent dashed→solid shift arrows, and full axis projections (E₁ → E₂).',
        vi: 'Thiết kế lại biểu đồ AD–AS, Đường Phillips, Vốn vay, Thị trường Tiền tệ và Kinh tế Mở thoáng dễ nhìn hơn: không bị cắt đường, thống nhất nét đứt (cũ) → nét liền (mới) kèm mũi tên dịch chuyển & chiếu trục E₁ → E₂.',
      },
      {
        en: 'Added interactive "Line Guide (hover or tap)" explanations on every macro graph and a clear Density / Shaded Area / Critical Cutoff legend under every ProbStat curve.',
        vi: 'Thêm bảng "Line Guide" (chạm hoặc rê chuột để làm nổi bật từng đường và đọc ý nghĩa EN/VI) cho mọi hình Kinh tế & chú thích rõ đường/vùng cho biểu đồ XSTK.',
      },
    ],
  },
  {
    id: 'v2.9',
    version: 'v2.9',
    date: 'Nov 2026',
    title: 'Web Logo PNG, 1-Click Explain with AI, Quick Flashcards & PWA Support',
    titleVi: 'Icon PNG Siêu Nhẹ, Hỏi AI 1-Click Câu Sai, Flashcards & Hỗ trợ Cài đặt App',
    items: [
      {
        en: 'Replaced the heavy 3.4 MB GIF with a crisp custom web logo PNG (-91% asset size) + installable PWA manifest & creator credit (vthonq).',
        vi: 'Thay thế file GIF 3.4 MB bằng icon web PNG mới siêu nhẹ (giảm >91% dung lượng tải trang), hỗ trợ cài đặt PWA và ghi dấu tác giả (vthonq).',
      },
      {
        en: 'Added 1-Click "Explain with AI" directly on Review Bank & Mock Exam questions + a Quick Formula & Trap Flashcards modal across MFC, Econ & ProbStat.',
        vi: 'Thêm nút "Explain with AI" 1 chạm ngay trên câu sai (Review Bank & Đề thi thử) và bộ Flashcards ôn nhanh công thức, bẫy thi & thuật ngữ 3 môn.',
      },
    ],
  },
  {
    id: 'v2.8',
    version: 'v2.8',
    date: 'Nov 2026',
    title: 'Website Intro Showcase, 3-Step Welcome Tour & Auto-Fill Claude',
    titleVi: 'Trang Giới Thiệu Web, Tour Chào Mừng 3 Bước & Tự Điền Claude/ChatGPT',
    items: [
      {
        en: 'Split-screen Website Intro on the Google Sign-In landing page + interactive 3-step Welcome Intro Tour (replayable anytime from Studio Settings).',
        vi: 'Trang chào mừng giới thiệu đầy đủ 3 môn & tính năng ngay ở màn hình đăng nhập + Tour hướng dẫn 3 bước cho người mới (mở lại bất kỳ lúc nào trong Settings).',
      },
      {
        en: 'Added Auto-Fill Claude (claude.ai/new?q=...) alongside Auto-Fill ChatGPT, synced prompt copy with live preview & 1-click Full Knowledge Pack copy/download.',
        vi: 'Bổ sung nút Auto-Fill Claude (tự điền câu hỏi & công thức vào ô chat) bên cạnh ChatGPT, kèm xem trước prompt và tải/copy toàn bộ kiến thức môn.',
      },
    ],
  },
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
        en: 'No API key? Web Gemini (No Key) tab auto-attaches matching website formulas & exam traps into every copied prompt + lets you download a full .md Course Knowledge Pack to attach once inside gemini.google.com.',
        vi: 'Không cần API key? Tab Web Gemini tự động đính kèm công thức & bẫy thi khớp câu hỏi từ web vào prompt + cho phép tải file .md toàn bộ kiến thức môn để thả vào gemini.google.com.',
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
