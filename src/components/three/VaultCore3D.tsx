import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { VaultCoreState } from '../../types/tool.types';

interface VaultCore3DProps {
  state?: VaultCoreState;
  progress?: number; // 0 to 100
  className?: string;
}

/**
 * 3D Hardware Security Microchip (Cryptic Local Enclave Processor)
 * 
 * Features:
 * - Dark Obsidian Silicon Die Substrate with chamfered bevels
 * - 32 Gold Contact Pins along all 4 perimeter edges
 * - Brushed Titanium Integrated Heat Spreader with laser-etched grooving
 * - Raised 3D Gold Shield Security Emblem at the center
 * - Surface SMD Ceramic Capacitors & Pulsing Crimson Circuit Traces
 * - Isometric Parallax Tilt & Realtime Computation Lighting
 */
export const VaultCore3D: React.FC<VaultCore3DProps> = ({
  state = 'idle',
  progress = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  const progressRef = useRef(progress);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  stateRef.current = state;
  progressRef.current = progress;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xf8f6f0, 1.5);
    scene.add(ambientLight);

    // Warm Key Light (Glancing highlights across gold pins and silicon facets)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
    keyLight.position.set(6, 8, 7);
    scene.add(keyLight);

    // Cool Fill Light for metallic contrast
    const fillLight = new THREE.DirectionalLight(0xdbe6f2, 1.2);
    fillLight.position.set(-6, -4, -3);
    scene.add(fillLight);

    // Crimson Security Enclave Glow
    const crimsonGlow = new THREE.PointLight(0xd21319, 4.0, 10);
    crimsonGlow.position.set(0, 0, 1.8);
    scene.add(crimsonGlow);

    // Master Group (Tilted in isometric aesthetic)
    const masterGroup = new THREE.Group();
    masterGroup.rotation.x = 0.52;
    masterGroup.rotation.y = -0.42;
    scene.add(masterGroup);

    // =========================================================================
    // MATERIALS: CRYPTIC CRIMSON RED & GUNMETAL TITANIUM
    // =========================================================================
    // 1. Bold Cryptic Crimson Red Substrate Board (#A81419)
    const siliconMat = new THREE.MeshStandardMaterial({
      color: 0xa81419,
      roughness: 0.32,
      metalness: 0.65,
    });

    // 2. Polished Gunmetal Titanium (Contact Pins & Leads) (#222A38)
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x222a38,
      roughness: 0.22,
      metalness: 0.96,
    });

    // 3. Deep Obsidian/Gunmetal Heat Spreader Cap (#131722)
    const heatSpreaderMat = new THREE.MeshStandardMaterial({
      color: 0x131722,
      roughness: 0.38,
      metalness: 0.92,
    });

    // 4. Titanium Bevel Frame & Shield (#2A3345)
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x2a3345,
      roughness: 0.25,
      metalness: 0.94,
    });

    // 5. Dark Ceramic Capacitor Blocks
    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0x252b36,
      roughness: 0.55,
      metalness: 0.3,
    });

    // 6. Glowing Crimson Circuit Trace Laser
    const circuitGlowMat = new THREE.MeshStandardMaterial({
      color: 0xff3838,
      emissive: 0xd21319,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.5,
    });

    // 7. Dark Chrome Bus Line Mat
    const busLineMat = new THREE.MeshStandardMaterial({
      color: 0x3d4659,
      roughness: 0.3,
      metalness: 0.92,
    });

    // =========================================================================
    // 1. SILICON SUBSTRATE BOARD (Main Chip Base)
    // =========================================================================
    const chipBaseGroup = new THREE.Group();
    masterGroup.add(chipBaseGroup);

    // Main Square Silicon Slab in Bold Crimson Red
    const slabGeo = new THREE.BoxGeometry(2.6, 2.6, 0.22);
    const slabMesh = new THREE.Mesh(slabGeo, siliconMat);
    chipBaseGroup.add(slabMesh);

    // Gunmetal Pin Index Marker Notch (Top Left Corner of Chip)
    const notchGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.24, 16);
    const notchMesh = new THREE.Mesh(notchGeo, pinMat);
    notchMesh.position.set(-1.1, 1.1, 0.01);
    chipBaseGroup.add(notchMesh);

    // =========================================================================
    // 2. PERIMETER GOLD CONTACT PINS (32 Precision Leads)
    // =========================================================================
    const pinsGroup = new THREE.Group();
    masterGroup.add(pinsGroup);

    const pinWidth = 0.08;
    const pinLength = 0.28;
    const pinThick = 0.04;
    const pinGeo = new THREE.BoxGeometry(pinWidth, pinLength, pinThick);

    const pinsPerSide = 8;
    const spacing = 2.2 / (pinsPerSide - 1);
    const halfWidth = 1.3 + pinLength / 2;

    for (let i = 0; i < pinsPerSide; i++) {
      const offset = -1.1 + i * spacing;

      // Top Side
      const topPin = new THREE.Mesh(pinGeo, pinMat);
      topPin.position.set(offset, halfWidth, 0);
      pinsGroup.add(topPin);

      // Bottom Side
      const btmPin = new THREE.Mesh(pinGeo, pinMat);
      btmPin.position.set(offset, -halfWidth, 0);
      pinsGroup.add(btmPin);

      // Left Side
      const leftPin = new THREE.Mesh(pinGeo, pinMat);
      leftPin.position.set(-halfWidth, offset, 0);
      leftPin.rotation.z = Math.PI / 2;
      pinsGroup.add(leftPin);

      // Right Side
      const rightPin = new THREE.Mesh(pinGeo, pinMat);
      rightPin.position.set(halfWidth, offset, 0);
      rightPin.rotation.z = Math.PI / 2;
      pinsGroup.add(rightPin);
    }

    // =========================================================================
    // 3. INTEGRATED HEAT SPREADER (Metallic Center Cap)
    // =========================================================================
    const capGroup = new THREE.Group();
    masterGroup.add(capGroup);

    // Raised metallic core
    const capGeo = new THREE.BoxGeometry(1.7, 1.7, 0.12);
    const capMesh = new THREE.Mesh(capGeo, heatSpreaderMat);
    capMesh.position.set(0, 0, 0.16);
    capGroup.add(capMesh);

    // Recessed border bevel frame in Gunmetal Titanium
    const frameGeo = new THREE.BoxGeometry(1.82, 1.82, 0.04);
    const frameMesh = new THREE.Mesh(frameGeo, titaniumMat);
    frameMesh.position.set(0, 0, 0.12);
    capGroup.add(frameMesh);

    // =========================================================================
    // 4. EMBOSSED 3D SECURITY SHIELD CREST & CORE
    // =========================================================================
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(0, 0, 0.23);
    masterGroup.add(shieldGroup);

    // Shield Emblem Geometry: Upper curved plate + Lower tapered point in Titanium
    const upperShieldGeo = new THREE.BoxGeometry(0.58, 0.38, 0.06);
    const upperShield = new THREE.Mesh(upperShieldGeo, titaniumMat);
    upperShield.position.set(0, 0.1, 0);
    shieldGroup.add(upperShield);

    // Lower pointed tip
    const lowerTipGeo = new THREE.ConeGeometry(0.29, 0.42, 3);
    const lowerTip = new THREE.Mesh(lowerTipGeo, titaniumMat);
    lowerTip.position.set(0, -0.19, 0);
    lowerTip.rotation.z = Math.PI;
    shieldGroup.add(lowerTip);

    // Center pulsating crimson security diode
    const diodeGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const diodeMesh = new THREE.Mesh(diodeGeo, circuitGlowMat);
    diodeMesh.position.set(0, 0, 0.04);
    shieldGroup.add(diodeMesh);

    // =========================================================================
    // 5. GLOWING BUS TRACES & CAPACITOR CLUSTERS
    // =========================================================================
    const circuitsGroup = new THREE.Group();
    circuitsGroup.position.set(0, 0, 0.12);
    masterGroup.add(circuitsGroup);

    // Etched circuit trace segments
    const traces: THREE.Mesh[] = [];
    const traceDefs = [
      // Top traces
      [-0.6, 1.05, 0.04, 0.35],
      [0, 1.05, 0.04, 0.35],
      [0.6, 1.05, 0.04, 0.35],
      // Bottom traces
      [-0.6, -1.05, 0.04, 0.35],
      [0, -1.05, 0.04, 0.35],
      [0.6, -1.05, 0.04, 0.35],
      // Left traces
      [-1.05, -0.5, 0.35, 0.04],
      [-1.05, 0.5, 0.35, 0.04],
      // Right traces
      [1.05, -0.5, 0.35, 0.04],
      [1.05, 0.5, 0.35, 0.04],
    ];

    traceDefs.forEach(([x, y, w, h], idx) => {
      const tGeo = new THREE.BoxGeometry(w, h, 0.02);
      const isCrimson = idx % 2 === 0;
      const tMesh = new THREE.Mesh(tGeo, isCrimson ? circuitGlowMat : busLineMat);
      tMesh.position.set(x, y, 0);
      circuitsGroup.add(tMesh);
      if (isCrimson) traces.push(tMesh);
    });

    // Surface SMD Ceramic Capacitors (4 pairs at the corners)
    const capSmdGeo = new THREE.BoxGeometry(0.12, 0.07, 0.05);
    const capOffsets = [
      [-0.95, 0.95],
      [0.95, 0.95],
      [-0.95, -0.95],
      [0.95, -0.95],
    ];
    capOffsets.forEach(([x, y]) => {
      const cap1 = new THREE.Mesh(capSmdGeo, ceramicMat);
      cap1.position.set(x, y, 0.13);
      masterGroup.add(cap1);

      const cap2 = new THREE.Mesh(capSmdGeo, ceramicMat);
      cap2.position.set(x, y + 0.1, 0.13);
      masterGroup.add(cap2);
    });

    // =========================================================================
    // MOUSE PARALLAX TRACKING
    // =========================================================================
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.45;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Responsive Canvas Resizing
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // =========================================================================
    // ANIMATION & KINETIC PHYSICS LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentProgress = progressRef.current;

      // Parallax smooth interpolation (lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      // Base isometric tilt + mouse parallax
      masterGroup.rotation.x = 0.52 - mouseRef.current.y * 0.55;
      masterGroup.rotation.y = -0.42 + mouseRef.current.x * 0.65;

      // Gentle floating levitation
      masterGroup.position.y = Math.sin(elapsed * 1.8) * 0.07;

      // Center Diode Pulse
      const diodePulse = 1.0 + Math.sin(elapsed * 4.0) * 0.22;
      diodeMesh.scale.set(diodePulse, diodePulse, diodePulse);

      // Crimson Light Intensity Breathing
      crimsonGlow.intensity = 3.5 + Math.sin(elapsed * 3.5) * 1.5;

      // State-Driven Chip Logic
      if (currentState === 'idle') {
        // Slow subtle circuit shimmer
        traces.forEach((tr, i) => {
          const shift = Math.sin(elapsed * 3.0 + i) * 0.3;
          (tr.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.6 + shift;
        });
      } else if (currentState === 'file-hover') {
        // Elevate and orient toward user
        masterGroup.position.z = Math.min(masterGroup.position.z + 0.02, 0.3);
        crimsonGlow.intensity = 6.0;

        traces.forEach(tr => {
          (tr.material as THREE.MeshStandardMaterial).emissiveIntensity = 3.0;
        });
      } else if (currentState === 'processing') {
        // Fast processing data bus ripple
        const speed = 6.0 + (currentProgress / 100) * 10.0;
        traces.forEach((tr, i) => {
          const active = Math.sin(elapsed * speed + i * 1.5) > 0 ? 3.8 : 0.8;
          (tr.material as THREE.MeshStandardMaterial).emissiveIntensity = active;
        });

        // Subtle micro-vibration under heavy WASM computation
        masterGroup.position.x = (Math.random() - 0.5) * 0.015;
      } else if (currentState === 'complete') {
        masterGroup.position.z += (0 - masterGroup.position.z) * 0.1;
        masterGroup.position.x = 0;
        crimsonGlow.intensity = 4.0;
      }

      renderer.render(scene, camera);
    };

    animate();

    // =========================================================================
    // CLEANUP DISPOSAL
    // =========================================================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      slabGeo.dispose();
      notchGeo.dispose();
      pinGeo.dispose();
      capGeo.dispose();
      frameGeo.dispose();
      upperShieldGeo.dispose();
      lowerTipGeo.dispose();
      diodeGeo.dispose();
      capSmdGeo.dispose();
      siliconMat.dispose();
      pinMat.dispose();
      titaniumMat.dispose();
      heatSpreaderMat.dispose();
      ceramicMat.dispose();
      circuitGlowMat.dispose();
      busLineMat.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{ minHeight: '260px' }}
      aria-label="3D Hardware Security Microchip"
    />
  );
};
