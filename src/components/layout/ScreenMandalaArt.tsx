import React from 'react';

interface ScreenMandalaArtProps {
  toolId: string | null;
}

export const ScreenMandalaArt: React.FC<ScreenMandalaArtProps> = ({ toolId }) => {
  if (!toolId) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none">
      {/* 1. Global Sacred Blueprint Grid & Technical Calibrations (Fills the void with fine engineering depth) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.14] dark:opacity-[0.18] text-[#222938] dark:text-[#94A3B8] stroke-current pointer-events-none"
        fill="none"
      >
        <defs>
          <pattern id="sacred-blueprint-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="0.75" fill="currentColor" opacity="0.6" />
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sacred-blueprint-grid)" />

        {/* Center Framing Orbital Horizon */}
        <circle cx="50%" cy="48%" r="460" strokeWidth="0.8" strokeDasharray="6 8" opacity="0.7" />
        <circle cx="50%" cy="48%" r="620" strokeWidth="0.6" strokeDasharray="3 6" opacity="0.5" />
        <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4" />
        <line x1="0" y1="48%" x2="100%" y2="48%" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4" />
      </svg>

      {/* 2. Ambient Soft Lighting Halos */}
      <div className="absolute -top-24 right-4 w-[750px] h-[750px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(17,24,39,0.05)_0%,rgba(210,19,25,0.03)_50%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_75%)] blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 left-4 w-[650px] h-[650px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(17,24,39,0.04)_0%,transparent_75%)] blur-2xl pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* 1. PDF STUDIO: METATRON'S CUBE & HEXAGONAL VECTOR GEOMETRY   */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'pdf-studio' && (
        <>
          {/* Top-Right: Balanced 820px Metatron's Cube */}
          <svg
            className="absolute -top-20 -right-8 w-[820px] h-[820px] opacity-[0.22] dark:opacity-[0.26] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none transition-opacity duration-500"
            fill="none"
            viewBox="0 0 800 800"
          >
            <circle cx="400" cy="400" r="380" strokeWidth="1.4" strokeDasharray="5 7" />
            <circle cx="400" cy="400" r="350" strokeWidth="1.8" />
            <circle cx="400" cy="400" r="280" strokeWidth="1.2" />
            <circle cx="400" cy="400" r="220" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="110" strokeWidth="1.6" />
            <circle cx="400" cy="400" r="45" strokeWidth="1.8" />

            <polygon
              points="400,50 703,225 703,575 400,750 97,575 97,225"
              strokeWidth="1.6"
              opacity="0.9"
            />
            <polygon
              points="400,110 651,255 651,545 400,690 149,545 149,255"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              opacity="0.8"
            />

            <g strokeWidth="1.0" opacity="0.85">
              <line x1="400" y1="50" x2="400" y2="750" />
              <line x1="97" y1="225" x2="703" y2="575" />
              <line x1="97" y1="575" x2="703" y2="225" />
              <line x1="400" y1="50" x2="97" y2="575" />
              <line x1="400" y1="50" x2="703" y2="575" />
              <line x1="400" y1="750" x2="97" y2="225" />
              <line x1="400" y1="750" x2="703" y2="225" />
              <line x1="97" y1="225" x2="703" y2="225" />
              <line x1="97" y1="575" x2="703" y2="575" />
              <line x1="400" y1="110" x2="400" y2="690" />
              <line x1="149" y1="255" x2="651" y2="545" />
              <line x1="149" y1="545" x2="651" y2="255" />
            </g>

            <g strokeWidth="1.4" opacity="0.9">
              <circle cx="400" cy="400" r="50" />
              <circle cx="400" cy="227" r="50" />
              <circle cx="400" cy="573" r="50" />
              <circle cx="250" cy="313" r="50" />
              <circle cx="550" cy="313" r="50" />
              <circle cx="250" cy="487" r="50" />
              <circle cx="550" cy="487" r="50" />
              <circle cx="400" cy="113" r="50" />
              <circle cx="400" cy="687" r="50" />
              <circle cx="150" cy="256" r="50" />
              <circle cx="650" cy="256" r="50" />
              <circle cx="150" cy="544" r="50" />
              <circle cx="650" cy="544" r="50" />
            </g>

            <g stroke="#D21319" strokeWidth="1.4" opacity="0.5">
              <polygon points="400,113 550,487 250,487" />
              <polygon points="400,687 550,313 250,313" />
              <circle cx="400" cy="400" r="28" strokeWidth="1.6" />
            </g>
          </svg>

          {/* Bottom-Left: Balanced 620px Hexagonal Lattice */}
          <svg
            className="absolute -bottom-20 -left-12 w-[620px] h-[620px] opacity-[0.18] dark:opacity-[0.22] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none"
            fill="none"
            viewBox="0 0 600 600"
          >
            <circle cx="300" cy="300" r="285" strokeWidth="1.5" strokeDasharray="4 6" />
            <circle cx="300" cy="300" r="230" strokeWidth="1.8" />
            <circle cx="300" cy="300" r="140" strokeWidth="1.3" />
            <polygon points="300,30 534,165 534,435 300,570 66,435 66,165" strokeWidth="1.4" />
            <polygon points="300,90 482,195 482,405 300,510 118,405 118,195" strokeWidth="1.0" strokeDasharray="5 5" />
            <g stroke="#D21319" strokeWidth="1.2" opacity="0.45">
              <polygon points="300,90 482,405 118,405" />
              <polygon points="300,510 482,195 118,195" />
            </g>
          </svg>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. IMAGE STUDIO: FLOWER OF LIFE & GOLDEN SPIRAL ROSETTE      */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'image-studio' && (
        <>
          {/* Top-Right: Balanced 840px Flower of Life */}
          <svg
            className="absolute -top-20 -right-8 w-[840px] h-[840px] opacity-[0.22] dark:opacity-[0.26] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none transition-opacity duration-500"
            fill="none"
            viewBox="0 0 800 800"
          >
            <circle cx="400" cy="400" r="385" strokeWidth="1.8" />
            <circle cx="400" cy="400" r="372" strokeWidth="1.2" strokeDasharray="4 5" />
            <circle cx="400" cy="400" r="335" strokeWidth="1.5" />

            <g strokeWidth="1.4" opacity="0.9">
              <circle cx="400" cy="400" r="125" />
              <circle cx="400" cy="275" r="125" />
              <circle cx="508" cy="337" r="125" />
              <circle cx="508" cy="463" r="125" />
              <circle cx="400" cy="525" r="125" />
              <circle cx="292" cy="463" r="125" />
              <circle cx="292" cy="337" r="125" />
              <circle cx="400" cy="150" r="125" />
              <circle cx="508" cy="212" r="125" />
              <circle cx="616" cy="275" r="125" />
              <circle cx="616" cy="400" r="125" />
              <circle cx="616" cy="525" r="125" />
              <circle cx="508" cy="587" r="125" />
              <circle cx="400" cy="650" r="125" />
              <circle cx="292" cy="587" r="125" />
              <circle cx="184" cy="525" r="125" />
              <circle cx="184" cy="400" r="125" />
              <circle cx="184" cy="275" r="125" />
              <circle cx="292" cy="212" r="125" />
            </g>

            <g stroke="#D21319" strokeWidth="1.5" opacity="0.5">
              <circle cx="400" cy="400" r="125" />
              <circle cx="400" cy="400" r="62" strokeWidth="1.6" />
            </g>

            <g strokeWidth="1.0" opacity="0.75" strokeDasharray="5 7">
              <line x1="400" y1="15" x2="400" y2="785" />
              <line x1="15" y1="400" x2="785" y2="400" />
              <line x1="128" y1="128" x2="672" y2="672" />
              <line x1="128" y1="672" x2="672" y2="128" />
            </g>
          </svg>

          {/* Bottom-Left: Balanced 620px Golden Ratio Spiral */}
          <svg
            className="absolute -bottom-20 -left-12 w-[620px] h-[620px] opacity-[0.18] dark:opacity-[0.22] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none"
            fill="none"
            viewBox="0 0 600 600"
          >
            <circle cx="300" cy="300" r="285" strokeWidth="1.5" />
            <circle cx="300" cy="300" r="215" strokeWidth="1.0" strokeDasharray="4 4" />
            <circle cx="300" cy="300" r="145" strokeWidth="1.3" />
            <circle cx="300" cy="300" r="75" strokeWidth="1.2" />
            <path
              d="M 300,300 A 75,75 0 0,1 375,300 A 150,150 0 0,1 225,300 A 225,225 0 0,1 450,300 A 300,300 0 0,1 150,300"
              strokeWidth="1.8"
            />
            <path
              d="M 300,300 A 75,75 0 0,0 225,300 A 150,150 0 0,0 375,300 A 225,225 0 0,0 150,300"
              stroke="#D21319"
              strokeWidth="1.4"
              opacity="0.45"
            />
          </svg>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. CRYPTO VAULT: 4D TESSERACT & CRYPTOGRAPHIC OCTAGRAM       */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'crypto-vault' && (
        <>
          {/* Top-Right: Balanced 820px Octagram & Tesseract */}
          <svg
            className="absolute -top-20 -right-8 w-[820px] h-[820px] opacity-[0.22] dark:opacity-[0.26] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none transition-opacity duration-500"
            fill="none"
            viewBox="0 0 800 800"
          >
            <circle cx="400" cy="400" r="385" strokeWidth="1.4" strokeDasharray="3 7" />
            <circle cx="400" cy="400" r="355" strokeWidth="1.8" />
            <circle cx="400" cy="400" r="295" strokeWidth="1.3" />
            <circle cx="400" cy="400" r="195" strokeWidth="1.5" strokeDasharray="6 5" />
            <circle cx="400" cy="400" r="95" strokeWidth="1.6" />

            <polygon
              points="400,70 730,400 400,730 70,400"
              strokeWidth="1.6"
              opacity="0.9"
            />
            <polygon
              points="166,166 634,166 634,634 166,634"
              strokeWidth="1.6"
              opacity="0.9"
            />

            <polygon
              points="400,185 615,400 400,615 185,400"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <polygon
              points="248,248 552,248 552,552 248,552"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.8"
            />

            <rect x="305" y="305" width="190" height="190" strokeWidth="1.5" />
            <line x1="166" y1="166" x2="305" y2="305" strokeWidth="1.2" />
            <line x1="634" y1="166" x2="495" y2="305" strokeWidth="1.2" />
            <line x1="634" y1="634" x2="495" y2="495" strokeWidth="1.2" />
            <line x1="166" y1="634" x2="305" y2="495" strokeWidth="1.2" />

            <g stroke="#D21319" strokeWidth="1.4" opacity="0.5">
              <polygon points="400,185 552,248 615,400 552,552 400,615 248,552 185,400 248,248" />
              <circle cx="400" cy="400" r="42" strokeWidth="1.5" />
            </g>

            <g strokeWidth="1.0" opacity="0.75">
              <line x1="400" y1="20" x2="400" y2="780" />
              <line x1="20" y1="400" x2="780" y2="400" />
              <line x1="130" y1="130" x2="670" y2="670" />
              <line x1="130" y1="670" x2="670" y2="130" />
            </g>
          </svg>

          {/* Bottom-Left: Balanced 620px Cryptographic Seal */}
          <svg
            className="absolute -bottom-20 -left-12 w-[620px] h-[620px] opacity-[0.18] dark:opacity-[0.22] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none"
            fill="none"
            viewBox="0 0 600 600"
          >
            <circle cx="300" cy="300" r="280" strokeWidth="1.6" />
            <circle cx="300" cy="300" r="245" strokeWidth="1.1" strokeDasharray="4 4" />
            <polygon points="300,50 550,300 300,550 50,300" strokeWidth="1.4" />
            <polygon points="123,123 477,123 477,477 123,477" strokeWidth="1.4" />
            <circle cx="300" cy="300" r="110" strokeWidth="1.4" />
            <circle cx="300" cy="300" r="50" stroke="#D21319" strokeWidth="1.3" opacity="0.45" />
          </svg>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ID WATERMARKER: SRI YANTRA & GUILLOCHÉ OFFICIAL SEAL       */}
      {/* ------------------------------------------------------------- */}
      {toolId === 'id-watermarker' && (
        <>
          {/* Top-Right: Balanced 820px Sri Yantra */}
          <svg
            className="absolute -top-20 -right-8 w-[820px] h-[820px] opacity-[0.22] dark:opacity-[0.26] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none transition-opacity duration-500"
            fill="none"
            viewBox="0 0 800 800"
          >
            <circle cx="400" cy="400" r="385" strokeWidth="1.8" />
            <circle cx="400" cy="400" r="360" strokeWidth="1.2" strokeDasharray="4 6" />
            <circle cx="400" cy="400" r="315" strokeWidth="1.5" />
            <circle cx="400" cy="400" r="285" strokeWidth="1.6" />

            <g strokeWidth="1.2" opacity="0.85">
              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map(
                (deg, i) => (
                  <ellipse
                    key={i}
                    cx="400"
                    cy="400"
                    rx="300"
                    ry="65"
                    transform={`rotate(${deg} 400 400)`}
                  />
                )
              )}
            </g>

            <g strokeWidth="1.5" opacity="0.9">
              <polygon points="400,150 600,530 200,530" />
              <polygon points="400,650 610,270 190,270" />
              <polygon points="400,200 570,500 230,500" />
              <polygon points="400,600 580,300 220,300" />
              <polygon points="400,250 540,470 260,470" />
              <polygon points="400,550 550,330 250,330" />
              <circle cx="400" cy="390" r="8" fill="#D21319" opacity="0.85" />
            </g>

            <g stroke="#D21319" strokeWidth="1.4" opacity="0.5">
              <polygon points="400,150 600,530 200,530" />
              <polygon points="400,650 610,270 190,270" />
            </g>

            <g strokeWidth="1.0" opacity="0.75" strokeDasharray="4 5">
              <line x1="400" y1="10" x2="400" y2="790" />
              <line x1="10" y1="400" x2="790" y2="400" />
            </g>
          </svg>

          {/* Bottom-Left: Balanced 620px Guilloché Seal */}
          <svg
            className="absolute -bottom-20 -left-12 w-[620px] h-[620px] opacity-[0.18] dark:opacity-[0.22] text-[#111827] dark:text-[#CBD5E1] stroke-current pointer-events-none"
            fill="none"
            viewBox="0 0 600 600"
          >
            <circle cx="300" cy="300" r="285" strokeWidth="1.6" />
            <circle cx="300" cy="300" r="235" strokeWidth="1.2" strokeDasharray="4 6" />
            <polygon points="300,70 510,430 90,430" strokeWidth="1.4" />
            <polygon points="300,530 520,170 80,170" strokeWidth="1.4" />
            <circle cx="300" cy="300" r="90" strokeWidth="1.4" />
            <circle cx="300" cy="300" r="45" stroke="#D21319" strokeWidth="1.3" opacity="0.45" />
          </svg>
        </>
      )}
    </div>
  );
};

export default ScreenMandalaArt;
