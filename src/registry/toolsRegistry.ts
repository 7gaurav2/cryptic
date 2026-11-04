import type { ToolDefinition } from '../types/tool.types';
import { PdfStudioTool } from '../tools/pdf-studio/PdfStudioTool';
import { ImageStudioTool } from '../tools/image-studio/ImageStudioTool';
import { CryptoVaultTool } from '../tools/crypto-vault/CryptoVaultTool';
import { IdWatermarkerTool } from '../tools/id-watermarker/IdWatermarkerTool';

export const TOOLS_REGISTRY: ToolDefinition[] = [
  {
    id: 'pdf-studio',
    serialNumber: 'MOD-01 // PDF',
    name: 'PDF Studio',
    tagline: 'Compress, Merge & Page Extraction Engine',
    description:
      'Real local binary PDF manipulation. Strip metadata, rasterize & compress bloated scans, combine multiple documents, or extract specific page ranges.',
    category: 'pdf',
    iconName: 'FileText',
    status: 'ready',
    component: PdfStudioTool,
    accentColor: '#C85A32', // Burnt Terracotta
    specs: ['pdf-lib + pdfjs-dist', 'Metadata Scrubbing', 'Adaptive DPI Resampling'],
  },
  {
    id: 'image-studio',
    serialNumber: 'MOD-02 // OPT',
    name: 'Image Studio',
    tagline: 'High-Efficiency Image Compressor & Format Converter',
    description:
      'Compress image files locally with instant WebP, JPEG, and PNG conversion and automatic camera/GPS EXIF metadata eradication. Zero cloud uploads.',
    category: 'optics',
    iconName: 'Sliders',
    status: 'ready',
    component: ImageStudioTool,
    accentColor: '#B8860B', // Warm Brass
    specs: ['WebP / JPEG / PNG', 'Lossless & Adaptive', '100% EXIF Eradication'],
  },
  {
    id: 'crypto-vault',
    serialNumber: 'MOD-03 // CRY',
    name: 'Crypto Vault',
    tagline: 'AES-256-GCM Zero-Knowledge File Locker',
    description:
      'Seal sensitive documents in encrypted .cryptic binary containers using native WebCrypto PBKDF2 (100k rounds) + authenticated AES-256-GCM cipher.',
    category: 'cryptography',
    iconName: 'Lock',
    status: 'ready',
    component: CryptoVaultTool,
    accentColor: '#3B6E5C', // Oxidized Sage
    specs: ['PBKDF2-SHA256 (100k)', 'AES-256-GCM Cipher', 'HMAC Auth Tag'],
  },
  {
    id: 'id-watermarker',
    serialNumber: 'MOD-04 // KYC',
    name: 'ID Watermarker',
    tagline: 'Protective KYC Cross-Hatch Watermarker',
    description:
      'Bake semi-transparent repeating diagonal watermarks into ID cards, passports, and utility bills to permanently prevent identity fraud and unauthorized reuse.',
    category: 'privacy',
    iconName: 'Stamp',
    status: 'beta',
    accentColor: '#C85A32', // Burnt Terracotta
    component: IdWatermarkerTool,
    specs: ['Canvas Pixel Matrix', 'Anti-Fraud Overlay', 'Zero Network Footprint'],
  },
];

export const getToolById = (id: string): ToolDefinition | undefined => {
  return TOOLS_REGISTRY.find(t => t.id === id);
};
