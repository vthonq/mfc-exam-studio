import type { EconLabTab, EconTopicId } from '../types';

export interface EconKnowledgeCard {
  id: string;
  topic: EconTopicId;
  chapterLabel: string;
  title: string;
  titleVi: string;
  summary: string;
  summaryVi: string;
  formulas: string[];
  examTrap?: string;
  examTrapVi?: string;
  relatedLab?: EconLabTab;
}

export interface EconGlossaryItem {
  en: string;
  vi: string;
  topic: EconTopicId;
  note: string;
}

export interface EconMcq {
  id: string;
  topic: EconTopicId;
  chapter: string;
  question: string;
  questionVi: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  explanationVi: string;
}

export interface EconScenario {
  id: string;
  topic: EconTopicId;
  chapterLabel: string;
  title: string;
  titleVi: string;
  prompt: string;
  promptVi: string;
  rubric: Array<{ label: string; points: number }>;
  modelSolution: string;
  modelSolutionVi: string;
}

export const ECON_KNOWLEDGE: EconKnowledgeCard[] = [
  // PART 6: Ch. 23, 24, 25, 26, 28
  {
    id: 'econ-ch23',
    topic: 'part6',
    chapterLabel: 'Ch. 23',
    title: 'Measuring a Nation’s Income (GDP, Nominal vs. Real, Deflator)',
    titleVi: 'Đo lường thu nhập quốc dân (GDP danh nghĩa, thực & Chỉ số giảm phát)',
    summary:
      'GDP is the market value of all final goods & services produced within a country in a given period (Y = C + I + G + NX). Intermediate inputs, used-good resales, illegal/non-market home production, and government transfer payments (Social Security) are excluded. Additions to inventory count in Investment (I) during the year produced. Nominal GDP uses current prices; Real GDP uses base-year prices.',
    summaryVi:
      'GDP đo giá trị thị trường của mọi hàng hóa và dịch vụ cuối cùng sản xuất trong lãnh thổ quốc gia (Y = C + I + G + NX). Hàng trung gian, hàng đã qua sử dụng, sản xuất tự cung tự cấp và trợ cấp chuyển nhượng không tính vào GDP; hàng tồn kho sản xuất trong năm tính vào Đầu tư I.',
    formulas: [
      'GDP = C + I + G + NX, \\quad NX = \\text{Exports} - \\text{Imports}',
      '\\text{GDP Deflator} = \\frac{\\text{Nominal GDP}}{\\text{Real GDP}} \\times 100',
      '\\pi_t = \\frac{\\text{Deflator}_t - \\text{Deflator}_{t-1}}{\\text{Deflator}_{t-1}} \\times 100\\%',
    ],
    examTrap:
      'A Vietnamese owner running a Pho restaurant in the USA counts in US GDP (location) and Vietnam GNP (nationality). Buying an existing house does NOT count in GDP (only a newly built house counts in I).',
    examTrapVi:
      'Quán phở của người Việt tại Mỹ tính vào GDP của Mỹ và GNP của Việt Nam. Mua nhà cũ không tính vào GDP (chỉ nhà xây mới tính vào I).',
    relatedLab: 'part6',
  },
  {
    id: 'econ-ch24',
    topic: 'part6',
    chapterLabel: 'Ch. 24',
    title: 'Measuring the Cost of Living (CPI vs. GDP Deflator & Real Interest)',
    titleVi: 'Đo lường chi phí sinh hoạt (CPI vs. GDP Deflator & Lãi suất thực)',
    summary:
      'CPI tracks a fixed basket of goods/services bought by a typical consumer. Three biases cause CPI to overstate true cost-of-living increases: (1) Substitution bias, (2) Introduction of new goods, (3) Unmeasured quality change. CPI includes imported consumer goods (fixed basket); GDP Deflator covers only domestically produced goods (changing basket).',
    summaryVi:
      'CPI đo chi phí một giỏ hàng tiêu dùng cố định nên có 3 sai lệch: lệch thay thế, hàng hóa mới và chất lượng không đo được. CPI tính cả hàng nhập khẩu tiêu dùng; GDP Deflator chỉ tính hàng sản xuất trong nước.',
    formulas: [
      '\\text{CPI}_t = \\frac{\\text{Cost of basket}_t}{\\text{Cost of basket}_{\\text{base}}} \\times 100',
      '\\text{Value today} = \\text{Value}_T \\times \\frac{\\text{CPI}_{\\text{today}}}{\\text{CPI}_T}',
      'r_{\\text{real}} = i_{\\text{nominal}} - \\pi_{\\text{inflation}}',
    ],
    examTrap:
      'If imported Italian olive oil rises in price, CPI rises while the GDP deflator stays unchanged. If an Air Force fighter jet price rises, GDP deflator rises while CPI is unchanged!',
    examTrapVi:
      'Giá dầu ô-liu nhập khẩu tăng làm CPI tăng còn GDP Deflator không đổi; giá máy bay chiến đấu sản xuất trong nước tăng làm GDP Deflator tăng còn CPI không đổi.',
    relatedLab: 'part6',
  },
  {
    id: 'econ-ch25',
    topic: 'part6',
    chapterLabel: 'Ch. 25',
    title: 'Production and Growth (Productivity, Diminishing Returns & Catch-Up)',
    titleVi: 'Sản xuất và Tăng trưởng (Năng suất, Lợi suất giảm dần & Hiệu ứng bắt kịp)',
    summary:
      'A country’s standard of living depends on productivity (Y/L), determined by Physical Capital per worker (K/L), Human Capital per worker (H/L), Natural Resources per worker (N/L), and Technological Knowledge (A). Technology is society’s understanding (the textbook); Human Capital is workers’ acquired skills (time spent reading it). Due to diminishing returns to capital, higher saving boosts growth only temporarily, and poor countries grow faster (catch-up effect).',
    summaryVi:
      'Mức sống phụ thuộc vào năng suất Y/L, do vốn vật chất, vốn nhân lực, tài nguyên và tri thức công nghệ quyết định. Do lợi suất giảm dần của vốn, tăng tiết kiệm chỉ giúp tăng trưởng nhanh hơn trong ngắn–trung hạn (hiệu ứng bắt kịp của nước nghèo).',
    formulas: [
      'Y = A \\cdot F(L, K, H, N) \\implies \\frac{Y}{L} = A \\cdot F\\left(1, \\frac{K}{L}, \\frac{H}{L}, \\frac{N}{L}\\right)',
    ],
    examTrap:
      'Free trade acts like a technological advance: opening up to trade raises productivity just like discovering a new technology.',
    examTrapVi:
      'Thương mại tự do hoạt động tương tự một tiến bộ công nghệ giúp nâng cao năng suất của nền kinh tế.',
    relatedLab: 'part6',
  },
  {
    id: 'econ-ch26',
    topic: 'part6',
    chapterLabel: 'Ch. 26',
    title: 'Saving, Investment, Financial System & Loanable Funds',
    titleVi: 'Tiết kiệm, Đầu tư, Hệ thống tài chính & Thị trường vốn vay',
    summary:
      'Financial markets (bonds, stocks) and intermediaries (banks, mutual funds) channel saving to investment. Remember: Earnings = Retained Earnings + Dividends; P/E = Stock Price / EPS; Dividend = Yield × Price. In a closed economy, S = I = (Y−T−C) + (T−G). Saving incentives shift Loanable Funds Supply RIGHT (r↓, I↑); Investment tax credits shift Demand RIGHT (r↑, I↑); Government budget deficits reduce Public Saving, shifting Supply LEFT (r↑, I↓ — crowding out).',
    summaryVi:
      'Trong kinh tế đóng S = I. Khuyến khích tiết kiệm đẩy cung vốn vay dịch phải (r↓, I↑); ưu đãi thuế đầu tư đẩy cầu vốn vay dịch phải (r↑, I↑); thâm hụt ngân sách giảm tiết kiệm công đẩy cung vốn vay dịch trái (r↑, I↓ — chèn lấn đầu tư).',
    formulas: [
      'S_{\\text{private}} = Y - T - C, \\quad S_{\\text{public}} = T - G, \\quad S = I',
      '\\text{P/E} = \\frac{\\text{Price}}{\\text{EPS}}, \\quad \\text{Dividend} = \\text{Dividend Yield} \\times \\text{Price}',
    ],
    examTrap:
      'Buying stocks or corporate bonds is SAVING (S), NOT Investment (I) in macroeconomics!',
    examTrapVi:
      'Mua cổ phiếu hoặc trái phiếu là Tiết kiệm (S), KHÔNG phải Đầu tư (I) trong kinh tế vĩ mô!',
    relatedLab: 'part6',
  },
  {
    id: 'econ-ch28',
    topic: 'part6',
    chapterLabel: 'Ch. 28',
    title: 'Unemployment (Labor Force, Natural Rate & Structural Causes)',
    titleVi: 'Thất nghiệp (Lực lượng lao động, Tỷ lệ tự nhiên & Thất nghiệp cơ cấu)',
    summary:
      'Adults divide into Employed, Unemployed (actively looked in past 4 weeks), and Not in the Labor Force (students, retirees, discouraged workers). Natural rate = Frictional (job search, sectoral shifts, unemployment insurance) + Structural (minimum-wage laws, unions/collective bargaining, efficiency wages above equilibrium).',
    summaryVi:
      'Dân số trưởng thành gồm Có việc, Thất nghiệp (có tìm việc trong 4 tuần qua) và Ngoài lực lượng lao động (người nản chí, nghỉ hưu, sinh viên). Thất nghiệp tự nhiên = Cọ xát + Cơ cấu (lương tối thiểu, công đoàn, lương hiệu quả).',
    formulas: [
      'u\\text{-rate} = \\frac{U}{E + U} \\times 100\\%, \\quad \\text{LFPR} = \\frac{E + U}{\\text{Adult Pop}} \\times 100\\%',
    ],
    examTrap:
      'When discouraged workers stop searching, they leave BOTH the numerator (U) and denominator (Labor Force), causing the official unemployment rate to FALL!',
    examTrapVi:
      'Khi người nản chí ngừng tìm việc, cả tử số và mẫu số đều giảm cùng một lượng nên tỷ lệ thất nghiệp chính thức GIẢM!',
    relatedLab: 'part6',
  },

  // PART 7: Ch. 29, 30
  {
    id: 'econ-ch29',
    topic: 'part7',
    chapterLabel: 'Ch. 29',
    title: 'The Monetary System (Fed Tools, Leverage & Money Multiplier)',
    titleVi: 'Hệ thống tiền tệ (Công cụ NHTW, Đòn bẩy & Số nhân tiền)',
    summary:
      'Money has 3 functions: Medium of exchange, Unit of account, Store of value. M1 includes currency + demand deposits; M2 adds savings/small time deposits/MMMF. Bank balance sheet: Assets (Reserves + Loans + Securities) = Liabilities (Deposits + Debt) + Capital; Leverage Ratio = Assets / Capital. Fed increases money supply by buying bonds (OMO) or cutting reserve requirements / discount rate / IOR. Simple multiplier = 1/R.',
    summaryVi:
      'Tiền có 3 chức năng: phương tiện trao đổi, đơn vị hạch toán, cất giữ giá trị. Tỷ lệ đòn bẩy = Tài sản / Vốn chủ sở hữu. NHTW tăng cung tiền bằng cách mua trái phiếu trên thị trường mở (OMO) hoặc giảm tỷ lệ dự trữ bắt buộc / lãi suất chiết khấu.',
    formulas: [
      '\\text{Money Multiplier} = \\frac{1}{R}, \\quad \\text{Leverage Ratio} = \\frac{\\text{Assets}}{\\text{Capital}}',
      '\\text{Actual Multiplier} = \\frac{1 + c_r}{r_r + e_r + c_r}',
    ],
    examTrap:
      'The Fed cannot control the money supply with 100% precision because (1) households decide how much currency to hold and (2) banks decide how many excess reserves to hold — both make the real multiplier smaller than 1/R.',
    examTrapVi:
      'NHTW không kiểm soát tuyệt đối cung tiền vì hộ gia đình quyết định lượng tiền mặt giữ lại và ngân hàng quyết định lượng dự trữ dư thừa.',
    relatedLab: 'part7',
  },
  {
    id: 'econ-ch30',
    topic: 'part7',
    chapterLabel: 'Ch. 30',
    title: 'Money Growth and Inflation (Quantity Theory, Fisher Effect & Costs)',
    titleVi: 'Tăng trưởng tiền & Lạm phát (Thuyết số lượng, Fisher & Chi phí lạm phát)',
    summary:
      'Value of money = 1/P. Quantity Equation MV = PY: with V stable and Y pinned down by real factors, rapid money growth causes proportional inflation (Classical Dichotomy & Monetary Neutrality). Fisher Effect: nominal interest rate i = r + π adjusts 1-for-1 with expected inflation. Six costs of inflation: Shoeleather, Menu, Relative-price variability, Tax distortions, Confusion/inconvenience, and Arbitrary wealth redistribution (unexpected inflation hurts lenders, helps borrowers).',
    summaryVi:
      'Giá trị tiền = 1/P. Phương trình số lượng MV = PY: trong dài hạn tiền tệ trung tính chỉ làm P tăng (lạm phát). Hiệu ứng Fisher: i = r + π. 6 chi phí lạm phát: mòn giày, thực đơn, biến động giá tương đối, bóp méo thuế, nhầm lẫn và tái phân phối của cải bất ngờ (lợi cho người đi vay, thiệt cho người cho vay).',
    formulas: [
      'M \\times V = P \\times Y, \\quad \\pi \\approx \\%\Delta M - \\%\Delta Y',
      'i = r + \\pi \\text{ (Fisher Effect)}',
    ],
    examTrap:
      'The "Inflation Fallacy" mistakenly thinks inflation lowers real purchasing power of wages — in fact, nominal incomes rise alongside prices; real wages depend on productivity, not inflation.',
    examTrapVi:
      'Ngụy biện lạm phát cho rằng lạm phát tự nó làm giảm thu nhập thực; thực chất cả giá cả và thu nhập danh nghĩa cùng tăng, thu nhập thực phụ thuộc năng suất.',
    relatedLab: 'part7',
  },

  // PART 8: Ch. 31, 32
  {
    id: 'econ-ch31',
    topic: 'part8',
    chapterLabel: 'Ch. 31',
    title: 'Open-Economy Macroeconomics: Basic Concepts (NX = NCO & PPP)',
    titleVi: 'Kinh tế vĩ mô mở: Khái niệm cơ bản (NX = NCO, Tỷ giá thực & PPP)',
    summary:
      'NCO = Purchase of foreign assets by domestic residents − Purchase of domestic assets by foreigners (FDI = active management like building a factory; Portfolio = passive stocks/bonds). Identity: NX = NCO and S = I + NCO. Real Exchange Rate ε = (e × P) / P*. Purchasing-Power Parity (PPP): ε = 1 so nominal rate e = P*/P; high-inflation currencies depreciate.',
    summaryVi:
      'NCO = Tài sản nước ngoài cư dân mua − Tài sản trong nước người nước ngoài mua (FDI là đầu tư trực tiếp; Portfolio là mua cổ phiếu/trái phiếu). Đồng nhất thức: NX = NCO và S = I + NCO. Tỷ giá thực ε = (e×P)/P*; theo PPP thì e = P*/P.',
    formulas: [
      'NX = NCO = S - I, \\quad \\varepsilon = \\frac{e \\cdot P}{P^*}',
      '\\text{PPP: } e = \\frac{P^*}{P}',
    ],
    examTrap:
      'Two reasons PPP fails in the real world: (1) many goods/services are not easily traded (haircuts, real estate), and (2) tradable goods from different countries are not perfect substitutes.',
    examTrapVi:
      'Hai lý do PPP không đúng hoàn toàn ngoài thực tế: (1) nhiều hàng hóa/dịch vụ không thể trao đổi quốc tế (cắt tóc, bất động sản), (2) hàng hóa giữa các nước không thay thế hoàn hảo.',
    relatedLab: 'part8',
  },
  {
    id: 'econ-ch32',
    topic: 'part8',
    chapterLabel: 'Ch. 32',
    title: 'A Macroeconomic Theory of the Open Economy (Twin Markets)',
    titleVi: 'Lý thuyết kinh tế vĩ mô của nền kinh tế mở (Mô hình hai thị trường)',
    summary:
      'Two linked markets: (1) Loanable Funds (Supply = S, Demand = I + NCO) sets real interest rate r; (2) Foreign-Currency Exchange (Supply = NCO, Demand = NX) sets real exchange rate e. Three core policies: Budget deficit (S↓ ⇒ r↑, NCO↓, e↑, NX↓), Import quota/tariff (FX Demand↑ ⇒ e↑, NX UNCHANGED!), Capital flight (NCO↑ ⇒ r↑, e↓, NX↑).',
    summaryVi:
      'Thị trường vốn vay (cung S, cầu I+NCO) quyết định r ⇒ NCO ⇒ cung ngoại tệ trong thị trường ngoại hối quyết định e. Thâm hụt ngân sách: r↑, NCO↓, e↑, NX↓. Hạn ngạch nhập khẩu: e↑, NX KHÔNG ĐỔI. Tháo chạy vốn: r↑, NCO↑, e↓, NX↑.',
    formulas: [
      'S = I(r) + NCO(r), \\quad NCO(r) = NX(\\varepsilon)',
    ],
    examTrap:
      'Trade barriers (tariffs/quotas) NEVER improve the overall trade balance NX = S − I — they only appreciate the currency!',
    examTrapVi:
      'Thuế quan và hạn ngạch KHÔNG bao giờ cải thiện cán cân thương mại tổng thể NX = S − I!',
    relatedLab: 'part8',
  },

  // PART 9: Ch. 33, 34, 35
  {
    id: 'econ-ch33',
    topic: 'part9',
    chapterLabel: 'Ch. 33',
    title: 'Aggregate Demand and Aggregate Supply (AD–SRAS–LRAS)',
    titleVi: 'Tổng cầu và Tổng cung (AD–SRAS–LRAS & Chu kỳ kinh tế)',
    summary:
      'AD slopes down via Wealth effect (C), Interest-rate effect (I), and Exchange-rate effect (NX). LRAS is vertical at natural output Y_n (determined by K, L, H, N, A — independent of P). SRAS slopes upward due to Sticky Wages, Sticky Prices, and Misperceptions. Shifts in AD cause output/price to move in the SAME direction; left shifts of SRAS cause STAGFLATION (P↑, Y↓).',
    summaryVi:
      'AD dốc xuống nhờ hiệu ứng Của cải, Lãi suất và Tỷ giá. LRAS thẳng đứng tại Y_n. SRAS dốc lên do tiền lương cứng nhắc, giá cứng nhắc và nhận thức sai lầm. Sốc cung bất lợi (SRAS dịch trái) gây Lạm phát đình trệ (P↑, Y↓).',
    formulas: [
      'Y = Y_n + \\alpha (P - P^e)',
    ],
    examTrap:
      'Expectations of a higher future price level P^e shift SRAS LEFT today, even before any actual demand shock hits!',
    examTrapVi:
      'Kỳ vọng mức giá tương lai P^e tăng cũng đủ đẩy đường SRAS dịch sang TRÁI ngay trong ngắn hạn.',
    relatedLab: 'part9',
  },
  {
    id: 'econ-ch34',
    topic: 'part9',
    chapterLabel: 'Ch. 34',
    title: 'Monetary & Fiscal Policy Influence on AD (Liquidity Pref. & Multipliers)',
    titleVi: 'Ảnh hưởng của Chính sách Tiền tệ & Tài khóa (Ưa thích thanh khoản & Số nhân)',
    summary:
      'Keynes’ Liquidity Preference: real money supply & money demand determine interest rate r; Fed MS↑ lowers r and shifts AD right. Fiscal policy: Spending Multiplier = 1/(1−MPC), Tax Multiplier = −MPC/(1−MPC). Balanced-budget change ΔG = ΔT shifts AD by ΔG. Crowding-out offsets part of fiscal expansion because higher Y raises money demand and r; automatic stabilizers (income taxes, UI) cushion cycles without legislative lag.',
    summaryVi:
      'Lý thuyết ưa thích thanh khoản: cung–cầu tiền xác định r. Số nhân chi tiêu = 1/(1−MPC), số nhân thuế = −MPC/(1−MPC). Chính sách tài khóa có thể bị hiệu ứng chèn lấn (r↑ làm giảm I). Bộ ổn định tự động giúp giảm biên độ chu kỳ mà không bị độ trễ thực thi.',
    formulas: [
      '\\text{Spending Multiplier} = \\frac{1}{1 - \\text{MPC}}, \\quad \\text{Tax Multiplier} = \\frac{-\\text{MPC}}{1 - \\text{MPC}}',
    ],
    examTrap:
      'In a deep recession where firms are pessimistic, the Investment Accelerator can amplify the multiplier, whereas Crowding Out shrinks it.',
    examTrapVi:
      'Trong tài khóa mở rộng, hiệu ứng số nhân khuếch đại tổng cầu trong khi hiệu ứng chèn lấn (r↑ ⇒ I↓) lại kéo tổng cầu bớt lại.',
    relatedLab: 'part9',
  },
  {
    id: 'econ-ch35',
    topic: 'part9',
    chapterLabel: 'Ch. 35',
    title: 'The Short-Run Trade-Off between Inflation & Unemployment (Phillips Curve)',
    titleVi: 'Đánh đổi ngắn hạn giữa Lạm phát và Thất nghiệp (Đường Phillips)',
    summary:
      'SRPC shows an inverse short-run trade-off from AD shifts: u = u_n − a(π − π^e). LRPC is vertical at the natural rate u_n (no long-run trade-off — Friedman & Phelps). Supply shocks shift BOTH SRAS left and SRPC right. Disinflation requires temporary recession measured by the Sacrifice Ratio (% annual GDP lost per 1% inflation drop), though credible central banks lower π^e faster for a lower sacrifice ratio.',
    summaryVi:
      'Đường Phillips ngắn hạn (SRPC) dốc xuống: u = u_n − a(π − π^e). Dài hạn LRPC thẳng đứng tại u_n (không có đánh đổi dài hạn). Sốc cung bất lợi đẩy SRPC dịch phải. Tỷ lệ hy sinh đo % GDP mất đi để giảm 1% lạm phát (giảm mạnh nếu NHTW có uy tín cao).',
    formulas: [
      'u = u_n - a(\\pi - \\pi^e), \\quad \\text{Sacrifice Ratio} = \\frac{\\text{Total }\\%\\Delta Y}{\\Delta \\pi}',
    ],
    examTrap:
      'Demand shifts cause MOVEMENT ALONG a fixed SRPC; changes in expected inflation π^e or supply shocks SHIFT the SRPC curve!',
    examTrapVi:
      'Thay đổi tổng cầu AD gây DI CHUYỂN DỌC theo SRPC; còn thay đổi kỳ vọng lạm phát π^e hoặc sốc cung gây DỊCH CHUYỂN cả đường SRPC!',
    relatedLab: 'part9',
  },
];

export const ECON_GLOSSARY: EconGlossaryItem[] = [
  { en: 'Gross Domestic Product (GDP)', vi: 'Tổng sản phẩm quốc nội', topic: 'part6', note: 'Market value of final goods produced inside a country' },
  { en: 'Gross National Product (GNP)', vi: 'Tổng sản phẩm quốc dân', topic: 'part6', note: 'Output produced by a nation’s permanent residents/citizens' },
  { en: 'Nominal vs. Real GDP', vi: 'GDP danh nghĩa vs. GDP thực', topic: 'part6', note: 'Current prices vs. constant base-year prices' },
  { en: 'GDP Deflator', vi: 'Chỉ số giảm phát GDP', topic: 'part6', note: '(Nominal GDP / Real GDP) × 100' },
  { en: 'Consumer Price Index (CPI)', vi: 'Chỉ số giá tiêu dùng', topic: 'part6', note: 'Cost of a fixed consumer basket relative to base year' },
  { en: 'Substitution Bias', vi: 'Sai lệch thay thế', topic: 'part6', note: 'CPI ignores consumers switching away from pricier goods' },
  { en: 'Indexation', vi: 'Điều chỉnh trượt giá (Chỉ số hóa)', topic: 'part6', note: 'Automatic dollar adjustment by CPI changes' },
  { en: 'Nominal vs. Real Interest Rate', vi: 'Lãi suất danh nghĩa vs. thực', topic: 'part6', note: 'r = i − π' },
  { en: 'Productivity (Y/L)', vi: 'Năng suất lao động', topic: 'part6', note: 'Output per unit of labor input' },
  { en: 'Physical / Human Capital', vi: 'Vốn vật chất / Vốn nhân lực', topic: 'part6', note: 'Equipment & structures / Education & skills' },
  { en: 'Diminishing Returns', vi: 'Lợi suất giảm dần', topic: 'part6', note: 'Extra capital adds less output as K/L grows' },
  { en: 'Catch-Up Effect', vi: 'Hiệu ứng bắt kịp', topic: 'part6', note: 'Poorer economies grow faster from low initial K/L' },
  { en: 'Private / Public / National Saving', vi: 'Tiết kiệm tư nhân / công / quốc gia', topic: 'part6', note: 'Y−T−C, T−G, and Y−C−G' },
  { en: 'Market for Loanable Funds', vi: 'Thị trường vốn vay', topic: 'part6', note: 'Supply = Saving; Demand = Investment (+ NCO)' },
  { en: 'Crowding Out', vi: 'Hiệu ứng chèn lấn', topic: 'part6', note: 'Higher government borrowing raises r, reducing private I' },
  { en: 'P/E Ratio', vi: 'Hệ số Giá trên Thu nhập (P/E)', topic: 'part6', note: 'Stock Price / Earnings per share' },
  { en: 'Labor Force', vi: 'Lực lượng lao động', topic: 'part6', note: 'Employed + Unemployed' },
  { en: 'Discouraged Workers', vi: 'Người lao động nản chí', topic: 'part6', note: 'Stopped looking → excluded from labor force & u-rate' },
  { en: 'Frictional Unemployment', vi: 'Thất nghiệp cọ xát', topic: 'part6', note: 'Time spent searching/matching jobs' },
  { en: 'Structural Unemployment', vi: 'Thất nghiệp cơ cấu', topic: 'part6', note: 'Wages held above equilibrium (min wage, unions, efficiency wages)' },
  { en: 'Efficiency Wages', vi: 'Tiền lương hiệu quả', topic: 'part6', note: 'Above-equilibrium wages paid to boost worker effort/retention' },
  { en: 'Fiat vs. Commodity Money', vi: 'Tiền pháp định vs. Tiền hàng hóa', topic: 'part7', note: 'Money without intrinsic value vs. intrinsic value (gold)' },
  { en: 'Fractional-Reserve Banking', vi: 'Ngân hàng dự trữ một phần', topic: 'part7', note: 'Banks hold only fraction R of deposits as reserves' },
  { en: 'Money Multiplier', vi: 'Số nhân tiền', topic: 'part7', note: '1 / R (simple) or (1+cr)/(rr+er+cr) (actual)' },
  { en: 'Open-Market Operations (OMO)', vi: 'Nghiệp vụ thị trường mở', topic: 'part7', note: 'Central bank buys/sells bonds to change reserves & MS' },
  { en: 'Leverage Ratio', vi: 'Tỷ lệ đòn bẩy', topic: 'part7', note: 'Bank Total Assets / Bank Capital' },
  { en: 'Quantity Theory of Money', vi: 'Thuyết số lượng tiền tệ', topic: 'part7', note: 'M × V = P × Y' },
  { en: 'Classical Dichotomy & Neutrality', vi: 'Lưỡng phân cổ điển & Trung tính tiền tệ', topic: 'part7', note: 'Long-run money changes affect nominal vars only, not real Y' },
  { en: 'Fisher Effect', vi: 'Hiệu ứng Fisher', topic: 'part7', note: 'Nominal interest rate rises 1-for-1 with inflation' },
  { en: 'Shoeleather & Menu Costs', vi: 'Chi phí mòn giày & Chi phí thực đơn', topic: 'part7', note: 'Resources wasted minimizing cash & updating prices' },
  { en: 'Inflation Tax', vi: 'Thuế lạm phát', topic: 'part7', note: 'Revenue raised by printing money (erodes cash value)' },
  { en: 'Net Capital Outflow (NCO)', vi: 'Dòng vốn ra ròng', topic: 'part8', note: 'Domestic purchase of foreign assets − Foreign purchase of domestic assets' },
  { en: 'FDI vs. Portfolio Investment', vi: 'Đầu tư trực tiếp (FDI) vs. Gián tiếp', topic: 'part8', note: 'Active factory ownership vs. passive shares/bonds' },
  { en: 'Nominal vs. Real Exchange Rate', vi: 'Tỷ giá danh nghĩa (e) vs. Thực (ε)', topic: 'part8', note: 'Currency swap rate vs. goods swap rate ε = eP/P*' },
  { en: 'Appreciation vs. Depreciation', vi: 'Tăng giá vs. Mất giá tiền tệ', topic: 'part8', note: 'Buys more vs. fewer units of foreign currency' },
  { en: 'Purchasing-Power Parity (PPP)', vi: 'Ngang giá sức mua', topic: 'part8', note: 'Arbitrage pushes real exchange rate ε → 1 (e = P*/P)' },
  { en: 'Twin Deficits', vi: 'Thâm hụt kép', topic: 'part8', note: 'Budget deficit reduces S, pushing NX into trade deficit' },
  { en: 'Capital Flight', vi: 'Tháo chạy vốn', topic: 'part8', note: 'Sudden jump in NCO raises r, depreciates e, boosts NX' },
  { en: 'Aggregate Demand (AD)', vi: 'Tổng cầu', topic: 'part9', note: 'Slopes down: Wealth, Interest-rate & Exchange-rate effects' },
  { en: 'LRAS vs. SRAS', vi: 'Tổng cung dài hạn vs. ngắn hạn', topic: 'part9', note: 'Vertical at Y_n vs. upward-sloping (sticky wages/prices)' },
  { en: 'Stagflation', vi: 'Lạm phát đình trệ', topic: 'part9', note: 'Falling output (Y↓) & rising prices (P↑) from SRAS left shift' },
  { en: 'Theory of Liquidity Preference', vi: 'Lý thuyết ưa thích thanh khoản', topic: 'part9', note: 'Money market sets r in the short run' },
  { en: 'Spending & Tax Multipliers', vi: 'Số nhân chi tiêu & Số nhân thuế', topic: 'part9', note: '1/(1−MPC) and −MPC/(1−MPC)' },
  { en: 'Automatic Stabilizers', vi: 'Bộ ổn định tự động', topic: 'part9', note: 'Tax brackets & unemployment insurance stabilizing AD automatically' },
  { en: 'Phillips Curve (SRPC / LRPC)', vi: 'Đường cong Phillips', topic: 'part9', note: 'Short-run π–u trade-off vs. vertical LRPC at u_n' },
  { en: 'Sacrifice Ratio & Rational Expectations', vi: 'Tỷ lệ hy sinh & Kỳ vọng hợp lý', topic: 'part9', note: 'GDP cost per 1% disinflation; lower if policy is credible' },
];

export const ECON_MCQS: EconMcq[] = [
  // PART 6: Ch. 23, 24, 25, 26, 28 (16 MCQs)
  {
    id: 'mcq-23-1',
    topic: 'part6',
    chapter: 'Ch. 23',
    question:
      'A Vietnamese chef owns and operates a Pho restaurant in California, USA. How is the restaurant’s income counted?',
    questionVi: 'Một đầu bếp người Việt sở hữu và vận hành quán phở tại California, Mỹ. Thu nhập này tính vào đâu?',
    choices: [
      'Included in Vietnam GDP and US GNP',
      'Included in US GDP and Vietnam GNP',
      'Included in both US GDP and Vietnam GDP',
      'Excluded from both because it is a service',
    ],
    correctIndex: 1,
    explanation: 'GDP measures output produced within a country’s borders (US GDP); GNP measures output produced by a nation’s citizens/residents (Vietnam GNP).',
    explanationVi: 'GDP tính theo lãnh thổ (ở Mỹ ⇒ GDP Mỹ); GNP tính theo quốc tịch (người Việt ⇒ GNP Việt Nam).',
  },
  {
    id: 'mcq-23-2',
    topic: 'part6',
    chapter: 'Ch. 23',
    question:
      'Ford builds $50 million of cars in 2023 and puts them into inventory, then sells them to households in 2024. What happens to 2023 and 2024 GDP?',
    questionVi: 'Ford sản xuất $50M ô tô vào 2023 đưa vào kho, rồi bán cho hộ gia đình năm 2024. GDP 2 năm thay đổi thế nào?',
    choices: [
      '2023 GDP unchanged; 2024 GDP rises by $50M',
      '2023 GDP rises by $50M (Investment); 2024 GDP is unchanged (C +$50M, I −$50M)',
      'Both 2023 and 2024 GDP rise by $50M',
      'Only 2023 GDP rises if exported',
    ],
    correctIndex: 1,
    explanation: 'Unsold production enters Investment (inventory) in 2023. When sold in 2024, Consumption rises by $50M and Inventory Investment falls by $50M, leaving 2024 GDP unchanged.',
    explanationVi: 'Hàng tồn kho tính vào Đầu tư I của năm sản xuất (2023); khi bán ra năm 2024 thì C tăng $50M và I giảm $50M nên GDP 2024 không đổi.',
  },
  {
    id: 'mcq-23-3',
    topic: 'part6',
    chapter: 'Ch. 23',
    question:
      'Suppose C = $4,500, I = $1,200, G = $1,400, Exports = $500, Imports = $600, and Depreciation = $300. What is GDP?',
    questionVi: 'Cho C = $4,500, I = $1,200, G = $1,400, Xuất khẩu = $500, Nhập khẩu = $600, Khấu hao = $300. Tính GDP:',
    choices: ['$6,700', '$7,000', '$7,300', '$8,200'],
    correctIndex: 1,
    explanation: 'GDP = C + I + G + (Exports − Imports) = 4500 + 1200 + 1400 + (500 − 600) = $7,000. Depreciation is NOT subtracted from GDP (it converts GDP to NDP).',
    explanationVi: 'GDP = 4500 + 1200 + 1400 + (500 − 600) = $7,000 (không trừ khấu hao khỏi GDP).',
  },
  {
    id: 'mcq-24-1',
    topic: 'part6',
    chapter: 'Ch. 24',
    question:
      'If the price of imported French wine sold to US consumers doubles while domestic US goods stay unchanged in price, then:',
    questionVi: 'Giá rượu vang Pháp nhập khẩu vào Mỹ tăng gấp đôi trong khi hàng sản xuất tại Mỹ giữ nguyên giá:',
    choices: [
      'Both CPI and GDP deflator rise equally',
      'GDP deflator rises; CPI is unchanged',
      'CPI rises; GDP deflator is unchanged',
      'Neither CPI nor GDP deflator rises',
    ],
    correctIndex: 2,
    explanation: 'CPI tracks a basket of goods bought by typical consumers (including imports); the GDP deflator covers only domestically produced goods.',
    explanationVi: 'CPI đo giỏ hàng tiêu dùng (gồm cả hàng nhập khẩu) nên tăng; GDP Deflator chỉ đo hàng sản xuất trong nước nên không đổi.',
  },
  {
    id: 'mcq-24-2',
    topic: 'part6',
    chapter: 'Ch. 24',
    question:
      'Which of the following is NOT one of the three problems that cause CPI to overstate the true cost of living?',
    questionVi: 'Điều nào KHÔNG phải là nguyên nhân khiến CPI phóng đại chi phí sinh hoạt thực?',
    choices: [
      'Substitution bias',
      'Introduction of new goods',
      'Unmeasured quality change',
      'Inclusion of capital goods purchased by firms',
    ],
    correctIndex: 3,
    explanation: 'Capital goods purchased by firms are in the GDP deflator, NOT the CPI. The 3 CPI biases are substitution bias, new goods, and unmeasured quality change.',
    explanationVi: 'Hàng hóa tư bản của doanh nghiệp không nằm trong CPI; 3 sai lệch của CPI là lệch thay thế, hàng mới và thay đổi chất lượng.',
  },
  {
    id: 'mcq-24-3',
    topic: 'part6',
    chapter: 'Ch. 24',
    question:
      'You put money in a bank account earning 6% nominal interest while inflation is 8%. What happens to your purchasing power and real interest rate?',
    questionVi: 'Gửi tiết kiệm lãi suất danh nghĩa 6% khi lạm phát là 8%. Sức mua và lãi suất thực của bạn thế nào?',
    choices: [
      'Real interest rate is +2%; purchasing power rises by 2%',
      'Real interest rate is −2%; purchasing power falls by 2%',
      'Real interest rate is +14%; purchasing power rises',
      'Real interest rate is +6% regardless of inflation',
    ],
    correctIndex: 1,
    explanation: 'Real interest rate = 6% − 8% = −2%, meaning your dollars buy 2% fewer goods after a year.',
    explanationVi: 'Lãi suất thực = 6% − 8% = −2%, nghĩa là sức mua thực tế giảm 2%.',
  },
  {
    id: 'mcq-25-1',
    topic: 'part6',
    chapter: 'Ch. 25',
    question:
      'Because of diminishing returns to capital, holding technology and population growth constant, a higher saving rate causes:',
    questionVi: 'Do lợi suất giảm dần của vốn, khi công nghệ không đổi, tăng tỷ lệ tiết kiệm sẽ:',
    choices: [
      'Permanently higher growth rate of GDP per person forever',
      'Higher growth only temporarily until the economy reaches a higher steady-state level of income',
      'Lower steady-state income per worker',
      'A permanent drop in human capital',
    ],
    correctIndex: 1,
    explanation: 'Higher saving raises capital and boosts growth during the transition, but diminishing returns eventually pull the growth rate back down at a higher level of income.',
    explanationVi: 'Tỷ lệ tiết kiệm cao chỉ tăng tốc độ tăng trưởng tạm thời trong giai đoạn chuyển tiếp lên mức thu nhập mới cao hơn.',
  },
  {
    id: 'mcq-25-2',
    topic: 'part6',
    chapter: 'Ch. 25',
    question:
      'Which statement correctly distinguishes Technological Knowledge from Human Capital?',
    questionVi: 'Phát biểu nào phân biệt đúng Tri thức công nghệ và Vốn nhân lực?',
    choices: [
      'Technological knowledge is workers’ years of schooling; human capital is patents',
      'Technological knowledge is society’s understanding of how to produce goods; human capital is the skills/education embodied in workers',
      'They are identical terms in Mankiw’s production function',
      'Human capital can be copied freely without cost like blueprints',
    ],
    correctIndex: 1,
    explanation: 'Mankiw’s metaphor: technological knowledge is the quality of society’s textbooks; human capital is the amount of time the population has spent reading them.',
    explanationVi: 'Tri thức công nghệ là hiểu biết chung về cách sản xuất (như sách giáo khoa), còn vốn nhân lực là kỹ năng tích lũy trong người lao động.',
  },
  {
    id: 'mcq-26-1',
    topic: 'part6',
    chapter: 'Ch. 26',
    question:
      'In a closed economy, Y = 10,000, C = 6,200, G = 1,800, and T = 1,500. What are Private Saving, Public Saving, and Investment?',
    questionVi: 'Trong nền kinh tế đóng, Y=10,000, C=6,200, G=1,800, T=1,500. Tính tiết kiệm tư nhân, tiết kiệm công và đầu tư:',
    choices: [
      'Private = 2,300; Public = −300; Investment = 2,000',
      'Private = 2,000; Public = +300; Investment = 2,300',
      'Private = 2,300; Public = +300; Investment = 2,600',
      'Private = 3,800; Public = −1,800; Investment = 2,000',
    ],
    correctIndex: 0,
    explanation: 'Private S = Y−T−C = 10,000−1,500−6,200 = 2,300; Public S = T−G = 1,500−1,800 = −300 (budget deficit); I = S = 2,300 + (−300) = 2,000.',
    explanationVi: 'S_tư nhân = 10000−1500−6200 = 2300; S_công = 1500−1800 = −300; I = S_quốc gia = 2000.',
  },
  {
    id: 'mcq-26-2',
    topic: 'part6',
    chapter: 'Ch. 26',
    question:
      'If Congress passes an investment tax credit (making firms want to buy more new machinery at every interest rate), in the Market for Loanable Funds:',
    questionVi: 'Nếu chính phủ áp dụng ưu đãi thuế đầu tư (khuyến khích doanh nghiệp mua máy móc mới), trên thị trường vốn vay:',
    choices: [
      'Supply shifts right; interest rate falls and saving rises',
      'Demand shifts right; equilibrium interest rate rises and saving/investment rise',
      'Supply shifts left; interest rate rises and investment falls',
      'Demand shifts left; interest rate falls',
    ],
    correctIndex: 1,
    explanation: 'An investment tax credit increases firms’ borrowing demand at every interest rate → Demand shifts RIGHT → r rises and equilibrium quantity of saving & investment rises.',
    explanationVi: 'Ưu đãi thuế đầu tư đẩy đường Cầu vốn vay dịch PHẢI ⇒ lãi suất cân bằng r tăng và lượng tiết kiệm/đầu tư đều tăng.',
  },
  {
    id: 'mcq-28-1',
    topic: 'part6',
    chapter: 'Ch. 28',
    question:
      'If discouraged workers give up looking for jobs and leave the labor force, what happens to the official unemployment rate and LFPR?',
    questionVi: 'Nếu người nản chí ngừng tìm việc và rời khỏi lực lượng lao động, tỷ lệ thất nghiệp và LFPR thay đổi thế nào?',
    choices: [
      'Both unemployment rate and LFPR rise',
      'Unemployment rate falls and LFPR falls',
      'Unemployment rate rises and LFPR falls',
      'Both stay unchanged',
    ],
    correctIndex: 1,
    explanation: 'Both U and LF decrease by the same amount so u-rate = U/LF falls; LF falls while adult population is unchanged so LFPR also falls.',
    explanationVi: 'Cả người thất nghiệp U và lực lượng lao động LF đều giảm một lượng như nhau nên tỷ lệ thất nghiệp giảm và tỷ lệ tham gia LFPR cũng giảm.',
  },
  {
    id: 'mcq-28-2',
    topic: 'part6',
    chapter: 'Ch. 28',
    question:
      'Why might a firm voluntarily pay "efficiency wages" above the market-clearing equilibrium wage?',
    questionVi: 'Tại sao doanh nghiệp tự nguyện trả "tiền lương hiệu quả" cao hơn mức cân bằng thị trường?',
    choices: [
      'To comply with minimum wage laws only',
      'To improve worker health, lower turnover, raise effort, and attract higher-quality applicants',
      'To reduce total firm revenue',
      'Because unions force every non-union firm to do so',
    ],
    correctIndex: 1,
    explanation: 'Efficiency-wage theories explain how higher wages boost worker productivity through better health, lower turnover, stronger effort, and higher applicant quality.',
    explanationVi: 'Lương cao hơn mức cân bằng giúp giảm tỷ lệ nghỉ việc, tăng nỗ lực làm việc và thu hút ứng viên giỏi hơn.',
  },

  // PART 7: Ch. 29, 30 (10 MCQs)
  {
    id: 'mcq-29-1',
    topic: 'part7',
    chapter: 'Ch. 29',
    question:
      'If the reserve ratio is 20%, banks hold no excess reserves, and people hold no currency, a $500 open-market bond purchase by the Fed can raise the money supply by at most:',
    questionVi: 'Với tỷ lệ dự trữ 20%, không dự trữ dư thừa hay rò rỉ tiền mặt, NHTW mua $500 trái phiếu làm cung tiền tăng tối đa:',
    choices: ['$500', '$1,000', '$2,500', '$5,000'],
    correctIndex: 2,
    explanation: 'Simple money multiplier = 1 / 0.20 = 5. Maximum expansion = $500 × 5 = $2,500.',
    explanationVi: 'Số nhân tiền = 1 / 0.20 = 5 ⇒ Cung tiền tăng tối đa $500 × 5 = $2,500.',
  },
  {
    id: 'mcq-29-2',
    topic: 'part7',
    chapter: 'Ch. 29',
    question:
      'A bank has $800 in loans, $100 in reserves, $100 in securities, $950 in deposits, and $50 in bank capital. What is its leverage ratio, and what happens if loans lose $60 in value?',
    questionVi: 'Ngân hàng có tổng tài sản $1,000 và vốn chủ $50. Tỷ lệ đòn bẩy là bao nhiêu và điều gì xảy ra nếu nợ xấu làm mất $60 giá trị tài sản?',
    choices: [
      'Leverage = 10; bank stays solvent',
      'Leverage = 20; bank becomes insolvent (capital becomes −$10)',
      'Leverage = 5; depositors gain $10',
      'Leverage = 20; bank capital rises to $110',
    ],
    correctIndex: 1,
    explanation: 'Leverage ratio = Assets / Capital = 1000 / 50 = 20. A $60 drop in asset value exceeds the $50 capital cushion, wiping out equity (insolvency).',
    explanationVi: 'Đòn bẩy = 1000 / 50 = 20. Khi tài sản giảm $60 (> vốn $50), vốn chủ âm −$10 và ngân hàng mất khả năng thanh toán.',
  },
  {
    id: 'mcq-29-3',
    topic: 'part7',
    chapter: 'Ch. 29',
    question:
      'Which action by the central bank DECREASES the money supply?',
    questionVi: 'Hành động nào của ngân hàng trung ương làm GIẢM cung tiền?',
    choices: [
      'Buying government bonds in open-market operations',
      'Lowering the reserve requirement',
      'Raising the interest rate paid on bank reserves (IOR) or selling government bonds',
      'Lowering the discount rate',
    ],
    correctIndex: 2,
    explanation: 'Selling bonds drains reserves; paying higher interest on reserves encourages banks to hold more reserves and lend less — both shrink the money supply.',
    explanationVi: 'Bán trái phiếu rút dự trữ khỏi hệ thống; tăng lãi suất trả cho tiền dự trữ khiến ngân hàng giữ dự trữ nhiều hơn và cho vay ít đi ⇒ giảm cung tiền.',
  },
  {
    id: 'mcq-30-1',
    topic: 'part7',
    chapter: 'Ch. 30',
    question:
      'According to the Classical Dichotomy and Monetary Neutrality, doubling the money supply in the long run:',
    questionVi: 'Theo lưỡng phân cổ điển và tính trung tính tiền tệ, tăng gấp đôi cung tiền trong dài hạn sẽ:',
    choices: [
      'Doubles real GDP and halves unemployment',
      'Doubles the price level and nominal wages, leaving real GDP and real interest rates unchanged',
      'Cuts real interest rates in half permanently',
      'Permanently doubles velocity V',
    ],
    correctIndex: 1,
    explanation: 'Long-run monetary neutrality means money growth changes nominal variables (P, nominal wages, nominal i) proportionally without changing real variables (Y, r).',
    explanationVi: 'Dài hạn tiền tệ chỉ tác động tỷ lệ thuận lên biến danh nghĩa (P, lương danh nghĩa, i), không đổi biến thực (Y, r).',
  },
  {
    id: 'mcq-30-2',
    topic: 'part7',
    chapter: 'Ch. 30',
    question:
      'Suppose real GDP grows at 3% per year, velocity is constant, and the central bank increases money supply by 8% per year. By the Quantity Equation, long-run inflation is approximately:',
    questionVi: 'Nếu GDP thực tăng 3%/năm, tốc độ lưu thông V không đổi, cung tiền tăng 8%/năm, lạm phát dài hạn xấp xỉ:',
    choices: ['11%', '5%', '8%', '2.67%'],
    correctIndex: 1,
    explanation: '%ΔM + %ΔV = π + %ΔY ⇒ 8% + 0% = π + 3% ⇒ π = 5%.',
    explanationVi: 'Từ MV = PY ⇒ %ΔM + %ΔV = π + %ΔY ⇒ π = 8% − 3% = 5%.',
  },
  {
    id: 'mcq-30-3',
    topic: 'part7',
    chapter: 'Ch. 30',
    question:
      'Unexpectedly HIGH inflation (higher than everyone expected when signing a fixed-rate loan contract) benefits:',
    questionVi: 'Lạm phát thực tế CAO HƠN dự kiến khi ký hợp đồng vay lãi suất cố định sẽ có lợi cho ai?',
    choices: [
      'Lenders (creditors), because the real value of repayments rises',
      'Borrowers (debtors), because they repay the loan with dollars that are worth less',
      'Both borrowers and lenders equally via the Fisher effect',
      'Only households holding large amounts of physical cash',
    ],
    correctIndex: 1,
    explanation: 'Unexpected inflation lowers the ex-post real interest rate, transferring real wealth from lenders to borrowers.',
    explanationVi: 'Lạm phát bất ngờ cao làm giảm giá trị thực của khoản nợ trả lại, có lợi cho người đi vay và gây thiệt hại cho người cho vay.',
  },

  // PART 8: Ch. 31, 32 (8 MCQs)
  {
    id: 'mcq-31-1',
    topic: 'part8',
    chapter: 'Ch. 31',
    question:
      'A US resident buys 500 shares of Sony in Tokyo, while Hyundai builds a new EV plant in Georgia (USA). How are these classified and how do they affect US NCO?',
    questionVi: 'Người Mỹ mua 500 cổ phiếu Sony tại Tokyo; Hyundai xây nhà máy mới ở Mỹ. Phân loại và tác động đến NCO của Mỹ thế nào?',
    choices: [
      'Sony purchase is FDI (US NCO↑); Hyundai plant is portfolio (US NCO↑)',
      'Sony purchase is portfolio investment (US NCO↑); Hyundai plant is FDI (US NCO↓)',
      'Both decrease US NCO',
      'Neither affects US NCO',
    ],
    correctIndex: 1,
    explanation: 'Buying foreign stock without active control is portfolio investment (increases US NCO); Hyundai building a US factory is inward FDI (decreases US NCO).',
    explanationVi: 'Mua cổ phiếu nước ngoài là đầu tư gián tiếp (làm NCO Mỹ tăng); Hyundai xây nhà máy tại Mỹ là FDI vào Mỹ (làm NCO Mỹ giảm).',
  },
  {
    id: 'mcq-31-2',
    topic: 'part8',
    chapter: 'Ch. 31',
    question:
      'A coffee costs $4 in the US and 100 pesos in Mexico. If the nominal exchange rate is 20 pesos per US dollar, what is the real exchange rate (Mexican coffees per US coffee)?',
    questionVi: 'Một ly cà phê giá $4 ở Mỹ và 100 peso ở Mexico; tỷ giá danh nghĩa e = 20 peso/USD. Tỷ giá thực ε bằng bao nhiêu?',
    choices: ['0.80', '1.25', '5.00', '0.50'],
    correctIndex: 0,
    explanation: 'ε = (e × P_US) / P_Mex = (20 × 4) / 100 = 80 / 100 = 0.80. US coffee is cheaper than Mexican coffee, so US exports rise under arbitrage.',
    explanationVi: 'ε = (20 × 4) / 100 = 0.80 (cà phê Mỹ đang rẻ hơn so với Mexico).',
  },
  {
    id: 'mcq-31-3',
    topic: 'part8',
    chapter: 'Ch. 31',
    question:
      'According to Purchasing-Power Parity (PPP), if Country A prints money rapidly causing 25% inflation while Country B has 2% inflation, Country A’s currency will:',
    questionVi: 'Theo ngang giá sức mua PPP, nếu nước A lạm phát 25% còn nước B lạm phát 2%, đồng tiền nước A sẽ:',
    choices: [
      'Appreciate in nominal terms',
      'Depreciate in nominal terms',
      'Stay fixed in nominal terms while real exchange rate doubles',
      'Become commodity money',
    ],
    correctIndex: 1,
    explanation: 'Because e = P*/P, faster price growth P in Country A means each unit of Country A’s currency buys fewer units of Country B’s currency (nominal depreciation).',
    explanationVi: 'Theo PPP, đồng tiền của nước có lạm phát cao hơn sẽ mất giá danh nghĩa tương ứng.',
  },
  {
    id: 'mcq-32-1',
    topic: 'part8',
    chapter: 'Ch. 32',
    question:
      'In Mankiw’s Open-Economy model (Ch. 32), if the government runs a larger budget deficit, what happens to r, NCO, the real exchange rate, and Net Exports (NX)?',
    questionVi: 'Trong mô hình kinh tế mở Ch. 32, thâm hụt ngân sách tăng gây ra kết quả gì?',
    choices: [
      'r↓, NCO↑, real FX depreciates, NX↑',
      'r↑, NCO↓, real FX appreciates, NX↓ (twin deficits)',
      'r↑, NCO↑, real FX depreciates, NX↑',
      'r unchanged, real FX appreciates, NX unchanged',
    ],
    correctIndex: 1,
    explanation: 'Lower public saving shifts Loanable Funds supply LEFT → r rises → NCO falls → FX supply shifts LEFT → currency appreciates → NX falls.',
    explanationVi: 'Cung vốn vay dịch trái ⇒ r↑ ⇒ NCO↓ ⇒ cung ngoại hối dịch trái ⇒ nội tệ lên giá ⇒ NX giảm (Thâm hụt kép).',
  },
  {
    id: 'mcq-32-2',
    topic: 'part8',
    chapter: 'Ch. 32',
    question:
      'In the Open-Economy model, if the government imposes a strict import quota on foreign cars, what happens to the real exchange rate and Net Exports (NX)?',
    questionVi: 'Nếu chính phủ áp hạn ngạch nhập khẩu ô tô trong nền kinh tế mở, tỷ giá thực và NX thay đổi thế nào?',
    choices: [
      'Real exchange rate depreciates; NX rises',
      'Real exchange rate appreciates; NX stays unchanged',
      'Real interest rate rises; NX falls',
      'Both real exchange rate and NX stay unchanged',
    ],
    correctIndex: 1,
    explanation: 'FX demand shifts right → currency appreciates, making domestic exports costlier until exports fall by the exact drop in imports, leaving NX = NCO = S−I unchanged!',
    explanationVi: 'Cầu ngoại hối dịch phải ⇒ đồng nội tệ lên giá ⇒ xuất khẩu giảm đúng bằng lượng nhập khẩu giảm ⇒ NX không đổi!',
  },
  {
    id: 'mcq-32-3',
    topic: 'part8',
    chapter: 'Ch. 32',
    question:
      'During sudden political instability (capital flight), investors rush to move wealth out of a country. What are the 4 equilibrium outcomes?',
    questionVi: 'Khi xảy ra tháo chạy vốn (capital flight) do bất ổn chính trị, 4 biến vĩ mô thay đổi thế nào?',
    choices: [
      'r↑, NCO↑, real FX depreciates, NX↑',
      'r↓, NCO↓, real FX appreciates, NX↓',
      'r↑, NCO↓, real FX appreciates, NX↓',
      'r unchanged, NCO↑, real FX depreciates, NX unchanged',
    ],
    correctIndex: 0,
    explanation: 'NCO shifts RIGHT → loanable funds demand (I+NCO) shifts RIGHT so r rises; higher NCO increases FX supply so the currency depreciates and NX increases.',
    explanationVi: 'NCO dịch phải ⇒ cầu vốn vay tăng (r↑) và cung nội tệ trên thị trường ngoại hối tăng ⇒ nội tệ mất giá ⇒ NX tăng.',
  },

  // PART 9: Ch. 33, 34, 35 (12 MCQs)
  {
    id: 'mcq-33-1',
    topic: 'part9',
    chapter: 'Ch. 33',
    question:
      'Why does the Aggregate Demand (AD) curve slope downward? Which of the following is NOT one of Mankiw’s 3 reasons?',
    questionVi: 'Vì sao đường Tổng cầu AD dốc xuống? Ý nào KHÔNG phải một trong 3 hiệu ứng của Mankiw?',
    choices: [
      'The Wealth Effect (P↓ makes money holdings feel wealthier → C↑)',
      'The Interest-Rate Effect (P↓ reduces money demand → r↓ → I↑)',
      'The Exchange-Rate Effect (P↓ → r↓ → currency depreciates → NX↑)',
      'The Substitution Effect between pizza and burgers',
    ],
    correctIndex: 3,
    explanation: 'Micro substitution between two single goods does not explain aggregate demand; macro AD slopes down due to Wealth, Interest-Rate, and Exchange-Rate effects.',
    explanationVi: 'Đường AD dốc xuống do 3 hiệu ứng: Của cải, Lãi suất và Tỷ giá (không phải thay thế giữa 2 mặt hàng vi mô).',
  },
  {
    id: 'mcq-33-2',
    topic: 'part9',
    chapter: 'Ch. 33',
    question:
      'Starting from long-run equilibrium, an adverse supply shock (e.g., an oil spike) hits the economy. In the short run:',
    questionVi: 'Từ cân bằng dài hạn, nền kinh tế gặp cú sốc cung bất lợi (giá dầu tăng mạnh). Trong ngắn hạn:',
    choices: [
      'AD shifts right; output rises and prices rise',
      'SRAS shifts left; output falls and the price level rises (stagflation)',
      'LRAS shifts left permanently even if energy prices recover',
      'SRAS shifts right; output rises and prices fall',
    ],
    correctIndex: 1,
    explanation: 'Higher input costs shift SRAS LEFT, causing both falling real GDP (recession/unemployment) and rising price level — stagflation.',
    explanationVi: 'Chi phí sản xuất tăng đẩy SRAS sang TRÁI, gây lạm phát đình trệ: sản lượng Y giảm và mức giá P tăng.',
  },
  {
    id: 'mcq-33-3',
    topic: 'part9',
    chapter: 'Ch. 33',
    question:
      'Suppose pessimism causes households and firms to cut spending, shifting AD left into a recession. If policymakers take NO action, how does the economy self-correct in the long run?',
    questionVi: 'Nếu tổng cầu giảm đẩy nền kinh tế vào suy thoái và chính phủ KHÔNG can thiệp, nền kinh tế tự điều chỉnh dài hạn thế nào?',
    choices: [
      'LRAS shifts left to meet the lower AD curve',
      'Over time, lower expected prices reduce nominal wages/costs, shifting SRAS right back to Y_n at a lower P',
      'AD automatically shifts back right on its own due to higher inflation',
      'The central bank is forced by law to print money',
    ],
    correctIndex: 1,
    explanation: 'High unemployment and lower prices eventually push expected prices P^e and nominal wages down, shifting SRAS RIGHT until Y returns to Y_n.',
    explanationVi: 'Thất nghiệp cao và giá thấp dần kéo kỳ vọng giá và tiền lương danh nghĩa giảm xuống, đẩy SRAS dịch PHẢI về lại sản lượng tự nhiên Y_n.',
  },
  {
    id: 'mcq-34-1',
    topic: 'part9',
    chapter: 'Ch. 34',
    question:
      'In Keynes’ Theory of Liquidity Preference, when the central bank increases the money supply in the short run:',
    questionVi: 'Theo lý thuyết ưa thích thanh khoản của Keynes, khi NHTW tăng cung tiền trong ngắn hạn:',
    choices: [
      'The equilibrium interest rate rises, shifting AD left',
      'The equilibrium interest rate falls, stimulating investment I and shifting AD right',
      'Money demand shifts left automatically',
      'Only LRAS shifts right',
    ],
    correctIndex: 1,
    explanation: 'At the old interest rate there is excess supply of money, so people buy bonds and push the interest rate r down, boosting investment I and shifting AD right.',
    explanationVi: 'Cung tiền tăng làm lãi suất cân bằng r giảm, kích thích đầu tư I và đẩy đường AD dịch phải.',
  },
  {
    id: 'mcq-34-2',
    topic: 'part9',
    chapter: 'Ch. 34',
    question:
      'If MPC = 0.8 (ignoring crowding out), how large is the Spending Multiplier, and how large is the Tax Multiplier?',
    questionVi: 'Nếu MPC = 0.8 (bỏ qua chèn lấn), số nhân chi tiêu và số nhân thuế lần lượt là bao nhiêu?',
    choices: [
      'Spending = 5; Tax = −4',
      'Spending = 4; Tax = −5',
      'Spending = 5; Tax = −5',
      'Spending = 1.25; Tax = −0.8',
    ],
    correctIndex: 0,
    explanation: 'Spending multiplier = 1/(1−0.8) = 5. Tax multiplier = −0.8/(1−0.8) = −4. Notice a $100 tax cut shifts AD less than a $100 government purchase because households save 20% of the tax cut!',
    explanationVi: 'Số nhân chi tiêu = 1/(1−0.8) = 5; số nhân thuế = −0.8/(1−0.8) = −4 (nhỏ hơn vì hộ gia đình tiết kiệm một phần tiền giảm thuế).',
  },
  {
    id: 'mcq-34-3',
    topic: 'part9',
    chapter: 'Ch. 34',
    question:
      'Why do many economists favor "automatic stabilizers" (progressive income taxes & unemployment insurance) over discretionary fiscal stimulus?',
    questionVi: 'Vì sao nhiều nhà kinh tế ưa chuộng "bộ ổn định tự động" hơn chính sách tài khóa tùy nghi?',
    choices: [
      'Automatic stabilizers eliminate long lags in passing new laws during recessions',
      'Automatic stabilizers always keep the government budget balanced every year',
      'They replace the central bank completely',
      'They make the spending multiplier equal to zero',
    ],
    correctIndex: 0,
    explanation: 'Discretionary fiscal policy suffers from long legislative implementation lags, whereas automatic stabilizers stimulate AD immediately when incomes fall.',
    explanationVi: 'Bộ ổn định tự động tự kích hoạt ngay khi thu nhập giảm, tránh được độ trễ lập pháp kéo dài của chính sách tài khóa tùy nghi.',
  },
  {
    id: 'mcq-35-1',
    topic: 'part9',
    chapter: 'Ch. 35',
    question:
      'In the long run, the Phillips Curve is:',
    questionVi: 'Trong dài hạn, đường cong Phillips (LRPC) có hình dạng thế nào?',
    choices: [
      'Downward-sloping at a 45° angle',
      'Horizontal at the target inflation rate',
      'Vertical at the natural rate of unemployment u_n (monetary neutrality)',
      'Upward-sloping',
    ],
    correctIndex: 2,
    explanation: 'Friedman & Phelps showed that in the long run, inflation depends on money growth while unemployment returns to its natural rate u_n — LRPC is vertical.',
    explanationVi: 'Trong dài hạn không có sự đánh đổi giữa lạm phát và thất nghiệp; đường LRPC thẳng đứng tại u_n.',
  },
  {
    id: 'mcq-35-2',
    topic: 'part9',
    chapter: 'Ch. 35',
    question:
      'What is the difference between an expansionary AD shock and an adverse supply shock on the Short-Run Phillips Curve (SRPC)?',
    questionVi: 'Điểm khác nhau giữa sốc tăng AD và sốc cung bất lợi trên đường Phillips ngắn hạn (SRPC) là gì?',
    choices: [
      'AD shock moves the economy UP-LEFT along a fixed SRPC; adverse supply shock SHIFTS SRPC RIGHT',
      'AD shock shifts SRPC right; supply shock moves along SRPC',
      'Both move the economy down along LRPC',
      'Neither affects unemployment in the short run',
    ],
    correctIndex: 0,
    explanation: 'Demand shifts trace movements along a given SRPC; adverse supply shocks shift SRAS left and shift SRPC right (higher π AND higher u).',
    explanationVi: 'Sốc cầu gây di chuyển dọc theo SRPC; sốc cung bất lợi làm dịch chuyển cả đường SRPC sang phải (cả lạm phát và thất nghiệp cùng tăng).',
  },
  {
    id: 'mcq-35-3',
    topic: 'part9',
    chapter: 'Ch. 35',
    question:
      'If the Sacrifice Ratio is 5 and the central bank wants to reduce inflation from 6% to 2%, how much annual GDP is lost in total, and what can reduce that cost?',
    questionVi: 'Nếu tỷ lệ hy sinh là 5 và NHTW muốn giảm lạm phát từ 6% xuống 2%, tổng % GDP mất đi là bao nhiêu và điều gì giúp giảm chi phí này?',
    choices: [
      '20% of 1 year’s GDP; credible commitment to disinflation lowers expected inflation π^e quickly',
      '4% of 1 year’s GDP; raising money growth',
      '1.25% of GDP; price ceilings',
      '20% of GDP; nothing can ever alter π^e',
    ],
    correctIndex: 0,
    explanation: 'Total output loss = Sacrifice Ratio × Δπ = 5 × (6% − 2%) = 20% of annual GDP. Under Rational Expectations, a credible Fed policy drops π^e faster, lowering the sacrifice ratio.',
    explanationVi: 'Tổng tổn thất sản lượng = 5 × 4% = 20% GDP hàng năm. Nếu NHTW đủ uy tín, kỳ vọng lạm phát giảm nhanh giúp giảm chi phí hy sinh.',
  },
];

export const ECON_SCENARIOS: EconScenario[] = [
  // PART 6 (2 scenarios)
  {
    id: 'scen-p6-gdp-cpi',
    topic: 'part6',
    chapterLabel: 'Part 6 · Ch. 23–24',
    title: 'GDP vs. CPI Measurement & Real Interest Distortion',
    titleVi: 'Đo lường GDP vs. CPI & Lãi suất thực',
    prompt:
      'Explain (a) how a rise in the price of imported European consumer cars affects the US CPI vs. US GDP Deflator, (b) why CPI typically overstates inflation (list the 3 biases), and (c) how unexpected inflation affects a borrower vs. lender on a fixed-rate loan.',
    promptVi:
      'Giải thích (a) giá ô tô châu Âu nhập khẩu tăng ảnh hưởng thế nào đến CPI và GDP Deflator của Mỹ, (b) 3 sai lệch khiến CPI phóng đại lạm phát, (c) tác động đến người vay và người cho vay.',
    rubric: [
      { label: 'State CPI rises (includes imported consumer goods) while GDP Deflator is unchanged (domestic output only)', points: 1 },
      { label: 'Name all 3 CPI biases: substitution bias, new goods, unmeasured quality change', points: 1.5 },
      { label: 'Explain real interest rate r = i − π falls with unexpected inflation → helps borrowers, hurts lenders', points: 1.5 },
    ],
    modelSolution: `(a) The CPI rises because imported cars bought by typical domestic consumers are in the CPI basket. The GDP Deflator is UNCHANGED because it only measures goods and services produced domestically.
(b) CPI overstates inflation due to: (1) Substitution bias (fixed basket ignores switching toward relatively cheaper goods), (2) Introduction of new goods (more variety increases dollar value), and (3) Unmeasured quality changes.
(c) Since real interest rate r = i − π, unexpectedly high inflation lowers the ex-post real interest rate: borrowers repay with cheaper dollars (better off), while lenders receive lower real returns (worse off).`,
    modelSolutionVi:
      '(a) CPI tăng vì tính cả hàng nhập khẩu tiêu dùng; GDP Deflator không đổi vì chỉ tính hàng sản xuất trong nước. (b) 3 sai lệch: lệch thay thế, hàng mới, chất lượng. (c) r = i − π giảm giúp người vay có lợi, người cho vay thiệt.',
  },
  {
    id: 'scen-p6-saving-unemp',
    topic: 'part6',
    chapterLabel: 'Part 6 · Ch. 26 & 28',
    title: 'Budget Deficit Crowding Out vs. Discouraged Workers',
    titleVi: 'Thâm hụt ngân sách (Chèn lấn) & Người lao động nản chí',
    prompt:
      '(a) Using the Market for Loanable Funds (closed economy), trace the effects of a government budget deficit on real interest rate r, investment I, and long-run growth. (b) Explain why a recession can cause the official unemployment rate to fall if many workers become discouraged.',
    promptVi:
      '(a) Dùng thị trường vốn vay phân tích tác động của thâm hụt ngân sách đến r, I và tăng trưởng dài hạn. (b) Giải thích vì sao người nản chí làm tỷ lệ thất nghiệp chính thức giảm.',
    rubric: [
      { label: 'Show budget deficit reduces public saving (T−G), shifting Supply of loanable funds LEFT', points: 1 },
      { label: 'Conclude real interest rate r rises, crowding out private investment I and slowing capital accumulation', points: 1.5 },
      { label: 'Explain discouraged workers leave BOTH Unemployed (U) and Labor Force (E+U), lowering u = U/(E+U)', points: 1.5 },
    ],
    modelSolution: `(a) A budget deficit lowers public saving (T − G), reducing national saving S and shifting the Supply of loanable funds LEFT. The equilibrium real interest rate r RISES, which reduces private investment borrowing (crowding out). Lower capital accumulation slows long-run productivity and GDP growth.
(b) Discouraged workers stop actively searching, so the statistics classify them as "Not in the labor force" instead of "Unemployed." Since both the numerator U and denominator (E + U) decrease by the same amount while U < E + U, the measured unemployment rate U / (E + U) drops even though actual joblessness worsened.`,
    modelSolutionVi:
      '(a) Thâm hụt ngân sách giảm S công ⇒ cung vốn vay dịch trái ⇒ r tăng ⇒ chèn lấn I và làm chậm tăng trưởng dài hạn. (b) Người nản chí rời cả U và LF nên tỷ số U/LF giảm.',
  },

  // PART 7 (2 scenarios)
  {
    id: 'scen-p7-money-mult',
    topic: 'part7',
    chapterLabel: 'Part 7 · Ch. 29',
    title: 'Fed Open-Market Purchase & Limits to Monetary Control',
    titleVi: 'Nghiệp vụ thị trường mở & Giới hạn kiểm soát cung tiền',
    prompt:
      'Suppose the central bank buys $1,000 of government bonds when the required reserve ratio is 10%. (a) Compute the theoretical maximum increase in the money supply. (b) Explain TWO reasons why the actual money expansion is usually smaller and makes central bank control imperfect.',
    promptVi:
      'NHTW mua $1,000 trái phiếu khi tỷ lệ dự trữ bắt buộc là 10%. (a) Tính mức tăng cung tiền tối đa. (b) Nêu 2 lý do khiến mức tăng thực tế thường nhỏ hơn.',
    rubric: [
      { label: 'Compute simple multiplier 1/0.10 = 10 and max expansion $10,000', points: 1.5 },
      { label: 'Reason 1: Households may hold some money as currency instead of depositing 100% in banks', points: 1.25 },
      { label: 'Reason 2: Commercial banks may hold excess reserves rather than lending out every allowable dollar', points: 1.25 },
    ],
    modelSolution: `(a) With reserve ratio R = 0.10, the simple money multiplier is 1 / R = 10. A $1,000 open-market bond purchase injects $1,000 in reserves and can expand the money supply by up to $1,000 × 10 = $10,000.
(b) The actual multiplier is smaller (and Fed control is imperfect) for two reasons:
  1. Household currency drain: If people hold part of their money as cash instead of bank deposits, banks have fewer deposits to multiply.
  2. Bank excess reserves: Banks may choose to hold reserves above the legal minimum (especially during crises), lending out less than (1 − R) of each deposit.`,
    modelSolutionVi:
      '(a) Số nhân = 1/0.1 = 10 ⇒ Tối đa $10,000. (b) Thực tế nhỏ hơn vì (1) hộ gia đình giữ tiền mặt thay vì gửi hết vào ngân hàng, và (2) ngân hàng có thể giữ dự trữ dư thừa.',
  },
  {
    id: 'scen-p7-quantity-inflation',
    topic: 'part7',
    chapterLabel: 'Part 7 · Ch. 30',
    title: 'Quantity Theory, Fisher Effect & Costs of Inflation',
    titleVi: 'Thuyết số lượng tiền tệ, Hiệu ứng Fisher & Chi phí lạm phát',
    prompt:
      'Using the Quantity Equation (MV = PY) and Monetary Neutrality, explain what happens in the long run when a country persistently prints money to finance its deficit (inflation tax). Include the Fisher Effect and name at least 3 social costs of inflation.',
    promptVi:
      'Dùng phương trình MV = PY và tính trung tính của tiền tệ, giải thích hậu quả dài hạn của việc in tiền tài trợ thâm hụt, hiệu ứng Fisher và ít nhất 3 chi phí xã hội của lạm phát.',
    rubric: [
      { label: 'Use MV = PY (stable V, real Y fixed by resources/tech) to show %ΔM drives inflation π', points: 1.5 },
      { label: 'Explain Fisher Effect: nominal interest rate i = r + π rises 1-for-1 with inflation', points: 1.25 },
      { label: 'Explain inflation tax on cash holders + at least 3 costs (shoeleather, menu, tax distortion, relative prices, confusion, arbitrary redistribution)', points: 1.25 },
    ],
    modelSolution: `In the Quantity Equation M × V = P × Y, velocity V is relatively stable and long-run real GDP (Y) is pinned down by labor, capital, human capital, and technology (Monetary Neutrality). Therefore, rapid growth in M causes proportional inflation (π ≈ %ΔM − %ΔY).
By the Fisher Effect (i = r + π), nominal interest rates rise one-for-one with inflation while real rate r stays unchanged.
Printing money acts as an "inflation tax" on anyone holding currency. Major social costs include: (1) Shoeleather costs (extra trips to the bank to minimize cash), (2) Menu costs (changing price tags/catalogs), (3) Tax distortions (taxing nominal capital gains/interest), (4) Relative-price variability & confusion, and (5) Arbitrary redistribution under unexpected inflation.`,
    modelSolutionVi:
      'Với V ổn định và Y dài hạn do các yếu tố thực quyết định, tăng cung tiền M kéo mức giá P tăng tương ứng; lãi suất danh nghĩa i = r + π tăng 1:1. Thuế lạm phát đánh vào người giữ tiền mặt kèm các chi phí mòn giày, thực đơn, bóp méo thuế...',
  },

  // PART 8 (2 scenarios)
  {
    id: 'scen-p8-budget-deficit',
    topic: 'part8',
    chapterLabel: 'Part 8 · Ch. 32',
    title: 'Open Economy: Government Budget Deficit in Twin Markets',
    titleVi: 'Kinh tế mở: Thâm hụt ngân sách trong mô hình hai thị trường',
    prompt:
      'Suppose an open economy runs a larger government budget deficit (G↑ or T↓). Using the 3-panel Mankiw Open-Economy model, trace the effects on: (1) Loanable Funds & real interest rate r, (2) NCO, (3) Real exchange rate, and (4) Net Exports NX.',
    promptVi:
      'Trong nền kinh tế mở, chính phủ thâm hụt ngân sách lớn hơn. Dùng mô hình 3 đồ thị Ch. 32 phân tích tác động lên r, NCO, tỷ giá thực và NX.',
    rubric: [
      { label: 'Public saving falls ⇒ Supply of loanable funds shifts LEFT ⇒ real interest rate r RISES', points: 1 },
      { label: 'Higher r attracts capital, reducing Net Capital Outflow (NCO FALLS)', points: 1 },
      { label: 'Lower NCO shifts FX supply LEFT ⇒ domestic currency APPRECIATES', points: 1 },
      { label: 'Stronger currency lowers exports & raises imports ⇒ Net Exports NX FALLS (twin deficits)', points: 1 },
    ],
    modelSolution: `1. Loanable Funds: Higher budget deficit reduces public saving (T − G) and national saving S, shifting Supply LEFT → real interest rate r RISES.
2. NCO: Higher domestic r makes domestic assets more attractive, so Net Capital Outflow (NCO) FALLS.
3. FX Market: Since FX Supply equals NCO, Supply shifts LEFT → the real exchange rate APPRECIATES.
4. Net Exports: A stronger currency makes domestic goods costlier abroad and foreign goods cheaper at home, so NX FALLS (matching lower NCO — the "twin deficits").`,
    modelSolutionVi:
      'Thâm hụt ngân sách ⇒ Cung vốn vay dịch trái ⇒ r↑ ⇒ NCO↓ ⇒ Cung ngoại hối dịch trái ⇒ Nội tệ lên giá ⇒ NX↓ (Thâm hụt kép).',
  },
  {
    id: 'scen-p8-quota-vs-flight',
    topic: 'part8',
    chapterLabel: 'Part 8 · Ch. 32',
    title: 'Open-Economy Dilemma: Why Import Quotas Fail to Fix Trade Deficits',
    titleVi: 'Kinh tế mở: Vì sao hạn ngạch nhập khẩu không giảm được thâm hụt thương mại',
    prompt:
      'Policymakers propose an import tariff/quota to shrink a trade deficit. (a) Using Mankiw’s Open-Economy model, prove why NX does NOT improve, and state what happens to the real exchange rate instead. (b) Contrast this with Capital Flight (political instability causing NCO to jump).',
    promptVi:
      'Chính phủ muốn đánh thuế/hạn ngạch nhập khẩu để giảm thâm hụt thương mại. (a) Giải thích vì sao NX không đổi và tỷ giá thực thay đổi thế nào. (b) So sánh với trường hợp tháo chạy vốn.',
    rubric: [
      { label: 'Show tariff/quota shifts FX Demand RIGHT (higher NX at given e) → currency APPRECIATES', points: 1.5 },
      { label: 'Explain S and I are unaffected, so NCO = S−I = NX stays UNCHANGED (appreciation kills exports equally)', points: 1.5 },
      { label: 'Contrast Capital Flight: NCO shifts RIGHT ⇒ r↑, FX supply shifts RIGHT ⇒ currency DEPRECIATES and NX↑', points: 1 },
    ],
    modelSolution: `(a) An import quota/tariff raises net exports at any given exchange rate, shifting FX Demand RIGHT and causing the real exchange rate to APPRECIATE. However, because trade barriers do NOT change national saving S or domestic investment I (nor r), NCO = S − I is unchanged! Since NX = NCO in equilibrium, the stronger currency reduces exports by the exact amount imports fell, leaving overall NX UNCHANGED.
(b) By contrast, Capital Flight shifts the NCO curve RIGHT: demand for loanable funds rises (r↑), and FX Supply shifts RIGHT, causing the currency to DEPRECIATE and Net Exports NX to RISE.`,
    modelSolutionVi:
      '(a) Thuế quan/hạn ngạch đẩy cầu ngoại hối dịch phải làm nội tệ lên giá, triệt tiêu xuất khẩu đúng bằng phần giảm nhập khẩu nên NX không đổi (do S−I không đổi). (b) Tháo chạy vốn đẩy NCO dịch phải làm r↑, nội tệ mất giá và NX↑.',
  },

  // PART 9 (2 scenarios)
  {
    id: 'scen-p9-stagflation',
    topic: 'part9',
    chapterLabel: 'Part 9 · Ch. 33 & 35',
    title: 'Stagflation & Policy Dilemma (AD–AS + Phillips Curve)',
    titleVi: 'Lạm phát đình trệ & Tình thế tiến thoái lưỡng nan (AD–AS + Phillips)',
    prompt:
      'Starting in long-run equilibrium, a sharp energy price shock raises production costs. Trace the short-run effects in BOTH (1) the AD–SRAS–LRAS model and (2) the Phillips Curve, and explain the policymaker’s dilemma between accommodating with AD stimulus vs. waiting.',
    promptVi:
      'Từ cân bằng dài hạn, giá năng lượng tăng vọt làm tăng chi phí sản xuất. Phân tích tác động trên cả đồ thị AD–AS và đường Phillips, đồng thời nêu thế tiến thoái lưỡng nan của nhà hoạch định chính sách.',
    rubric: [
      { label: 'AD–AS: SRAS shifts LEFT → Price level P rises and Output Y falls below Y_n (Stagflation)', points: 1 },
      { label: 'Phillips Curve: SRPC shifts RIGHT (both inflation π and unemployment u rise)', points: 1 },
      { label: 'Accommodate (AD↑): restores Y_n & u_n faster, but permanently raises P and π^e', points: 1 },
      { label: 'Wait / No action: recession lowers wages/P^e slowly so SRAS shifts right back to Y_n', points: 1 },
    ],
    modelSolution: `1. AD–AS Model: Higher energy costs shift SRAS LEFT. Output falls below Y_n (recession, unemployment u rises) while price level P rises — stagflation.
2. Phillips Curve: Worse supply conditions shift SRPC RIGHT, creating higher inflation AND higher unemployment simultaneously.
3. Policy Dilemma:
   • Accommodate (expansionary fiscal/monetary policy): Shifts AD RIGHT, bringing Y back to Y_n quickly, but at the cost of permanently higher inflation and price level.
   • Do nothing: Accepts a prolonged recession until high unemployment pushes nominal wages and P^e down, slowly shifting SRAS RIGHT back to Y_n at lower inflation.`,
    modelSolutionVi:
      'SRAS dịch trái (P↑, Y↓) và SRPC dịch phải (π↑, u↑). Nhà nước đứng giữa 2 lựa chọn: kích cầu AD (hồi phục nhanh Y nhưng lạm phát cao) hoặc chờ lương giảm dần (suy thoái kéo dài nhưng ổn định giá).',
  },
  {
    id: 'scen-p9-policy-lags',
    topic: 'part9',
    chapterLabel: 'Part 9 · Ch. 34 & 35',
    title: 'Fiscal vs. Monetary Policy, Multipliers & Credible Disinflation',
    titleVi: 'Chính sách Tài khóa vs. Tiền tệ, Số nhân & Giảm phát uy tín',
    prompt:
      '(a) Explain why a $50B increase in G shifts AD by more than a $50B tax cut (use multipliers for MPC = 0.8), AND explain two forces (crowding out vs. accelerator) that modify the final shift. (b) Explain how central bank credibility affects the Sacrifice Ratio during disinflation.',
    promptVi:
      '(a) Giải thích vì sao tăng chi tiêu $50B đẩy AD mạnh hơn giảm thuế $50B (MPC=0.8) và nêu tác động của hiệu ứng chèn lấn. (b) Uy tín của NHTW ảnh hưởng thế nào đến tỷ lệ hy sinh khi giảm lạm phát?',
    rubric: [
      { label: 'Compute Spending Multiplier = 5 (AD +$250B) vs Tax Multiplier = −4 (AD +$200B); households save part of tax cut', points: 1.5 },
      { label: 'Explain Crowding Out: higher Y raises money demand ⇒ r↑ ⇒ private I↓ partially offsets AD shift', points: 1.25 },
      { label: 'Explain Credible Disinflation (Rational Expectations): lowers π^e faster, shifting SRPC left and reducing Sacrifice Ratio', points: 1.25 },
    ],
    modelSolution: `(a) With MPC = 0.8:
  • Spending multiplier = 1 / (1 − 0.8) = 5 → ΔG = $50B shifts AD by $250B (initial $50B enters spending 100%).
  • Tax multiplier = −0.8 / (1 − 0.8) = −4 → ΔT = −$50B shifts AD by $200B (because households save 20% = $10B on the first round).
  • Crowding-Out vs. Accelerator: Higher income Y raises money demand in the Liquidity Preference model, pushing interest rate r UP and reducing investment I (crowding out shrinks the net AD shift). Conversely, optimistic investment expectations (accelerator) can amplify it.
(b) Under Rational Expectations, if a central bank announces a credible anti-inflation policy and people believe it, expected inflation π^e drops quickly, shifting SRPC LEFT and shrinking the output/unemployment cost (lower Sacrifice Ratio).`,
    modelSolutionVi:
      '(a) Số nhân chi tiêu = 5 > |số nhân thuế| = 4 vì người dân tiết kiệm một phần tiền giảm thuế; tuy nhiên lãi suất r tăng khi Y tăng sẽ gây hiệu ứng chèn lấn đầu tư I. (b) Chính sách giảm lạm phát có uy tín giúp giảm nhanh kỳ vọng lạm phát, thu nhỏ tỷ lệ hy sinh.',
  },
];
