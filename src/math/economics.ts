export interface GoodYearData {
  name: string;
  years: Array<{ price: number; qty: number }>;
}

export interface GdpYearSummary {
  yearLabel: string;
  nominalGdp: number;
  realGdp: number;
  gdpDeflator: number;
  realGrowthPct: number | null;
  inflationPct: number | null;
}

export function computeGdpTable(
  yearLabels: string[],
  goods: GoodYearData[],
  baseYearIdx: number,
): GdpYearSummary[] {
  const rows: GdpYearSummary[] = [];

  for (let y = 0; y < yearLabels.length; y++) {
    let nominal = 0;
    let real = 0;
    for (const g of goods) {
      nominal += g.years[y].price * g.years[y].qty;
      real += g.years[baseYearIdx].price * g.years[y].qty;
    }
    const deflator = real === 0 ? 0 : (nominal / real) * 100;
    const prev = rows[y - 1];
    const realGrowthPct =
      prev && prev.realGdp !== 0 ? ((real - prev.realGdp) / prev.realGdp) * 100 : null;
    const inflationPct =
      prev && prev.gdpDeflator !== 0
        ? ((deflator - prev.gdpDeflator) / prev.gdpDeflator) * 100
        : null;

    rows.push({
      yearLabel: yearLabels[y],
      nominalGdp: round2(nominal),
      realGdp: round2(real),
      gdpDeflator: round2(deflator),
      realGrowthPct: realGrowthPct === null ? null : round2(realGrowthPct),
      inflationPct: inflationPct === null ? null : round2(inflationPct),
    });
  }
  return rows;
}

export interface CpiGoodItem {
  name: string;
  basketQty: number;
  prices: number[];
}

export interface CpiYearSummary {
  yearLabel: string;
  basketCost: number;
  cpi: number;
  inflationPct: number | null;
}

export function computeCpiTable(
  yearLabels: string[],
  basket: CpiGoodItem[],
  baseYearIdx: number,
): CpiYearSummary[] {
  const costs = yearLabels.map((_, y) =>
    basket.reduce((s, item) => s + item.basketQty * item.prices[y], 0),
  );
  const baseCost = costs[baseYearIdx] || 1;
  const rows: CpiYearSummary[] = [];

  for (let y = 0; y < yearLabels.length; y++) {
    const cpi = (costs[y] / baseCost) * 100;
    const prev = rows[y - 1];
    const inflationPct = prev && prev.cpi !== 0 ? ((cpi - prev.cpi) / prev.cpi) * 100 : null;
    rows.push({
      yearLabel: yearLabels[y],
      basketCost: round2(costs[y]),
      cpi: round2(cpi),
      inflationPct: inflationPct === null ? null : round2(inflationPct),
    });
  }
  return rows;
}

export function indexDollarValue(amountThen: number, cpiThen: number, cpiNow: number): number {
  return round2(amountThen * (cpiNow / cpiThen));
}

export function realInterestRate(nominalRatePct: number, inflationRatePct: number): number {
  return round2(nominalRatePct - inflationRatePct);
}

export function computePeAndDividend(stockPrice: number, eps: number, dividendYieldPct: number) {
  const peRatio = eps > 0 ? round2(stockPrice / eps) : 0;
  const dividendPerShare = round2(stockPrice * (dividendYieldPct / 100));
  const retainedEarningsPerShare = round2(eps - dividendPerShare);
  return { peRatio, dividendPerShare, retainedEarningsPerShare };
}

export function computeSavingAndUnemployment(input: {
  Y: number;
  C: number;
  G: number;
  T: number;
  employed: number;
  unemployed: number;
  notInLaborForce: number;
}) {
  const privateSaving = round2(input.Y - input.T - input.C);
  const publicSaving = round2(input.T - input.G);
  const nationalSaving = round2(input.Y - input.C - input.G);
  const budgetStatus =
    publicSaving > 0
      ? 'Budget Surplus'
      : publicSaving < 0
        ? 'Budget Deficit'
        : 'Balanced Budget';

  const laborForce = input.employed + input.unemployed;
  const adultPop = laborForce + input.notInLaborForce;
  const unemploymentRate = laborForce > 0 ? round2((input.unemployed / laborForce) * 100) : 0;
  const lfpr = adultPop > 0 ? round2((laborForce / adultPop) * 100) : 0;

  return {
    privateSaving,
    publicSaving,
    nationalSaving,
    budgetStatus,
    laborForce,
    adultPop,
    unemploymentRate,
    lfpr,
  };
}

export function computeMoneyBanking(input: {
  initialDeposit: number;
  reserveRatioPct: number;
  excessReservePct?: number;
  currencyDrainPct?: number;
  bankAssets: number;
  bankCapital: number;
  moneySupplyM: number;
  velocityV: number;
  realOutputY: number;
}) {
  const rr = input.reserveRatioPct / 100;
  const er = (input.excessReservePct ?? 0) / 100;
  const cr = (input.currencyDrainPct ?? 0) / 100;

  const simpleMultiplier = rr > 0 ? round2(1 / rr) : 0;
  const actualMultiplier =
    rr + er + cr > 0 ? round2((1 + cr) / (rr + er + cr)) : 0;

  const maxTotalMoneyCreated = round2(input.initialDeposit * simpleMultiplier);
  const maxNewLoans = round2(maxTotalMoneyCreated - input.initialDeposit);
  const actualMoneyCreated = round2(input.initialDeposit * actualMultiplier);

  const leverageRatio =
    input.bankCapital > 0 ? round2(input.bankAssets / input.bankCapital) : 0;
  const priceLevel =
    input.realOutputY > 0
      ? round2((input.moneySupplyM * input.velocityV) / input.realOutputY)
      : 0;

  return {
    moneyMultiplier: simpleMultiplier,
    actualMultiplier,
    maxTotalMoneyCreated,
    maxNewLoans,
    actualMoneyCreated,
    leverageRatio,
    priceLevel,
  };
}

export function computeOpenEconomy(input: {
  nominalExchangeRate: number;
  domesticPrice: number;
  foreignPrice: number;
  nationalSavingS: number;
  domesticInvestmentI: number;
}) {
  const realExchangeRate =
    input.foreignPrice > 0
      ? round2((input.nominalExchangeRate * input.domesticPrice) / input.foreignPrice)
      : 0;
  const pppNominalRate =
    input.domesticPrice > 0 ? round2(input.foreignPrice / input.domesticPrice) : 0;
  const nco = round2(input.nationalSavingS - input.domesticInvestmentI);
  const nx = nco;
  const tradeStatus =
    nx > 0
      ? 'Trade Surplus (Net Capital Outflow > 0)'
      : nx < 0
        ? 'Trade Deficit (Net Capital Inflow)'
        : 'Balanced Trade';

  return {
    realExchangeRate,
    pppNominalRate,
    nco,
    nx,
    tradeStatus,
  };
}

export type OpenEconPolicyId = 'budget-deficit' | 'import-quota' | 'capital-flight';

export interface OpenEconPolicyOutcome {
  id: OpenEconPolicyId;
  title: string;
  titleVi: string;
  loanableFundsShift: string;
  fxShift: string;
  realInterestRate: 'Rises ↑' | 'Falls ↓' | 'Unchanged';
  nco: 'Falls ↓' | 'Rises ↑' | 'Unchanged';
  realExchangeRate: 'Appreciates ↑' | 'Depreciates ↓' | 'Unchanged';
  netExports: 'Falls ↓' | 'Rises ↑' | 'Unchanged';
  explanation: string;
  explanationVi: string;
}

export const OPEN_ECON_POLICIES: OpenEconPolicyOutcome[] = [
  {
    id: 'budget-deficit',
    title: 'Government Budget Deficit (G ↑ or T ↓)',
    titleVi: 'Thâm hụt ngân sách chính phủ',
    loanableFundsShift: 'Supply of loanable funds shifts LEFT (S ↓)',
    fxShift: 'Supply of dollars in FX shifts LEFT (since NCO ↓)',
    realInterestRate: 'Rises ↑',
    nco: 'Falls ↓',
    realExchangeRate: 'Appreciates ↑',
    netExports: 'Falls ↓',
    explanation:
      'Lower public saving reduces national saving (S shifts left), raising the real interest rate r. Higher r makes domestic assets more attractive, reducing NCO. Lower NCO cuts the supply of domestic currency in the FX market, appreciating the real exchange rate and shrinking NX (trade deficit / crowding out net exports).',
    explanationVi:
      'Tiết kiệm quốc gia giảm làm cung vốn vay dịch trái ⇒ lãi suất thực r tăng ⇒ NCO giảm ⇒ cung nội tệ trên thị trường ngoại hối giảm ⇒ tỷ giá thực tăng giá (appreciate) ⇒ xuất khẩu ròng NX giảm.',
  },
  {
    id: 'import-quota',
    title: 'Trade Policy: Import Quota / Tariff',
    titleVi: 'Chính sách thương mại: Hạn ngạch / Thuế nhập khẩu',
    loanableFundsShift: 'No shift (S and NCO depend on r, not trade barriers)',
    fxShift: 'Demand for dollars shifts RIGHT (higher NX at every e)',
    realInterestRate: 'Unchanged',
    nco: 'Unchanged',
    realExchangeRate: 'Appreciates ↑',
    netExports: 'Unchanged',
    explanation:
      'Because NX = NCO = S − I and neither S nor I changes, equilibrium NX does NOT change! Cutting imports shifts FX demand right, appreciating the real exchange rate until exports fall by the exact amount imports fell.',
    explanationVi:
      'Vì NX = NCO = S − I không đổi nên rào cản thương mại chỉ đẩy cầu ngoại hối dịch phải làm đồng nội tệ tăng giá, khiến xuất khẩu giảm đúng bằng phần nhập khẩu giảm — tổng NX không đổi!',
  },
  {
    id: 'capital-flight',
    title: 'Political Instability / Capital Flight',
    titleVi: 'Bất ổn chính trị / Tháo chạy vốn (Capital Flight)',
    loanableFundsShift: 'NCO shifts RIGHT → Demand for loanable funds shifts RIGHT',
    fxShift: 'Supply of domestic currency in FX shifts RIGHT (NCO ↑)',
    realInterestRate: 'Rises ↑',
    nco: 'Rises ↑',
    realExchangeRate: 'Depreciates ↓',
    netExports: 'Rises ↑',
    explanation:
      'Investors pull money out of the country, shifting NCO right. In loanable funds, higher NCO raises demand for borrowing, pushing r up. In FX, higher NCO increases supply of domestic currency, depreciating the real exchange rate and increasing NX.',
    explanationVi:
      'Nhà đầu tư rút vốn ra nước ngoài làm NCO dịch phải ⇒ cầu vốn vay tăng (r tăng) và cung nội tệ tăng làm nội tệ mất giá (depreciate) ⇒ NX tăng.',
  },
];

export function computeMultipliers(mpc: number, deltaG: number, deltaT: number) {
  const denom = 1 - mpc;
  const spendingMultiplier = denom !== 0 ? round2(1 / denom) : 0;
  const taxMultiplier = denom !== 0 ? round2(-mpc / denom) : 0;
  const adShiftFromG = round2(spendingMultiplier * deltaG);
  const adShiftFromT = round2(taxMultiplier * deltaT);
  const totalAdShift = round2(adShiftFromG + adShiftFromT);
  return {
    spendingMultiplier,
    taxMultiplier,
    adShiftFromG,
    adShiftFromT,
    totalAdShift,
  };
}

export function computeSacrificeRatio(
  inflationReductionPct: number,
  sacrificeRatio: number,
  yearsToDisinflate = 1,
) {
  const totalGdpLossPct = round2(inflationReductionPct * sacrificeRatio);
  const annualGdpLossPct =
    yearsToDisinflate > 0 ? round2(totalGdpLossPct / yearsToDisinflate) : totalGdpLossPct;
  return { totalGdpLossPct, annualGdpLossPct };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
