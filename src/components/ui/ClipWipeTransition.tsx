import React from 'react';
import { Shield } from 'lucide-react';

export type WipeStage = 'idle' | 'covering' | 'revealing';

interface ClipWipeTransitionProps {
  stage: WipeStage;
  targetName?: string;
}

export const ClipWipeTransition: React.FC<ClipWipeTransitionProps> = ({
  stage,
  targetName,
}) => {
  if (stage === 'idle') return null;

  const isCovering = stage === 'covering';

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Leading Crimson Laser Shutter Blade */}
      <div
        className={`absolute inset-0 bg-[#D21319] shadow-[0_0_50px_rgba(210,19,25,0.7)] ${
          isCovering ? 'clip-wipe-lead-in' : 'clip-wipe-lead-out'
        }`}
      />

      {/* 2. Main Matte Titanium Tactical Curtain */}
      <div
        className={`absolute inset-0 bg-[#111622] text-white flex items-center justify-center border-r-2 border-[#D21319]/80 ${
          isCovering ? 'clip-wipe-main-in' : 'clip-wipe-main-out'
        }`}
      >
        {/* Subtle Background Sacred Geometry Grid */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Tactical Transition Emblem & Chamber Status */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center shadow-lg backdrop-blur-md">
            <Shield className="w-6 h-6 text-[#D21319] animate-pulse" strokeWidth={2.2} />
          </div>
          <div className="text-center">
            <span className="font-beyno tracking-[0.25em] text-sm text-white font-bold block">
              CRYPTIC
            </span>
            <span className="font-mono text-[10px] tracking-widest text-[#94A3B8] uppercase block mt-1">
              {targetName ? `ENGAGING // ${targetName}` : 'INITIALIZING SECURE ENCLAVE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
