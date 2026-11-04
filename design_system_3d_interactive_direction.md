# Design System & 3D Aesthetic Specification (`DESIGN.md`)
**Design Persona:** *Tactile Industrial Luxury* (Inspired by Teenage Engineering, Dieter Rams' Braun, and Leica Camera UI)

---

## 1. Anti-Cliché Mandate (Strict Prohibitions)
To ensure this product feels like a bespoke $500 physical hardware instrument rather than a generic AI-generated template, the coding agent **MUST STRICTLY AVOID**:
* **NO** pitch-black (`#000000`) or generic slate-blue (`#0f172a`) dark themes.
* **NO** sterile, blinding pure-white (`#ffffff`) backgrounds.
* **NO** neon cyberpunk colors (no neon purple, cyan, magenta, or glowing green gradients).
* **NO** generic glowing glassmorphism blobs floating in the background.

---

## 2. Color Palette: "Warm Anodized Stone & Obsidian Ink"
The interface uses a mid-tone tactile palette modeled after bead-blasted aluminum, warm archival paper, and matte carbon keys.

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#EAE6DF` | Primary app background (Warm Alabaster / Travertine Stone) |
| `--bg-surface` | `#F4F1EA` | Elevated card & module surface (Natural Unbleached Vellum) |
| `--bg-recessed` | `#DDD8CE` | Recessed dropzones, mechanical slots, and toggle wells |
| `--bg-chassis-dark` | `#232220` | Secondary high-contrast module (Matte Anodized Charcoal) |
| `--text-primary` | `#1C1B19` | Primary typography (Deep Carbon Ink) |
| `--text-secondary` | `#5C5852` | Technical labels, subtitles, and metadata |
| `--text-muted` | `#8C867E` | Disabled states, grid coordinates, and serial numbers |
| `--accent-primary` | `#C85A32` | Primary mechanical action button (Muted Burnt Terracotta / International Orange) |
| `--accent-sage` | `#3B6E5C` | Air-Gapped / Privacy Verified status indicator (Oxidized Forest Sage) |
| `--accent-amber` | `#B8860B` | Processing / Active Cryptographic computation indicator (Warm Brass) |
| `--border-hairline` | `#D0C9BD` | Crisp $1\text{px}$ structural dividers and exposed technical grid lines |
| `--shadow-tactile` | `rgba(28, 27, 25, 0.08)` | Soft ambient physical elevation shadow |

---

## 3. Typography System
Pair an authoritative editorial/grotesque header font with a razor-sharp technical monospace for file sizes, cryptographic hashes, and serial numbers.

* **Display & UI Headings:** `'Space Grotesk'` or `'Plus Jakarta Sans'` (Weights: `500`, `600`, `700`). Tight tracking (`-0.03em`).
* **Technical Data & Metrics:** `'JetBrains Mono'` or `'IBM Plex Mono'` (Weights: `400`, `500`). Used for byte counters, SHA-256 checksums, EXIF coordinates, and tool index numbers (`[MOD-01]`).

---

## 4. 3D Interactive & Spatial Architecture
Instead of a flat 2D web page, Cryptic behaves like an **Interactive 3D Hardware Workbench**.

### A. Interactive 3D Hero Artifact ("The Cryptographic Core")
* Placed in the upper workbench header or interactive inspector panel using **Three.js / React Three Fiber** (or a hardware-accelerated 3D Canvas/WebGL shader if lightweight mode is needed).
* **Visual Form:** A precision-machined, matte-charcoal and brushed-brass gyroscope / geometric vault core sitting in warm studio lighting (soft directional shadows, subtle metallic roughness, zero neon glow).
* **Interactivity:**
  * Reacts smoothly to cursor movement via spring-physics parallax.
  * When a file is dragged into the app, the 3D Vault Core mechanically rotates and opens its outer rings.
  * During active compression or AES-256 encryption, the core spins at high velocity according to real-time progress percentage, then locks shut with a crisp visual snap when completed.

### B. 3D Perspective Tilt Tool Cards (Spring Physics)
* Each tool card on the Hub Grid is a physical "Hardware Cartridge" with a `1000px` CSS 3D perspective container.
* Moving the cursor across a card calculates real-time rotational vectors (`rotateX`, `rotateY`) with a subtle dynamic specular light sheen across the anodized surface.
* Cards feature exposed corner screw-head micro-graphics (`+`), a stamped serial number (`SYS-01 // PDF`), and a tactile mechanical depression effect (`translateY(2px)`) when clicked.

### C. Tactile Dropzone ("The Magnetic Intake Slot")
* Designed like a recessed physical scanner bed (`--bg-recessed`) with chamfered inner shadows (`box-shadow: inset 0 2px 6px rgba(0,0,0,0.08)`), technical registration marks at all four corners, and animated mechanical hatch lines when hovering with a file.

---

## 5. Layout & Exposed Technical Grid
* **Visible Blueprint Hairlines:** The layout uses an exposed $1\text{px}$ solid `--border-hairline` architectural grid that divides the viewport into a precision instrument panel:
  * **Top Telemetry Bar:** Brand mark, Live Network/Air-Gap Hardware Switch, Session Memory Usage Counter, and `"PURGE RAM"` physical button.
  * **Left/Main Workbench:** Either the 3D Cartridge Grid (Hub View) or the active Tool Studio with split-pane "Input Inspection" vs. "Processed Output Telemetry".
  * **Bottom Status Rail:** Live local cryptographic log (e.g., `[12:04:01] WebCrypto Subtle Engine Initialized — 0 External Requests`).