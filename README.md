# 🛡️ Cryptic — Local-First Privacy Workbench

> **Zero Cloud Uploads. 100% Client-Side In-Browser Processing.**

[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](LICENSE)
[![Built With](https://img.shields.io/badge/React%2019-Vite%20%7C%20Tailwind-blue?style=for-the-badge)](https://react.dev/)

Most web tools silently upload your sensitive bank statements, IDs, and private photos to remote cloud servers. **Cryptic** executes every byte of compression, encryption, and watermarking directly inside your browser memory using WebAssembly and WebCrypto — no remote servers, no cloud storage, and zero data leakage.

---

## ⚡ Available Tools

| Chamber | Tool | What it Does |
| :--- | :--- | :--- |
| **01** | **PDF Studio** | Shrink, compress, combine, and sanitize heavy PDF bank statements and tax forms. |
| **02** | **Image Studio** | Compress JPG, PNG, and WebP images by up to 90% with instant EXIF camera/GPS metadata scrubbing. |
| **03** | **Crypto Vault** | Unbreakable password protection using authenticated **AES-256-GCM** + PBKDF2 (100k rounds). |
| **04** | **ID Watermarker** | Overlay forensic anti-fraud watermarks on Aadhaar, PAN, Passport, or driver's license scans before sharing. |

---

## 🔒 Privacy & Security Architecture

- **100% Client-Side**: No backend servers exist. Files never leave your device.
- **Air-Gapped Operation**: Works completely offline without an internet connection once loaded.
- **Zero Retention**: All temporary buffers are scrubbed from browser memory upon navigation.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Tactile Claymorphism Design System
- **3D Graphics**: Three.js (WebGL Hardware Enclave Core)
- **Engines**: `pdf-lib`, `pdfjs-dist`, WebCrypto API (AES-GCM / PBKDF2)
- **Animations**: Custom GPU 2D Cel Wipe Canvas Engine

---

## 💻 Local Development

If you want to run this project locally:

```bash
# Clone the repository
git clone https://github.com/7gaurav2/cryptic.git

# Navigate to project folder
cd cryptic

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License

Distributed under the MIT License. Built with privacy in mind.
