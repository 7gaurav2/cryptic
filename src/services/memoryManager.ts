type MemoryChangeListener = (bytes: number) => void;

class MemoryManagerService {
  private objectUrls: Set<string> = new Set();
  private trackedBuffers: Set<Uint8Array> = new Set();
  private cleanupCallbacks: Set<() => void> = new Set();
  private trackedBytes: number = 0;
  private listeners: Set<MemoryChangeListener> = new Set();

  /**
   * Register a created ObjectURL for lifecycle tracking and later revocation.
   */
  public registerUrl(url: string, estimatedBytes: number = 0): void {
    if (!url) return;
    this.objectUrls.add(url);
    if (estimatedBytes > 0) {
      this.trackedBytes += estimatedBytes;
      this.notifyListeners();
    }
  }

  /**
   * Register an allocated Uint8Array to enable secure zeroing out on RAM purge.
   */
  public registerBuffer(buffer: Uint8Array): void {
    if (!buffer) return;
    this.trackedBuffers.add(buffer);
    this.trackedBytes += buffer.byteLength;
    this.notifyListeners();
  }

  /**
   * Register an arbitrary cleanup callback (e.g. canvas destruction, worker termination).
   */
  public registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.add(callback);
  }

  /**
   * Revoke all registered object URLs and trigger cleanups for component unmounting.
   */
  public revokeAll(): void {
    for (const url of this.objectUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('Failed to revoke object URL:', url, err);
      }
    }
    this.objectUrls.clear();

    for (const cleanup of this.cleanupCallbacks) {
      try {
        cleanup();
      } catch (err) {
        console.warn('Error during memory cleanup execution:', err);
      }
    }
    this.cleanupCallbacks.clear();
    this.trackedBytes = 0;
    this.notifyListeners();
  }

  /**
   * High-security purge:
   * 1. Cryptographically / zero-overwrites all tracked Uint8Array buffers
   * 2. Revokes all Object URLs
   * 3. Clears internal sets
   */
  public purgeRAM(): number {
    const clearedBytes = this.trackedBytes;

    // Overwrite active buffers with zeros to prevent RAM scraping
    for (const buffer of this.trackedBuffers) {
      try {
        buffer.fill(0);
      } catch (e) {
        // Buffer may be detached
      }
    }
    this.trackedBuffers.clear();

    // Revoke all Blob URLs
    for (const url of this.objectUrls) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    }
    this.objectUrls.clear();

    // Run cleanups
    for (const cleanup of this.cleanupCallbacks) {
      try {
        cleanup();
      } catch (e) {}
    }
    this.cleanupCallbacks.clear();

    this.trackedBytes = 0;
    this.notifyListeners();

    return clearedBytes;
  }

  public getTrackedBytes(): number {
    return this.trackedBytes;
  }

  public subscribe(listener: MemoryChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.trackedBytes);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.trackedBytes);
    }
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return '0.00 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const idx = Math.min(i, sizes.length - 1);
    return (bytes / Math.pow(k, idx)).toFixed(2) + ' ' + sizes[idx];
  }
}

export const MemoryManager = new MemoryManagerService();
