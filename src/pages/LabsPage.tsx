import React from 'react';
import type { LabTab } from '../types';
import { LogicLab } from '../components/labs/LogicLab';
import { NumberTheoryLab } from '../components/labs/NumberTheoryLab';
import { RelationsLab } from '../components/labs/RelationsLab';
import { GraphsTreesLab } from '../components/labs/GraphsTreesLab';
import { BooleanLab } from '../components/labs/BooleanLab';
import { BiText } from '../components/BiText';

interface LabsPageProps {
  activeTab: LabTab;
  onSelectTab: (tab: LabTab) => void;
}

const LAB_TABS: Array<{ id: LabTab; label: string; badge: string }> = [
  { id: 'logic', label: 'Logic & Truth Tables', badge: 'Ch. 1' },
  { id: 'number-theory', label: 'Number Theory & Crypto', badge: 'Ch. 4' },
  { id: 'relations', label: 'Relations & Posets', badge: 'Ch. 9' },
  { id: 'graphs-trees', label: 'Graphs & Trees', badge: 'Ch. 10–11' },
  { id: 'boolean', label: 'Boolean & K-Maps', badge: 'Ch. 12' },
];

export const LabsPage: React.FC<LabsPageProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Interactive Practice Labs</h1>
        <BiText
          en="Step-by-step calculators and exam trainers covering every algorithmic problem type."
          vi="Các công cụ luyện tập từng bước cho toàn bộ dạng bài thuật toán và bảng tính."
          className="text-sm text-slate-500 dark:text-slate-400 mt-1"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {LAB_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {t.badge}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'logic' && <LogicLab />}
      {activeTab === 'number-theory' && <NumberTheoryLab />}
      {activeTab === 'relations' && <RelationsLab />}
      {activeTab === 'graphs-trees' && <GraphsTreesLab />}
      {activeTab === 'boolean' && <BooleanLab />}
    </div>
  );
};
