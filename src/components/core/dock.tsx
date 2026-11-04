import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface DockContextType {
  mouseXRef: React.MutableRefObject<number | null>;
  baseItemSize: number;
  magnification: number;
  distance: number;
}

const DockContext = createContext<DockContextType | null>(null);

export interface DockProps {
  children: React.ReactNode;
  className?: string;
  baseItemSize?: number;
  magnification?: number;
  distance?: number;
}

export const Dock: React.FC<DockProps> = ({
  children,
  className = '',
  baseItemSize = 40,
  magnification = 80,
  distance = 140,
}) => {
  const mouseXRef = useRef<number | null>(null);

  return (
    <DockContext.Provider value={{ mouseXRef, baseItemSize, magnification, distance }}>
      <div
        onMouseMove={(e) => {
          mouseXRef.current = e.clientX;
        }}
        onMouseLeave={() => {
          mouseXRef.current = null;
        }}
        className={`mx-auto flex h-16 items-end gap-3 rounded-2xl backdrop-blur-2xl px-3 pb-3 transition-all ${className}`}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
};

export interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const DockItem: React.FC<DockItemProps> = ({
  children,
  className = '',
  onClick,
}) => {
  const context = useContext(DockContext);
  const baseItemSize = context?.baseItemSize ?? 40;
  const magnification = context?.magnification ?? 80;
  const distance = context?.distance ?? 140;
  const mouseXRef = context?.mouseXRef;

  const itemRef = useRef<HTMLDivElement>(null);
  const currentWidthRef = useRef<number>(baseItemSize);
  const velocityRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // High-performance 60fps spring simulation loop matching Framer Motion's useSpring
  useEffect(() => {
    let animId: number;

    const tick = () => {
      let target = baseItemSize;

      if (mouseXRef && mouseXRef.current !== null && itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        const itemCenterX = rect.left + rect.width / 2;
        const dist = Math.abs(mouseXRef.current - itemCenterX);

        if (dist < distance) {
          // Smooth cosine bell-curve
          const factor = (1 + Math.cos((Math.PI * dist) / distance)) / 2;
          target = baseItemSize + (magnification - baseItemSize) * factor;
        }
      }

      // Spring physics (stiffness: 190, damping: 15)
      const diff = target - currentWidthRef.current;
      if (Math.abs(diff) > 0.05 || Math.abs(velocityRef.current) > 0.05) {
        const force = 190 * diff - 15 * velocityRef.current;
        velocityRef.current += force * 0.016;
        currentWidthRef.current += velocityRef.current * 0.016;

        if (itemRef.current) {
          const size = Math.max(baseItemSize, Math.min(magnification, currentWidthRef.current));
          itemRef.current.style.width = `${size}px`;
          itemRef.current.style.height = `${size}px`;
        }
      } else if (target === baseItemSize && Math.abs(currentWidthRef.current - baseItemSize) > 0) {
        currentWidthRef.current = baseItemSize;
        velocityRef.current = 0;
        if (itemRef.current) {
          itemRef.current.style.width = `${baseItemSize}px`;
          itemRef.current.style.height = `${baseItemSize}px`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [baseItemSize, magnification, distance, mouseXRef]);

  return (
    <div
      ref={itemRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: `${baseItemSize}px`,
        height: `${baseItemSize}px`,
      }}
      className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-full select-none will-change-[width,height] ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DockLabel) {
          return React.cloneElement(child as React.ReactElement<{ isHovered?: boolean }>, { isHovered });
        }
        return child;
      })}
    </div>
  );
};

export interface DockLabelProps {
  children: React.ReactNode;
  className?: string;
  isHovered?: boolean;
}

export const DockLabel: React.FC<DockLabelProps> = ({
  children,
  className = '',
  isHovered = false,
}) => {
  return (
    <div
      className={`absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-normal text-white bg-neutral-900/90 backdrop-blur-xl border border-white/15 shadow-xl transition-all duration-150 ${
        isHovered
          ? 'opacity-100 -translate-y-1 scale-100'
          : 'opacity-0 translate-y-1 scale-95'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export interface DockIconProps {
  children: React.ReactNode;
  className?: string;
}

export const DockIcon: React.FC<DockIconProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full h-full flex items-center justify-center p-2.5 text-white/90 transition-colors ${className}`}>
      {children}
    </div>
  );
};

export interface DockSeparatorProps {
  className?: string;
}

export const DockSeparator: React.FC<DockSeparatorProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`h-7 w-[1px] bg-white/20 dark:bg-white/10 mx-0.5 mb-2.5 self-end rounded-full transition-opacity ${className}`}
    />
  );
};
