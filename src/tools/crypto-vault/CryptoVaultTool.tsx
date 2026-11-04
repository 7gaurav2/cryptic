import React, { useState } from 'react';
import type { ToolComponentProps } from '../../types/tool.types';
import { TactileDropzone } from '../../components/ui/TactileDropzone';
import { MechanicalButton } from '../../components/ui/MechanicalButton';
import { TelemetryComparison } from '../../components/ui/TelemetryComparison';
import { CryptoEngine } from '../../services/cryptoEngine';
import { MemoryManager } from '../../services/memoryManager';
import { Lock, Unlock, KeyRound, Eye, EyeOff, Hash, AlertOctagon, ShieldCheck, Cpu, Trash2, FileCode } from 'lucide-react';

type VaultMode = 'encrypt' | 'decrypt';

export const CryptoVaultTool: React.FC<ToolComponentProps> = ({
  onProcessStart,
  onProcessComplete,
  onProgress,
  logTelemetry,
  registerBlobUrl,
}) => {
  const [mode, setMode] = useState<VaultMode>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState<string>('');
  const [confirmPassphrase, setConfirmPassphrase] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Result state
  const [resultBlobUrl, setResultBlobUrl] = useState<string | null>(null);
  const [originalBytes, setOriginalBytes] = useState<number>(0);
  const [processedBytes, setProcessedBytes] = useState<number>(0);
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [checksum, setChecksum] = useState<string>('');

  const resetState = () => {
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    setResultBlobUrl(null);
    setFile(null);
    setPassphrase('');
    setConfirmPassphrase('');
    setErrorNotice(null);
    setOriginalBytes(0);
    setProcessedBytes(0);
    setOutputFileName('');
    setChecksum('');
  };

  const handleFilesSelected = (files: File[]) => {
    resetState();
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setOriginalBytes(selected.size);

    if (mode === 'decrypt' && !selected.name.endsWith('.cryptic') && !selected.name.endsWith('.vvault')) {
      logTelemetry('Notice: Selected file does not have standard .cryptic extension, but attempting verification.', 'warn');
    }

    logTelemetry(`Deposited artifact: ${selected.name} (${MemoryManager.formatBytes(selected.size)})`, 'info');
  };

  /**
   * Execute AES-256-GCM Encryption
   */
  const handleEncrypt = async () => {
    if (!file) return;
    if (!passphrase) {
      setErrorNotice('Passphrase is required to derive cryptographic key.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setErrorNotice('Passphrase confirmation does not match.');
      return;
    }
    if (passphrase.length < 8) {
      setErrorNotice('For zero-knowledge security, passphrases must contain at least 8 characters.');
      return;
    }

    setErrorNotice(null);
    setIsProcessing(true);
    onProcessStart('AES_256_GCM_ENCRYPT');
    logTelemetry(`Initiating zero-knowledge AES-256-GCM encryption on ${file.name}...`, 'info');

    try {
      const buffer = await file.arrayBuffer();

      onProgress(20);
      setProcessingStatus('Deriving PBKDF2-SHA256 key (100,000 iterations)...');
      logTelemetry('Deriving 256-bit symmetric key with 100k rounds of PBKDF2...', 'info');

      const result = await CryptoEngine.encryptFile(
        buffer,
        file.name,
        passphrase,
        step => {
          setProcessingStatus(step);
          logTelemetry(step, 'info');
        }
      );

      onProgress(85);
      setProcessingStatus('Generating SHA-256 audit digest...');
      const sha256 = await CryptoEngine.calculateChecksum(result.vaultBuffer.buffer as ArrayBuffer);
      setChecksum(sha256);
      logTelemetry(`Artifact SHA-256: ${sha256.substring(0, 16)}...`, 'info');

      onProgress(100);
      const outBlob = new Blob([result.vaultBuffer as unknown as BlobPart], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(outBlob);

      registerBlobUrl(url);
      MemoryManager.registerBuffer(result.vaultBuffer);
      setResultBlobUrl(url);
      setProcessedBytes(outBlob.size);
      const newName = `${file.name}.cryptic`;
      setOutputFileName(newName);

      logTelemetry(`Sealed in .cryptic container (${MemoryManager.formatBytes(outBlob.size)}) with 128-bit authentication tag`, 'success');
      onProcessComplete('Encryption locked');
    } catch (err) {
      setErrorNotice((err as Error).message);
      logTelemetry(`Encryption failure: ${(err as Error).message}`, 'alert');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  /**
   * Execute AES-256-GCM Decryption & Verification
   */
  const handleDecrypt = async () => {
    if (!file) return;
    if (!passphrase) {
      setErrorNotice('Passphrase is required to unlock this vault container.');
      return;
    }

    setErrorNotice(null);
    setIsProcessing(true);
    onProcessStart('AES_256_GCM_DECRYPT');
    logTelemetry(`Initiating vault container unlock on ${file.name}...`, 'info');

    try {
      const buffer = await file.arrayBuffer();

      onProgress(25);
      setProcessingStatus('Verifying container header & deriving key...');

      const result = await CryptoEngine.decryptVault(
        buffer,
        passphrase,
        step => {
          setProcessingStatus(step);
          logTelemetry(step, 'info');
        }
      );

      onProgress(85);
      setProcessingStatus('Computing checksum of recovered plaintext...');
      const sha256 = await CryptoEngine.calculateChecksum(result.decryptedBuffer.buffer as ArrayBuffer);
      setChecksum(sha256);

      onProgress(100);
      const outBlob = new Blob([result.decryptedBuffer as unknown as BlobPart]);
      const url = URL.createObjectURL(outBlob);

      registerBlobUrl(url);
      MemoryManager.registerBuffer(result.decryptedBuffer);
      setResultBlobUrl(url);
      setProcessedBytes(outBlob.size);
      setOutputFileName(result.originalFileName);

      logTelemetry(`Decryption & HMAC verification successful! Restored "${result.originalFileName}" (${MemoryManager.formatBytes(outBlob.size)})`, 'success');
      onProcessComplete('Decryption verified');
    } catch (err) {
      const msg = (err as Error).message;
      setErrorNotice(msg);
      logTelemetry(`Authentication Failed: ${msg}`, 'alert');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDownload = () => {
    if (!resultBlobUrl) return;
    const a = document.createElement('a');
    a.href = resultBlobUrl;
    a.download = outputFileName || 'unlocked_file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logTelemetry(`Downloaded vault artifact: ${outputFileName}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Segmented Control */}
      <div className="flex justify-start">
        <div className="bg-[#EAE5DB]/90 dark:bg-[#1A2230] p-1.5 rounded-xl border border-[#DDD8CE] dark:border-white/10 inline-flex flex-wrap items-center gap-1.5 shadow-inner">
          <button
            onClick={() => { setMode('encrypt'); resetState(); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              mode === 'encrypt'
                ? 'bg-white dark:bg-[#252E3E] text-[#111622] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#D5D0C5] dark:border-white/15'
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111622] hover:bg-white/40 border border-transparent'
            }`}
          >
            <Lock className={`w-3.5 h-3.5 ${mode === 'encrypt' ? 'text-[#D21319]' : ''}`} />
            <span>SEAL / ENCRYPT (AES-256)</span>
          </button>

          <button
            onClick={() => { setMode('decrypt'); resetState(); }}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              mode === 'decrypt'
                ? 'bg-white dark:bg-[#252E3E] text-[#111622] dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-[#D5D0C5] dark:border-white/15'
                : 'text-[#6B7280] dark:text-[#94A3B8] hover:text-[#111622] hover:bg-white/40 border border-transparent'
            }`}
          >
            <Unlock className={`w-3.5 h-3.5 ${mode === 'decrypt' ? 'text-[#D21319]' : ''}`} />
            <span>UNLOCK / DECRYPT (.CRYPTIC)</span>
          </button>
        </div>
      </div>

      {/* Dropzone Intake Slot or Active Cryptographic Controls */}
      {!file ? (
        <TactileDropzone
          onFilesSelected={handleFilesSelected}
          accept={mode === 'decrypt' ? '.cryptic,.vvault,application/octet-stream' : '*'}
          label={
            mode === 'encrypt'
              ? 'DEPOSIT ANY ARTIFACT TO SEAL IN ZERO-KNOWLEDGE VAULT'
              : 'DEPOSIT .CRYPTIC CONTAINER TO UNLOCK & VERIFY'
          }
          sublabel={
            mode === 'encrypt'
              ? 'PDFs, images, ZIPs, documents, database dumps. Locked via PBKDF2 + AES-256-GCM.'
              : 'Integrity verified with 128-bit authentication tag before byte release.'
          }
          disabled={isProcessing}
          supportedFormats={mode === 'decrypt' ? ['CRYPTIC', 'VVAULT', 'OCTET-STREAM'] : ['ANY FILE', 'PDF', 'PNG', 'ZIP', 'DOCX']}
        />
      ) : !resultBlobUrl && (
        <div className="bg-white/90 dark:bg-[#1A2230] border border-[#DDD8CE] dark:border-white/10 rounded-xl p-6 space-y-6 shadow-xs">
          {/* Active File Notification & Discard Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-3 px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 text-[#D21319]">
                <FileCode className="w-4 h-4" />
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
                  Wrong file? Discard to upload the intended file or container.
                </p>
              </div>
            </div>
            <button
              onClick={resetState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-[#D21319] bg-white dark:bg-[#1E2533] border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shadow-xs cursor-pointer ml-auto"
              title="Discard selected file and re-upload"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#D21319]" />
              <span>REMOVE & RE-UPLOAD</span>
            </button>
          </div>

          <div className="flex items-center justify-between border-b border-[#DDD8CE] dark:border-white/10 pb-3.5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#D21319]" />
              <span className="font-mono text-xs font-bold text-[#111622] dark:text-white uppercase tracking-wider">
                CRYPTOGRAPHIC PASSPHRASE AUTHENTICATION
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#6B7280] dark:text-[#94A3B8] bg-[#EDE9E0] dark:bg-[#252E3E] px-2.5 py-1 rounded-md">
              PBKDF2-SHA256 // 100K ITERATIONS
            </span>
          </div>

          {errorNotice && (
            <div className="p-3.5 rounded-lg bg-[#D21319]/10 border border-[#D21319]/30 flex items-start gap-2.5 text-[#D21319] font-mono text-xs">
              <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-mono text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] uppercase tracking-wider">
                PASSPHRASE
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passphrase}
                  onChange={e => setPassphrase(e.target.value)}
                  placeholder="Enter strong secret key..."
                  className="w-full bg-[#FAF8F5] dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-lg px-4 py-2.5 font-mono text-xs text-[#111622] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D21319]/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#6B7280] hover:text-[#111622] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'encrypt' && (
              <div className="space-y-1.5">
                <label className="block font-mono text-xs font-semibold text-[#4B5563] dark:text-[#CBD5E1] uppercase tracking-wider">
                  CONFIRM PASSPHRASE
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassphrase}
                  onChange={e => setConfirmPassphrase(e.target.value)}
                  placeholder="Re-type secret key to verify..."
                  className="w-full bg-[#FAF8F5] dark:bg-[#151B26] border border-[#DDD8CE] dark:border-white/10 rounded-lg px-4 py-2.5 font-mono text-xs text-[#111622] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D21319]/30"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-[#5C5852] font-mono">
              * Zero backdoors. If you lose the passphrase, this file cannot be recovered.
            </span>
            <MechanicalButton
              variant={mode === 'encrypt' ? 'terracotta' : 'chassis'}
              size="lg"
              isLoading={isProcessing}
              loadingText={processingStatus || 'COMPUTING CIPHER...'}
              onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
            >
              {mode === 'encrypt' ? 'LOCK & SEAL FILE' : 'UNLOCK & EXTRACT FILE'}
            </MechanicalButton>
          </div>
        </div>
      )}

      {/* Completed Telemetry Audit Block */}
      {resultBlobUrl && (
        <div className="space-y-4">
          <TelemetryComparison
            originalBytes={originalBytes}
            processedBytes={processedBytes}
            originalLabel={mode === 'encrypt' ? 'PLAINTEXT PAYLOAD' : 'ENCRYPTED CONTAINER'}
            processedLabel={mode === 'encrypt' ? 'SEALED CONTAINER' : 'RECOVERED PLAINTEXT'}
            downloadFilename={outputFileName}
            onDownload={handleDownload}
            extraMetrics={[
              {
                label: 'ALGORITHM',
                originalVal: 'RAW',
                processedVal: 'AES-256-GCM',
              },
              {
                label: 'KEY DERIVATION',
                originalVal: 'PASSPHRASE',
                processedVal: 'PBKDF2 100K',
              },
            ]}
            privacyNotes={[
              'Raw key material wiped from JS heap on task completion',
              'Authenticated encryption tags verify zero tampering or corruption',
              'File metadata and contents encrypted with native WebCrypto API',
            ]}
          />

          {checksum && (
            <div className="bg-[#DDD8CE]/60 border border-[#D0C9BD] rounded p-3 flex items-center justify-between font-mono text-[11px] text-[#5C5852]">
              <div className="flex items-center gap-2 truncate">
                <Hash className="w-3.5 h-3.5 text-[#8C867E] flex-shrink-0" />
                <span className="text-[#8C867E]">SHA-256 CHECKSUM:</span>
                <span className="text-[#1C1B19] truncate">{checksum}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
