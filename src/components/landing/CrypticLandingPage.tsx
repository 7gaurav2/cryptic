import React from 'react';
import { VaultCore3D } from '../three/VaultCore3D';
import type { VaultCoreState } from '../../types/tool.types';

interface CrypticLandingPageProps {
  onSelectTool: (toolId: string, initialFiles?: File[]) => void;
  vaultState: VaultCoreState;
  vaultProgress: number;
}

export const CrypticLandingPage: React.FC<CrypticLandingPageProps> = ({
  onSelectTool,
  vaultState,
  vaultProgress,
}) => {

  return (
    <div className="relative w-full min-h-screen text-[#1F2937] select-none overflow-x-hidden">
      {/* SACRED GEOMETRY MANDALA WATERMARK OVERLAYS */}
      <div className="mandala-bg pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Top Right Sacred Geometry Mandala in mineral charcoal stroke */}
        <svg
          className="absolute -top-24 right-4 w-[920px] h-[920px] opacity-[0.14] text-[#222938] stroke-current pointer-events-none"
          fill="none"
          viewBox="0 0 800 800"
        >
          <circle cx="400" cy="400" r="385" strokeDasharray="6 8" strokeWidth="1.4" />
          <circle cx="400" cy="400" opacity="0.9" r="340" strokeWidth="1.8" />
          <circle cx="400" cy="400" r="280" strokeWidth="1.2" />
          <circle cx="400" cy="400" opacity="0.95" r="220" strokeDasharray="4 6" strokeWidth="1.8" />
          <circle cx="400" cy="400" r="160" strokeWidth="1.2" />
          <circle cx="400" cy="400" r="90" strokeWidth="1.8" />
          <g opacity="0.95" strokeWidth="1.6">
            <polygon points="400,80 480,260 676,200 560,340 720,400 560,460 676,600 480,540 400,720 320,540 124,600 240,460 80,400 240,340 124,200 320,260" />
            <polygon
              opacity="0.75"
              points="400,140 450,280 600,240 520,350 640,400 520,450 600,560 450,520 400,660 350,520 200,560 280,450 160,400 280,350 200,240 350,280"
            />
          </g>
          <g opacity="0.7" strokeWidth="1">
            <line x1="400" x2="400" y1="15" y2="785" />
            <line x1="15" x2="785" y1="400" y2="400" />
            <line x1="128" x2="672" y1="128" y2="672" />
            <line x1="128" x2="672" y1="672" y2="128" />
            <line x1="258" x2="542" y1="42" y2="758" />
            <line x1="42" x2="758" y1="258" y2="542" />
            <line x1="542" x2="258" y1="42" y2="758" />
            <line x1="758" x2="42" y1="258" y2="542" />
          </g>
          <g opacity="0.8" strokeWidth="1.4">
            <circle cx="400" cy="180" r="120" />
            <circle cx="400" cy="620" r="120" />
            <circle cx="180" cy="400" r="120" />
            <circle cx="620" cy="400" r="120" />
            <circle cx="244" cy="244" r="120" />
            <circle cx="556" cy="244" r="120" />
            <circle cx="244" cy="556" r="120" />
            <circle cx="556" cy="556" r="120" />
          </g>
        </svg>

        {/* Bottom Left Secondary Mandala */}
        <svg
          className="absolute -bottom-36 -left-28 w-[760px] h-[760px] opacity-[0.12] text-[#222938] stroke-current pointer-events-none"
          fill="none"
          viewBox="0 0 700 700"
        >
          <circle cx="350" cy="350" r="340" strokeDasharray="5 7" strokeWidth="1.5" />
          <circle cx="350" cy="350" r="280" strokeWidth="1.8" />
          <circle cx="350" cy="350" r="210" strokeWidth="1.2" />
          <circle cx="350" cy="350" r="140" strokeDasharray="3 5" strokeWidth="1.6" />
          <circle cx="350" cy="350" r="80" strokeWidth="1.8" />
          <g opacity="0.85" strokeWidth="1.5">
            <polygon points="350,70 420,240 590,200 480,310 630,350 480,390 590,500 420,460 350,630 280,460 110,500 220,390 70,350 220,310 110,200 280,240" />
          </g>
          <g opacity="0.65" strokeWidth="1">
            <line x1="350" x2="350" y1="10" y2="690" />
            <line x1="10" x2="690" y1="350" y2="350" />
            <line x1="110" x2="590" y1="110" y2="590" />
            <line x1="110" x2="590" y1="590" y2="110" />
          </g>
        </svg>

        {/* Ambient radiance glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-white/40 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-[#EF4444]/8 blur-[120px] pointer-events-none" />
      </div>

      {/* ROOT CONTAINER: 1440px DESKTOP ARCHITECTURAL GRID */}
      <div className="relative w-full max-w-[1440px] mx-auto min-h-screen flex flex-col border-x border-[#D3CEBF] z-10 bg-transparent">
        {/* 1. TOP ARCHITECTURAL HEADER WITH PERSISTENT CRYPTIC BRAND */}
        <header className="h-14 px-6 sm:px-8 border-b border-[#D3CEBF] flex items-center justify-between text-xs font-medium text-[#374151] select-none bg-[#E9E6DE]/85 backdrop-blur-sm">
          {/* Brand Logo & Name (Exact matching dimensions across entire app) */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#D5D0C3] flex items-center justify-center shadow-sm">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D21319] rotate-45 shadow-[0_0_6px_rgba(210,19,25,0.4)]" />
            </div>
            <span className="text-base font-bold tracking-[0.22em] text-[#111622] font-beyno leading-none">
              CRYPTIC
            </span>
          </div>

        </header>

        {/* 2. MAIN CANVAS POSTER LAYOUT */}
        <main className="flex-1 px-6 sm:px-8 pt-6 pb-28 flex flex-col gap-8">
          {/* UPPER HERO STAGE */}
          <section className="grid grid-cols-12 gap-8 items-center">
            {/* Left Column (7 cols) */}
            <div className="col-span-12 lg:col-span-7 flex flex-col justify-center pr-2">
              {/* Eyebrow Tag */}
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-[12px] text-[#D21319] font-bold tracking-[0.14em] inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D21319]/8 border border-[#D21319]/20 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D21319] animate-pulse" />
                  <span className="font-beyno">CRYPTIC ENGINE</span>
                </span>
              </div>

              {/* Giant Editorial Poster Headline */}
              <h1 className="font-poster text-[42px] sm:text-[52px] lg:text-[58px] leading-[1.04] text-[#111622] font-bold mb-4 tracking-tight drop-shadow-sm">
                Fix, shrink, and lock your files.{' '}
                <span className="text-[#D21319] block sm:inline">Without sending them to the internet.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#374151] leading-relaxed max-w-xl mb-6 font-normal">
                Most web tools silently upload your sensitive bank statements, IDs, and private photos to remote servers.
                Cryptic executes every byte of encryption, compression, and watermarking right inside your local browser memory.
              </p>

              {/* 3 Light Frosted Stone Trust Pills */}
              <div className="flex flex-wrap items-center gap-2.5 mb-7">
                <div className="bg-white/95 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1F2937] flex items-center gap-1.5 border border-[#D5D0C3] shadow-[0_2px_8px_rgba(20,20,30,0.04)]">
                  <span className="w-4 h-4 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Zero Cloud Uploads</span>
                </div>
                <div className="bg-white/95 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1F2937] flex items-center gap-1.5 border border-[#D5D0C3] shadow-[0_2px_8px_rgba(20,20,30,0.04)]">
                  <span className="w-4 h-4 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>100% Offline Engine</span>
                </div>
                <div className="bg-white/95 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1F2937] flex items-center gap-1.5 border border-[#D5D0C3] shadow-[0_2px_8px_rgba(20,20,30,0.04)]">
                  <span className="w-4 h-4 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Always Free &amp; Private</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    const el = document.getElementById('chambers-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else onSelectTool('pdf-studio');
                  }}
                  className="bg-[#14171F] hover:bg-[#1E232E] text-white px-8 py-3.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase inline-flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(20,23,31,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_28px_rgba(20,23,31,0.35)] active:translate-y-[1px] transition-all cursor-pointer group"
                >
                  <span>Explore Tools &amp; Chambers</span>
                  <span className="w-5 h-5 rounded-full bg-[#D21319] text-white flex items-center justify-center text-xs font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column (Sculptural Composition with Interactive 3D WebGL Vault Core) */}
            <div className="col-span-12 lg:col-span-5 relative flex items-center justify-center min-h-[380px]">
              {/* Soft Ambient Glows */}
              <div className="absolute w-80 h-80 rounded-full bg-[#D21319]/10 blur-3xl pointer-events-none" />
              <div className="absolute w-64 h-64 rounded-full bg-white/60 blur-2xl pointer-events-none" />

              {/* Sculptural Composition Container */}
              <div className="relative w-full max-w-[420px] h-[360px] flex items-center justify-center">
                {/* Cast-Stone Sculptural Sphere with Real 3D Gyroscope Inside */}
                <div
                  onClick={() => onSelectTool('crypto-vault')}
                  className="clay-sculpture absolute w-56 h-56 rounded-full -left-2 top-8 z-10 floating-piece overflow-hidden flex items-center justify-center cursor-pointer hover:scale-[1.03] transition-all"
                  title="Open Crypto Vault"
                >
                  <div className="w-full h-full rounded-full border border-white/70 flex items-center justify-center relative">
                    <div className="w-full h-full flex items-center justify-center absolute inset-0">
                      <VaultCore3D state={vaultState} progress={vaultProgress} />
                    </div>
                  </div>
                </div>

                {/* Clay Document Card */}
                <div
                  onClick={() => onSelectTool('pdf-studio')}
                  className="absolute right-6 top-4 z-10 w-52 bg-white rounded-2xl p-4 shadow-[0_16px_30px_rgba(30,35,45,0.14),inset_1px_1px_2px_rgba(255,255,255,0.95)] border border-[#E2DED5] floating-piece-alt transform rotate-6 cursor-pointer hover:rotate-3 hover:scale-105 transition-all"
                  title="Open PDF Studio"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D21319]" />
                      <span className="text-[10px] font-bold tracking-wider text-[#111622] font-mono-numbers">
                        DOCUMENT_ENCLAVE
                      </span>
                    </div>
                    <span className="text-[9px] font-mono-numbers text-[#6B7280] font-bold">
                      LOCAL
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-3/4 rounded-full bg-[#E5E1D8]" />
                    <div className="h-2 w-full rounded-full bg-[#EFECE6]" />
                    <div className="h-2 w-1/2 rounded-full bg-[#EFECE6]" />
                  </div>
                  <div className="mt-4 pt-2 flex items-center justify-between text-[10px] text-[#374151] font-mono-numbers font-medium">
                    <span>8.4 MB</span>
                    <span className="text-[#D21319] font-bold">CRYPTIC SEAL</span>
                  </div>
                </div>

                {/* Suspended Crimson Glass Shield */}
                <div
                  onClick={() => onSelectTool('crypto-vault')}
                  className="glass-shield-curved absolute z-20 w-64 h-72 rounded-3xl -right-2 bottom-2 p-5 flex flex-col justify-between transform -rotate-3 transition-all hover:rotate-0 hover:scale-105 duration-300 cursor-pointer"
                  title="Open Crypto Vault Enclave"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-white/25 text-white text-[9px] font-bold tracking-wider font-mono-numbers">
                      CRYPTIC-ISOLATED
                    </span>
                    <div className="w-3 h-3 rounded-full bg-white/50 border border-white/70" />
                  </div>

                  {/* Central Glass Refraction Badge */}
                  <div className="my-auto text-center py-4 bg-black/15 rounded-2xl border border-white/30 shadow-inner">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center shadow-inner">
                      <span className="w-3.5 h-3.5 rounded-xs bg-white rotate-45" />
                    </div>
                    <p className="text-white text-xs font-bold tracking-wide font-sans">
                      CRYPTIC ENCLAVE
                    </p>
                    <p className="text-white/90 text-[10px] font-medium font-sans">
                      Zero Cloud Leakage
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-white text-[10px] font-mono-numbers">
                    <span className="font-medium">STATUS: SECURE</span>
                    <span className="font-bold bg-black/20 px-1.5 py-0.5 rounded">100% LOCAL</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BALANCED 4-COLUMN HORIZONTAL TOOL CHAMBERS */}
          <section id="chambers-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {/* Card 01 — The PDF Tool */}
            <div
              onClick={() => onSelectTool('pdf-studio')}
              className="clay-surface flex flex-col justify-between overflow-hidden group hover:shadow-lg hover:border-[#D21319]/40 transition-all duration-200 cursor-pointer"
            >
              <div className="px-5 py-3.5 border-b border-[#E5E1D8] bg-[#FAF8F5]/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDD8CE] text-[10px] font-mono font-bold text-[#111622] shadow-[0_1px_2px_rgba(0,0,0,0.03)] group-hover:border-[#D21319]/40 group-hover:text-[#D21319] transition-all">
                    01
                  </span>
                  <span className="text-xs font-bold tracking-tight text-[#111622] font-sans">
                    PDF Chamber
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#D21319]/8 border border-[#D21319]/20 text-[#D21319]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D21319] animate-pulse" />
                  Popular
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#111622] mb-1.5 font-poster tracking-tight group-hover:text-[#D21319] transition-colors">
                    Compress &amp; Combine PDFs
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                    Shrink heavy bank statements, job resumes, and tax forms to easily fit email limits,
                    or merge separate pages into a single document.
                  </p>
                </div>

                {/* Visual Preview Box */}
                <div className="clay-recessed p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDD8CE] text-[9px] font-mono font-bold text-[#D21319] shadow-2xs flex-shrink-0">
                        PDF
                      </span>
                      <span className="text-xs font-bold text-[#111622] truncate">Statement.pdf</span>
                    </div>
                    <span className="clay-pill-crimson text-white text-[10px] font-bold font-mono-numbers px-2 py-0.5 rounded-md flex-shrink-0">
                      -93%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono-numbers text-[#555E6D]">
                    <span className="line-through text-[#6B7280]">14.2 MB</span>
                    <span className="text-xs text-[#D21319] font-bold">➔</span>
                    <span className="text-xs font-bold text-[#111622] bg-white border border-[#D5D1C7] px-2.5 py-0.5 rounded shadow-sm">
                      920 KB
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTool('pdf-studio');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl btn-stone-card text-xs font-bold text-[#111622] flex items-center justify-center gap-1.5 cursor-pointer group-hover:border-[#D21319]/40 transition-colors"
                >
                  <span>Open PDF Tool</span>
                  <span className="text-[#D21319] font-bold text-sm">→</span>
                </button>
              </div>
            </div>

            {/* Card 02 — The Photo Privacy Tool */}
            <div
              onClick={() => onSelectTool('image-studio')}
              className="clay-surface flex flex-col justify-between overflow-hidden group hover:shadow-lg hover:border-[#D21319]/40 transition-all duration-200 cursor-pointer"
            >
              <div className="px-5 py-3.5 border-b border-[#E5E1D8] bg-[#FAF8F5]/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDD8CE] text-[10px] font-mono font-bold text-[#111622] shadow-[0_1px_2px_rgba(0,0,0,0.03)] group-hover:border-[#D21319]/40 group-hover:text-[#D21319] transition-all">
                    02
                  </span>
                  <span className="text-xs font-bold tracking-tight text-[#111622] font-sans">
                    Image Studio
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white border border-[#DDD8CE] text-[#374151] shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Lossless
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#111622] mb-1.5 font-poster tracking-tight group-hover:text-[#D21319] transition-colors">
                    Compress Photos &amp; Images
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                    Shrink heavy JPG, PNG, and WebP photos by up to 90% without losing visual quality,
                    with instant EXIF metadata removal.
                  </p>
                </div>

                {/* Visual Preview Box */}
                <div className="clay-recessed p-3.5 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDD8CE] text-[9px] font-mono font-bold text-[#D21319] shadow-2xs flex-shrink-0">
                        IMG
                      </span>
                      <span className="text-xs font-bold text-[#111622] truncate">Photo_RAW.png</span>
                    </div>
                    <span className="clay-pill-crimson text-white text-[10px] font-bold font-mono-numbers px-2 py-0.5 rounded-md flex-shrink-0">
                      -88%
                    </span>
                  </div>

                  <div className="bg-white border border-[#D5D1C7] px-2 py-1 rounded flex items-center justify-between text-xs font-medium text-[#111622] shadow-sm">
                    <span className="flex items-center gap-1 text-[11px] font-mono-numbers text-[#4B5563]">
                      <span className="line-through text-[#6B7280]">7 MB</span>
                      <span className="text-[#D21319] font-bold">➔</span>
                      <span className="text-[#111622] font-bold">840 KB</span>
                    </span>
                    <span className="text-[9px] font-bold text-[#065F46] bg-[#059669]/10 px-1.5 py-0.5 rounded">
                      Compressed
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTool('image-studio');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl btn-stone-card text-xs font-bold text-[#111622] flex items-center justify-center gap-1.5 cursor-pointer group-hover:border-[#D21319]/40 transition-colors"
                >
                  <span>Compress Images</span>
                  <span className="text-[#D21319] font-bold text-sm">→</span>
                </button>
              </div>
            </div>

            {/* Card 03 — The File Locker */}
            <div
              onClick={() => onSelectTool('crypto-vault')}
              className="clay-surface flex flex-col justify-between overflow-hidden group hover:shadow-lg hover:border-[#D21319]/40 transition-all duration-200 cursor-pointer"
            >
              <div className="px-5 py-3.5 border-b border-[#E5E1D8] bg-[#FAF8F5]/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDD8CE] text-[10px] font-mono font-bold text-[#111622] shadow-[0_1px_2px_rgba(0,0,0,0.03)] group-hover:border-[#D21319]/40 group-hover:text-[#D21319] transition-all">
                    03
                  </span>
                  <span className="text-xs font-bold tracking-tight text-[#111622] font-sans">
                    Crypto Vault
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white border border-[#DDD8CE] text-[#374151] shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  AES-256
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#111622] mb-1.5 font-poster tracking-tight group-hover:text-[#D21319] transition-colors">
                    Lock Any File with Password
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                    Put an unbreakable password lock on your private documents, folders, or photos
                    before sending them over WhatsApp or Email.
                  </p>
                </div>

                {/* Visual Preview Box */}
                <div className="clay-recessed p-3.5 flex items-center justify-between">
                  <div className="font-mono-numbers text-xs text-[#111622] tracking-widest font-bold bg-white border border-[#D5D1C7] px-3 py-1.5 rounded-md shadow-sm">
                    ••••••••••••
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#C41E3A] bg-[#D21319]/10 border border-[#D21319]/25 px-2.5 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D21319]" />
                    <span>Protected</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTool('crypto-vault');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl btn-stone-card text-xs font-bold text-[#111622] flex items-center justify-center gap-1.5 cursor-pointer group-hover:border-[#D21319]/40 transition-colors"
                >
                  <span>Lock a File</span>
                  <span className="text-[#D21319] font-bold text-sm">→</span>
                </button>
              </div>
            </div>

            {/* Card 04 — Protective KYC Watermarker */}
            <div
              onClick={() => onSelectTool('id-watermarker')}
              className="clay-surface flex flex-col justify-between overflow-hidden group hover:shadow-lg hover:border-[#D21319]/40 transition-all duration-200 cursor-pointer"
            >
              <div className="px-5 py-3.5 border-b border-[#E5E1D8] bg-[#FAF8F5]/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-[#DDD8CE] text-[10px] font-mono font-bold text-[#111622] shadow-[0_1px_2px_rgba(0,0,0,0.03)] group-hover:border-[#D21319]/40 group-hover:text-[#D21319] transition-all">
                    04
                  </span>
                  <span className="text-xs font-bold tracking-tight text-[#111622] font-sans">
                    ID Watermarker
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-white border border-[#DDD8CE] text-[#374151] shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Anti-Fraud
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#111622] mb-1.5 font-poster tracking-tight group-hover:text-[#D21319] transition-colors">
                    Sanitize &amp; Stamp IDs
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-normal">
                    Overlay protective semi-transparent fraud watermarks on Aadhaar, PAN, Passport, or
                    license scans before sharing with vendors.
                  </p>
                </div>

                {/* Visual Preview Box */}
                <div className="clay-recessed p-3.5 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDD8CE] text-[9px] font-mono font-bold text-[#D21319] shadow-2xs flex-shrink-0">
                        KYC
                      </span>
                      <span className="text-xs font-bold text-[#111622] truncate">National_ID.jpg</span>
                    </div>
                    <span className="clay-pill-crimson text-white text-[10px] font-bold font-mono-numbers px-2 py-0.5 rounded-md flex-shrink-0">
                      Anti-Fraud
                    </span>
                  </div>

                  <div className="bg-white border border-[#D5D1C7] px-2 py-1 rounded text-center shadow-sm">
                    <span className="font-mono text-[9px] font-bold tracking-wider text-[#C41E3A] uppercase truncate block">
                      FOR KYC VERIFICATION ONLY
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTool('id-watermarker');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl btn-stone-card text-xs font-bold text-[#111622] flex items-center justify-center gap-1.5 cursor-pointer group-hover:border-[#D21319]/40 transition-colors"
                >
                  <span>Watermark ID</span>
                  <span className="text-[#D21319] font-bold text-sm">→</span>
                </button>
              </div>
            </div>
          </section>

          {/* 4. BOTTOM PROOF BAR */}
          <div className="bg-white/90 rounded-xl px-6 py-3.5 border border-[#D5D1C7] flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-[#111622] shadow-[0_4px_12px_rgba(40,44,52,0.04)] gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#D21319]" />
              <span className="font-bold tracking-wide text-xs">Zero Cloud Storage</span>
            </div>
            <div className="flex items-center gap-4 text-[#555E6D] text-[11px] font-medium font-mono-numbers">
              <span className="font-beyno tracking-[0.14em] text-[#111622] text-xs font-bold">CRYPTIC PRIVACY GUARANTEE</span>
              <span>•</span>
              <span>No Cookies</span>
              <span>•</span>
              <span className="font-bold text-[#059669]">100% Client-Side</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
