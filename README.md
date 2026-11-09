# 🛡️ Cryptic

**Local-First Privacy Workbench — Zero Cloud Uploads.**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)

Most web tools silently upload your sensitive bank statements, IDs, and private photos to remote servers. **Cryptic** executes every byte of compression, encryption, and watermarking right inside your local browser memory. Zero servers, zero storage, zero data leakage.

---

## ⚡ Tools

### 01 · PDF Studio
Shrink, compress, combine, and sanitize heavy PDF bank statements, tax forms, and documents.

### 02 · Image Studio
Compress JPG, PNG, and WebP images by up to 90% with instant EXIF camera and GPS metadata removal.

### 03 · Crypto Vault
Client-side password protection using authenticated **AES-256-GCM** + PBKDF2 (100k iterations).

### 04 · ID Watermarker
Apply protective forensic anti-fraud watermarks on Aadhaar, PAN, Passport, or ID scans before sharing.

---

## 🔒 Security

- **100% Client-Side**: No backend servers exist. Files never leave your device.
- **Air-Gapped Operation**: Functions completely offline once loaded.
- **Zero Retention**: All temporary buffers are scrubbed from browser memory upon navigation.

---

## 🛠️ Tech Stack

- **UI**: React 19, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js (Interactive WebGL Enclave Core)
- **Processing**: `pdf-lib`, `pdfjs-dist`, WebCrypto API (AES-GCM / PBKDF2)
- **Animation**: Custom GPU 2D Cel Wipe Canvas Engine

---

## 💻 Run Locally

```bash
# Clone repository
git clone https://github.com/7gaurav2/cryptic.git

# Enter directory
cd cryptic

# Install dependencies
npm install

# Start local server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---


