import React from 'react';
import { ArrowRight, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { MechanicalButton } from './MechanicalButton';
import { MemoryManager } from '../../services/memoryManager';

interface TelemetryComparisonProps {
  originalBytes: number;
  processedBytes: number;
  originalLabel?: string;
  processedLabel?: string;
  onDownload: () => void;
  downloadFilename: string;
  extraMetrics?: { label: string; originalVal: string; processedVal: string }[];
  privacyNotes?: string[];
}

export const TelemetryComparison: React.FC<TelemetryComparisonProps> = ({
  originalBytes,
  processedBytes,
  originalLabel = 'ORIGINAL ARTIFACT',
  processedLabel = 'PROCESSED ARTIFACT',
  onDownload,
  downloadFilename,
  extraMetrics = [],
  privacyNotes = ['All EXIF headers sanitized', 'Processed 100% inside local Web Worker / RAM'],
}) => {
  const reductionPercent =
    originalBytes > 0
      ? Math.max(0, Math.round(((originalBytes - processedBytes) / originalBytes) * 100))
      : 0;

  const isSmaller = processedBytes < originalBytes;

  return (
    <div className="w-full bg-[#FAF8F5] dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-xl p-6 shadow-sm space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DDD8CE] dark:border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
          <span className="font-mono text-xs font-bold tracking-wider text-[#111622] dark:text-white uppercase">
            COMPLETION TELEMETRY AUDIT
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
            ZERO TRANSMISSION
          </span>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Before */}
        <div className="bg-white dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 rounded-xl p-4 text-center shadow-xs">
          <div className="font-mono text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
            {originalLabel}
          </div>
          <div className="font-mono text-base font-bold text-[#111622] dark:text-white">
            {MemoryManager.formatBytes(originalBytes)}
          </div>
        </div>

        {/* Arrow / Reduction Badge */}
        <div className="flex flex-col items-center justify-center py-1">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#DDD8CE] dark:bg-white/15" />
            <ArrowRight className="w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <div className="h-[1px] w-8 bg-[#DDD8CE] dark:bg-white/15" />
          </div>
          {isSmaller ? (
            <span className="mt-2 inline-block font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
              −{reductionPercent}% REDUCTION
            </span>
          ) : (
            <span className="mt-2 inline-block font-mono text-xs font-semibold text-[#4B5563] dark:text-[#94A3B8] bg-[#EDE9E0] dark:bg-[#1E2533] px-3 py-1 rounded-full">
              OPTIMIZED
            </span>
          )}
        </div>

        {/* After */}
        <div className="bg-white dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 rounded-xl p-4 text-center shadow-xs">
          <div className="font-mono text-[10px] text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
            {processedLabel}
          </div>
          <div className="font-mono text-base font-bold text-[#D21319]">
            {MemoryManager.formatBytes(processedBytes)}
          </div>
        </div>
      </div>

      {/* Optional Extra Metrics */}
      {extraMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#DDD8CE] dark:border-white/10">
          {extraMetrics.map((m, i) => (
            <div key={i} className="font-mono text-xs bg-white/70 dark:bg-[#1A2230] p-2.5 rounded-lg border border-[#DDD8CE] dark:border-white/10">
              <span className="text-[#6B7280] block text-[10px] uppercase font-medium">{m.label}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[#111622] dark:text-white font-medium">{m.originalVal}</span>
                <span className="text-[#9CA3AF]">→</span>
                <span className="text-emerald-600 font-bold">{m.processedVal}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Guarantee List */}
      <div className="bg-white/80 dark:bg-[#1A2230] rounded-xl p-3 border border-[#DDD8CE] dark:border-white/10 space-y-1.5">
        {privacyNotes.map((note, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-[#4B5563] dark:text-[#CBD5E1] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{note}</span>
          </div>
        ))}
      </div>

      {/* Download Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <span className="font-mono text-xs text-[#6B7280] dark:text-[#94A3B8] truncate max-w-sm">
          OUT: <strong className="text-[#111622] dark:text-white">{downloadFilename}</strong>
        </span>
        <MechanicalButton
          variant="terracotta"
          size="md"
          icon={<Download className="w-4 h-4" />}
          onClick={onDownload}
          className="w-full sm:w-auto"
        >
          EXPORT ARTIFACT
        </MechanicalButton>
      </div>
    </div>
  );
};
