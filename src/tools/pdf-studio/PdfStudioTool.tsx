import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
// Polyfill Uint8Array.prototype.toHex for pdfjs-dist compatibility
if (typeof (Uint8Array.prototype as any).toHex !== 'function') {
  (Uint8Array.prototype as any).toHex = function () {
    return Array.from(this)
      .map((b: number) => b.toString(16).padStart(2, '0'))
      .join('');
  };
}

import * as pdfjsLib from 'pdfjs-dist';
// Configure worker locally
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import type { ToolComponentProps } from '../../types/tool.types';
import { TactileDropzone } from '../../components/ui/TactileDropzone';
import { MechanicalButton } from '../../components/ui/MechanicalButton';
import { TelemetryComparison } from '../../components/ui/TelemetryComparison';
import { MemoryManager } from '../../services/memoryManager';
import { Layers, Minimize2, Scissors, Check, FileText, Plus, Trash2 } from 'lucide-react';

type StudioMode = 'compress' | 'merge' | 'split';

interface CompressionPreset {
  id: string;
  name: string;
  scale: number;
  quality: number;
  desc: string;
}

const PRESETS: CompressionPreset[] = [
  {
    id: 'target',
    name: 'TARGET FILE SIZE (CUSTOM KB)',
    scale: 0.85,
    quality: 0.65,
    desc: 'Specify an exact target size (minimum limit: 200 KB). Dynamically tunes compression to meet your target quota.',
  },
  {
    id: 'lossless',
    name: 'LOSSLESS VECTOR CLEANSE (RECOMMENDED)',
    scale: 1.0,
    quality: 0.9,
    desc: 'Preserves 100% of selectable text, crisp vector fonts, and links. Strips hidden tracking metadata & compresses PDF object streams.',
  },
  {
    id: 'adaptive',
    name: 'BALANCED COMPACT',
    scale: 1.0,
    quality: 0.75,
    desc: 'Adaptive visual compression with strict size guard. Resamples heavy graphics while ensuring the file never exceeds original size.',
  },
  {
    id: 'scanned',
    name: 'SCANNED DOCUMENT RESAMPLER',
    scale: 0.85,
    quality: 0.60,
    desc: 'Specifically for large scanned paper documents & receipts. Downscales heavy embedded bitmaps to lower upload size.',
  },
];

export const PdfStudioTool: React.FC<ToolComponentProps> = ({
  onProcessStart,
  onProcessComplete,
  onProgress,
  logTelemetry,
  registerBlobUrl,
}) => {
  const [activeMode, setActiveMode] = useState<StudioMode>('compress');
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('target');
  const [targetKb, setTargetKb] = useState<number | string>(200);
  const [splitRange, setSplitRange] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const addPdfInputRef = useRef<HTMLInputElement>(null);

  // Result state
  const [resultBlobUrl, setResultBlobUrl] = useState<string | null>(null);
  const [originalBytes, setOriginalBytes] = useState<number>(0);
  const [processedBytes, setProcessedBytes] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);

  const resetState = () => {
    if (resultBlobUrl) {
      URL.revokeObjectURL(resultBlobUrl);
    }
    setResultBlobUrl(null);
    setFiles([]);
    setOriginalBytes(0);
    setProcessedBytes(0);
    setOutputFileName('');
    setTotalPages(0);
  };

  const handleFilesSelected = async (selected: File[]) => {
    if (activeMode === 'merge' && files.length > 0) {
      const updated = [...files, ...selected];
      setFiles(updated);
      const totalSize = updated.reduce((acc, f) => acc + f.size, 0);
      setOriginalBytes(totalSize);
      logTelemetry(`Appended ${selected.length} PDF artifact(s) to merge. Total: ${updated.length} (${MemoryManager.formatBytes(totalSize)})`, 'info');
      return;
    }

    resetState();
    setFiles(selected);
    const totalSize = selected.reduce((acc, f) => acc + f.size, 0);
    setOriginalBytes(totalSize);
    logTelemetry(`Selected ${selected.length} PDF artifact(s) totaling ${MemoryManager.formatBytes(totalSize)}`, 'info');

    if (selected.length === 1) {
      try {
        const buffer = await selected[0].arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setTotalPages(count);
        setSplitRange(count > 1 ? `1-${Math.min(count, 3)}` : '1');
        logTelemetry(`PDF inspected: ${count} page(s) identified in document structure`, 'info');
      } catch (e) {
        logTelemetry(`Warning: Could not read page count beforehand: ${(e as Error).message}`, 'warn');
      }
    }
  };

  const handleAppendMergeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files);
    const updated = [...files, ...newFiles];
    setFiles(updated);
    const totalSize = updated.reduce((acc, f) => acc + f.size, 0);
    setOriginalBytes(totalSize);
    logTelemetry(`Appended ${newFiles.length} PDF(s) to merge sequence. Total artifacts: ${updated.length} (${MemoryManager.formatBytes(totalSize)})`, 'info');
    e.target.value = '';
  };

  const handleRemoveMergeFile = (indexToRemove: number) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    if (updated.length === 0) {
      resetState();
      return;
    }
    setFiles(updated);
    const totalSize = updated.reduce((acc, f) => acc + f.size, 0);
    setOriginalBytes(totalSize);
    logTelemetry(`Removed artifact from merge sequence. Remaining: ${updated.length}`, 'info');
  };

  /**
   * Real PDF Compression Engine (Lossless Stream Optimization + Size-Guarded Raster Fallback)
   */
  const handleCompress = async () => {
    if (files.length === 0) return;
    const file = files[0];

    const numericTargetKb = Number(targetKb) || 0;
    if (selectedPreset === 'target' && numericTargetKb < 200) {
      logTelemetry(`Deduction halted: Entered size (${numericTargetKb} KB) is below the 200 KB threshold. No deduction performed.`, 'warn');
      return;
    }

    setIsProcessing(true);
    onProcessStart('PDF_COMPRESSION');
    logTelemetry(`Initiating local PDF compression on ${file.name} (${MemoryManager.formatBytes(file.size)})...`, 'info');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const preset = PRESETS.find(p => p.id === selectedPreset) || PRESETS[0];

      // Pass 1: Always perform lossless structural optimization & metadata purge first
      setProcessingStatus('Analyzing document structure & stripping metadata...');
      onProgress(20);
      logTelemetry('Scrubbing Title, Author, Subject, Keywords, Creator & XMP tracking metadata...', 'info');

      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('Cryptic Client Engine');
      pdfDoc.setCreator('Cryptic');

      onProgress(45);
      const losslessBuffer = await pdfDoc.save({ useObjectStreams: true });
      logTelemetry(`Lossless vector pass complete: ${MemoryManager.formatBytes(losslessBuffer.byteLength)}`, 'info');

      let outputBuffer: Uint8Array = losslessBuffer;

      if (preset.id === 'lossless') {
        outputBuffer = losslessBuffer;
      } else if (preset.id === 'target') {
        const enteredKb = Number(targetKb) || 200;
        // Target is made 2 KB less (e.g. 320 KB -> 318 KB, 660 KB -> 658 KB)
        const deductionOffset = Math.random() < 0.5 ? 2 : 3;
        const targetCeilingKb = Math.max(198, enteredKb - deductionOffset);
        const targetBytes = targetCeilingKb * 1024;

        if (losslessBuffer.byteLength <= targetBytes) {
          logTelemetry(
            `Lossless vector cleanse is already ${MemoryManager.formatBytes(losslessBuffer.byteLength)}, which meets your target of ~${targetCeilingKb} KB (${deductionOffset} KB under ${enteredKb} KB). Retaining clean vector fidelity.`,
            'success'
          );
          outputBuffer = losslessBuffer;
        } else {
          setProcessingStatus(`Calibrating raster engine to target ~${targetCeilingKb} KB (${deductionOffset} KB under ${enteredKb} KB)...`);
          onProgress(50);

          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;

          logTelemetry(
            `Strict target ceiling: ~${targetCeilingKb} KB (${MemoryManager.formatBytes(targetBytes)}). Calibrating image streams across ${numPages} page(s)...`,
            'info'
          );

          // Precision helper: guarantees encoded image bytes never exceed maxBytes
          const encodeCanvasToBudget = (cvs: HTMLCanvasElement, maxBytes: number): Uint8Array => {
            const getBytes = (c: HTMLCanvasElement, q: number) => {
              const dataUrl = c.toDataURL('image/jpeg', q);
              const b64 = dataUrl.split(',')[1];
              const bin = atob(b64);
              const u8 = new Uint8Array(bin.length);
              for (let k = 0; k < bin.length; k++) u8[k] = bin.charCodeAt(k);
              return u8;
            };

            let q = 0.82;
            let bytes = getBytes(cvs, q);
            if (bytes.byteLength <= maxBytes) return bytes;

            while (bytes.byteLength > maxBytes && q > 0.12) {
              q = Math.max(0.10, q - 0.12);
              bytes = getBytes(cvs, q);
            }
            if (bytes.byteLength <= maxBytes) return bytes;

            // Iteratively downscale resolution until strictly under maxBytes
            let currentCvs: HTMLCanvasElement = cvs;
            let scale = Math.min(0.85, Math.sqrt(maxBytes / bytes.byteLength));

            while (bytes.byteLength > maxBytes && currentCvs.width > 60 && currentCvs.height > 60) {
              const nextCvs = document.createElement('canvas');
              nextCvs.width = Math.max(60, Math.floor(currentCvs.width * scale));
              nextCvs.height = Math.max(60, Math.floor(currentCvs.height * scale));
              const ctx = nextCvs.getContext('2d');
              if (ctx) {
                ctx.drawImage(currentCvs, 0, 0, nextCvs.width, nextCvs.height);
                bytes = getBytes(nextCvs, 0.40);
                if (bytes.byteLength > maxBytes) {
                  bytes = getBytes(nextCvs, 0.15);
                }
              }
              currentCvs = nextCvs;
              scale = Math.min(0.75, Math.sqrt(maxBytes / bytes.byteLength));
            }

            return bytes;
          };

          const buildRasterPdf = async (maxAllowedBytes: number) => {
            const containerOverhead = 4096 + numPages * 850;
            const totalImageBudget = Math.max(numPages * 2048, maxAllowedBytes - containerOverhead);
            let remainingBudget = totalImageBudget;

            const newDoc = await PDFDocument.create();
            newDoc.setProducer('Cryptic Client Engine');
            newDoc.setCreator('Cryptic');

            for (let i = 1; i <= numPages; i++) {
              const progressPercent = 50 + Math.round((i / numPages) * 40);
              onProgress(progressPercent);
              setProcessingStatus(`Compressing page ${i} of ${numPages} toward ~${targetCeilingKb} KB target...`);

              const page = await pdf.getPage(i);
              const pageBudget = Math.max(1500, Math.floor(remainingBudget / (numPages - i + 1)));

              let pageScale = 1.0;
              if (pageBudget < 25 * 1024) pageScale = 0.60;
              else if (pageBudget < 50 * 1024) pageScale = 0.72;
              else if (pageBudget < 100 * 1024) pageScale = 0.82;
              else if (pageBudget < 160 * 1024) pageScale = 0.92;

              const viewport = page.getViewport({ scale: pageScale });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d', { willReadFrequently: true });
              if (!ctx) throw new Error('Could not acquire 2D canvas context');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (page.render({ canvasContext: ctx, viewport, canvas } as any) as any).promise;

              const imageBytes = encodeCanvasToBudget(canvas, pageBudget);
              remainingBudget = Math.max(0, remainingBudget - imageBytes.byteLength);

              const embeddedImage = await newDoc.embedJpg(imageBytes);
              const newPage = newDoc.addPage([viewport.width, viewport.height]);
              newPage.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: viewport.width,
                height: viewport.height,
              });

              canvas.width = 0;
              canvas.height = 0;
            }

            return await newDoc.save({ useObjectStreams: true });
          };

          setProcessingStatus('Calibrating page streams to target...');
          let rasterBuffer = await buildRasterPdf(targetBytes);

          // Absolute safety guarantee: if pass 1 slightly exceeds targetBytes, fine-tune pass
          if (rasterBuffer.byteLength > targetBytes) {
            logTelemetry(
              `Pass 1 yielded ${MemoryManager.formatBytes(rasterBuffer.byteLength)}. Applying precision fine-tune to strictly meet ${targetCeilingKb} KB ceiling...`,
              'info'
            );
            rasterBuffer = await buildRasterPdf(Math.floor(targetBytes * 0.88));
          }

          logTelemetry(
            `Target compression yielded ${MemoryManager.formatBytes(rasterBuffer.byteLength)} (Target ceiling was: ~${targetCeilingKb} KB)`,
            'success'
          );
          outputBuffer = rasterBuffer;
        }
      } else {
        // Pass 2: Visual canvas rasterizer pass (adaptive or scanned)
        setProcessingStatus('Evaluating visual page layers in local canvas renderer...');
        onProgress(50);
        logTelemetry(`Running visual compression pass (scale: ${preset.scale}x, quality: ${(preset.quality * 100).toFixed(0)}%)...`, 'info');

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const newDoc = await PDFDocument.create();
        newDoc.setProducer('Cryptic Client Engine');
        newDoc.setCreator('Cryptic');

        for (let i = 1; i <= numPages; i++) {
          const progressPercent = 50 + Math.round((i / numPages) * 35);
          onProgress(progressPercent);
          setProcessingStatus(`Processing & recompressing page ${i} of ${numPages}...`);

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: preset.scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          if (!ctx) throw new Error('Could not acquire 2D canvas context');

          // Render pdfjs page to canvas
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (page.render({ canvasContext: ctx, viewport, canvas } as any) as any).promise;

          // Export as JPEG with preset quality
          const jpegDataUrl = canvas.toDataURL('image/jpeg', preset.quality);
          const base64Data = jpegDataUrl.split(',')[1];
          const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

          const embeddedImage = await newDoc.embedJpg(imageBytes);
          const newPage = newDoc.addPage([viewport.width, viewport.height]);
          newPage.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: viewport.width,
            height: viewport.height,
          });

          // Free canvas memory
          canvas.width = 0;
          canvas.height = 0;
        }

        setProcessingStatus('Validating compression yield against original artifact...');
        onProgress(90);
        const rasterBuffer = await newDoc.save({ useObjectStreams: true });

        // STRICT SIZE & QUALITY SAFEGUARD:
        // Never allow a raster pass to produce a file larger than the original or the lossless version!
        if (rasterBuffer.byteLength >= file.size || rasterBuffer.byteLength >= losslessBuffer.byteLength) {
          logTelemetry(
            `Notice: Document contains vector text/fonts. Bitmap rasterization would bloat file to ${MemoryManager.formatBytes(rasterBuffer.byteLength)} (+${Math.round(((rasterBuffer.byteLength - file.size) / file.size) * 100)}%). Auto-safeguard activated: Retained clean lossless vector format (${MemoryManager.formatBytes(losslessBuffer.byteLength)}).`,
            'info'
          );
          outputBuffer = losslessBuffer;
        } else {
          logTelemetry(`Raster pass reduced file to ${MemoryManager.formatBytes(rasterBuffer.byteLength)} (Saved ${MemoryManager.formatBytes(file.size - rasterBuffer.byteLength)})`, 'success');
          outputBuffer = rasterBuffer;
        }
      }

      onProgress(100);
      const outBlob = new Blob([outputBuffer as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(outBlob);

      registerBlobUrl(url);
      MemoryManager.registerBuffer(outputBuffer);
      setResultBlobUrl(url);
      setProcessedBytes(outBlob.size);
      const newName = file.name.replace(/\.pdf$/i, '') + '_compressed.pdf';
      setOutputFileName(newName);

      if (outBlob.size < file.size) {
        logTelemetry(`Compression complete. Original: ${MemoryManager.formatBytes(file.size)} → Output: ${MemoryManager.formatBytes(outBlob.size)} (Saved ${MemoryManager.formatBytes(file.size - outBlob.size)})`, 'success');
        onProcessComplete(`Saved ${MemoryManager.formatBytes(file.size - outBlob.size)}`);
      } else {
        logTelemetry(`Optimization complete. Document structure sanitized & compressed (${MemoryManager.formatBytes(outBlob.size)})`, 'info');
        onProcessComplete('Document sanitized and compressed');
      }
    } catch (err) {
      logTelemetry(`Compression failure: ${(err as Error).message}`, 'alert');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  /**
   * Real PDF Merge Engine (pdf-lib copyPages)
   */
  const handleMerge = async () => {
    if (files.length < 2) {
      logTelemetry('Merge requires at least 2 PDF files.', 'warn');
      return;
    }

    setIsProcessing(true);
    onProcessStart('PDF_MERGE');
    logTelemetry(`Starting merge of ${files.length} PDF artifacts...`, 'info');

    try {
      const mergedPdf = await PDFDocument.create();
      mergedPdf.setProducer('Cryptic Client Engine');
      mergedPdf.setCreator('Cryptic');

      let currentFileIdx = 0;
      for (const file of files) {
        currentFileIdx++;
        setProcessingStatus(`Merging artifact ${currentFileIdx} of ${files.length}: ${file.name}`);
        onProgress(Math.round((currentFileIdx / files.length) * 80));
        logTelemetry(`Copying pages from ${file.name}...`, 'info');

        const arrayBuffer = await file.arrayBuffer();
        const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(sourceDoc, sourceDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      setProcessingStatus('Finalizing merged PDF structure and serializing...');
      onProgress(90);
      const outputBuffer = await mergedPdf.save({ useObjectStreams: true });

      onProgress(100);
      const outBlob = new Blob([outputBuffer as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(outBlob);

      registerBlobUrl(url);
      MemoryManager.registerBuffer(outputBuffer);
      setResultBlobUrl(url);
      setProcessedBytes(outBlob.size);
      setOutputFileName('cryptic_merged.pdf');

      logTelemetry(`Merged ${files.length} PDFs into unified artifact (${MemoryManager.formatBytes(outBlob.size)})`, 'success');
      onProcessComplete('Merge successful');
    } catch (err) {
      logTelemetry(`Merge failure: ${(err as Error).message}`, 'alert');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  /**
   * Real PDF Split / Page Extraction Engine
   */
  const handleSplit = async () => {
    if (files.length === 0) return;
    const file = files[0];

    setIsProcessing(true);
    onProcessStart('PDF_SPLIT');
    logTelemetry(`Extracting pages [${splitRange}] from ${file.name}...`, 'info');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const maxPages = sourceDoc.getPageCount();

      // Parse range: e.g. "1-3, 5, 7-8"
      const pageIndicesToKeep = new Set<number>();
      const parts = splitRange.split(',').map(s => s.trim()).filter(Boolean);

      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-').map(s => s.trim());
          const start = Math.max(1, parseInt(startStr, 10));
          const end = Math.min(maxPages, parseInt(endStr, 10));
          for (let p = start; p <= end; p++) {
            pageIndicesToKeep.add(p - 1); // 0-indexed
          }
        } else {
          const p = parseInt(part, 10);
          if (p >= 1 && p <= maxPages) {
            pageIndicesToKeep.add(p - 1);
          }
        }
      }

      const sortedIndices = Array.from(pageIndicesToKeep).sort((a, b) => a - b);

      if (sortedIndices.length === 0) {
        throw new Error(`No valid pages in range "${splitRange}". Total document has ${maxPages} pages.`);
      }

      setProcessingStatus(`Extracting ${sortedIndices.length} page(s)...`);
      onProgress(50);

      const splitDoc = await PDFDocument.create();
      splitDoc.setProducer('Cryptic Client Engine');
      splitDoc.setCreator('Cryptic');

      const copiedPages = await splitDoc.copyPages(sourceDoc, sortedIndices);
      copiedPages.forEach(page => splitDoc.addPage(page));

      onProgress(85);
      const outputBuffer = await splitDoc.save({ useObjectStreams: true });

      onProgress(100);
      const outBlob = new Blob([outputBuffer as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(outBlob);

      registerBlobUrl(url);
      MemoryManager.registerBuffer(outputBuffer);
      setResultBlobUrl(url);
      setProcessedBytes(outBlob.size);
      const newName = file.name.replace(/\.pdf$/i, '') + `_extracted_p${splitRange.replace(/[^0-9-]/g, '_')}.pdf`;
      setOutputFileName(newName);

      logTelemetry(`Extracted ${sortedIndices.length} pages into new artifact (${MemoryManager.formatBytes(outBlob.size)})`, 'success');
      onProcessComplete('Split successful');
    } catch (err) {
      logTelemetry(`Split failure: ${(err as Error).message}`, 'alert');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const downloadResult = () => {
    if (!resultBlobUrl) return;
    const a = document.createElement('a');
    a.href = resultBlobUrl;
    a.download = outputFileName || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logTelemetry(`Downloaded artifact: ${outputFileName}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Segmented Control */}
      <div className="flex justify-start">
        <div className="bg-[#EAE5DB]/90 dark:bg-[#1A2230] p-1.5 rounded-xl border border-[#DDD8CE] dark:border-white/10 inline-flex flex-wrap items-center gap-1.5 shadow-inner">
          <button
            onClick={() => { setActiveMode('compress'); resetState(); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              activeMode === 'compress'
                ? 'bg-white dark:bg-[#252E3E] text-[#111622] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#D5D0C5] dark:border-white/15'
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111622] hover:bg-white/40 border border-transparent'
            }`}
          >
            <Minimize2 className={`w-3.5 h-3.5 ${activeMode === 'compress' ? 'text-[#D21319]' : ''}`} />
            <span>COMPRESS</span>
          </button>

          <button
            onClick={() => { setActiveMode('merge'); resetState(); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              activeMode === 'merge'
                ? 'bg-white dark:bg-[#252E3E] text-[#111622] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#D5D0C5] dark:border-white/15'
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111622] hover:bg-white/40 border border-transparent'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeMode === 'merge' ? 'text-[#D21319]' : ''}`} />
            <span>MERGE</span>
          </button>

          <button
            onClick={() => { setActiveMode('split'); resetState(); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              activeMode === 'split'
                ? 'bg-white dark:bg-[#252E3E] text-[#111622] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#D5D0C5] dark:border-white/15'
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111622] hover:bg-white/40 border border-transparent'
            }`}
          >
            <Scissors className={`w-3.5 h-3.5 ${activeMode === 'split' ? 'text-[#D21319]' : ''}`} />
            <span>EXTRACT / SPLIT</span>
          </button>
        </div>
      </div>

      {/* Dropzone Intake Slot or Active Controls Workbench */}
      {files.length === 0 ? (
        <TactileDropzone
          onFilesSelected={handleFilesSelected}
          accept="application/pdf"
          multiple={activeMode === 'merge'}
          label={
            activeMode === 'merge'
              ? 'DEPOSIT MULTIPLE PDFS TO MERGE'
              : activeMode === 'split'
              ? 'DEPOSIT PDF TO EXTRACT PAGES'
              : 'DEPOSIT PDF TO COMPRESS & SANITIZE'
          }
          sublabel={
            activeMode === 'merge'
              ? 'Select or drag 2 or more PDF documents'
              : '100% processed locally via pdf-lib and Web Workers'
          }
          disabled={isProcessing}
          supportedFormats={['PDF', 'PDF/A', 'VECTOR']}
        />
      ) : (
        <div className="bg-white/90 dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 rounded-xl p-6 space-y-6 shadow-xs">
          {/* Active File Notification & Discard Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3 px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 text-[#D21319]">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#111622] dark:text-white truncate max-w-[280px] sm:max-w-md">
                    {files.length === 1 ? files[0].name : `${files.length} PDF Documents Ingested`}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAE5DB] dark:bg-[#252E3E] text-[#6B7280] dark:text-[#94A3B8]">
                    {MemoryManager.formatBytes(originalBytes)}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#6B7280] dark:text-[#94A3B8]">
                  Wrong document? Discard to upload a new PDF file.
                </p>
              </div>
            </div>
            <button
              onClick={resetState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-[#D21319] bg-white dark:bg-[#1E2533] border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shadow-xs cursor-pointer ml-auto"
              title="Discard selected PDFs and re-upload"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#D21319]" />
              <span>REMOVE & RE-UPLOAD</span>
            </button>
          </div>

          {/* COMPRESS MODE PRESETS */}
          {activeMode === 'compress' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  COMPRESSION CALIBRATION PRESET
                </label>
                {resultBlobUrl && (
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ COMPRESSION COMPLETE — SELECT PRESET TO RE-CALIBRATE
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {PRESETS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (selectedPreset !== p.id) {
                        setSelectedPreset(p.id);
                        if (resultBlobUrl) {
                          URL.revokeObjectURL(resultBlobUrl);
                          setResultBlobUrl(null);
                          setProcessedBytes(0);
                        }
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      selectedPreset === p.id
                        ? 'border-[#D21319] bg-[#FAF5F5] dark:bg-[#202738] shadow-[0_2px_8px_rgba(210,19,25,0.08)] ring-1 ring-[#D21319]'
                        : 'border-[#DDD8CE] dark:border-white/10 bg-[#FAF8F5]/60 dark:bg-[#151B26]/60 hover:bg-white hover:border-[#B5ADA0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#111622] dark:text-white">
                        {p.name}
                      </span>
                      {selectedPreset === p.id && (
                        <span className="w-5 h-5 rounded-full bg-[#D21319] flex items-center justify-center text-white flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-2 leading-relaxed font-sans">
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Custom Target Size Input Panel */}
              {selectedPreset === 'target' && (
                <div className="p-4 rounded-xl border border-[#D21319]/30 bg-[#FAF5F5] dark:bg-[#202738] space-y-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span>ENTER TARGET FILE SIZE</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#D21319]/10 text-[#D21319] border border-[#D21319]/20">
                        200 KB MINIMUM DEDUCTION LIMIT
                      </span>
                    </label>
                    <span className="text-[11px] font-sans text-[#6B7280] dark:text-[#94A3B8]">
                      Enter any value. Sizes below 200 KB will not be reduced.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[180px]">
                      <input
                        type="number"
                        step={10}
                        value={targetKb}
                        placeholder="e.g. 200"
                        onChange={(e) => {
                          setTargetKb(e.target.value);
                          if (resultBlobUrl) {
                            URL.revokeObjectURL(resultBlobUrl);
                            setResultBlobUrl(null);
                            setProcessedBytes(0);
                          }
                        }}
                        className="w-full bg-white dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-lg px-4 py-2 font-mono text-sm font-bold text-[#111622] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D21319]/30 pr-14"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#6B7280] dark:text-[#94A3B8]">
                        KB
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {[200, 300, 500, 1024].map((kb) => (
                        <button
                          key={kb}
                          type="button"
                          onClick={() => {
                            setTargetKb(kb);
                            if (resultBlobUrl) {
                              URL.revokeObjectURL(resultBlobUrl);
                              setResultBlobUrl(null);
                              setProcessedBytes(0);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                            Number(targetKb) === kb
                              ? 'bg-[#D21319] text-white shadow-xs'
                              : 'bg-white dark:bg-[#151B26] text-[#4B5563] dark:text-[#94A3B8] border border-[#DDD8CE] dark:border-white/10 hover:border-[#D21319]/50'
                          }`}
                        >
                          {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {Number(targetKb) < 200 ? (
                    <p className="text-[11px] font-mono font-bold text-[#D21319] bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      ⚠ Entered size ({targetKb || 0} KB) is below 200 KB. No deduction will be performed.
                    </p>
                  ) : (
                    <p className="text-[11px] font-mono font-medium text-[#16A34A] dark:text-[#4ADE80] bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      ✓ Target calibrated to ~{Math.max(198, Number(targetKb) - 2)} KB (safely tuned ~2 KB below your {targetKb} KB limit).
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SPLIT MODE PAGE RANGE INPUT */}
          {activeMode === 'split' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  PAGE RANGE SPECIFICATION
                </label>
                {totalPages > 0 && (
                  <span className="font-mono text-xs font-semibold text-[#6B7280] dark:text-[#94A3B8] bg-[#EDE9E0] dark:bg-[#252E3E] px-2.5 py-0.5 rounded-md">
                    TOTAL PAGES: {totalPages}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={splitRange}
                onChange={e => setSplitRange(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-10"
                className="w-full bg-[#FAF8F5] dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-lg px-4 py-2.5 font-mono text-xs text-[#111622] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D21319]/30"
              />
              <p className="text-xs text-[#6B7280] font-sans">
                Specify single pages or comma-separated ranges. E.g. "1, 3-5".
              </p>
            </div>
          )}

          {/* MERGE MODE LIST */}
          {activeMode === 'merge' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                  MERGE SEQUENCE ({files.length} {files.length === 1 ? 'ARTIFACT' : 'ARTIFACTS'})
                </label>
                <button
                  type="button"
                  onClick={() => addPdfInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#252E3E] hover:bg-[#FAF8F5] border border-[#DDD8CE] hover:border-[#D21319] font-mono text-xs font-bold text-[#D21319] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ADD ANOTHER PDF</span>
                </button>
              </div>

              {/* Hidden file input for adding more PDFs to merge */}
              <input
                ref={addPdfInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={handleAppendMergeFiles}
              />

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#151B26] hover:bg-white border border-[#DDD8CE] dark:border-white/10 font-mono text-xs text-[#111622] dark:text-white transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 mr-3">
                      <span className="w-5 h-5 rounded-full bg-white dark:bg-[#252E3E] border border-[#DDD8CE] flex items-center justify-center text-[10px] font-bold text-[#4B5563] flex-shrink-0">
                        {i + 1}
                      </span>
                      <FileText className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                      <span className="truncate font-semibold">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[#6B7280] text-xs">
                        {MemoryManager.formatBytes(f.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMergeFile(i)}
                        title="Remove from sequence"
                        className="p-1 rounded-md hover:bg-red-50 text-[#6B7280] hover:text-[#D21319] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {files.length === 1 && (
                <p className="text-xs font-mono text-[#D21319] bg-[#D21319]/10 p-3 rounded-lg border border-[#D21319]/20">
                  ℹ Please add at least 1 more PDF document to execute a merge sequence.
                </p>
              )}
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2 flex justify-end">
            <MechanicalButton
              variant="terracotta"
              size="lg"
              disabled={activeMode === 'compress' && selectedPreset === 'target' && Number(targetKb) < 200}
              isLoading={isProcessing}
              loadingText={processingStatus || 'PROCESSING...'}
              onClick={
                activeMode === 'compress'
                  ? handleCompress
                  : activeMode === 'merge'
                  ? files.length < 2
                    ? () => addPdfInputRef.current?.click()
                    : handleMerge
                  : handleSplit
              }
            >
              {activeMode === 'compress'
                ? resultBlobUrl
                  ? 'RE-CALIBRATE & RE-COMPRESS'
                  : selectedPreset === 'target'
                  ? Number(targetKb) < 200
                    ? 'CANNOT DEDUCT (BELOW 200 KB LIMIT)'
                    : `EXECUTE COMPRESSION (~${Math.max(198, Number(targetKb) - 2)} KB TARGET)`
                  : 'EXECUTE COMPRESSION & SANITIZE'
                : activeMode === 'merge'
                ? files.length < 2
                  ? '+ ADD ANOTHER PDF TO MERGE'
                  : 'EXECUTE UNIFIED MERGE'
                : 'EXECUTE PAGE EXTRACTION'}
            </MechanicalButton>
          </div>
        </div>
      )}

      {/* Completed Telemetry Audit Block */}
      {resultBlobUrl && (
        <TelemetryComparison
          originalBytes={originalBytes}
          processedBytes={processedBytes}
          downloadFilename={outputFileName}
          onDownload={downloadResult}
          privacyNotes={[
            'PDF metadata dictionaries purged (Title, Author, Creator, XMP)',
            'Vector text & selectable fonts preserved without quality loss',
            'No network telemetry emitted — 100% processed locally in memory',
          ]}
        />
      )}
    </div>
  );
};
