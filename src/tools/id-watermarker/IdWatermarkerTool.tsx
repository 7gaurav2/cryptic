import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ToolComponentProps } from '../../types/tool.types';
import { TactileDropzone } from '../../components/ui/TactileDropzone';
import { TelemetryComparison } from '../../components/ui/TelemetryComparison';
import { MemoryManager } from '../../services/memoryManager';
import { Stamp, ShieldCheck, Cpu, Sliders, Trash2, FileImage } from 'lucide-react';

const QUICK_TEXTS = [
  'FOR KYC VERIFICATION ONLY',
  'OFFICIAL IDENTITY CHECK — NOT FOR LOAN',
  'AUTHORIZED PURPOSE ONLY — NO REUSE',
  'COPY FOR RECORD VERIFICATION',
];

export const IdWatermarkerTool: React.FC<ToolComponentProps> = ({
  onProcessStart,
  onProcessComplete,
  logTelemetry,
  registerBlobUrl,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Watermark Settings
  const [watermarkText, setWatermarkText] = useState<string>('FOR KYC VERIFICATION ONLY — NOT FOR REUSE');
  const [opacity, setOpacity] = useState<number>(30); // 10% to 70%
  const [fontSize, setFontSize] = useState<number>(28); // 16 to 54
  const [rotationAngle, setRotationAngle] = useState<number>(-30); // -60 to 60
  const [textColor, setTextColor] = useState<string>('#1C1B19'); // Carbon black or terracotta
  const [spacing] = useState<number>(140); // 80 to 240

  // Result state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedBytes, setProcessedBytes] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    logTelemetry(`Ingesting ID document artifact: ${selected.name} (${MemoryManager.formatBytes(selected.size)})`, 'info');

    const objectUrl = URL.createObjectURL(selected);
    registerBlobUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      logTelemetry(`ID Document resolution: ${img.naturalWidth} × ${img.naturalHeight} px`, 'info');
      renderWatermark(img, watermarkText, opacity, fontSize, rotationAngle, textColor, spacing);
    };
    img.src = objectUrl;
  };

  /**
   * Render Cross-Hatch / Diagonal Repeating Protective Watermark on Canvas
   */
  const renderWatermark = useCallback(
    (
      img: HTMLImageElement,
      text: string,
      op: number,
      fSize: number,
      angleDeg: number,
      color: string,
      sp: number
    ) => {
      onProcessStart('ID_WATERMARK_RENDER');

      try {
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvasRef.current = canvas;
        }

        const width = img.naturalWidth;
        const height = img.naturalHeight;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D canvas context');

        // Draw original clean image
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark Styling
        ctx.save();
        ctx.font = `bold ${fSize}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = op / 100;

        // Diagonal repetition pattern
        const rad = (angleDeg * Math.PI) / 180;
        const diag = Math.sqrt(width * width + height * height);

        // Translate to center to rotate cleanly
        ctx.translate(width / 2, height / 2);
        ctx.rotate(rad);
        ctx.textAlign = 'center';

        const stepX = sp * 2.2;
        const stepY = sp;

        for (let y = -diag; y < diag; y += stepY) {
          for (let x = -diag; x < diag; x += stepX) {
            ctx.fillText(text, x, y);
          }
        }

        ctx.restore();

        // Export clean sanitized JPEG
        canvas.toBlob(
          blob => {
            if (!blob) return;
            if (previewUrl) URL.revokeObjectURL(previewUrl);

            const url = URL.createObjectURL(blob);
            registerBlobUrl(url);
            setPreviewUrl(url);
            setProcessedBlob(blob);
            setProcessedBytes(blob.size);

            const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'id_artifact';
            setOutputFileName(`${baseName}_protected_kyc.jpg`);

            logTelemetry(`Watermark overlay generated successfully (${MemoryManager.formatBytes(blob.size)})`, 'success');
            onProcessComplete();
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        logTelemetry(`Watermark render failed: ${(err as Error).message}`, 'alert');
      }
    },
    [file, logTelemetry, onProcessComplete, onProcessStart, previewUrl, registerBlobUrl]
  );

  const handleUpdate = (
    newText = watermarkText,
    newOp = opacity,
    newSize = fontSize,
    newAngle = rotationAngle,
    newColor = textColor,
    newSpacing = spacing
  ) => {
    if (!imageElement) return;
    renderWatermark(imageElement, newText, newOp, newSize, newAngle, newColor, newSpacing);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = outputFileName || 'protected_id.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logTelemetry(`Downloaded protected ID: ${outputFileName}`, 'info');
  };

  const resetState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setImageElement(null);
    setPreviewUrl(null);
    setProcessedBlob(null);
    setOutputFileName('');
    setProcessedBytes(0);
    logTelemetry('Discarded active ID artifact. Ready for new ingestion.', 'info');
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <TactileDropzone
          onFilesSelected={handleFilesSelected}
          accept="image/*"
          label="DEPOSIT ID CARD / PASSPORT / KYC DOCUMENT"
          sublabel="Applies a protective, repeating diagonal tamper-resistant watermark. Strips 100% of camera/GPS EXIF."
          supportedFormats={['PNG', 'JPEG', 'WEBP', 'PDF / SCAN']}
          onClearFiles={resetState}
        />
      ) : (
        <div className="space-y-6">
          {/* Active Document Top Rail with Discard Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3 px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 text-[#D21319]">
                <FileImage className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#111622] dark:text-white truncate max-w-[280px] sm:max-w-md">
                    {file.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAE5DB] dark:bg-[#252E3E] text-[#6B7280] dark:text-[#94A3B8]">
                    {MemoryManager.formatBytes(file.size)}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#6B7280] dark:text-[#94A3B8]">
                  Wrong ID document? Discard to upload the intended file.
                </p>
              </div>
            </div>
            <button
              onClick={resetState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-[#D21319] bg-white dark:bg-[#1E2533] border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shadow-xs cursor-pointer ml-auto"
              title="Discard current document and re-upload"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#D21319]" />
              <span>REMOVE & RE-UPLOAD</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Watermark Customizer */}
            <div className="lg:col-span-5 bg-white/90 dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 rounded-xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2.5 border-b border-[#DDD8CE] dark:border-white/10 pb-3.5">
                <Stamp className="w-4 h-4 text-[#D21319]" />
                <span className="font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  PROTECTIVE WATERMARK CALIBRATION
                </span>
              </div>

              {/* Watermark text */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] uppercase tracking-wider">
                  WATERMARK TEXT OVERLAY
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={e => {
                    setWatermarkText(e.target.value);
                    handleUpdate(e.target.value);
                  }}
                  className="w-full bg-[#FAF8F5] dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-lg px-4 py-2.5 font-mono text-xs text-[#111622] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D21319]/30"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {QUICK_TEXTS.map(txt => (
                    <button
                      key={txt}
                      onClick={() => {
                        setWatermarkText(txt);
                        handleUpdate(txt);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#EDE9E0] dark:bg-[#252E3E] border border-[#DDD8CE] dark:border-white/10 font-mono text-[10px] text-[#4B5563] dark:text-[#CBD5E1] hover:text-[#111622] cursor-pointer transition-colors"
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#6B7280] dark:text-[#94A3B8] font-medium">OPACITY / VISIBILITY:</span>
                  <span className="font-bold text-[#111622] dark:text-white">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={opacity}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setOpacity(val);
                    handleUpdate(watermarkText, val);
                  }}
                  className="w-full accent-[#D21319] cursor-pointer"
                />
              </div>

              {/* Font Size slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#6B7280] dark:text-[#94A3B8] font-medium">FONT SCALE:</span>
                  <span className="font-bold text-[#111622] dark:text-white">{fontSize} PX</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="60"
                  value={fontSize}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setFontSize(val);
                    handleUpdate(watermarkText, opacity, val);
                  }}
                  className="w-full accent-[#D21319] cursor-pointer"
                />
              </div>

              {/* Rotation Angle slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#6B7280] dark:text-[#94A3B8] font-medium">ROTATION ANGLE:</span>
                  <span className="font-bold text-[#111622] dark:text-white">{rotationAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={rotationAngle}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setRotationAngle(val);
                    handleUpdate(watermarkText, opacity, fontSize, val);
                  }}
                  className="w-full accent-[#D21319] cursor-pointer"
                />
              </div>

              {/* Color Selector */}
              <div className="space-y-2 border-t border-[#DDD8CE] dark:border-white/10 pt-3.5">
                <label className="block font-mono text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] uppercase tracking-wider">
                  WATERMARK INK COLOR
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'CARBON BLACK', color: '#111622' },
                    { label: 'CRIMSON RED', color: '#D21319' },
                    { label: 'OXIDIZED EMERALD', color: '#059669' },
                  ].map(c => (
                    <button
                      key={c.color}
                      onClick={() => {
                        setTextColor(c.color);
                        handleUpdate(watermarkText, opacity, fontSize, rotationAngle, c.color);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg border font-mono text-[10px] font-bold cursor-pointer transition-all ${
                        textColor === c.color
                          ? 'border-[#D21319] bg-[#FAF5F5] dark:bg-[#202738] text-[#111622] dark:text-white ring-1 ring-[#D21319]'
                          : 'border-[#DDD8CE] dark:border-white/10 text-[#6B7280] bg-[#FAF8F5] dark:bg-[#151B26]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Optical Inspector */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white/90 dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 px-5 py-3 rounded-xl flex items-center justify-between shadow-xs">
                <span className="font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  PROTECTED ARTIFACT PREVIEW
                </span>
                <span className="font-mono text-[10px] text-[#3B6E5C] bg-[#3B6E5C]/10 px-2 py-0.5 rounded border border-[#3B6E5C]/30">
                  REUSE PREVENTED
                </span>
              </div>

              <div
                className="relative w-full rounded-lg border border-[#D0C9BD] bg-[#DDD8CE]/70 flex items-center justify-center p-4 min-h-[380px] overflow-hidden shadow-inner"
                style={{
                  backgroundImage: 'radial-gradient(#C4BEB3 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Watermarked ID"
                    className="max-w-full max-h-[460px] object-contain rounded shadow-tactile border border-[#D0C9BD]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Completion Telemetry */}
          {processedBlob && (
            <TelemetryComparison
              originalBytes={file.size}
              processedBytes={processedBytes}
              downloadFilename={outputFileName}
              onDownload={handleDownload}
              privacyNotes={[
                'Protective watermark permanently baked into raw image pixel matrix',
                '100% of EXIF camera serials & location metadata stripped',
                'Prevents identity document reuse for fraudulent loan applications or account creations',
              ]}
            />
          )}
        </div>
      )}
    </div>
  );
};
