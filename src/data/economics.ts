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
  title: string;
  titleVi: string;
  prompt: string;
  promptVi: string;
  rubric: Array<{ label: string; points: number }>;
  modelSolution: string;
  modelSolutionVi: string;
}

export const ECON_KNOWLEDGE: EconKnowledgeCard[] = [
  {
    id: 'econ-ch23',
    topic: 'macro-gdp-cpi',
    chapterLabel: 'Macro Ch. 23',
    title: 'Measuring a Nation’s Income (GDP, Nominal vs Real, Deflator)',
    titleVi: 'Đo lường thu nhập quốc dân (GDP danh nghĩa, thực & Chỉ số giảm phát)',
    summary:
      'GDP is the market value of all final goods & services produced within a country in a given period (GDP = C + I + G + NX). Used goods, intermediate inputs, and transfer payments (Social Security) are excluded. Inventory produced this year counts in I. Nominal GDP uses current prices; Real GDP uses base-year prices.',
    summaryVi:
      'GDP đo giá trị thị trường của mọi hàng hóa/dịch vụ cuối cùng sản xuất trong phạm vi lãnh thổ quốc gia (GDP = C + I + G + NX). Hàng cũ, hàng trung gian và trợ cấp chuyển nhượng không tính vào GDP; hàng tồn kho sản xuất trong năm được tính vào Đầu tư (I).',
    formulas: [
      'GDP = C + I + G + NX, \\quad NX = \\text{Exports} - \\text{Imports}',
      '\\text{GDP Deflator} = \\frac{\\text{Nominal GDP}}{\\text{Real GDP}} \\times 100',
      '\\text{Inflation Rate}_t = \\frac{\\text{Deflator}_t - \\text{Deflator}_{t-1}}{\\text{Deflator}_{t-1}} \\times 100\\%',
    ],
    examTrap:
      'A Vietnamese owner running a Pho restaurant in the USA counts toward US GDP (location), NOT Vietnam GDP (only Vietnam GNP)!',
    examTrapVi:
      'Chủ quán phở người Việt mở quán tại Mỹ được tính vào GDP của Mỹ (theo lãnh thổ), chỉ tính vào GNP của Việt Nam!',
    relatedLab: 'gdp-cpi',
  },
  {
    id: 'econ-ch24',
    topic: 'macro-gdp-cpi',
    chapterLabel: 'Macro Ch. 24',
    title: 'Measuring the Cost of Living (CPI vs GDP Deflator & Real Interest)',
    titleVi: 'Đo lường chi phí sinh hoạt (CPI so với GDP Deflator & Lãi suất thực)',
    summary:
      'CPI tracks a fixed basket of goods bought by a typical consumer. Three biases cause CPI to overstate true inflation: Substitution bias, Introduction of new goods, and Unmeasured quality change. Unlike the GDP deflator (which covers all domestic production with a changing basket), CPI includes imported consumer goods using a fixed basket.',
    summaryVi:
      'CPI theo dõi giỏ hàng tiêu dùng cố định nên có 3 sai lệch làm phóng đại lạm phát: lệch thay thế, hàng hóa mới và thay đổi chất lượng. CPI tính cả hàng nhập khẩu tiêu dùng (khác GDP Deflator chỉ tính hàng sản xuất trong nước).',
    formulas: [
      '\\text{CPI}_t = \\frac{\\text{Cost of basket}_t}{\\text{Cost of basket}_{\\text{base}}} \\times 100',
      '\\text{Value today} = \\text{Value}_T \\times \\frac{\\text{CPI}_{\\text{today}}}{\\text{CPI}_T}',
      'r_{\\text{real}} = i_{\\text{nominal}} - \\pi_{\\text{inflation}}',
    ],
    examTrap:
      'If the price of an imported French wine rises, CPI rises, while the GDP deflator is unaffected! If a military submarine price rises, GDP deflator rises, while CPI is unaffected.',
    examTrapVi:
      'Giá rượu vang nhập khẩu tăng làm CPI tăng nhưng GDP Deflator không đổi; giá tàu ngầm quân sự tăng làm GDP Deflator tăng nhưng CPI không đổi.',
    relatedLab: 'gdp-cpi',
  },
  {
    id: 'econ-ch25-26',
    topic: 'macro-growth-saving-unemp',
    chapterLabel: 'Macro Ch. 25–26',
    title: 'Production, Growth & Saving / Loanable Funds Market',
    titleVi: 'Tăng trưởng kinh tế, Tiết kiệm & Thị trường vốn vay',
    summary:
      'Productivity (Y/L) depends on Physical Capital (K/L), Human Capital (H/L), Natural Resources (N/L), and Technological Knowledge (A). Because of diminishing returns to capital, poorer countries grow faster (catch-up effect). In a closed economy, S = I = (Y−T−C) + (T−G). Budget deficits reduce Public Saving, shifting Loanable Funds Supply LEFT, raising r and crowding out investment.',
    summaryVi:
      'Năng suất phụ thuộc vốn vật chất, vốn nhân lực, tài nguyên và tri thức công nghệ. Do quy luật lợi suất giảm dần của vốn, nước nghèo tăng trưởng nhanh hơn (hiệu ứng bắt kịp). Trong kinh tế đóng S = I; thâm hụt ngân sách làm giảm cung vốn vay, tăng lãi suất r và gây chèn lấn đầu tư (crowding out).',
    formulas: [
      'S_{\\text{private}} = Y - T - C, \\quad S_{\\text{public}} = T - G, \\quad S_{\\text{national}} = Y - C - G = I',
      '\\text{P/E Ratio} = \\frac{\\text{Stock Price}}{\\text{Earnings per Share}}',
    ],
    examTrap:
      'Buying stocks or bonds on financial markets is SAVING (not Investment I in GDP!). In macroeconomics, I means buying new capital equipment, factories, or new houses.',
    examTrapVi:
      'Mua cổ phiếu/trái phiếu là Tiết kiệm (Saving), KHÔNG phải Đầu tư (I) trong GDP! Đầu tư I là mua máy móc, nhà xưởng hoặc nhà ở mới.',
    relatedLab: 'money-saving',
  },
  {
    id: 'econ-ch28',
    topic: 'macro-growth-saving-unemp',
    chapterLabel: 'Macro Ch. 28',
    title: 'Unemployment, Labor Force & Minimum Wage / Efficiency Wages',
    titleVi: 'Thất nghiệp, Lực lượng lao động & Tiền lương tối thiểu',
    summary:
      'Labor Force = Employed + Unemployed. Discouraged workers who stop looking are "Not in the labor force" (so when they drop out, the official u-rate falls!). Natural rate of unemployment includes Frictional (job search, UI) and Structural (minimum wage, unions, efficiency wages — wage kept above equilibrium).',
    summaryVi:
      'Lực lượng lao động = Có việc + Thất nghiệp. Người nản chí bỏ tìm việc không thuộc lực lượng lao động (nên khi họ bỏ tìm việc, tỷ lệ thất nghiệp đo được lại giảm!). Thất nghiệp tự nhiên gồm cọ xát (tìm việc) và cơ cấu (lương tối thiểu, công đoàn, lương hiệu quả).',
    formulas: [
      'u\\text{-rate} = \\frac{\\text{Unemployed}}{\\text{Labor Force}} \\times 100\\%, \\quad \\text{LFPR} = \\frac{\\text{Labor Force}}{\\text{Adult Pop}} \\times 100\\%',
    ],
    relatedLab: 'gdp-cpi',
  },
  {
    id: 'econ-ch29-30',
    topic: 'macro-money-inflation',
    chapterLabel: 'Macro Ch. 29–30',
    title: 'Monetary System, Money Multiplier & Classical Inflation Theory',
    titleVi: 'Hệ thống tiền tệ, Số nhân tiền & Lý thuyết lạm phát cổ điển',
    summary:
      'Fed tools: Open-Market Operations (buy bonds → MS ↑, sell bonds → MS ↓), Reserve Requirements, Discount Rate / Interest on Reserves. Under fractional-reserve banking, Money Multiplier = 1/R. In the long run, Quantity Equation MV = PY implies inflation equals money growth minus real output growth (Monetary Neutrality), and Fisher Effect gives i = r + π.',
    summaryVi:
      'Công cụ của NHTW: Nghiệp vụ thị trường mở (mua trái phiếu → cung tiền tăng), tỷ lệ dự trữ bắt buộc R, lãi suất chiết khấu. Số nhân tiền = 1/R. Dài hạn: MV = PY (tiền tệ trung tính), hiệu ứng Fisher: i = r + π.',
    formulas: [
      '\\text{Money Multiplier} = \\frac{1}{R}, \\quad \\text{Leverage Ratio} = \\frac{\\text{Assets}}{\\text{Capital}}',
      'M \\times V = P \\times Y, \\quad i = r + \\pi \\text{ (Fisher Effect)}',
    ],
    examTrap:
      'If households hold some currency instead of depositing 100% into banks, OR if banks hold excess reserves, the actual money multiplier is SMALLER than 1/R!',
    examTrapVi:
      'Nếu người dân giữ tiền mặt hoặc ngân hàng giữ dự trữ dư thừa, số nhân tiền thực tế sẽ NHỎ hơn 1/R!',
    relatedLab: 'money-saving',
  },
  {
    id: 'econ-ch31-32',
    topic: 'macro-open-econ',
    chapterLabel: 'Macro Ch. 31–32',
    title: 'Open-Economy Identities, PPP & Twin-Market Equilibrium',
    titleVi: 'Kinh tế mở, Ngang giá sức mua PPP & Mô hình hai thị trường',
    summary:
      'In every open economy, Net Exports MUST equal Net Capital Outflow: NX = NCO = S − I. Real Exchange Rate ε = (e × P) / P*. Purchasing-Power Parity (PPP) says ε = 1 so e = P*/P. In Ch. 32: Market for Loanable Funds (S = I + NCO) sets real interest rate r, which pins down NCO, which is the vertical Supply in the FX market determining real exchange rate e.',
    summaryVi:
      'Luôn có đồng nhất thức NX = NCO = S − I. Tỷ giá thực ε = (e × P)/P*. Theo PPP, ε = 1 ⇒ e = P*/P. Mô hình 2 thị trường: Thị trường vốn vay quyết định r ⇒ xác định NCO ⇒ quyết định cung ngoại hối và tỷ giá thực e.',
    formulas: [
      'NX = NCO = S - I, \\quad \\varepsilon = \\frac{e \\cdot P}{P^*}',
      '\\text{PPP: } e = \\frac{P^*}{P}',
    ],
    examTrap:
      'Import quotas and tariffs do NOT reduce a trade deficit (NX = S − I is unchanged); they simply appreciate the currency so exports fall as much as imports!',
    examTrapVi:
      'Thuế quan hay hạn ngạch nhập khẩu KHÔNG cải thiện thâm hụt thương mại NX vì S − I không đổi; nó chỉ làm nội tệ lên giá khiến xuất khẩu giảm tương ứng!',
    relatedLab: 'open-econ',
  },
  {
    id: 'econ-ch33-35',
    topic: 'macro-adas-policy-phillips',
    chapterLabel: 'Macro Ch. 33–35',
    title: 'AD–AS Fluctuations, Multipliers & Phillips Curve',
    titleVi: 'Tổng cầu – Tổng cung (AD–AS), Số nhân & Đường Phillips',
    summary:
      'AD slopes downward due to Wealth, Interest-Rate, and Exchange-Rate effects. LRAS is vertical at natural output Y_n. SRAS slopes upward (sticky wages/prices/misperceptions). Expansionary policy shifts AD right (P↑, Y↑ in SR; later SRAS shifts left back to Y_n). Adverse supply shock shifts SRAS left (stagflation: P↑, Y↓) and shifts SRPC right. Fiscal multipliers: 1/(1−MPC) for ΔG, −MPC/(1−MPC) for ΔT.',
    summaryVi:
      'AD dốc xuống nhờ hiệu ứng Của cải, Lãi suất và Tỷ giá. LRAS thẳng đứng tại sản lượng tự nhiên Y_n. Sốc cung bất lợi đẩy SRAS sang trái (lạm phát đình trệ: P↑, Y↓) và đẩy SRPC sang phải. Số nhân chi tiêu = 1/(1−MPC); số nhân thuế = −MPC/(1−MPC).',
    formulas: [
      '\\text{Spending Multiplier} = \\frac{1}{1 - \\text{MPC}}, \\quad \\text{Tax Multiplier} = \\frac{-\\text{MPC}}{1 - \\text{MPC}}',
      'u = u_n - a(\\pi - \\pi^e)',
    ],
    examTrap:
      'Balanced-budget rule: Increasing BOTH G and T by Δ$100 expands AD by Δ$100 because 1/(1−MPC) + (−MPC/(1−MPC)) = 1!',
    examTrapVi:
      'Khi tăng cả G và T cùng một lượng $100, tổng cầu vẫn tăng $100 vì tổng hai số nhân luôn bằng 1!',
    relatedLab: 'adas-phillips',
  },
  {
    id: 'econ-micro-1-9',
    topic: 'micro-supply-elasticity-tax',
    chapterLabel: 'Micro Ch. 1–9',
    title: 'Comparative Advantage, Supply/Demand, Elasticity & Tax Welfare',
    titleVi: 'Lợi thế so sánh, Cung–Cầu, Độ co giãn & Tổn thất vô ích của thuế',
    summary:
      'Gains from trade come from Comparative Advantage (lowest opportunity cost), NOT absolute advantage. Midpoint elasticity |Ed| = |(ΔQ/avg Q)/(ΔP/avg P)|; if elastic (|Ed|>1), P↑ lowers TR; if inelastic (|Ed|<1), P↑ raises TR. Tax incidence falls more heavily on the MORE INELASTIC side of the market. DWL = ½ × Tax × ΔQ grows with the square of the tax.',
    summaryVi:
      'Lợi ích thương mại đến từ Lợi thế so sánh (chi phí cơ hội thấp nhất). Nếu cầu co giãn (|Ed|>1), tăng giá làm giảm doanh thu; nếu kém co giãn, tăng giá làm tăng doanh thu. Bên nào kém co giãn hơn sẽ gánh phần lớn gánh nặng thuế.',
    formulas: [
      'E_d = \\frac{(Q_2-Q_1)/[(Q_2+Q_1)/2]}{(P_2-P_1)/[(P_2+P_1)/2]}, \\quad \\text{DWL} = \\frac{1}{2} \\cdot t \\cdot (Q^* - Q_t)',
    ],
    relatedLab: 'micro',
  },
  {
    id: 'econ-micro-13-21',
    topic: 'micro-costs-markets',
    chapterLabel: 'Micro Ch. 13–17, 21',
    title: 'Production Costs, Perfect Competition, Monopoly & Oligopoly',
    titleVi: 'Chi phí sản xuất, Cạnh tranh hoàn hảo, Độc quyền & Độc quyền nhóm',
    summary:
      'MC crosses ATC and AVC at their minimums. Competitive firm: P = MR = MC (shut down in SR if P < AVC; exit in LR if P < ATC; LR profit = 0). Monopoly: MR = MC gives Q_m, price P_m read off Demand curve (P_m > MR = MC ⇒ DWL). Monopolistic competition: excess capacity + markup (P > MC), LR profit = 0. Oligopoly: Prisoner’s Dilemma creates dominant-strategy failure to collude.',
    summaryVi:
      'Đường MC cắt ATC và AVC tại cực tiểu. Doanh nghiệp cạnh tranh hoàn hảo: P = MR = MC (đóng cửa ngắn hạn nếu P < AVC). Độc quyền hoàn toàn: chọn Q tại MR = MC rồi gióng lên đường cầu tìm P_m (gây DWL). Độc quyền nhóm có bài toán Thế tiến thoái lưỡng nan của tù nhân.',
    formulas: [
      '\\text{Competitive: } P = MC, \\quad \\text{Monopoly: } MR = MC,\\ P_m > MC',
      '\\text{Inverse Demand } P = a - bQ \\implies MR = a - 2bQ',
    ],
    relatedLab: 'micro',
  },
];

export const ECON_GLOSSARY: EconGlossaryItem[] = [
  { en: 'Opportunity Cost', vi: 'Chi phí cơ hội', topic: 'micro-supply-elasticity-tax', note: 'Best alternative foregone' },
  { en: 'Comparative Advantage', vi: 'Lợi thế so sánh', topic: 'micro-supply-elasticity-tax', note: 'Lower opportunity cost producer' },
  { en: 'Consumer / Producer Surplus', vi: 'Thặng dư tiêu dùng / sản xuất', topic: 'micro-supply-elasticity-tax', note: 'Welfare area between curve & price' },
  { en: 'Deadweight Loss (DWL)', vi: 'Tổn thất vô ích', topic: 'micro-supply-elasticity-tax', note: 'Lost total surplus from tax or monopoly' },
  { en: 'Price Elasticity of Demand', vi: 'Độ co giãn của cầu theo giá', topic: 'micro-supply-elasticity-tax', note: '%ΔQ / %ΔP (midpoint formula)' },
  { en: 'Price Ceiling / Floor', vi: 'Giá trần / Giá sàn', topic: 'micro-supply-elasticity-tax', note: 'Binding ceiling → shortage; floor → surplus' },
  { en: 'Marginal Cost (MC)', vi: 'Chi phí biên', topic: 'micro-costs-markets', note: 'ΔTC / ΔQ; intersects min ATC & AVC' },
  { en: 'Shut-down Rule (SR)', vi: 'Quy tắc đóng cửa ngắn hạn', topic: 'micro-costs-markets', note: 'Shut down if P < AVC' },
  { en: 'Monopoly Markup', vi: 'Chênh lệch giá độc quyền', topic: 'micro-costs-markets', note: 'P_m > MR = MC' },
  { en: 'Gross Domestic Product (GDP)', vi: 'Tổng sản phẩm quốc nội', topic: 'macro-gdp-cpi', note: 'Market value of domestic final goods' },
  { en: 'GDP Deflator', vi: 'Chỉ số giảm phát GDP', topic: 'macro-gdp-cpi', note: '(Nominal GDP / Real GDP) × 100' },
  { en: 'Consumer Price Index (CPI)', vi: 'Chỉ số giá tiêu dùng', topic: 'macro-gdp-cpi', note: 'Fixed consumer basket price index' },
  { en: 'Substitution Bias', vi: 'Sai lệch thay thế', topic: 'macro-gdp-cpi', note: 'CPI ignores consumers switching to cheaper goods' },
  { en: 'Nominal vs Real Interest Rate', vi: 'Lãi suất danh nghĩa vs thực', topic: 'macro-gdp-cpi', note: 'r = i − π' },
  { en: 'Catch-Up Effect', vi: 'Hiệu ứng bắt kịp', topic: 'macro-growth-saving-unemp', note: 'Low-capital countries grow faster' },
  { en: 'Private / Public Saving', vi: 'Tiết kiệm tư nhân / công', topic: 'macro-growth-saving-unemp', note: 'Y−T−C and T−G' },
  { en: 'Crowding Out', vi: 'Hiệu ứng chèn lấn', topic: 'macro-growth-saving-unemp', note: 'Budget deficit pushes r up, reducing I' },
  { en: 'Frictional Unemployment', vi: 'Thất nghiệp cọ xát', topic: 'macro-growth-saving-unemp', note: 'Time spent matching workers to jobs' },
  { en: 'Structural Unemployment', vi: 'Thất nghiệp cơ cấu', topic: 'macro-growth-saving-unemp', note: 'Wages kept above equilibrium (min wage, unions)' },
  { en: 'Efficiency Wages', vi: 'Tiền lương hiệu quả', topic: 'macro-growth-saving-unemp', note: 'Above-equilibrium wage paid to raise productivity' },
  { en: 'Discouraged Workers', vi: 'Người lao động nản chí', topic: 'macro-growth-saving-unemp', note: 'Excluded from labor force & u-rate' },
  { en: 'Reserve Ratio (R)', vi: 'Tỷ lệ dự trữ', topic: 'macro-money-inflation', note: 'Fraction of deposits held as reserves' },
  { en: 'Money Multiplier', vi: 'Số nhân tiền', topic: 'macro-money-inflation', note: '1 / R in simple fractional banking' },
  { en: 'Open-Market Operations', vi: 'Nghiệp vụ thị trường mở', topic: 'macro-money-inflation', note: 'Fed buys bonds → MS↑; sells → MS↓' },
  { en: 'Quantity Theory of Money', vi: 'Lý thuyết số lượng tiền tệ', topic: 'macro-money-inflation', note: 'M × V = P × Y' },
  { en: 'Fisher Effect', vi: 'Hiệu ứng Fisher', topic: 'macro-money-inflation', note: '1-for-1 adjustment of nominal i to inflation π' },
  { en: 'Net Capital Outflow (NCO)', vi: 'Dòng vốn ra ròng', topic: 'macro-open-econ', note: 'Foreign assets bought − domestic assets sold by foreigners' },
  { en: 'Real Exchange Rate (ε)', vi: 'Tỷ giá hối đoái thực', topic: 'macro-open-econ', note: '(e × P) / P*' },
  { en: 'Purchasing-Power Parity', vi: 'Ngang giá sức mua (PPP)', topic: 'macro-open-econ', note: 'Unit of currency buys same goods everywhere' },
  { en: 'Aggregate Demand (AD)', vi: 'Tổng cầu', topic: 'macro-adas-policy-phillips', note: 'Downward sloping: wealth, interest, exchange effects' },
  { en: 'Stagflation', vi: 'Lạm phát đình trệ', topic: 'macro-adas-policy-phillips', note: 'Falling output (Y↓) and rising prices (P↑) from SRAS left shift' },
  { en: 'Liquidity Preference', vi: 'Lý thuyết ưa thích thanh khoản', topic: 'macro-adas-policy-phillips', note: 'Money supply & demand set interest rate r' },
  { en: 'Spending / Tax Multiplier', vi: 'Số nhân chi tiêu / thuế', topic: 'macro-adas-policy-phillips', note: '1/(1−MPC) and −MPC/(1−MPC)' },
  { en: 'Phillips Curve', vi: 'Đường cong Phillips', topic: 'macro-adas-policy-phillips', note: 'Short-run inverse trade-off between inflation & unemployment' },
];

export const ECON_MCQS: EconMcq[] = [
  {
    id: 'mcq-23-1',
    topic: 'macro-gdp-cpi',
    chapter: 'Ch. 23',
    question:
      'A Vietnamese chef owns and operates a Pho restaurant in California, USA. How is the restaurant’s income counted?',
    questionVi: 'Một đầu bếp người Việt sở hữu và vận hành quán phở tại Mỹ. Thu nhập này tính vào đâu?',
    choices: [
      'Included in Vietnam GDP and US GNP',
      'Included in US GDP and Vietnam GNP',
      'Included in both US GDP and Vietnam GDP',
      'Excluded from both because it is a service',
    ],
    correctIndex: 1,
    explanation: 'GDP is geographic (produced inside the US → US GDP); GNP is based on nationality (Vietnamese citizen → Vietnam GNP).',
    explanationVi: 'GDP tính theo lãnh thổ (ở Mỹ ⇒ GDP Mỹ); GNP tính theo quốc tịch (người Việt ⇒ GNP Việt Nam).',
  },
  {
    id: 'mcq-23-2',
    topic: 'macro-gdp-cpi',
    chapter: 'Ch. 23',
    question:
      'Ford builds $50 million of cars in 2023 and puts them in inventory, then sells them in 2024. What happens to 2023 GDP and 2024 GDP?',
    questionVi: 'Ford sản xuất $50 triệu ô tô vào năm 2023 cho vào kho và bán vào năm 2024. GDP hai năm thay đổi thế nào?',
    choices: [
      '2023 GDP unchanged; 2024 GDP increases by $50M',
      '2023 GDP increases by $50M (Investment); 2024 GDP unchanged (C +$50M, I −$50M)',
      'Both 2023 and 2024 GDP increase by $50M',
      'Neither year changes because cars were not exported',
    ],
    correctIndex: 1,
    explanation: 'Inventory additions count as Investment (I) in the year produced (2023). Selling from inventory in 2024 raises C and reduces I by the same amount, leaving 2024 GDP unchanged.',
    explanationVi: 'Tồn kho tính vào Đầu tư I của năm sản xuất (2023); sang 2024 bán ra làm C tăng và I giảm đúng $50M nên GDP 2024 không đổi.',
  },
  {
    id: 'mcq-24-1',
    topic: 'macro-gdp-cpi',
    chapter: 'Ch. 24',
    question:
      'Suppose the price of imported French wine sold to US consumers doubles while domestic US goods do not change price. Which statement is true?',
    questionVi: 'Giá rượu vang Pháp nhập khẩu vào Mỹ tăng gấp đôi, hàng nội địa giữ nguyên. Điều nào đúng?',
    choices: [
      'Both CPI and GDP deflator increase equally',
      'GDP deflator increases, CPI is unchanged',
      'CPI increases, GDP deflator is unchanged',
      'Neither CPI nor GDP deflator changes',
    ],
    correctIndex: 2,
    explanation: 'CPI includes imported goods bought by typical domestic consumers; the GDP deflator only reflects goods produced domestically.',
    explanationVi: 'CPI đo giỏ hàng tiêu dùng (gồm cả hàng nhập khẩu) nên CPI tăng; GDP Deflator chỉ đo hàng sản xuất trong nước nên không đổi.',
  },
  {
    id: 'mcq-24-2',
    topic: 'macro-gdp-cpi',
    chapter: 'Ch. 24',
    question:
      'You earn 7% nominal interest on a savings deposit while inflation is 4%. What is your real interest rate?',
    questionVi: 'Lãi suất danh nghĩa là 7%/năm và lạm phát 4%/năm. Lãi suất thực là bao nhiêu?',
    choices: ['11%', '3%', '2.8%', '−3%'],
    correctIndex: 1,
    explanation: 'Real interest rate = Nominal interest rate − Inflation rate = 7% − 4% = 3%.',
    explanationVi: 'Lãi suất thực = Lãi suất danh nghĩa − Tỷ lệ lạm phát = 7% − 4% = 3%.',
  },
  {
    id: 'mcq-25-1',
    topic: 'macro-growth-saving-unemp',
    chapter: 'Ch. 25',
    question:
      'Because of diminishing returns to capital, holding other factors constant, an increase in the saving rate leads to:',
    questionVi: 'Do lợi suất giảm dần của vốn, khi giữ các yếu tố khác không đổi, tăng tỷ lệ tiết kiệm dẫn đến:',
    choices: [
      'Permanently higher growth rate of GDP per person forever',
      'Higher growth rate only temporarily until the economy reaches a higher steady-state level of income',
      'Lower productivity in the long run',
      'Elimination of technological knowledge',
    ],
    correctIndex: 1,
    explanation: 'Higher saving raises capital and growth in the transition, but diminishing returns mean growth eventually returns to the rate determined by technological progress.',
    explanationVi: 'Tỷ lệ tiết kiệm cao chỉ tăng tốc độ tăng trưởng tạm thời trong giai đoạn chuyển tiếp lên mức thu nhập mới cao hơn.',
  },
  {
    id: 'mcq-26-1',
    topic: 'macro-growth-saving-unemp',
    chapter: 'Ch. 26',
    question:
      'In a closed economy, when the government runs a larger budget deficit (and investment tax rules are unchanged):',
    questionVi: 'Trong nền kinh tế đóng, khi chính phủ thâm hụt ngân sách lớn hơn:',
    choices: [
      'Supply of loanable funds shifts right, interest rate falls, investment rises',
      'Supply of loanable funds shifts left, interest rate rises, investment falls (crowding out)',
      'Demand for loanable funds shifts right, investment rises',
      'Private saving automatically rises by 100% of the deficit',
    ],
    correctIndex: 1,
    explanation: 'A budget deficit lowers public saving (T−G), shifting national saving S (supply of loanable funds) left, raising r and crowding out private investment.',
    explanationVi: 'Thâm hụt ngân sách làm tiết kiệm công giảm ⇒ cung vốn vay dịch trái ⇒ lãi suất tăng và chèn lấn đầu tư tư nhân.',
  },
  {
    id: 'mcq-28-1',
    topic: 'macro-growth-saving-unemp',
    chapter: 'Ch. 28',
    question:
      'If an unemployed worker becomes discouraged and stops looking for a job, what happens to the official unemployment rate?',
    questionVi: 'Nếu người thất nghiệp nản chí và ngừng tìm việc, tỷ lệ thất nghiệp chính thức thay đổi thế nào?',
    choices: [
      'It increases',
      'It decreases',
      'It remains unchanged',
      'It becomes equal to the labor-force participation rate',
    ],
    correctIndex: 1,
    explanation: 'Both numerator (Unemployed) and denominator (Labor Force = E + U) drop by the same person; since U < E+U, the ratio U/(E+U) decreases!',
    explanationVi: 'Người nản chí rời khỏi nhóm Thất nghiệp lẫn Lực lượng lao động, làm cả tử và mẫu đều giảm một lượng bằng nhau ⇒ tỷ lệ thất nghiệp giảm.',
  },
  {
    id: 'mcq-28-2',
    topic: 'macro-growth-saving-unemp',
    chapter: 'Ch. 28',
    question:
      'Which of the following is a reason for structural (rather than frictional) unemployment?',
    questionVi: 'Nguyên nhân nào sau đây gây ra thất nghiệp cơ cấu (thay vì thất nghiệp cọ xát)?',
    choices: [
      'Graduates taking 2 months to interview for better-fitting jobs',
      'Workers shifting from declining coal regions to growing tech cities',
      'Minimum-wage laws, unions, or efficiency wages keeping wages above equilibrium',
      'Generous short-term unemployment insurance encouraging careful job search',
    ],
    correctIndex: 2,
    explanation: 'Minimum wages, collective bargaining unions, and efficiency wages hold the real wage above market-clearing equilibrium, creating structural unemployment.',
    explanationVi: 'Lương tối thiểu, công đoàn và lương hiệu quả giữ lương cao hơn mức cân bằng cung–cầu lao động ⇒ thất nghiệp cơ cấu.',
  },
  {
    id: 'mcq-29-1',
    topic: 'macro-money-inflation',
    chapter: 'Ch. 29',
    question:
      'If banks hold a 10% reserve ratio and hold no excess reserves (and households deposit all currency), a $1,000 Fed open-market bond purchase can increase the money supply by up to:',
    questionVi: 'Nếu tỷ lệ dự trữ bắt buộc là 10% và không có dự trữ dư thừa hay rò rỉ tiền mặt, NHTW mua $1,000 trái phiếu làm cung tiền tăng tối đa:',
    choices: ['$1,000', '$9,000', '$10,000', '$100,000'],
    correctIndex: 2,
    explanation: 'Money multiplier = 1 / 0.10 = 10. Total maximum money supply expansion = $1,000 × 10 = $10,000.',
    explanationVi: 'Số nhân tiền = 1 / 0.1 = 10 ⇒ Cung tiền tăng tối đa $1,000 × 10 = $10,000.',
  },
  {
    id: 'mcq-30-1',
    topic: 'macro-money-inflation',
    chapter: 'Ch. 30',
    question:
      'According to the Classical Dichotomy and Monetary Neutrality, if the central bank doubles the money supply in the long run:',
    questionVi: 'Theo lưỡng phân cổ điển và tính trung tính của tiền tệ, nếu NHTW tăng gấp đôi cung tiền trong dài hạn:',
    choices: [
      'Real GDP doubles and the price level stays constant',
      'The price level and nominal wages double, while real GDP and real interest rates are unchanged',
      'Real interest rates fall permanently by half',
      'Velocity of money falls to zero',
    ],
    correctIndex: 1,
    explanation: 'In the long run, changes in the money supply affect nominal variables (P, nominal wages, nominal interest rate via Fisher effect) proportionally, not real variables (Y, r).',
    explanationVi: 'Trong dài hạn, tiền tệ trung tính chỉ làm biến danh nghĩa (mức giá P, lương danh nghĩa) tăng tương ứng, không đổi biến thực (GDP thực, lãi suất thực).',
  },
  {
    id: 'mcq-31-1',
    topic: 'macro-open-econ',
    chapter: 'Ch. 31',
    question:
      'A US citizen buys 100 shares of Samsung stock on the Korean exchange, and Toyota builds a new car factory in Texas. Which is FDI and how does US NCO change?',
    questionVi: 'Công dân Mỹ mua cổ phiếu Samsung, còn Toyota xây nhà máy mới tại Texas. Đâu là FDI và NCO của Mỹ thế nào?',
    choices: [
      'Both are portfolio investment; US NCO rises for both',
      'Toyota factory is FDI (decreases US NCO); Samsung stock purchase is portfolio investment (increases US NCO)',
      'Samsung stock is FDI; Toyota factory increases US NCO',
      'Neither affects US NCO',
    ],
    correctIndex: 1,
    explanation: 'Building/operating a physical factory abroad is FDI (Toyota in US lowers US NCO); buying foreign shares without management control is portfolio investment (raises US NCO).',
    explanationVi: 'Xây nhà máy là FDI (nước ngoài đầu tư vào Mỹ làm giảm NCO của Mỹ); mua cổ phiếu nước ngoài là đầu tư gián tiếp (làm tăng NCO của Mỹ).',
  },
  {
    id: 'mcq-32-1',
    topic: 'macro-open-econ',
    chapter: 'Ch. 32',
    question:
      'In Mankiw’s open-economy model, if a country imposes a strict import quota on foreign cars, what happens to its real exchange rate and Net Exports (NX)?',
    questionVi: 'Trong mô hình kinh tế mở, nếu chính phủ áp hạn ngạch nhập khẩu ô tô, tỷ giá thực và xuất khẩu ròng NX thay đổi thế nào?',
    choices: [
      'Real exchange rate depreciates; NX increases',
      'Real exchange rate appreciates; NX stays unchanged',
      'Real exchange rate stays unchanged; NX increases',
      'Real interest rate falls; NX increases',
    ],
    correctIndex: 1,
    explanation: 'Import quotas shift FX demand right → domestic currency appreciates, reducing exports until NX returns to S − I (unchanged!).',
    explanationVi: 'Hạn ngạch làm cầu ngoại hối dịch phải ⇒ đồng nội tệ tăng giá ⇒ xuất khẩu giảm đúng bằng phần nhập khẩu giảm, NX không đổi!',
  },
  {
    id: 'mcq-33-1',
    topic: 'macro-adas-policy-phillips',
    chapter: 'Ch. 33',
    question:
      'If an economy starts in long-run equilibrium and experiences an adverse supply shock (e.g., an oil price spike), in the short run:',
    questionVi: 'Nền kinh tế đang cân bằng dài hạn gặp cú sốc cung bất lợi (giá dầu tăng mạnh), trong ngắn hạn:',
    choices: [
      'AD shifts right; output rises and price level rises',
      'SRAS shifts left; output falls and price level rises (stagflation)',
      'SRAS shifts right; output rises and price level falls',
      'LRAS shifts right immediately',
    ],
    correctIndex: 1,
    explanation: 'Higher production costs shift SRAS left, lowering Y and raising P simultaneously — stagflation.',
    explanationVi: 'Chi phí đầu vào tăng đẩy SRAS dịch trái, gây lạm phát đình trệ: sản lượng Y giảm và mức giá P tăng.',
  },
  {
    id: 'mcq-34-1',
    topic: 'macro-adas-policy-phillips',
    chapter: 'Ch. 34',
    question:
      'If the MPC = 0.75 (ignoring crowding out), an increase in government purchases ΔG = $20 billion shifts Aggregate Demand right by:',
    questionVi: 'Nếu MPC = 0.75 (bỏ qua chèn lấn), chi tiêu chính phủ tăng $20 tỷ sẽ làm tổng cầu dịch phải bao nhiêu?',
    choices: ['$20 billion', '$60 billion', '$80 billion', '$15 billion'],
    correctIndex: 2,
    explanation: 'Spending multiplier = 1 / (1 − 0.75) = 4. Total AD shift = 4 × $20B = $80 billion.',
    explanationVi: 'Số nhân chi tiêu = 1 / (1 − 0.75) = 4 ⇒ Tổng cầu tăng 4 × $20 tỷ = $80 tỷ.',
  },
  {
    id: 'mcq-35-1',
    topic: 'macro-adas-policy-phillips',
    chapter: 'Ch. 35',
    question:
      'When inflation expectations (π^e) rise, what happens to the Short-Run Phillips Curve (SRPC) and Long-Run Phillips Curve (LRPC)?',
    questionVi: 'Khi kỳ vọng lạm phát tăng, đường Phillips ngắn hạn (SRPC) và dài hạn (LRPC) thay đổi thế nào?',
    choices: [
      'Both SRPC and LRPC shift right',
      'SRPC shifts right (higher inflation at every unemployment rate); LRPC stays vertical at u_n',
      'SRPC shifts left; LRPC shifts left',
      'Movement upward along a fixed SRPC only',
    ],
    correctIndex: 1,
    explanation: 'Higher expected inflation shifts SRPC upward/rightward; LRPC remains vertical at the natural rate of unemployment u_n.',
    explanationVi: 'Kỳ vọng lạm phát tăng đẩy đường SRPC dịch lên/sang phải; LRPC vẫn thẳng đứng tại tỷ lệ thất nghiệp tự nhiên u_n.',
  },
  {
    id: 'mcq-micro-1',
    topic: 'micro-supply-elasticity-tax',
    chapter: 'Micro Ch. 5–8',
    question:
      'If demand is highly inelastic and supply is elastic, who bears most of the economic burden of a per-unit excise tax?',
    questionVi: 'Nếu cầu rất kém co giãn và cung co giãn nhiều, ai chịu phần lớn gánh nặng thuế?',
    choices: [
      'Sellers, regardless of who is legally taxed',
      'Buyers, regardless of whether the tax is placed on buyers or sellers',
      'Always split 50/50',
      'Neither side; government absorbs it via deadweight loss',
    ],
    correctIndex: 1,
    explanation: 'Tax incidence depends on relative elasticities, NOT statutory placement: the more inelastic side (here, buyers) bears the larger share of the tax burden.',
    explanationVi: 'Gánh nặng thuế không phụ thuộc đánh thuế vào ai mà rơi nhiều hơn vào phía KÉM CO GIÃN hơn (ở đây là người mua).',
  },
  {
    id: 'mcq-micro-2',
    topic: 'micro-costs-markets',
    chapter: 'Micro Ch. 14–15',
    question:
      'In the short run, a perfectly competitive firm should temporarily shut down whenever:',
    questionVi: 'Trong ngắn hạn, doanh nghiệp cạnh tranh hoàn hảo nên tạm ngừng sản xuất khi:',
    choices: [
      'P < ATC',
      'P < AVC',
      'Total profit < 0',
      'MC < AFC',
    ],
    correctIndex: 1,
    explanation: 'Fixed costs are sunk in the short run; as long as P ≥ AVC, operating covers variable costs and contributes toward fixed costs. Shut down if P < AVC.',
    explanationVi: 'Trong ngắn hạn chi phí cố định là chi phí chìm; doanh nghiệp đóng cửa khi giá bán không bù nổi chi phí biến đổi trung bình (P < AVC).',
  },
  {
    id: 'mcq-micro-3',
    topic: 'micro-costs-markets',
    chapter: 'Micro Ch. 15',
    question:
      'A profit-maximizing single-price monopoly produces the quantity where ______, and charges a price ______:',
    questionVi: 'Nhà độc quyền tối đa hóa lợi nhuận sản xuất tại mức sản lượng ______, và đặt giá ______:',
    choices: [
      'P = MC; equal to MC',
      'MR = MC; on the demand curve above MC (P > MC)',
      'MR = ATC; equal to min ATC',
      'P = MR; below MC',
    ],
    correctIndex: 1,
    explanation: 'Monopoly chooses Q_m where MR = MC, then reads price P_m off the demand curve (where P_m > MR = MC), creating deadweight loss.',
    explanationVi: 'Độc quyền chọn sản lượng tại MR = MC rồi gióng lên đường cầu để định giá P_m > MC.',
  },
];

export const ECON_SCENARIOS: EconScenario[] = [
  {
    id: 'scen-budget-deficit-open',
    topic: 'macro-open-econ',
    title: 'Open Economy: Government Budget Deficit in Twin Markets',
    titleVi: 'Kinh tế mở: Tác động của thâm hụt ngân sách trong mô hình hai thị trường',
    prompt:
      'Suppose an open economy increases government spending without raising taxes (creating a budget deficit). Trace the effects on: (1) Loanable Funds & real interest rate r, (2) Net Capital Outflow (NCO), (3) Real exchange rate e, and (4) Net Exports (NX).',
    promptVi:
      'Chính phủ tăng chi tiêu gây thâm hụt ngân sách trong nền kinh tế mở. Phân tích tác động đến (1) Thị trường vốn vay & r, (2) NCO, (3) Tỷ giá thực e, (4) Xuất khẩu ròng NX.',
    rubric: [
      { label: 'Identify public saving (T−G) falls ⇒ Supply of loanable funds shifts LEFT', points: 1 },
      { label: 'Conclude real interest rate r RISES', points: 1 },
      { label: 'Deduce higher r lowers NCO, shifting FX supply LEFT and appreciating real exchange rate', points: 1 },
      { label: 'Conclude NX falls (trade deficit / crowding out net exports)', points: 1 },
    ],
    modelSolution: `1. Market for Loanable Funds: Higher budget deficit reduces public saving (T − G) and national saving S, shifting the Supply of loanable funds LEFT. Consequently, the real interest rate r RISES.
2. NCO: Higher domestic r makes domestic bonds more attractive relative to foreign assets, so Net Capital Outflow (NCO) FALLS.
3. Foreign-Currency Exchange Market: Because Supply of domestic currency equals NCO, lower NCO shifts FX Supply LEFT, causing the real exchange rate to APPRECIATE (rise).
4. Net Exports: A stronger domestic currency makes exports dearer and imports cheaper, so NX FALLS (matching the lower NCO).`,
    modelSolutionVi:
      'Thâm hụt ngân sách ⇒ Cung vốn vay dịch trái ⇒ r tăng ⇒ NCO giảm ⇒ Cung ngoại tệ trên thị trường ngoại hối dịch trái ⇒ Tỷ giá tăng giá ⇒ NX giảm.',
  },
  {
    id: 'scen-stagflation-adas',
    topic: 'macro-adas-policy-phillips',
    title: 'Stagflation & Policy Trade-Off (AD–AS + Phillips Curve)',
    titleVi: 'Lạm phát đình trệ & Đánh đổi chính sách (AD–AS + Phillips)',
    prompt:
      'Starting from long-run equilibrium, a sharp global energy shock raises production costs. Explain what happens in the short run in both the AD–AS diagram and the Phillips Curve, and describe the two policy choices.',
    promptVi:
      'Từ trạng thái cân bằng dài hạn, cú sốc giá năng lượng làm tăng chi phí sản xuất. Giải thích diễn biến ngắn hạn trên đồ thị AD–AS, đường Phillips và 2 lựa chọn chính sách.',
    rubric: [
      { label: 'SRAS shifts LEFT → P rises and Y falls (Stagflation)', points: 1 },
      { label: 'SRPC shifts RIGHT (both inflation π and unemployment u rise)', points: 1 },
      { label: 'Option A (Accommodate / boost AD): restores Y_n faster but locks in higher P/inflation', points: 1 },
      { label: 'Option B (Do nothing): recession gradually lowers wages/P^e until SRAS shifts right back', points: 1 },
    ],
    modelSolution: `1. Short-Run Effect: Higher energy costs shift SRAS LEFT. Output falls below Y_n (recession, unemployment u rises) while the price level P rises — stagflation. On the Phillips curve, SRPC shifts RIGHT, presenting a worse inflation–unemployment trade-off.
2. Policy Option 1 (Accommodate via expansionary monetary/fiscal policy): Shifts AD RIGHT, returning output to Y_n quickly, at the cost of permanently higher price level and inflation expectations.
3. Policy Option 2 (No intervention / contractionary): Allows high unemployment to push wages and expected prices down over time so SRAS eventually shifts RIGHT back to Y_n, at the cost of a prolonged recession.`,
    modelSolutionVi:
      'Sốc cung bất lợi đẩy SRAS sang trái (P tăng, Y giảm) và đẩy SRPC sang phải. Chính phủ có thể kích cầu AD (hồi phục nhanh Y nhưng lạm phát cao hơn) hoặc chờ lương giảm dần (suy thoái kéo dài nhưng ổn định giá).',
  },
  {
    id: 'scen-fed-oms',
    topic: 'macro-money-inflation',
    title: 'Monetary Policy: Fed Open-Market Purchase & Liquidity Preference',
    titleVi: 'Chính sách tiền tệ: Nghiệp vụ thị trường mở & Ưa thích thanh khoản',
    prompt:
      'During a recession, the central bank buys government bonds on the open market. Trace how this affects (a) money supply & money multiplier, (b) the interest rate in the Liquidity Preference model, and (c) AD in the short run vs. prices in the long run.',
    promptVi:
      'Trong suy thoái, NHTW mua trái phiếu chính phủ. Phân tích tác động đến (a) cung tiền, (b) lãi suất trong lý thuyết ưa thích thanh khoản, và (c) AD ngắn hạn vs dài hạn.',
    rubric: [
      { label: 'Open-market purchase injects reserves; money supply rises by up to ΔReserves × (1/R)', points: 1 },
      { label: 'In Liquidity Preference, MS shifts right ⇒ interest rate r falls', points: 1 },
      { label: 'Lower r stimulates I (and weakens currency → NX↑), shifting AD RIGHT (Y↑, P↑)', points: 1 },
      { label: 'Long run: SRAS shifts left back to Y_n; money is neutral (higher P only)', points: 1 },
    ],
    modelSolution: `(a) Buying bonds injects bank reserves. Through fractional-reserve lending, the money supply rises by up to ΔReserves × (1/R).
(b) In the Liquidity Preference model, MS shifts RIGHT, lowering the equilibrium interest rate r.
(c) Lower r encourages business & residential investment I, shifting AD RIGHT (raising short-run output Y and lowering unemployment). In the long run, higher price expectations shift SRAS LEFT back to Y_n so output returns to natural level while P is permanently higher (Monetary Neutrality).`,
    modelSolutionVi:
      'Mua trái phiếu bơm dự trữ và mở rộng cung tiền (lên tới 1/R lần) ⇒ lãi suất giảm ⇒ đầu tư tăng, AD dịch phải (ngắn hạn Y tăng); dài hạn SRAS dịch trái về Y_n với mức giá cao hơn.',
  },
  {
    id: 'scen-tax-welfare',
    topic: 'micro-supply-elasticity-tax',
    title: 'Microeconomics: Tax Incidence & Deadweight Loss',
    titleVi: 'Kinh tế vi mô: Gánh nặng thuế & Tổn thất vô ích (DWL)',
    prompt:
      'Explain why a $2 per-unit tax on sellers vs. buyers produces the exact same market outcome (Pb, Ps, Qt, DWL), and explain what determines who bears more of the tax burden.',
    promptVi:
      'Giải thích vì sao thuế $2/đơn vị đánh vào người bán hay người mua đều cho kết quả cân bằng giống hệt nhau, và yếu tố nào quyết định gánh nặng thuế.',
    rubric: [
      { label: 'Tax creates a $2 wedge Pb − Ps = 2 regardless of which curve shifts', points: 1 },
      { label: 'Quantity falls from Q* to Q_t, creating DWL = ½ × 2 × (Q* − Q_t)', points: 1 },
      { label: 'Incidence depends on relative price elasticities (not statutory placement)', points: 1 },
      { label: 'More inelastic side bears the larger share of the tax burden', points: 1 },
    ],
    modelSolution: `Whether the $2 tax is levied on buyers (shifting Demand down by $2) or on sellers (shifting Supply up by $2), it creates the exact same $2 wedge between the price buyers pay (Pb) and the price sellers receive (Ps): Pb − Ps = $2. Therefore Qt, Pb, Ps, Tax Revenue, and DWL = ½ × $2 × (Q* − Qt) are identical.
Tax incidence depends solely on relative elasticities: the side of the market that is MORE INELASTIC (less responsive to price, having fewer substitutes) bears the larger share of the tax burden.`,
    modelSolutionVi:
      'Thuế luôn tạo ra khoảng cách Pb − Ps = $2 dù đánh vào người mua hay người bán. Phía nào KÉM CO GIÃN hơn sẽ gánh phần lớn thuế.',
  },
];
