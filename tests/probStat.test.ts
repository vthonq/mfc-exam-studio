import { describe, expect, it } from 'vitest';
import {
  analyzeDiscreteJoint,
  binomialCdf,
  binomialPmf,
  binomialStats,
  chiSqCritUpper,
  ciMeanT,
  ciMeanZ,
  ciProportion,
  ciVarianceChiSq,
  exponentialCdf,
  exponentialStats,
  fCritUpper,
  formatSbChiSq,
  formatSbF,
  formatSbNormal,
  formatSbT,
  gammaStats,
  geometricPmf,
  geometricStats,
  hypergeometricPmf,
  hypergeometricStats,
  negBinomialPmf,
  negBinomialStats,
  normalAreaZeroToZ,
  normalCdf,
  normalInv,
  poissonCdf,
  poissonPmf,
  powerMeanZ,
  sampleSizeMean,
  tCritUpper,
  testMeanT,
  testProportionZ,
  testVarianceChiSq,
} from '../src/math/probStat';
import { parseRichMathTokens } from '../src/components/Math';

describe('SB Statistical Tables accuracy (matching scanned Appendices C-1..F)', () => {
  it('matches Appendix C-1 (Standard Normal Area between 0 and z, p.767)', () => {
    expect(formatSbNormal(normalAreaZeroToZ(0.0), 0.0)).toBe('.0000');
    expect(formatSbNormal(normalAreaZeroToZ(1.0), 1.0)).toBe('.3413');
    expect(formatSbNormal(normalAreaZeroToZ(1.96), 1.96)).toBe('.4750');
    expect(formatSbNormal(normalAreaZeroToZ(2.58), 2.58)).toBe('.4951');
    expect(formatSbNormal(normalAreaZeroToZ(3.15), 3.15)).toBe('.49918');
    expect(formatSbNormal(normalAreaZeroToZ(3.79), 3.79)).toBe('.49992');
  });

  it('matches Appendix C-2 (Cumulative Standard Normal, p.768-769)', () => {
    expect(formatSbNormal(normalCdf(-1.96), 1.96)).toBe('.0250');
    expect(formatSbNormal(normalCdf(-3.12), 3.12)).toBe('.00090');
    expect(formatSbNormal(normalCdf(-0.0), 0.0)).toBe('.5000');
    expect(formatSbNormal(normalCdf(1.28), 1.28)).toBe('.8997');
    expect(formatSbNormal(normalCdf(1.64), 1.64)).toBe('.9495');
    expect(formatSbNormal(normalCdf(1.96), 1.96)).toBe('.9750');
    expect(normalInv(0.975)).toBeCloseTo(1.959964, 5);
    expect(normalInv(0.025)).toBeCloseTo(-1.959964, 5);
  });

  it('matches Appendix D (Student t critical values, p.770)', () => {
    expect(formatSbT(tCritUpper(0.025, 1))).toBe('12.706');
    expect(formatSbT(tCritUpper(0.005, 1))).toBe('63.657');
    expect(formatSbT(tCritUpper(0.025, 15))).toBe('2.131');
    expect(formatSbT(tCritUpper(0.05, 24))).toBe('1.711');
    expect(formatSbT(tCritUpper(0.01, 40))).toBe('2.423');
    expect(formatSbT(tCritUpper(0.025, Infinity))).toBe('1.960');
  });

  it('matches Appendix E (Chi-Square upper-tail critical values, p.771)', () => {
    expect(formatSbChiSq(chiSqCritUpper(0.05, 4))).toBe('9.488');
    expect(formatSbChiSq(chiSqCritUpper(0.975, 15))).toBe('6.262');
    expect(formatSbChiSq(chiSqCritUpper(0.025, 15))).toBe('27.49');
    expect(formatSbChiSq(chiSqCritUpper(0.05, 24))).toBe('36.42');
    expect(formatSbChiSq(chiSqCritUpper(0.05, 100))).toBe('124.3');
  });

  it('matches Appendix F (F critical values, p.772-779)', () => {
    expect(formatSbF(fCritUpper(0.1, 5, 10))).toBe('2.52');
    expect(formatSbF(fCritUpper(0.05, 4, 12))).toBe('3.26');
    expect(formatSbF(fCritUpper(0.025, 6, 15))).toBe('3.41');
    expect(formatSbF(fCritUpper(0.01, 3, 20))).toBe('4.94');
    expect(formatSbF(fCritUpper(0.01, 1, 1))).toBe('4052');
    expect(formatSbF(fCritUpper(0.05, 12, Infinity))).toBe('1.75');
    expect(formatSbF(fCritUpper(0.05, Infinity, 12))).toBe('2.30');
  });
});

describe('Chapters 1-5 Distributions & Problem Set Ground Truths', () => {
  it('computes Ch. 1 discrete distributions accurately', () => {
    // PS1 Problem 2: Binomial(n=10, p=0.05), P(X >= 2)
    const pAtLeast2 = 1 - binomialCdf(1, 10, 0.05);
    expect(pAtLeast2).toBeCloseTo(0.08614, 4);
    expect(binomialStats(10, 0.05).mean).toBeCloseTo(0.5, 6);

    // Binomial single point check
    expect(binomialPmf(3, 10, 0.3)).toBeCloseTo(0.266828, 5);

    // PS1 Problem 5: Poisson, P(X >= 1) = 0.8647 => e^{-lambda} ~ 0.1353 => lambda = 2
    expect(1 - poissonPmf(0, 2)).toBeCloseTo(0.864665, 4);
    expect(1 - poissonCdf(5, 2)).toBeCloseTo(0.01656, 4);

    // PS1 Problem 9: Geometric & NegBinomial (trials convention)
    expect(geometricStats(0.35).mean).toBeCloseTo(1 / 0.35, 6);
    expect(geometricPmf(1, 0.35)).toBeCloseTo(0.35, 6);
    expect(negBinomialStats(3, 0.35).mean).toBeCloseTo(3 / 0.35, 6);
    expect(negBinomialPmf(3, 3, 0.35)).toBeCloseTo(Math.pow(0.35, 3), 6);

    // PS1 Problem 10: Hypergeometric(n=2, N=10, D=2), P(X=0) = C(8,2)/C(10,2) = 28/45
    expect(hypergeometricPmf(0, 2, 10, 2)).toBeCloseTo(28 / 45, 6);
    expect(hypergeometricStats(2, 10, 2).mean).toBeCloseTo(0.4, 6);
  });

  it('computes Ch. 2 continuous distributions accurately', () => {
    // PS2 Problem 8: Exponential with mean 10 => lambda = 0.1
    expect(exponentialStats(0.1).variance).toBeCloseTo(100, 6);
    expect(1 - exponentialCdf(15, 0.1)).toBeCloseTo(Math.exp(-1.5), 6);

    // Gamma(shape=3, rate=0.5) => E=6, Var=12
    expect(gammaStats(3, 0.5).mean).toBeCloseTo(6, 6);
    expect(gammaStats(3, 0.5).variance).toBeCloseTo(12, 6);
  });

  it('computes Ch. 3 discrete bivariate joint distribution & covariance accurately', () => {
    // PS3 Problem 2: Moisture X in {1,2,3,4}, Impurity Y in {1,2}
    const xs = [1, 2, 3, 4];
    const ys = [1, 2];
    const grid = [
      [0.05, 0.05, 0.15, 0.10], // Y = 1
      [0.10, 0.20, 0.30, 0.05], // Y = 2
    ];
    const res = analyzeDiscreteJoint(xs, ys, grid);
    expect(res.valid).toBe(true);
    expect(res.marginalX[0]).toBeCloseTo(0.15, 6);
    expect(res.marginalX[1]).toBeCloseTo(0.25, 6);
    expect(res.marginalX[2]).toBeCloseTo(0.45, 6);
    expect(res.marginalX[3]).toBeCloseTo(0.15, 6);
    expect(res.marginalY[0]).toBeCloseTo(0.35, 6);
    expect(res.marginalY[1]).toBeCloseTo(0.65, 6);
    expect(res.ex).toBeCloseTo(2.6, 6);
    // E(Y^2) = 1*0.35 + 4*0.65 = 2.95 => E(2X + 10Y^2) = 5.2 + 29.5 = 34.7
    expect(res.ey2).toBeCloseTo(2.95, 6);
    expect(2 * res.ex + 10 * res.ey2).toBeCloseTo(34.7, 6);
    expect(res.independent).toBe(false);
  });

  it('computes Ch. 5 CIs, hypothesis tests, sample size & power accurately', () => {
    // PS5 Problem 1: Sugar bags (n=25, xBar=19.8, sigma=1.2, 99% CI)
    const ci1 = ciMeanZ(19.8, 1.2, 25, 0.99);
    expect(ci1.lower).toBeCloseTo(19.1818, 3);
    expect(ci1.upper).toBeCloseTo(20.4182, 3);
    expect(sampleSizeMean(1.2, 0.1, 0.99)).toBe(956);

    // PS5 Problem 4: Jane fruit boxes (n=16, 98% CI (70.65, 80.35) => xBar=75.5, margin=4.85)
    // t_{0.01, 15} = 2.602 => s = 4.85*4 / 2.602 = 7.4558
    const tTest5 = testMeanT(167.1, 165, Math.sqrt(101.2), 100, 0.05, 'right');
    expect(tTest5.stat).toBeCloseTo(2.0875, 3);
    expect(tTest5.reject).toBe(true); // 5% right-tail rejects

    // Same data at 1%: t_{0.01, 99} ~ 2.365 > 2.0875 => fail to reject
    const tTest5b = testMeanT(167.1, 165, Math.sqrt(101.2), 100, 0.01, 'right');
    expect(tTest5b.reject).toBe(false);

    // CI mean t check
    const ciT = ciMeanT(13.35, 1.5, 8, 0.95);
    expect(ciT.tCrit).toBeCloseTo(2.3646, 3);

    // PS5 Problem 7: Laptop proportion (355/546, 95% CI, test vs 2/3)
    const ciP = ciProportion(355, 546, 0.95);
    expect(ciP.pHat).toBeCloseTo(0.65018, 4);
    const propTest = testProportionZ(355, 546, 2 / 3, 0.05, 'two');
    expect(propTest.reject).toBe(false);

    // PS5 Variance CI & test
    const ciVar = ciVarianceChiSq(2.0, 20, 0.95);
    expect(ciVar.lowerVar).toBeLessThan(ciVar.upperVar);
    const varTest = testVarianceChiSq(3.2, 1.65, 10, 0.05, 'right');
    expect(varTest.stat).toBeCloseTo((9 * 3.2) / 1.65, 4);
    expect(varTest.reject).toBe(true);

    // PS5 Problem 12 power check
    const pwr = powerMeanZ(72, 80, 20, 30, 0.02, 'right');
    expect(pwr.beta).toBeGreaterThan(0);
    expect(pwr.power + pwr.beta).toBeCloseTo(1, 6);
  });
});

describe('RichMathText tokenizer', () => {
  it('parses inline LaTeX, escaped currency inside math, bold+math, and standalone prices safely', () => {
    const t1 = parseRichMathTokens('Follows $X \\sim N(\\mu, \\sigma^2)$ today.');
    expect(t1).toEqual([
      { type: 'text', value: 'Follows ' },
      { type: 'math', value: 'X \\sim N(\\mu, \\sigma^2)', display: false },
      { type: 'text', value: ' today.' },
    ]);

    const t2 = parseRichMathTokens('Mean is $\\mu = \\$115.50$ per week.');
    expect(t2).toEqual([
      { type: 'text', value: 'Mean is ' },
      { type: 'math', value: '\\mu = \\$115.50', display: false },
      { type: 'text', value: ' per week.' },
    ]);

    const t3 = parseRichMathTokens('Decision: **David rejects $H_0$** here.');
    expect(t3).toEqual([
      { type: 'text', value: 'Decision: ' },
      {
        type: 'bold',
        children: [
          { type: 'text', value: 'David rejects ' },
          { type: 'math', value: 'H_0', display: false },
        ],
      },
      { type: 'text', value: ' here.' },
    ]);

    const t4 = parseRichMathTokens('Exceeds $50 on average.');
    expect(t4).toEqual([{ type: 'text', value: 'Exceeds $50 on average.' }]);
  });
});
