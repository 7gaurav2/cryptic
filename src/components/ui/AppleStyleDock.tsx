import React, { useEffect } from 'react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/core/dock';

export interface DockItemData {
  title: string;
  icon: React.ReactNode;
  toolId?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface AppleStyleDockProps {
  items?: DockItemData[];
  activeToolId?: string | null;
  onSelectTool?: (toolId: string) => void;
  onReturnHome?: () => void;
  className?: string;
}

export function AppleStyleDock({
  items,
  activeToolId,
  onSelectTool,
  onReturnHome,
  className = '',
}: AppleStyleDockProps) {
  // Ensure clean tactile theme without dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.removeItem('cryptic_theme');
    }
  }, []);

  // Primary tools with custom bespoke vector icons (no generic Lucide icons)
  const toolItems: DockItemData[] = [
    {
      title: 'Home',
      icon: (
        <svg className="h-full w-full p-0.5 text-white/95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      ),
      isActive: !activeToolId,
      onClick: () => {
        if (onReturnHome) {
          onReturnHome();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      title: 'Shrink PDF',
      icon: (
        <svg className="h-full w-full p-0.5 text-white/95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="15" y2="17" />
        </svg>
      ),
      toolId: 'pdf-studio',
      isActive: activeToolId === 'pdf-studio',
      onClick: () => onSelectTool?.('pdf-studio'),
    },
    {
      title: 'Compress Image',
      icon: (
        <svg className="h-full w-full p-0.5 text-white/95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      toolId: 'image-studio',
      isActive: activeToolId === 'image-studio',
      onClick: () => onSelectTool?.('image-studio'),
    },
    {
      title: 'Lock File',
      icon: (
        <svg className="h-full w-full p-0.5 text-white/95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      toolId: 'crypto-vault',
      isActive: activeToolId === 'crypto-vault',
      onClick: () => onSelectTool?.('crypto-vault'),
    },
    {
      title: 'Watermark ID',
      icon: (
        <svg className="h-full w-full p-0.5 text-white/95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <line x1="15" y1="8" x2="17" y2="8" />
          <line x1="15" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </svg>
      ),
      toolId: 'id-watermarker',
      isActive: activeToolId === 'id-watermarker',
      onClick: () => onSelectTool?.('id-watermarker'),
    },
  ];

  return (
    <div className={`fixed bottom-4 left-1/2 max-w-full -translate-x-1/2 z-50 pointer-events-auto ${className}`}>
      {/* 1. Ambient Crimson Glass Floor Reflection (Grounds dock in 3D perspective) */}
      <div className="absolute -inset-x-8 -bottom-3 h-10 bg-[#D21319]/25 blur-2xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute left-1/4 right-1/4 -bottom-1 h-5 bg-[#EF4444]/35 blur-lg -z-10 rounded-full pointer-events-none" />
      <div className="absolute -inset-x-4 -bottom-1 h-6 bg-black/35 blur-xl -z-10 rounded-full pointer-events-none" />

      {/* 2. Crimson Glassmorphic Dock Bar */}
      <Dock className="items-end pb-3 bg-gradient-to-b from-[#2B0E12]/85 via-[#1D0609]/90 to-[#120305]/95 backdrop-blur-2xl border border-[#EF4444]/35 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_8px_24px_rgba(210,19,25,0.25),inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_0_24px_rgba(239,68,68,0.12)]">
        {/* Render Tools */}
        {(items || toolItems).map((item, idx) => (
          <DockItem
            key={idx}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else if (item.toolId && onSelectTool) {
                onSelectTool(item.toolId);
              }
            }}
            className={`group aspect-square rounded-full backdrop-blur-xl active:scale-95 transition-all cursor-pointer ${
              item.isActive
                ? 'bg-gradient-to-b from-[#EF4444]/40 to-[#991B1B]/55 border border-[#EF4444]/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.45),0_0_14px_rgba(239,68,68,0.4)]'
                : 'bg-gradient-to-b from-white/12 to-[#D21319]/20 hover:from-white/20 hover:to-[#D21319]/40 border border-white/20 hover:border-[#EF4444]/55 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.2)]'
            }`}
          >
            <DockLabel>{item.title}</DockLabel>
            <DockIcon>{item.icon}</DockIcon>

            {/* Glowing Ruby Active Indicator Dot */}
            {item.isActive && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444,0_0_12px_rgba(239,68,68,0.9)] pointer-events-none" />
            )}
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}

export default AppleStyleDock;
