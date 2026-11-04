import React from 'react';

interface TopTelemetryBarProps {
  activeToolName?: string | null;
  onReturnToHub?: () => void;
}

export const TopTelemetryBar: React.FC<TopTelemetryBarProps> = ({
  activeToolName,
  onReturnToHub,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FBF9F5]/90 dark:bg-[#121620]/90 backdrop-blur-md border-b border-[#DDD8CE] dark:border-white/10 px-4 sm:px-6 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Back to Hub Button & Brand / Breadcrumb */}
        <div className="flex items-center gap-3">
          {activeToolName && onReturnToHub && (
            <>
              <button
                onClick={onReturnToHub}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1A2230] hover:bg-[#EDE8DE] dark:hover:bg-[#252E3E] border border-[#DDD8CE] dark:border-white/15 text-xs font-mono font-bold text-[#111622] dark:text-white transition-all cursor-pointer group shadow-xs hover:border-[#D21319]/50 active:translate-y-[1px]"
                title="Return to Cryptic Master Hub"
              >
                <svg className="w-3.5 h-3.5 text-[#D21319] group-hover:-translate-x-1 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13L5 8l5-5" />
                </svg>
                <span className="tracking-wider">BACK TO HUB</span>
              </button>
              <div className="h-5 w-px bg-[#DDD8CE] dark:bg-white/15" />
            </>
          )}

          <button
            onClick={onReturnToHub}
            className="flex items-center gap-2.5 group cursor-pointer text-left bg-transparent border-0 p-0 transition-opacity hover:opacity-85"
            title="Return to Cryptic Master Hub"
          >
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1A212E] border border-[#DDD8CE] dark:border-white/15 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] group-hover:border-[#D21319] transition-colors">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D21319] rotate-45 shadow-[0_0_6px_rgba(210,19,25,0.4)]" />
            </div>
            <span className="text-base font-bold tracking-[0.24em] text-[#111622] dark:text-white font-beyno leading-none">
              CRYPTIC
            </span>
          </button>

          {activeToolName && (
            <div className="flex items-center gap-2 pl-3 border-l border-[#DDD8CE] dark:border-white/15">
              <span className="text-[#9CA3AF] font-mono text-xs select-none">/</span>
              <span className="font-mono text-xs font-bold tracking-wider text-[#111622] dark:text-white uppercase bg-white/90 dark:bg-[#1E2533] px-3 py-1 rounded-lg border border-[#DDD8CE] dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                {activeToolName}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
