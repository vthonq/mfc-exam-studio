import React from 'react';
import { computeLinearMarket } from '../../math/economics';

interface SupplyDemandSvgProps {
  a: number;
  b: number;
  c: number;
  d: number;
  tax: number;
}

export const SupplyDemandSvg: React.FC<SupplyDemandSvgProps> = ({ a, b, c, d, tax }) => {
  const m = computeLinearMarket({ a, b, c, d, tax });
  const maxQ = Math.max(20, a * 1.05);
  const maxP = Math.max(10, (a / b) * 1.1);

  const toX = (q: number) => 42 + (Math.max(0, q) / maxQ) * 230;
  const toY = (p: number) => 210 - (Math.max(0, p) / maxP) * 180;

  const pDemand0 = a / b;
  const qDemandP0 = a;
  const pSupply0 = Math.max(0, -c / d);
  const qSupplyAtP0 = Math.max(0, c);
  const qSupplyMax = c + d * maxP;

  const eqX = toX(m.eqQty);
  const eqY = toY(m.eqPrice);
  const qTaxX = toX(m.qTax);
  const pbY = toY(m.pbTax);
  const psY = toY(m.psTax);

  return (
    <svg
      viewBox="0 0 300 245"
      className="w-full max-w-[330px] mx-auto select-none"
      aria-label="Supply and Demand Welfare Diagram"
    >
      {/* Axes */}
      <line x1="42" y1="20" x2="42" y2="210" className="stroke-slate-400" strokeWidth="1.8" />
      <line x1="42" y1="210" x2="280" y2="210" className="stroke-slate-400" strokeWidth="1.8" />
      <text x="16" y="28" className="text-[11px] font-bold fill-slate-500">P</text>
      <text x="270" y="228" className="text-[11px] font-bold fill-slate-500">Q</text>

      {tax <= 0 ? (
        <>
          {/* CS & PS shaded */}
          <polygon
            points={`42,${toY(pDemand0)} ${eqX},${eqY} 42,${eqY}`}
            className="fill-sky-400/25"
          />
          <polygon
            points={`${toX(qSupplyAtP0)},${toY(pSupply0)} ${eqX},${eqY} 42,${eqY}`}
            className="fill-emerald-400/25"
          />
        </>
      ) : (
        <>
          {/* Tax Revenue Box */}
          <rect
            x={42}
            y={pbY}
            width={Math.max(0, qTaxX - 42)}
            height={Math.max(0, psY - pbY)}
            className="fill-amber-400/35"
          />
          {/* DWL Triangle */}
          <polygon
            points={`${qTaxX},${pbY} ${eqX},${eqY} ${qTaxX},${psY}`}
            className="fill-rose-500/45"
          />
        </>
      )}

      {/* Demand line */}
      <line
        x1={toX(0)}
        y1={toY(pDemand0)}
        x2={toX(qDemandP0)}
        y2={toY(0)}
        className="stroke-indigo-600 dark:stroke-indigo-400"
        strokeWidth="2.4"
      />
      <text x={toX(qDemandP0) - 10} y="203" className="text-[10px] font-bold fill-indigo-600">D</text>

      {/* Supply line */}
      <line
        x1={toX(qSupplyAtP0)}
        y1={toY(pSupply0)}
        x2={toX(qSupplyMax)}
        y2={toY(maxP)}
        className="stroke-emerald-600 dark:stroke-emerald-400"
        strokeWidth="2.4"
      />
      <text x={Math.min(265, toX(qSupplyMax) - 8)} y="32" className="text-[10px] font-bold fill-emerald-600">S</text>

      {/* Equilibrium dot */}
      <circle cx={eqX} cy={eqY} r="4.5" className="fill-slate-800 dark:fill-white" />
      <text x={eqX + 6} y={eqY - 5} className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-200">
        E({m.eqQty}, {m.eqPrice})
      </text>

      {tax > 0 && (
        <>
          <line x1={qTaxX} y1={pbY} x2={qTaxX} y2={210} strokeDasharray="3 2" className="stroke-rose-500" />
          <text x={qTaxX - 10} y="224" className="text-[9px] font-mono fill-rose-600">Qₜ={m.qTax}</text>
        </>
      )}
    </svg>
  );
};
