# Product Requirements Document (PRD)
**Project Name:** Cryptic (Local-First Privacy Utility Hub)
**Platform:** Progressive Web Application (React + TypeScript + Vite + Web Workers)
**Architecture Philosophy:** 100% Client-Side Execution, Zero-Server, Air-Gap Capable

---

## 1. Executive Summary & Vision
Users frequently need to compress sensitive PDFs (bank statements, tax returns, government IDs), strip GPS metadata from private photos, or encrypt confidential files before sharing. Existing online utilities require uploading files to unknown third-party cloud servers, creating severe privacy and identity-theft risks.

**Cryptic** solves this by bringing industrial-grade file manipulation directly into the browser using WebAssembly, HTML5 Canvas, and the native Web Crypto API. Every byte is processed in local device RAM. No files ever leave the user's machine.

---

## 2. Core Value Propositions
1. **Zero-Network Guarantee:** Strict Content Security Policy (`connect-src 'none'`) and a live "Air-Gap Verifier" in the UI that encourages users to turn off Wi-Fi while processing files.
2. **Modular Plug-and-Play Hub:** Built around a central Tool Registry so new privacy utilities can be added in the future by registering a single configuration object.
3. **Tactile Hardware Aesthetic:** Rejects generic SaaS/AI neon dark modes in favor of a physical, precision-engineered studio aesthetic with 3D interactive depth.

---

## 3. Phase 1 MVP Tools (Detailed Functional Specs)

### Tool 01: Local PDF Studio (Compress, Merge, Split)
* **User Story:** As a user with sensitive financial or identity PDFs, I want to shrink file size or combine/extract pages locally so I can upload them to strict government/banking portals safely.
* **Capabilities:**
  * **Compress Mode:** Renders PDF pages via `pdfjs-dist` onto an offscreen HTML5 Canvas at user-selected DPI (`72 DPI` Extreme, `144 DPI` Balanced, `200 DPI` High Quality) and re-encodes them as optimized JPEG streams inside a clean `pdf-lib` container, stripping all document metadata and XMP history.
  * **Merge Mode:** Drag-and-drop multiple PDFs, reorder pages visually, and merge into a single flattened PDF.
  * **Split / Extract Mode:** Select specific page ranges (e.g., `1-3, 5`) and export immediately.
* **Output Metrics:** Displays Original Size, New Size, Percentage Saved, and Metadata Stripped confirmation badge.

### Tool 02: Optics & EXIF Scrubber (Image Privacy & Optimizer)
* **User Story:** As a privacy-conscious user, I want to inspect and destroy hidden EXIF data (GPS coordinates, camera serial numbers, timestamps) while compressing images to exact KB targets.
* **Capabilities:**
  * **EXIF Inspector:** Reads raw binary header data before scrubbing to show the user exactly what hidden data was found (Device Model, Date/Time, GPS Latitude/Longitude).
  * **Cryptographic Pixel Redraw:** Re-draws pixel buffers onto an clean HTML5 `<canvas>` and exports as `image/webp`, `image/jpeg`, or `image/png`, guaranteeing 100% destruction of all EXIF, IPTC, and XMP headers.
  * **Target Size Slider:** Quality control (`10%` to `95%`) + dimension scaling with real-time byte-size preview.

### Tool 03: Zero-Knowledge Cryptographic Vault (AES-256-GCM File Locker)
* **User Story:** As a user sending confidential files over email, WhatsApp, or cloud drives, I want to lock any file with a password so only the recipient with the passphrase can decrypt it.
* **Capabilities:**
  * **Encrypt Mode:** Accepts any file type (`.pdf`, `.docx`, `.zip`, `.jpg`). Derives a 256-bit cryptographic key from the user's passphrase using `PBKDF2` (`100,000` iterations, SHA-256, random 16-byte salt) and encrypts the payload using `AES-256-GCM` with a random 12-byte IV via the browser's native `window.crypto.subtle` API.
  * **Custom Container Format:** Outputs a `.cryptic` binary file containing `[Magic Header 6B][Salt 16B][IV 12B][Ciphertext + AuthTag]`.
  * **Decrypt Mode:** Drops a `.cryptic` file, enters the passphrase, verifies authentication tag integrity, and restores the exact original filename and binary payload.

---

## 4. Global Hub Features
1. **Live Air-Gap Status Indicator:** Top navigation bar monitors `navigator.onLine` and real-time `PerformanceObserver` network resource entries. Shows `"LOCAL ENGINE READY (0 BYTES SENT)"` when online, and switches to `"AIR-GAPPED MODE ACTIVE — HARDWARE ISOLATED"` when the user disconnects Wi-Fi.
2. **RAM Memory Purge Button:** One-click `"Purge Session RAM"` button that revokes all `URL.createObjectURL` blobs, zeroes out `Uint8Array` buffers, and resets state.
3. **PWA Offline Support:** Full Service Worker caching so the entire studio installs as a standalone desktop or Android app and launches with zero internet connection.

---

## 5. Non-Functional Requirements
* **Performance:** All file processing $>2\text{ MB}$ must execute inside Web Workers or asynchronous chunked loops so the UI maintains $60\text{ FPS}$ and 3D interactions never stutter.
* **Zero Telemetry:** No Google Analytics, no Sentry, no external font CDNs that track IP addresses (all fonts bundled locally or loaded via privacy-preserving rules).
* **Accessibility:** Full keyboard navigation, high-contrast stone/ink legibility (WCAG AA+ compliance), and reduced-motion fallback for 3D animations.