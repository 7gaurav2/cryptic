import React from 'react';

interface HardwareGridProps {
  children: React.ReactNode;
  className?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  serialNumber?: string;
}

export const HardwareGrid: React.FC<HardwareGridProps> = ({
  children,
  className = '',
  headerTitle,
  headerSubtitle,
  serialNumber,
}) => {
  return (
    <div
      className={`relative border border-[#DDD8CE] dark:border-white/10 bg-[#FAF8F5]/95 dark:bg-[#151B26]/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_12px_40px_-8px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] ${className}`}
      style={{
        boxShadow: '0 12px 40px -8px rgba(28, 27, 25, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* 4 Optical Corner Calibration Reticles */}
      <span className="absolute top-2.5 left-3 font-mono text-[11px] text-[#A8A29E] select-none pointer-events-none">+</span>
      <span className="absolute top-2.5 right-3 font-mono text-[11px] text-[#A8A29E] select-none pointer-events-none">+</span>
      <span className="absolute bottom-2.5 left-3 font-mono text-[11px] text-[#A8A29E] select-none pointer-events-none">+</span>
      <span className="absolute bottom-2.5 right-3 font-mono text-[11px] text-[#A8A29E] select-none pointer-events-none">+</span>

      {/* Chassis Header Bar */}
      {headerTitle && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDD8CE] dark:border-white/10 px-6 sm:px-8 py-4 bg-[#F3EFE7]/85 dark:bg-[#1A2230]/85">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-4 bg-[#D21319] rounded-full flex-shrink-0" />
            <div>
              {headerTitle && (
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm sm:text-base font-bold tracking-wider text-[#111622] dark:text-white uppercase font-mono leading-none">
                    {headerTitle}
                  </h2>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
                </div>
              )}
              {headerSubtitle && (
                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] font-sans mt-1">
                  {headerSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Telemetry Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[10px] text-[#6B7280] dark:text-[#94A3B8] bg-white/70 dark:bg-[#1E2533] px-2.5 py-1 rounded-lg border border-[#DDD8CE] dark:border-white/10 shadow-xs">
              <span className="w-2 h-2 rounded-2xs bg-[#D21319] shadow-[0_0_4px_rgba(210,19,25,0.4)]" />
              <span>WASM // ZERO REMOTE BYTES</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid Canvas Content */}
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );
};
