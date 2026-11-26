import React from 'react';
import type { OpenEconPolicyId } from '../../math/economics';

export const TwinMarketSvg: React.FC<{ policyId: OpenEconPolicyId }> = ({ policyId }) => {
  // Visual schematic matching Mankiw Ch. 32 3-panel Open-Economy model
  const isDeficit = policyId === 'budget-deficit';
  const isQuota = policyId === 'import-quota';
  const isFlight = policyId === 'capital-flight';

  return (
    <div className="grid md:grid-cols-3 gap-3">
      {/* Panel A: Loanable Funds */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="text-[11px] font-bold text-center mb-1">1. Market for Loanable Funds</div>
        <svg viewBox="0 0 210 185" className="w-full max-w-[210px] mx-auto">
          <line x1="30" y1="15" x2="30" y2="160" className="stroke-slate-400" strokeWidth="1.5" />
          <line x1="30" y1="160" x2="195" y2="160" className="stroke-slate-400" strokeWidth="1.5" />
          <text x="12" y="25" className="text-[10px] font-bold fill-slate-500">r</text>
          <text x="180" y="174" className="text-[10px] font-bold fill-slate-500">LF</text>

          {/* Supply S */}
          <line
            x1="55"
            y1="145"
            x2="165"
            y2="35"
            className={isDeficit ? 'stroke-emerald-300' : 'stroke-emerald-600'}
            strokeWidth={isDeficit ? 1.5 : 2.2}
            strokeDasharray={isDeficit ? '3 3' : undefined}
          />
          <text x="160" y="32" className="text-[9px] font-bold fill-emerald-600">S₁</text>
          {isDeficit && (
            <>
              <line x1="40" y1="130" x2="140" y2="30" className="stroke-emerald-600" strokeWidth="2.3" />
              <text x="132" y="26" className="text-[9px] font-bold fill-emerald-600">S₂</text>
            </>
          )}

          {/* Demand D = I + NCO */}
          <line
            x1="55"
            y1="35"
            x2="165"
            y2="145"
            className={isFlight ? 'stroke-indigo-300' : 'stroke-indigo-600'}
            strokeWidth={isFlight ? 1.5 : 2.2}
            strokeDasharray={isFlight ? '3 3' : undefined}
          />
          <text x="160" y="152" className="text-[9px] font-bold fill-indigo-600">D₁</text>
          {isFlight && (
            <>
              <line x1="78" y1="35" x2="188" y2="145" className="stroke-indigo-600" strokeWidth="2.3" />
              <text x="178" y="136" className="text-[9px] font-bold fill-indigo-600">D₂</text>
            </>
          )}

          <circle cx="110" cy="90" r="3.5" className="fill-slate-500" />
          {isDeficit && <circle cx="97" cy="77" r="4" className="fill-rose-600" />}
          {isFlight && <circle cx="121" cy="79" r="4" className="fill-rose-600" />}
        </svg>
      </div>

      {/* Panel B: NCO */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="text-[11px] font-bold text-center mb-1">2. Net Capital Outflow (NCO)</div>
        <svg viewBox="0 0 210 185" className="w-full max-w-[210px] mx-auto">
          <line x1="30" y1="15" x2="30" y2="160" className="stroke-slate-400" strokeWidth="1.5" />
          <line x1="30" y1="160" x2="195" y2="160" className="stroke-slate-400" strokeWidth="1.5" />
          <text x="12" y="25" className="text-[10px] font-bold fill-slate-500">r</text>
          <text x="165" y="174" className="text-[10px] font-bold fill-slate-500">NCO</text>

          <line
            x1="60"
            y1="35"
            x2="160"
            y2="145"
            className={isFlight ? 'stroke-amber-300' : 'stroke-amber-600'}
            strokeWidth={isFlight ? 1.5 : 2.2}
            strokeDasharray={isFlight ? '3 3' : undefined}
          />
          <text x="158" y="140" className="text-[9px] font-bold fill-amber-600">NCO₁</text>
          {isFlight && (
            <>
              <line x1="85" y1="35" x2="185" y2="145" className="stroke-amber-600" strokeWidth="2.3" />
              <text x="175" y="128" className="text-[9px] font-bold fill-amber-600">NCO₂</text>
            </>
          )}
          <circle cx="110" cy="90" r="3.5" className="fill-slate-500" />
          {isDeficit && <circle cx="96" cy="75" r="4" className="fill-rose-600" />}
          {isFlight && <circle cx="128" cy="80" r="4" className="fill-rose-600" />}
        </svg>
      </div>

      {/* Panel C: FX Market */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <div className="text-[11px] font-bold text-center mb-1">3. Foreign-Currency Exchange</div>
        <svg viewBox="0 0 210 185" className="w-full max-w-[210px] mx-auto">
          <line x1="30" y1="15" x2="30" y2="160" className="stroke-slate-400" strokeWidth="1.5" />
          <line x1="30" y1="160" x2="195" y2="160" className="stroke-slate-400" strokeWidth="1.5" />
          <text x="12" y="25" className="text-[10px] font-bold fill-slate-500">e</text>
          <text x="165" y="174" className="text-[10px] font-bold fill-slate-500">FX ($)</text>

          {/* Vertical Supply S = NCO */}
          <line
            x1="110"
            y1="25"
            x2="110"
            y2="160"
            className={isDeficit || isFlight ? 'stroke-amber-300' : 'stroke-amber-600'}
            strokeWidth={isDeficit || isFlight ? 1.5 : 2.2}
            strokeDasharray={isDeficit || isFlight ? '3 3' : undefined}
          />
          <text x="113" y="27" className="text-[9px] font-bold fill-amber-600">S₁</text>
          {isDeficit && (
            <>
              <line x1="84" y1="25" x2="84" y2="160" className="stroke-amber-600" strokeWidth="2.3" />
              <text x="68" y="27" className="text-[9px] font-bold fill-amber-600">S₂</text>
            </>
          )}
          {isFlight && (
            <>
              <line x1="138" y1="25" x2="138" y2="160" className="stroke-amber-600" strokeWidth="2.3" />
              <text x="142" y="27" className="text-[9px] font-bold fill-amber-600">S₂</text>
            </>
          )}

          {/* Demand D = NX */}
          <line
            x1="50"
            y1="38"
            x2="165"
            y2="145"
            className={isQuota ? 'stroke-indigo-300' : 'stroke-indigo-600'}
            strokeWidth={isQuota ? 1.5 : 2.2}
            strokeDasharray={isQuota ? '3 3' : undefined}
          />
          <text x="162" y="152" className="text-[9px] font-bold fill-indigo-600">D₁</text>
          {isQuota && (
            <>
              <line x1="76" y1="38" x2="188" y2="145" className="stroke-indigo-600" strokeWidth="2.3" />
              <text x="178" y="132" className="text-[9px] font-bold fill-indigo-600">D₂</text>
            </>
          )}

          <circle cx="110" cy="94" r="3.5" className="fill-slate-500" />
          {isDeficit && <circle cx="84" cy="70" r="4" className="fill-rose-600" />}
          {isQuota && <circle cx="110" cy="70" r="4" className="fill-rose-600" />}
          {isFlight && <circle cx="138" cy="120" r="4" className="fill-rose-600" />}
        </svg>
      </div>
    </div>
  );
};
