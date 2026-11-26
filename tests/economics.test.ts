import { describe, expect, it } from 'vitest';
import {
  computeComparativeAdvantage,
  computeCpiTable,
  computeGdpTable,
  computeLinearMarket,
  computeMidpointElasticity,
  computeMoneyBanking,
  computeMonopolyLinear,
  computeMultipliers,
  computeOpenEconomy,
  computeSavingAndUnemployment,
  indexDollarValue,
  realInterestRate,
} from '../src/math/economics';

describe('Principles of Economics — Macro & Micro Calculators', () => {
  it('computes Nominal GDP, Real GDP, Deflator and growth/inflation accurately', () => {
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

  it('computes CPI, indexing, and real interest rate', () => {
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

  it('computes national saving and unemployment stats', () => {
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
  });

  it('computes money multiplier, leverage ratio, and quantity theory price level', () => {
    const res = computeMoneyBanking({
      initialDeposit: 1000,
      reserveRatioPct: 10,
      bankAssets: 1000,
      bankCapital: 50,
      moneySupplyM: 500,
      velocityV: 4,
      realOutputY: 1000,
    });
    expect(res.moneyMultiplier).toBe(10);
    expect(res.maxTotalMoneyCreated).toBe(10000);
    expect(res.maxNewLoans).toBe(9000);
    expect(res.leverageRatio).toBe(20);
    expect(res.priceLevel).toBe(2);
  });

  it('computes open economy real exchange rate, PPP, and NCO = NX', () => {
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

  it('computes spending and tax multipliers', () => {
    const res = computeMultipliers(0.8, 100, 100);
    expect(res.spendingMultiplier).toBe(5);
    expect(res.taxMultiplier).toBe(-4);
    expect(res.adShiftFromG).toBe(500);
    expect(res.adShiftFromT).toBe(-400);
    expect(res.totalAdShift).toBe(100);
  });

  it('computes linear market equilibrium, tax incidence, DWL, and price controls', () => {
    // Qd = 100 - 2P, Qs = 20 + 2P -> 4P = 80 -> P*=20, Q*=60
    const mkt = computeLinearMarket({
      a: 100,
      b: 2,
      c: 20,
      d: 2,
      tax: 4,
      priceControl: { type: 'ceiling', price: 15 },
    });
    expect(mkt.eqPrice).toBe(20);
    expect(mkt.eqQty).toBe(60);
    expect(mkt.pbTax).toBe(22);
    expect(mkt.psTax).toBe(18);
    expect(mkt.qTax).toBe(56);
    expect(mkt.taxRevenue).toBe(224);
    expect(mkt.dwlTax).toBe(8);
    expect(mkt.shortageOrSurplus).toBe(20);
  });

  it('computes midpoint elasticity, monopoly, and comparative advantage', () => {
    const el = computeMidpointElasticity(4, 120, 6, 80);
    expect(el.elasticityAbs).toBe(1);
    expect(el.tr1).toBe(480);
    expect(el.tr2).toBe(480);

    const mono = computeMonopolyLinear(100, 1, 20, 100);
    expect(mono.qComp).toBe(80);
    expect(mono.qMono).toBe(40);
    expect(mono.pMono).toBe(60);
    expect(mono.profitMono).toBe(1500);
    expect(mono.dwl).toBe(800);

    const trade = computeComparativeAdvantage({
      personAName: 'Frank',
      personBName: 'Ruby',
      good1Name: 'Meat',
      good2Name: 'Potatoes',
      aGood1Max: 8,
      aGood2Max: 32,
      bGood1Max: 24,
      bGood2Max: 48,
    });
    expect(trade.compAdvGood1).toBe('Ruby');
    expect(trade.compAdvGood2).toBe('Frank');
  });
});
