import React, { useRef, useState } from 'react';
import { Upload, FileCheck, FolderOpen, Trash2, X } from 'lucide-react';

interface TactileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
  onHoverStateChange?: (isHovering: boolean) => void;
  selectedFileNames?: string[];
  disabled?: boolean;
  supportedFormats?: string[];
  onClearFiles?: () => void;
  onRemoveFileAtIndex?: (index: number) => void;
}

export const TactileDropzone: React.FC<TactileDropzoneProps> = ({
  onFilesSelected,
  accept,
  multiple = false,
  label = 'DEPOSIT RAW ARTIFACT FOR LOCAL INGESTION',
  sublabel = 'Zero server upload. Data persists exclusively in browser RAM.',
  onHoverStateChange,
  selectedFileNames = [],
  disabled = false,
  supportedFormats,
  onClearFiles,
  onRemoveFileAtIndex,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!isDragOver) {
      setIsDragOver(true);
      onHoverStateChange?.(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
    onHoverStateChange?.(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onHoverStateChange?.(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(multiple ? filesArray : [filesArray[0]]);
      e.target.value = ''; // reset for re-selection
    }
  };

  return (
    <div className="select-none">
      {/* Main Tactile Intake Hatch */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`group relative w-full rounded-2xl border-2 border-dashed p-8 sm:p-12 transition-all duration-200 cursor-pointer overflow-hidden
          ${isDragOver
            ? 'border-[#D21319] bg-[#FAF2F2] shadow-[0_0_35px_rgba(210,19,25,0.12)] scale-[0.995]'
            : 'border-[#D5D0C5] bg-[#FAF8F5]/80 hover:bg-white hover:border-[#B5ADA0] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Technical Coordinate Grid Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tactile-intake-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.8" fill="#111622" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactile-intake-dots)" />
        </svg>

        {/* 4 Optical Corner Registration Marks */}
        <span className="absolute top-3 left-3 font-mono text-xs text-[#A8A29E] leading-none select-none">┌</span>
        <span className="absolute top-3 right-3 font-mono text-xs text-[#A8A29E] leading-none select-none">┐</span>
        <span className="absolute bottom-3 left-3 font-mono text-xs text-[#A8A29E] leading-none select-none">└</span>
        <span className="absolute bottom-3 right-3 font-mono text-xs text-[#A8A29E] leading-none select-none">┘</span>

        {/* Center Intake Chamber */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          {/* Animated Central Intake Capsule */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] ${
              isDragOver
                ? 'bg-[#D21319] text-white scale-110 shadow-lg'
                : 'bg-white text-[#111622] border border-[#DDD8CE] group-hover:border-[#D21319] group-hover:scale-105'
            }`}
          >
            {selectedFileNames.length > 0 ? (
              <FileCheck className="w-7 h-7 text-emerald-600" strokeWidth={2.2} />
            ) : (
              <Upload className="w-7 h-7 text-[#D21319]" strokeWidth={2.2} />
            )}
          </div>

          {/* Heading & Sublabel */}
          <div>
            <div className="font-mono text-sm sm:text-base font-bold tracking-[0.16em] text-[#111622] dark:text-white uppercase">
              {label}
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1.5 max-w-lg font-sans mx-auto leading-relaxed">
              {sublabel}
            </p>
          </div>

          {/* Direct Tactile Action Button */}
          <div className="pt-1 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) inputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111622] hover:bg-[#1F2737] text-white font-mono text-xs font-bold tracking-wider uppercase shadow-xs transition-all active:translate-y-[1px] cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#EF4444]" />
              <span>CHOOSE ARTIFACT</span>
            </button>
          </div>

          {/* Supported Format Chips */}
          {supportedFormats && supportedFormats.length > 0 && selectedFileNames.length === 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <span className="text-[10px] font-mono text-[#8C867E] uppercase tracking-wider mr-1">
                ACCEPTED FORMATS:
              </span>
              {supportedFormats.map((fmt, i) => (
                <span
                  key={i}
                  className="font-mono text-[10px] font-semibold text-[#4B5563] dark:text-[#CBD5E1] bg-white dark:bg-[#1E2533] px-2 py-0.5 rounded border border-[#DDD8CE] dark:border-white/10 shadow-xs"
                >
                  .{fmt}
                </span>
              ))}
            </div>
          )}

          {/* Ingested File Badges with Delete Actions */}
          {selectedFileNames.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2.5 pointer-events-auto">
              <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                {selectedFileNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1E2533] border border-[#DDD8CE] dark:border-white/10 font-mono text-xs font-semibold text-[#111622] dark:text-white shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="truncate max-w-[260px]">{name}</span>
                    {onRemoveFileAtIndex && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFileAtIndex(idx);
                        }}
                        className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-[#8C867E] hover:text-[#D21319] transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
