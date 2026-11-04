import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ToolComponentProps } from '../../types/tool.types';
import { TactileDropzone } from '../../components/ui/TactileDropzone';
import { TelemetryComparison } from '../../components/ui/TelemetryComparison';
import { MemoryManager } from '../../services/memoryManager';
import { Check, Trash2, FileImage } from 'lucide-react';

type ImageFormat = 'image/webp' | 'image/jpeg' | 'image/png';

export const ImageStudioTool: React.FC<ToolComponentProps> = ({
  onProcessStart,
  onProcessComplete,
  logTelemetry,
  registerBlobUrl,
}) => {
  // Input file & loaded image
  const [file, setFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  // Compression Controls
  const [format, setFormat] = useState<ImageFormat>('image/webp');
  const [quality, setQuality] = useState<number>(80); // 5 to 100
  const [compressionMode, setCompressionMode] = useState<'target' | 'quality'>('target');
  const [targetKb, setTargetKb] = useState<number | string>(200);

  // Interactive View & Processing State
  const [previewMode, setPreviewMode] = useState<'processed' | 'original'>('processed');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Processed Output
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedBytes, setProcessedBytes] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [processedDimensions, setProcessedDimensions] = useState<{ width: number; height: number } | null>(null);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clean up ObjectURLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * Main Compression Function
   */
  const processImage = useCallback(
    async (
      img: HTMLImageElement,
      fmt: ImageFormat,
      q: number,
      mode: 'target' | 'quality' = compressionMode,
      targetVal: number | string = targetKb
    ) => {
      setIsProcessing(true);
      onProcessStart('IMAGE_COMPRESS');

      try {
        let canvas = offscreenCanvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          offscreenCanvasRef.current = canvas;
        }

        const width = img.naturalWidth;
        const height = img.naturalHeight;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not initialize 2D canvas context');

        // Draw source image onto canvas (cleanses EXIF metadata)
        ctx.drawImage(img, 0, 0, width, height);

        // CASE 1: TARGET FILE SIZE MODE (Strict KB budget with ~2 KB deduction buffer)
        if (mode === 'target') {
          const numericKb = Number(targetVal) || 0;
          if (numericKb <= 0) {
            logTelemetry(`Deduction halted: Please enter a target size greater than 0 KB.`, 'warn');
            setIsProcessing(false);
            return;
          }

          // Target is made ~2 KB less (e.g. 320 KB -> 318 KB)
          const deductionOffset = numericKb > 10 ? (Math.random() < 0.5 ? 2 : 3) : 1;
          const targetCeilingKb = Math.max(1, numericKb - deductionOffset);
          const targetBytes = targetCeilingKb * 1024;

          const exportFmt = fmt === 'image/png' ? 'image/webp' : fmt;

          const getBlob = (c: HTMLCanvasElement, qualityFactor: number): Promise<Blob | null> => {
            return new Promise((resolve) => c.toBlob(resolve, exportFmt, qualityFactor));
          };

          // Binary search quality between 0.08 and 0.95
          let low = 0.08;
          let high = 0.95;
          let bestBlob: Blob | null = await getBlob(canvas, high);

          if (bestBlob && bestBlob.size > targetBytes) {
            for (let step = 0; step < 7; step++) {
              const mid = (low + high) / 2;
              const testBlob = await getBlob(canvas, mid);
              if (testBlob) {
                if (testBlob.size <= targetBytes) {
                  bestBlob = testBlob;
                  low = mid;
                } else {
                  high = mid;
                  bestBlob = testBlob;
                }
              }
            }
          }

          // If still over targetBytes (large image resolution), dynamically downscale canvas
          let currentCvs: HTMLCanvasElement = canvas;
          while (bestBlob && bestBlob.size > targetBytes && currentCvs.width > 80 && currentCvs.height > 80) {
            const scale = Math.min(0.85, Math.sqrt(targetBytes / bestBlob.size));
            const nextCvs = document.createElement('canvas');
            nextCvs.width = Math.max(80, Math.floor(currentCvs.width * scale));
            nextCvs.height = Math.max(80, Math.floor(currentCvs.height * scale));
            const nctx = nextCvs.getContext('2d');
            if (nctx) {
              nctx.drawImage(currentCvs, 0, 0, nextCvs.width, nextCvs.height);
              let downBlob = await getBlob(nextCvs, 0.50);
              if (downBlob && downBlob.size > targetBytes) {
                downBlob = await getBlob(nextCvs, 0.20);
              }
              if (downBlob && (downBlob.size <= targetBytes || downBlob.size < bestBlob.size)) {
                bestBlob = downBlob;
              }
            }
            currentCvs = nextCvs;
          }

          if (!bestBlob) throw new Error('Could not generate compressed image blob');

          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const url = URL.createObjectURL(bestBlob);
          registerBlobUrl(url);
          setPreviewUrl(url);
          setProcessedBlob(bestBlob);
          setProcessedBytes(bestBlob.size);

          setProcessedDimensions({ width: currentCvs.width, height: currentCvs.height });

          const ext = exportFmt === 'image/webp' ? '.webp' : '.jpg';
          const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'artifact';
          setOutputFileName(`${baseName}_target_${targetCeilingKb}kb${ext}`);

          logTelemetry(
            `Target compression yielded ${MemoryManager.formatBytes(bestBlob.size)} (Target ceiling was: ~${targetCeilingKb} KB, ~2 KB under ${numericKb} KB limit)`,
            'success'
          );
          onProcessComplete();
          setIsProcessing(false);
          return;
        }

        // CASE 2: QUALITY RATIO (%) MODE
        const qFactor = fmt === 'image/png' ? undefined : q / 100;

        canvas.toBlob(
          blob => {
            if (!blob) {
              logTelemetry('Error generating compressed blob', 'alert');
              setIsProcessing(false);
              return;
            }

            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }

            const url = URL.createObjectURL(blob);
            registerBlobUrl(url);
            setPreviewUrl(url);
            setProcessedBlob(blob);
            setProcessedBytes(blob.size);
            setProcessedDimensions({ width, height });

            const ext = fmt === 'image/webp' ? '.webp' : fmt === 'image/jpeg' ? '.jpg' : '.png';
            const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'artifact';
            const newName = `${baseName}_compressed${ext}`;
            setOutputFileName(newName);

            logTelemetry(
              `Compressed artifact: ${width}×${height} | ${MemoryManager.formatBytes(blob.size)} (${fmt.split('/')[1].toUpperCase()})`,
              'success'
            );
            onProcessComplete();
            setIsProcessing(false);
          },
          fmt,
          qFactor
        );
      } catch (err) {
        logTelemetry(`Compression error: ${(err as Error).message}`, 'alert');
        setIsProcessing(false);
      }
    },
    [compressionMode, file, logTelemetry, onProcessComplete, onProcessStart, previewUrl, registerBlobUrl, targetKb]
  );

  /**
   * Handle Ingestion
   */
  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selectedFile = files[0];
    setFile(selectedFile);

    logTelemetry(`Ingesting image artifact: ${selectedFile.name} (${MemoryManager.formatBytes(selectedFile.size)})`, 'info');

    const objectUrl = URL.createObjectURL(selectedFile);
    registerBlobUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      logTelemetry(`Artifact dimensions: ${img.naturalWidth} × ${img.naturalHeight} px`, 'info');
      processImage(img, format, quality, compressionMode, targetKb);
    };
    img.onerror = () => {
      logTelemetry('Failed to decode image file. Please provide a standard image format.', 'alert');
    };
    img.src = objectUrl;
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setImageElement(null);
    setPreviewUrl(null);
    setProcessedBlob(null);
    setOutputFileName('');
    setProcessedBytes(0);
    setProcessedDimensions(null);
    logTelemetry('Removed image artifact. Ready for new ingestion.', 'info');
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = outputFileName || 'compressed_image.webp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logTelemetry(`Downloaded artifact: ${outputFileName}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Dropzone Intake Slot or Active Studio View */}
      {!file ? (
        <TactileDropzone
          onFilesSelected={handleFilesSelected}
          accept="image/*"
          label="DEPOSIT IMAGE FOR LOCAL COMPRESSION & CONVERSION"
          sublabel="Strips 100% of camera/GPS EXIF metadata naturally via pixel rebuild. Zero cloud uploads."
          supportedFormats={['PNG', 'JPEG', 'WEBP', 'AVIF', 'BMP']}
          onClearFiles={handleRemoveFile}
        />
      ) : (
        <div className="space-y-6">
          {/* Active File Notification & Discard Bar */}
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
                  Wrong file selected? Discard to upload a new image.
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-[#D21319] bg-white dark:bg-[#1E2533] border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shadow-xs cursor-pointer ml-auto"
              title="Discard current image and re-upload"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#D21319]" />
              <span>REMOVE & RE-UPLOAD</span>
            </button>
          </div>

          {/* Main Workbench Grid: Compression Settings (Left) + Interactive Visual Inspector (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Compression Settings */}
            <div className="lg:col-span-5 bg-white/90 dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 rounded-xl p-6 space-y-5 shadow-xs">
              {/* Calibration Method Switcher */}
              <div className="space-y-2">
                <label className="block font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  COMPRESSION CALIBRATION METHOD
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCompressionMode('target');
                      if (imageElement) {
                        processImage(imageElement, format, quality, 'target', targetKb);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer text-center ${
                      compressionMode === 'target'
                        ? 'bg-white dark:bg-[#252E3E] text-[#111622] dark:text-white shadow-xs border border-[#DDD8CE] dark:border-white/15'
                        : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111622]'
                    }`}
                  >
                    TARGET SIZE (KB)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompressionMode('quality');
                      if (imageElement) {
                        processImage(imageElement, format, quality, 'quality', targetKb);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer text-center ${
                      compressionMode === 'quality'
                        ? 'bg-white dark:bg-[#252E3E] text-[#111622] dark:text-white shadow-xs border border-[#DDD8CE] dark:border-white/15'
                        : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111622]'
                    }`}
                  >
                    QUALITY RATIO (%)
                  </button>
                </div>
              </div>

              {/* Format Selector */}
              <div className="space-y-2">
                <label className="block font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  OUTPUT CONTAINER FORMAT
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/webp', name: 'WebP', desc: 'Optimal compact' },
                    { id: 'image/jpeg', name: 'JPEG', desc: 'Universal' },
                    { id: 'image/png', name: 'PNG', desc: 'Lossless' },
                  ].map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        const newFmt = fmt.id as ImageFormat;
                        setFormat(newFmt);
                        if (imageElement) {
                          processImage(imageElement, newFmt, quality, compressionMode, targetKb);
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        format === fmt.id
                          ? 'border-[#D21319] bg-[#FAF5F5] dark:bg-[#202738] shadow-xs ring-1 ring-[#D21319]'
                          : 'border-[#DDD8CE] dark:border-white/10 bg-[#FAF8F5]/60 dark:bg-[#151B26]/60 hover:border-[#B5ADA0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#111622] dark:text-white">
                          {fmt.name}
                        </span>
                        {format === fmt.id && <Check className="w-3.5 h-3.5 text-[#D21319] stroke-[2.5]" />}
                      </div>
                      <span className="block text-[11px] text-[#6B7280] dark:text-[#94A3B8] mt-1 font-sans">{fmt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target File Size Calibration Panel */}
              {compressionMode === 'target' ? (
                <div className="border-t border-[#DDD8CE] dark:border-white/10 pt-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span>ENTER TARGET FILE SIZE</span>
                    </label>
                    <span className="text-[11px] font-sans text-[#6B7280] dark:text-[#94A3B8]">
                      Enter any target size in KB.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[140px]">
                      <input
                        type="number"
                        step={10}
                        min={1}
                        value={targetKb}
                        placeholder="e.g. 200"
                        onChange={(e) => {
                          const val = e.target.value;
                          setTargetKb(val);
                          if (imageElement) {
                            processImage(imageElement, format, quality, 'target', val);
                          }
                        }}
                        className="w-full bg-[#FAF8F5] dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-lg px-4 py-2 font-mono text-sm font-bold text-[#111622] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D21319]/30 pr-14"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#6B7280] dark:text-[#94A3B8]">
                        KB
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[50, 100, 200, 500, 1024].map((kb) => (
                        <button
                          key={kb}
                          type="button"
                          onClick={() => {
                            setTargetKb(kb);
                            if (imageElement) {
                              processImage(imageElement, format, quality, 'target', kb);
                            }
                          }}
                          className={`px-2.5 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                            Number(targetKb) === kb
                              ? 'bg-[#D21319] text-white shadow-xs'
                              : 'bg-[#FAF8F5] dark:bg-[#151B26] text-[#4B5563] dark:text-[#94A3B8] border border-[#DDD8CE] dark:border-white/10 hover:border-[#D21319]/50'
                          }`}
                        >
                          {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {Number(targetKb) <= 0 ? (
                    <p className="text-[11px] font-mono font-bold text-[#D21319] bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      ⚠ Please enter a target size greater than 0 KB.
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono font-medium text-[#16A34A] dark:text-[#4ADE80] bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      ✓ Target calibrated to ~{Math.max(1, Number(targetKb) - (Number(targetKb) > 10 ? 2 : 1))} KB (safely tuned below your {targetKb} KB limit).
                    </p>
                  )}
                </div>
              ) : (
                /* Quality Ratio Calibration */
                <div className="border-t border-[#DDD8CE] dark:border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#6B7280] dark:text-[#94A3B8] font-bold uppercase tracking-wider">
                      COMPRESSION QUALITY:
                    </span>
                    <span className="font-bold text-[#D21319] text-sm">
                      {format === 'image/png' ? 'LOSSLESS (100%)' : `${quality}%`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    disabled={format === 'image/png' || isProcessing}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setQuality(val);
                      if (imageElement) {
                        processImage(imageElement, format, val, 'quality', targetKb);
                      }
                    }}
                    className="w-full accent-[#D21319] cursor-pointer disabled:opacity-40"
                  />

                  {format === 'image/png' ? (
                    <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] font-mono block">
                      * PNG uses lossless compression. Bitmaps retain 100% pixel fidelity.
                    </span>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { label: 'MAX', val: 92 },
                        { label: 'HIGH', val: 80 },
                        { label: 'MED', val: 65 },
                        { label: 'LOW', val: 45 },
                      ].map(p => (
                        <button
                          key={p.label}
                          onClick={() => {
                            setQuality(p.val);
                            if (imageElement) {
                              processImage(imageElement, format, p.val, 'quality', targetKb);
                            }
                          }}
                          className={`py-1.5 rounded-lg border font-mono text-[11px] font-bold transition-all cursor-pointer ${
                            quality === p.val
                              ? 'bg-[#D21319] text-white border-[#D21319]'
                              : 'bg-[#FAF8F5] dark:bg-[#1E2533] border-[#DDD8CE] dark:border-white/10 text-[#6B7280] dark:text-[#CBD5E1] hover:border-[#D21319]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Visual Inspector & Preview */}
            <div className="lg:col-span-7 space-y-4">
              {/* Preview Mode Switcher */}
              <div className="flex items-center justify-between bg-white/90 dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 px-5 py-3 rounded-xl shadow-xs">
                <span className="font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  OPTICAL INSPECTION
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs bg-[#EDE9E0] dark:bg-[#252E3E] p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('original')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all ${
                      previewMode === 'original'
                        ? 'bg-[#111622] text-white shadow-xs'
                        : 'text-[#6B7280] hover:text-[#111622]'
                    }`}
                  >
                    RAW ORIGINAL
                  </button>
                  <button
                    onClick={() => setPreviewMode('processed')}
                    className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all ${
                      previewMode === 'processed'
                        ? 'bg-[#D21319] text-white shadow-xs'
                        : 'text-[#6B7280] hover:text-[#111622]'
                    }`}
                  >
                    COMPRESSED
                  </button>
                </div>
              </div>

              {/* Viewport Canvas Frame */}
              <div
                className="relative w-full rounded-xl border border-[#DDD8CE] dark:border-white/10 bg-[#FAF8F5] dark:bg-[#151B26] flex items-center justify-center p-6 min-h-[380px] overflow-hidden shadow-xs"
                style={{
                  backgroundImage: 'radial-gradient(#D5D0C5 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {imageElement && (
                  <div className="relative max-w-full max-h-[460px] flex items-center justify-center">
                    <img
                      src={previewMode === 'original' ? imageElement.src : previewUrl || imageElement.src}
                      alt="Inspector View"
                      className="max-w-full max-h-[460px] object-contain rounded-lg shadow-sm border border-[#DDD8CE] dark:border-white/10"
                    />

                    {/* Mode Stamp Watermark */}
                    <span className="absolute bottom-2.5 right-2.5 bg-[#111622]/85 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm shadow-xs">
                      {previewMode === 'original' ? 'RAW UNPROCESSED' : 'COMPRESSED & SANITIZED'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completion Telemetry Comparison Block */}
          {processedBlob && (
            <TelemetryComparison
              originalBytes={file.size}
              processedBytes={processedBytes}
              downloadFilename={outputFileName}
              onDownload={handleDownload}
              extraMetrics={[
                {
                  label: 'RESOLUTION',
                  originalVal: imageElement ? `${imageElement.naturalWidth}×${imageElement.naturalHeight}` : '—',
                  processedVal: processedDimensions
                    ? `${processedDimensions.width}×${processedDimensions.height}`
                    : imageElement
                      ? `${imageElement.naturalWidth}×${imageElement.naturalHeight}`
                      : '—',
                },
                {
                  label: 'FORMAT',
                  originalVal: file.type.split('/')[1]?.toUpperCase() || 'IMG',
                  processedVal: format.split('/')[1]?.toUpperCase(),
                },
              ]}
              privacyNotes={[
                '100% of EXIF camera serials, timestamps & GPS coordinates eradicated via canvas pixel rebuild',
                'Lossless/adaptive compression calculated strictly in client RAM',
                'Zero image data leaves your browser or touches an external server',
              ]}
            />
          )}
        </div>
      )}
    </div>
  );
};
