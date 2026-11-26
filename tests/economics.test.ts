import { describe, expect, it } from 'vitest';
import {
  computeCpiTable,
  computeGdpTable,
  computeMoneyBanking,
  computeMultipliers,
  computeOpenEconomy,
  computePeAndDividend,
  computeSacrificeRatio,
  computeSavingAndUnemployment,
  indexDollarValue,
  realInterestRate,
} from '../src/math/economics';

describe('ECO101 Principles of Macroeconomics — Final Exam Calculators', () => {
  it('Part 6 (Ch. 23): Nominal GDP, Real GDP, Deflator and growth/inflation', () => {
    const res = computeGdpTable(
      ['2021', '2022', '2023'],
      [
        {
          name: 'Pizza',
          years: [
            { price: 10, qty: 400 },
            { price: 11, qty: 500 },
            { price: 12, qty: 600 },
          ],
        },
        {
          name: 'Coffee',
          years: [
            { price: 2, qty: 1000 },
            { price: 2.5, qty: 1100 },
            { price: 3, qty: 1200 },
          ],
        },
      ],
      0,
    );
    expect(res[0].nominalGdp).toBe(6000);
    expect(res[0].realGdp).toBe(6000);
    expect(res[0].gdpDeflator).toBe(100);
    expect(res[1].nominalGdp).toBe(8250);
    expect(res[1].realGdp).toBe(7200);
    expect(res[1].gdpDeflator).toBe(114.58);
    expect(res[1].realGrowthPct).toBe(20);
  });

  it('Part 6 (Ch. 24): CPI, indexing, and real interest rate', () => {
    const cpi = computeCpiTable(
      ['2022', '2023'],
      [
        { name: 'Hot dogs', basketQty: 4, prices: [1, 2] },
        { name: 'Burgers', basketQty: 2, prices: [2, 3] },
      ],
      0,
    );
    expect(cpi[0]).toEqual({ yearLabel: '2022', basketCost: 8, cpi: 100, inflationPct: null });
    expect(cpi[1]).toEqual({ yearLabel: '2023', basketCost: 14, cpi: 175, inflationPct: 75 });
    expect(indexDollarValue(100, 100, 175)).toBe(175);
    expect(realInterestRate(8, 3)).toBe(5);
  });

  it('Part 6 (Ch. 26 & 28): Saving, P/E ratio, and unemployment stats', () => {
    const res = computeSavingAndUnemployment({
      Y: 10000,
      C: 6000,
      G: 1700,
      T: 1500,
      employed: 145,
      unemployed: 5,
      notInLaborForce: 50,
    });
    expect(res.privateSaving).toBe(2500);
    expect(res.publicSaving).toBe(-200);
    expect(res.nationalSaving).toBe(2300);
    expect(res.budgetStatus).toBe('Budget Deficit');
    expect(res.laborForce).toBe(150);
    expect(res.unemploymentRate).toBe(3.33);
    expect(res.lfpr).toBe(75);

    const stock = computePeAndDividend(60, 4, 2.5);
    expect(stock).toEqual({ peRatio: 15, dividendPerShare: 1.5, retainedEarningsPerShare: 2.5 });
  });

  it('Part 7 (Ch. 29–30): Money multiplier (simple vs actual), leverage & MV = PY', () => {
    const res = computeMoneyBanking({
      initialDeposit: 1000,
      reserveRatioPct: 10,
      excessReservePct: 5,
      currencyDrainPct: 10,
      bankAssets: 1000,
      bankCapital: 50,
      moneySupplyM: 500,
      velocityV: 4,
      realOutputY: 1000,
    });
    expect(res.moneyMultiplier).toBe(10);
    expect(res.actualMultiplier).toBe(4.4);
    expect(res.maxTotalMoneyCreated).toBe(10000);
    expect(res.maxNewLoans).toBe(9000);
    expect(res.leverageRatio).toBe(20);
    expect(res.priceLevel).toBe(2);
  });

  it('Part 8 (Ch. 31–32): Open economy real exchange rate, PPP, and NCO = NX', () => {
    const res = computeOpenEconomy({
      nominalExchangeRate: 100,
      domesticPrice: 2,
      foreignPrice: 400,
      nationalSavingS: 1200,
      domesticInvestmentI: 900,
    });
    expect(res.realExchangeRate).toBe(0.5);
    expect(res.pppNominalRate).toBe(200);
    expect(res.nco).toBe(300);
    expect(res.nx).toBe(300);
  });

  it('Part 9 (Ch. 34–35): Spending/tax multipliers and sacrifice ratio', () => {
    const res = computeMultipliers(0.8, 100, 100);
    expect(res.spendingMultiplier).toBe(5);
    expect(res.taxMultiplier).toBe(-4);
    expect(res.adShiftFromG).toBe(500);
    expect(res.adShiftFromT).toBe(-400);
    expect(res.totalAdShift).toBe(100);

    const sac = computeSacrificeRatio(4, 5, 2);
    expect(sac).toEqual({ totalGdpLossPct: 20, annualGdpLossPct: 10 });
  });

  it('Handles zero/invalid denominator edge cases safely', () => {
    expect(indexDollarValue(500, 0, 175)).toBe(0);
    expect(indexDollarValue(500, -10, 175)).toBe(0);
    const badMult = computeMultipliers(1, 50, 0);
    expect(badMult.spendingMultiplier).toBe(0);
    expect(badMult.taxMultiplier).toBe(0);
    expect(badMult.totalAdShift).toBe(0);
  });
});
