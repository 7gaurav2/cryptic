import React, { useRef, useState, useCallback } from 'react';

interface TiltCartridgeProps {
  children: React.ReactNode;
  serialNumber?: string;
  className?: string;
  onClick?: () => void;
  accentColor?: string;
}

export const TiltCartridge: React.FC<TiltCartridgeProps> = ({
  children,
  serialNumber,
  className = '',
  onClick,
  accentColor = '#C85A32',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [sheenPosition, setSheenPosition] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Rotate within -7deg to +7deg
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTransformStyle(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`);
    setSheenPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransformStyle('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setSheenPosition(prev => ({ ...prev, opacity: 0 }));
    setIsPressed(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <div
      className="perspective-container group cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          transform: `${transformStyle} ${isPressed ? 'translateY(2px)' : ''}`,
          transition: 'transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 140ms ease',
          willChange: 'transform',
        }}
        className={`relative preserve-3d bg-[#F4F1EA] border border-[#D0C9BD] rounded-lg p-5 shadow-tactile transition-shadow duration-200 group-hover:shadow-tactile-lg ${className}`}
      >
        {/* Dynamic Specular Sheen Layer */}
        <div
          className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden transition-opacity duration-300"
          style={{
            opacity: sheenPosition.opacity,
            background: `radial-gradient(circle 280px at ${sheenPosition.x}% ${sheenPosition.y}%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.05) 60%, transparent 100%)`,
          }}
        />

        {/* 4 Exposed Hardware Screw-Head Micro-Graphics (+) */}
        <div className="absolute top-2 left-2 text-[#8C867E] text-[10px] font-mono leading-none select-none opacity-60">+</div>
        <div className="absolute top-2 right-2 text-[#8C867E] text-[10px] font-mono leading-none select-none opacity-60">+</div>
        <div className="absolute bottom-2 left-2 text-[#8C867E] text-[10px] font-mono leading-none select-none opacity-60">+</div>
        <div className="absolute bottom-2 right-2 text-[#8C867E] text-[10px] font-mono leading-none select-none opacity-60">+</div>

        {/* Stamped Serial Number & Top Indicator */}
        {serialNumber && (
          <div className="flex items-center justify-between border-b border-[#D0C9BD]/70 pb-3 mb-4">
            <span className="font-mono text-[11px] tracking-wider text-[#5C5852] font-medium uppercase">
              {serialNumber}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <span className="font-mono text-[10px] text-[#8C867E] tracking-tight uppercase">LOCAL</span>
            </div>
          </div>
        )}

        {/* Inner Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};
