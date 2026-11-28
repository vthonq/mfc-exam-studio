import React, { useEffect } from 'react';
import { Download, Film, X } from 'lucide-react';

interface PromoVideoModalProps {
  open: boolean;
  onClose: () => void;
  bilingual?: boolean;
}

export const PromoVideoModal: React.FC<PromoVideoModalProps> = ({
  open,
  onClose,
  bilingual = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-[3px] flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="animate-fade-in studio-card rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Exam Studio Hub Official Trailer and Guide"
      >
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                Exam Studio Hub — Official Studio 5.0 Trailer &amp; Video Guide
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {bilingual
                  ? 'Neon 4-Model Trailer · Hướng dẫn 3 bước · Tổng hợp tính năng & lợi ích (1080p)'
                  : 'Neon 4-Model Trailer · 3-Step Usage Guide · Full Features & Benefits (1080p)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="./promo-trailer.mp4"
              download="exam-studio-hub-trailer-1080p.mp4"
              className="px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download MP4</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 cursor-pointer"
              aria-label="Close Video Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-black p-2 sm:p-3">
          <video
            controls
            autoPlay
            playsInline
            preload="metadata"
            src="./promo-trailer.mp4"
            className="w-full aspect-video rounded-2xl bg-black outline-none"
          />
        </div>
      </div>
    </div>
  );
};
