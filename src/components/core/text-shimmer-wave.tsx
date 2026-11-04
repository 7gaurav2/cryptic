import React, { ElementType } from 'react';

export interface TextShimmerWaveProps {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  zDistance?: number;
  xDistance?: number;
  yDistance?: number;
  spread?: number;
  scaleDistance?: number;
  style?: React.CSSProperties;
}

export function TextShimmerWave({
  children,
  as: Component = 'span',
  className = '',
  duration = 1.2,
  spread = 1,
  style,
}: TextShimmerWaveProps) {
  if (typeof children !== 'string') {
    return (
      <Component className={className} style={style}>
        {children}
      </Component>
    );
  }

  const chars = children.split('');
  const total = chars.length;

  return (
    <Component
      className={`inline-flex items-center flex-wrap select-none ${className}`}
      style={style}
    >
      {chars.map((char, i) => {
        const delay = (i / Math.max(total, 1)) * duration * spread;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              animation: `text-shimmer-wave ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              willChange: 'transform, opacity, filter',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </Component>
  );
}

export default TextShimmerWave;
