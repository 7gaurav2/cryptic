import React from 'react';
import { Loader2 } from 'lucide-react';
import { TextShimmerWave } from '@/components/core/text-shimmer-wave';

interface MechanicalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'terracotta' | 'chassis' | 'sage' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export const MechanicalButton: React.FC<MechanicalButtonProps> = ({
  children,
  variant = 'terracotta',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  className = '',
  disabled,
  ...rest
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-mono font-bold tracking-wider uppercase transition-all duration-150 select-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D21319]/40 active:translate-y-[1px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';

  const sizeStyles = {
    sm: 'text-[11px] px-3.5 py-1.5 gap-1.5',
    md: 'text-xs px-5 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    terracotta:
      'bg-[#D21319] text-white border border-[#B70F14] hover:bg-[#B70F14] shadow-[0_2px_8px_rgba(210,19,25,0.28)] active:shadow-none',
    chassis:
      'bg-[#111622] text-white border border-[#1F2737] hover:bg-[#1A2234] shadow-[0_2px_6px_rgba(17,22,34,0.25)] active:shadow-none',
    sage:
      'bg-[#059669] text-white border border-[#047857] hover:bg-[#047857] shadow-[0_2px_6px_rgba(5,150,105,0.25)] active:shadow-none',
    ghost:
      'bg-white text-[#111622] border border-[#D5D0C3] hover:bg-[#F8F6F1] hover:border-[#BDB5A5] shadow-xs active:shadow-none',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current flex-shrink-0" strokeWidth={2} />
          <TextShimmerWave duration={1.2}>
            {loadingText || 'EXECUTING...'}
          </TextShimmerWave>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
