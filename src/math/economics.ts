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
  const numYears = yearLabels.length;
  const rows: GdpYearSummary[] = [];

  for (let y = 0; y < numYears; y++) {
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
  const nationalSaving = round2(input.Y - input.C - input.G); // equals private + public
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
  bankAssets: number;
  bankCapital: number;
  moneySupplyM: number;
  velocityV: number;
  realOutputY: number;
}) {
  const r = input.reserveRatioPct / 100;
  const moneyMultiplier = r > 0 ? round2(1 / r) : 0;
  const maxTotalMoneyCreated = round2(input.initialDeposit * moneyMultiplier);
  const maxNewLoans = round2(maxTotalMoneyCreated - input.initialDeposit);
  const leverageRatio =
    input.bankCapital > 0 ? round2(input.bankAssets / input.bankCapital) : 0;
  const priceLevel =
    input.realOutputY > 0
      ? round2((input.moneySupplyM * input.velocityV) / input.realOutputY)
      : 0;

  return {
    moneyMultiplier,
    maxTotalMoneyCreated,
    maxNewLoans,
    leverageRatio,
    priceLevel,
  };
}

export function computeOpenEconomy(input: {
  nominalExchangeRate: number; // foreign currency per 1 domestic unit
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
    nx > 0 ? 'Trade Surplus (Net Capital Outflow > 0)' : nx < 0 ? 'Trade Deficit (Net Capital Inflow)' : 'Balanced Trade';

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

// Linear market: Qd = a - bP, Qs = c + dP (with a > 0, b > 0, d > 0)
export function computeLinearMarket(input: {
  a: number;
  b: number;
  c: number;
  d: number;
  tax?: number;
  priceControl?: { type: 'none' | 'ceiling' | 'floor'; price: number };
}) {
  const { a, b, c, d, tax = 0 } = input;
  const eqPrice = (a - c) / (b + d);
  const eqQty = a - b * eqPrice;
  const pMaxDemand = a / b;
  const pMinSupply = -c / d;

  const csNoTax = 0.5 * (pMaxDemand - eqPrice) * eqQty;
  const psNoTax = 0.5 * (eqPrice - Math.max(0, pMinSupply)) * eqQty;

  // With per-unit tax t: Pb - Ps = t, and a - b*Pb = c + d*Ps => Q_tax
  const psTax = (a - c - b * tax) / (b + d);
  const pbTax = psTax + tax;
  const qTax = Math.max(0, a - b * pbTax);
  const taxRevenue = tax * qTax;
  const dwlTax = 0.5 * tax * Math.max(0, eqQty - qTax);
  const buyerBurdenPerUnit = pbTax - eqPrice;
  const sellerBurdenPerUnit = eqPrice - psTax;

  let controlStatus = 'No Price Control';
  let shortageOrSurplus = 0;
  let actualQtyControl = eqQty;

  if (input.priceControl && input.priceControl.type !== 'none') {
    const pCtrl = input.priceControl.price;
    const qdAt = Math.max(0, a - b * pCtrl);
    const qsAt = Math.max(0, c + d * pCtrl);
    if (input.priceControl.type === 'ceiling') {
      if (pCtrl < eqPrice) {
        controlStatus = 'Binding Price Ceiling (Shortage)';
        shortageOrSurplus = round2(qdAt - qsAt);
        actualQtyControl = round2(qsAt);
      } else {
        controlStatus = 'Non-Binding Price Ceiling (Market stays at P*)';
      }
    } else if (input.priceControl.type === 'floor') {
      if (pCtrl > eqPrice) {
        controlStatus = 'Binding Price Floor (Surplus)';
        shortageOrSurplus = round2(qsAt - qdAt);
        actualQtyControl = round2(qdAt);
      } else {
        controlStatus = 'Non-Binding Price Floor (Market stays at P*)';
      }
    }
  }

  return {
    eqPrice: round2(eqPrice),
    eqQty: round2(eqQty),
    csNoTax: round2(csNoTax),
    psNoTax: round2(psNoTax),
    tsNoTax: round2(csNoTax + psNoTax),
    pbTax: round2(pbTax),
    psTax: round2(psTax),
    qTax: round2(qTax),
    taxRevenue: round2(taxRevenue),
    dwlTax: round2(dwlTax),
    buyerBurdenPerUnit: round2(buyerBurdenPerUnit),
    sellerBurdenPerUnit: round2(sellerBurdenPerUnit),
    controlStatus,
    shortageOrSurplus,
    actualQtyControl,
  };
}

export function computeMidpointElasticity(p1: number, q1: number, p2: number, q2: number) {
  const pctQ = (q2 - q1) / ((q2 + q1) / 2);
  const pctP = (p2 - p1) / ((p2 + p1) / 2);
  const ed = pctP !== 0 ? Math.abs(pctQ / pctP) : Infinity;
  const classification =
    ed > 1.0001 ? 'Elastic (|Ed| > 1)' : ed < 0.9999 ? 'Inelastic (|Ed| < 1)' : 'Unit Elastic (|Ed| = 1)';
  const tr1 = round2(p1 * q1);
  const tr2 = round2(p2 * q2);
  return {
    elasticityAbs: ed === Infinity ? Infinity : round2(ed),
    classification,
    tr1,
    tr2,
    trDelta: round2(tr2 - tr1),
  };
}

// Inverse demand P = a - bQ, constant MC, optional Fixed Cost
export function computeMonopolyLinear(a: number, b: number, mc: number, fixedCost = 0) {
  // Competitive: P = MC => Q_c = (a - mc)/b
  const qComp = Math.max(0, (a - mc) / b);
  const pComp = mc;
  // Monopoly: MR = a - 2bQ = MC => Q_m = (a - mc)/(2b)
  const qMono = Math.max(0, (a - mc) / (2 * b));
  const pMono = a - b * qMono;
  const profitMono = (pMono - mc) * qMono - fixedCost;
  const dwl = 0.5 * (pMono - mc) * (qComp - qMono);

  return {
    qComp: round2(qComp),
    pComp: round2(pComp),
    qMono: round2(qMono),
    pMono: round2(pMono),
    profitMono: round2(profitMono),
    dwl: round2(dwl),
  };
}

export function computeComparativeAdvantage(input: {
  personAName: string;
  personBName: string;
  good1Name: string;
  good2Name: string;
  aGood1Max: number;
  aGood2Max: number;
  bGood1Max: number;
  bGood2Max: number;
}) {
  const oppA1 = round2(input.aGood2Max / input.aGood1Max); // cost of 1 unit of Good1 in Good2
  const oppB1 = round2(input.bGood2Max / input.bGood1Max);
  const oppA2 = round2(input.aGood1Max / input.aGood2Max);
  const oppB2 = round2(input.bGood1Max / input.bGood2Max);

  const compAdvGood1 =
    oppA1 < oppB1 ? input.personAName : oppB1 < oppA1 ? input.personBName : 'Tie';
  const compAdvGood2 =
    oppA2 < oppB2 ? input.personAName : oppB2 < oppA2 ? input.personBName : 'Tie';

  const absAdvGood1 =
    input.aGood1Max > input.bGood1Max
      ? input.personAName
      : input.bGood1Max > input.aGood1Max
        ? input.personBName
        : 'Tie';
  const absAdvGood2 =
    input.aGood2Max > input.bGood2Max
      ? input.personAName
      : input.bGood2Max > input.aGood2Max
        ? input.personBName
        : 'Tie';

  const lowPriceGood1 = Math.min(oppA1, oppB1);
  const highPriceGood1 = Math.max(oppA1, oppB1);

  return {
    oppA1,
    oppB1,
    oppA2,
    oppB2,
    compAdvGood1,
    compAdvGood2,
    absAdvGood1,
    absAdvGood2,
    tradeRangeGood1: `${lowPriceGood1} to ${highPriceGood1} ${input.good2Name} per ${input.good1Name}`,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
