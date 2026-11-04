import React, { useEffect, useRef, useState, useCallback } from 'react';

export type CelWipeStage = 'idle' | 'active';
export type CelWipeMode = 'full' | 'reveal';

interface CelWipeTransitionProps {
  stage: CelWipeStage;
  mode?: CelWipeMode;
  onPeakCover?: () => void;
  onComplete?: () => void;
  colorTheme?: 'original-yellow' | 'cryptic-crimson';
}

const TOTAL_FRAMES = 17;
const FRAME_WIDTH = 800;
const FRAME_HEIGHT = 600;
const COLS = 4;
const PEAK_FRAME = 6; // Frame index 6 is the 100% full cover moment
const FULL_DURATION_MS = 620; // ~27.4 fps hand-drawn cel animation timing
const REVEAL_DURATION_MS = 380; // Timing for reveal-only entrance

/**
 * 2D Hand-Drawn Cel Wipe Transition
 * Inspired by Chris Guyot's iconic Dribbble animation:
 * https://dribbble.com/shots/2888876-Cel-Wipe-Transition
 * 
 * Modes:
 * - 'full': Complete inflow wave (frames 0-6) -> peak route swap -> outflow dissolve (frames 6-16)
 * - 'reveal': Screen entry outflow dissolve (frames 6-16) with droplets tearing away
 */
export const CelWipeTransition: React.FC<CelWipeTransitionProps> = ({
  stage,
  mode = 'full',
  onPeakCover,
  onComplete,
  colorTheme = 'cryptic-crimson',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sheetImageRef = useRef<HTMLImageElement | null>(null);
  const [isSheetLoaded, setIsSheetLoaded] = useState(false);
  const peakFiredRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // 1. Preload the spritesheet on mount (respecting vite base path for GitHub Pages)
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
    const webpPath = `${basePath}/cel-wipe/cel_wipe_sheet.webp`;
    const pngPath = `${basePath}/cel-wipe/cel_wipe_sheet.png`;

    const img = new Image();
    img.src = webpPath;
    img.onload = () => {
      sheetImageRef.current = img;
      setIsSheetLoaded(true);
    };
    img.onerror = () => {
      // Fallback to PNG if WebP fails
      const pngImg = new Image();
      pngImg.src = pngPath;
      pngImg.onload = () => {
        sheetImageRef.current = pngImg;
        setIsSheetLoaded(true);
      };
      pngImg.onerror = () => {
        // In case of total failure, fallback gracefully
        setIsSheetLoaded(true);
      };
    };
  }, []);

  // 2. Drive the frame animation loop when stage === 'active'
  useEffect(() => {
    if (stage !== 'active') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // If active but sheet isn't loaded yet, wait for isSheetLoaded or fallback timeout
    if (!sheetImageRef.current) {
      const fallbackTimer = setTimeout(() => {
        if (!peakFiredRef.current) {
          peakFiredRef.current = true;
          onPeakCover?.();
        }
        onComplete?.();
      }, 350);
      return () => clearTimeout(fallbackTimer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sheet = sheetImageRef.current;
    peakFiredRef.current = mode === 'reveal';

    // Set canvas dimensions to viewport
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const startTime = performance.now();
    const duration = mode === 'reveal' ? REVEAL_DURATION_MS : FULL_DURATION_MS;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let currentFrame: number;
      if (mode === 'reveal') {
        // Frames from PEAK_FRAME (6) to TOTAL_FRAMES - 1 (16)
        currentFrame = Math.min(
          PEAK_FRAME + Math.floor(progress * (TOTAL_FRAMES - PEAK_FRAME)),
          TOTAL_FRAMES - 1
        );
      } else {
        // Full range 0 to 16
        currentFrame = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
      }

      // Trigger route swap at peak coverage frame
      if (mode === 'full' && currentFrame >= PEAK_FRAME && !peakFiredRef.current) {
        peakFiredRef.current = true;
        onPeakCover?.();
      }

      // Draw current cel frame
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const col = currentFrame % COLS;
      const row = Math.floor(currentFrame / COLS);
      const sx = col * FRAME_WIDTH;
      const sy = row * FRAME_HEIGHT;

      // Draw the organic liquid wave
      ctx.drawImage(sheet, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, 0, 0, width, height);

      // Tint to Cryptic Crimson if requested (slightly faded)
      if (colorTheme === 'cryptic-crimson') {
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = 'rgba(210, 19, 25, 0.85)';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        // Clear and notify completion
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stage, mode, isSheetLoaded, onPeakCover, onComplete, colorTheme]);

  if (stage === 'idle') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[99999] pointer-events-auto select-none w-full h-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
};
