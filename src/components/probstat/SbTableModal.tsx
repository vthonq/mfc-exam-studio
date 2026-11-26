import React from 'react';
import { Table2, X } from 'lucide-react';
import { SbTableExplorer, type SbAppendixId } from './SbTableExplorer';

interface SbTableModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: SbAppendixId;
}

export const SbTableModal: React.FC<SbTableModalProps> = ({
  open,
  onClose,
  initialTab = 'c2',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 md:p-6">
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Table2 className="w-4 h-4 text-sky-600" />
            Quick SB Statistical Tables Reference (Appendices C-1 – F)
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close SB Tables"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <SbTableExplorer initialTab={initialTab} compact />
        </div>
      </div>
    </div>
  );
};
