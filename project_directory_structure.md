# Project Directory & File Structure (`STRUCTURE.md`)

```text
cryptic/
├── index.html                        # Strict CSP headers + Local Fonts + Title
├── package.json                      # Dependencies (react, three, pdf-lib, lucide-react)
├── vite.config.ts                    # Vite bundler + PWA Service Worker config
├── tailwind.config.js                # Custom Tactile Luxury theme tokens
└── src/
    ├── main.tsx                      # Application entry point
    ├── App.tsx                       # Master Workbench Shell, Telemetry Bar & View Router
    ├── index.css                     # CSS Variables, 3D perspective utilities, tactile shadows
    │
    ├── types/
    │   └── tool.types.ts             # Unified interfaces for Tools, Telemetry, & Memory Manager
    │
    ├── registry/
    │   └── toolsRegistry.ts          # Single source of truth for all current & future tools
    │
    ├── services/
    │   ├── memoryManager.ts          # Tracks & purges Blob URLs and Uint8Array buffers
    │   ├── exifParser.ts             # Pure binary DataView parser to inspect GPS/Camera EXIF
    │   └── cryptoEngine.ts           # Native WebCrypto PBKDF2 + AES-256-GCM implementation
    │
    ├── components/
    │   ├── layout/
    │   │   ├── TopTelemetryBar.tsx   # Air-Gap indicator, RAM counter, Purge RAM switch
    │   │   ├── BottomStatusRail.tsx  # Live cryptographic & local execution log
    │   │   └── HardwareGrid.tsx      # Exposed 1px technical grid wrapper
    │   │
    │   ├── three/
    │   │   ├── VaultCore3D.tsx       # Interactive 3D Three.js/WebGL Gyroscopic Vault Artifact
    │   │   └── TiltCartridge.tsx     # 3D perspective physics wrapper for Tool Cards
    │   │
    │   └── ui/
    │       ├── TactileDropzone.tsx   # Recessed scanner-bed file intake slot
    │       ├── MechanicalButton.tsx  # Industrial push-button with physical active state
    │       └── TelemetryComparison.tsx # Before/After byte savings & privacy badge display
    │
    └── tools/
        ├── pdf-studio/
        │   └── PdfStudioTool.tsx     # Tool 01: Local PDF Compress, Merge & Page Extractor
        ├── exif-scrubber/
        │   └── ExifScrubberTool.tsx  # Tool 02: Binary EXIF Inspector, Scrubber & Image Optimizer
        ├── crypto-vault/
        │   └── CryptoVaultTool.tsx   # Tool 03: AES-256-GCM Zero-Knowledge File Locker
        └── id-watermarker/           # [Future Ready Slot / Included Bonus]
            └── IdWatermarkerTool.tsx # Tool 04: Protective KYC Cross-Hatch ID Watermarker
```