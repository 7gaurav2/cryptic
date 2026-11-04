# System & Technical Architecture (`ARCHITECTURE.md`)

---

## 1. High-Level Architectural Diagram

```
+-------------------------------------------------------------------------+
|                        USER BROWSER (CLIENT RAM)                        |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                     UI Presentation Layer (React)                 |  |
|  |  - 3D WebGL Vault Core (Three.js / Canvas)                        |  |
|  |  - 3D Tilt Tool Cartridges & Exposed Hardware Grid                |  |
|  |  - Air-Gap Telemetry Monitor (navigator.onLine + ResourceTiming)  |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|                                    v                                    |
|  +-------------------------------------------------------------------+  |
|  |                 Central Tool Registry (`toolsRegistry.ts`)        |  |
|  |  - Dynamic Lazy Loader & Unified Tool Props Interface             |  |
|  +----------------+----------------+----------------+----------------+  |
|                   |                |                |                   |
|                   v                v                v                   |
|        +--------------+  +------------------+  +-----------------+      |
|        | PDF Engine   |  | Optics Engine    |  | Crypto Engine   |      |
|        | (pdf-lib +   |  | (OffscreenCanvas |  | (Web Crypto API |      |
|        |  pdf.js)     |  |  + Binary EXIF)  |  |  AES-256-GCM)   |      |
|        +------+-------+  +--------+---------+  +--------+--------+      |
|               |                   |                     |               |
|               +-------------------+---------------------+               |
|                                   |                                     |
|                                   v                                     |
|  +-------------------------------------------------------------------+  |
|  |             Memory Manager & Blob Garbage Collector               |  |
|  |  - Tracks all ObjectURLs & ArrayBuffers for instant RAM Purge     |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                          [ STRICT AIR-GAP WALL ]
                   CSP: default-src 'self'; connect-src 'none'
                                    |
                                    X  (Zero External Server Traffic)
```

---

## 2. Core Technical Stack
* **Framework:** React 18+ with TypeScript (Vite bundler for ultra-fast HMR and clean ES module output).
* **Styling:** Tailwind CSS configured with custom CSS variables for the Warm Stone & Obsidian palette, paired with custom CSS 3D transforms and inset tactile shadows.
* **3D & Physics Engine:** `three` (Three.js) or custom WebGL/Canvas 3D renderer for the interactive Cryptographic Core + custom pointer-tracking 3D tilt hooks.
* **Local Processing Engines:**
  * **PDF Manipulation:** `pdf-lib` (structural merge, split, creation) + `pdfjs-dist` (page rasterization for extreme local compression).
  * **Image & EXIF Processing:** Custom binary DataView EXIF parser (reads APP1 `0xFFE1` TIFF tags locally) + HTML5 `<canvas>` `toBlob()` pipeline.
  * **Encryption Engine:** Native `window.crypto.subtle` (`PBKDF2` + `AES-GCM`). Zero external encryption dependencies to eliminate supply-chain vulnerabilities.
* **Icons:** `lucide-react` (styled with crisp $1.5\text{px}$ technical strokes).

---

## 3. Data Lifecycle & Memory Safety
Because users will load multi-megabyte PDFs and high-resolution images into browser memory, strict memory hygiene is mandatory:

1. **Ingestion:** Files enter via drag-and-drop or `<input type="file">` as immutable `File` references.
2. **Buffer Allocation:** Converted to `ArrayBuffer` only inside the active tool's execution scope.
3. **Registry Tracking:** Every generated `URL.createObjectURL(blob)` is registered in a global `MemoryManager` service.
4. **Automatic & Manual Purge:**
   * Switching tools automatically revokes previous tool ObjectURLs.
   * Clicking **"PURGE RAM"** in the top telemetry bar overwrites active `Uint8Array` buffers with zeros (`crypto.getRandomValues` or `.fill(0)`), revokes all ObjectURLs, and clears the telemetry log.

---

## 4. Plug-and-Play Scalability Pattern
To add Tool #4 (e.g., *Smart ID Watermarker*) or Tool #5 (e.g., *Local OCR*) in the future without touching the core layout:
1. Create a folder in `src/tools/[tool-id]/`.
2. Export a component implementing `ToolComponentProps` (`onProcessStart`, `onProcessComplete`, `registerCleanUp`, `logTelemetry`).
3. Append one metadata entry to `src/registry/toolsRegistry.ts`. The Hub Grid, Navigation, and 3D Core automatically adapt.