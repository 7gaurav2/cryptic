import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getToolById } from './registry/toolsRegistry';
import type { VaultCoreState } from './types/tool.types';
import { TopTelemetryBar } from './components/layout/TopTelemetryBar';
import { HardwareGrid } from './components/layout/HardwareGrid';
import { CrypticLandingPage } from './components/landing/CrypticLandingPage';
import { AppleStyleDock } from './components/ui/AppleStyleDock';
import { ScreenMandalaArt } from './components/layout/ScreenMandalaArt';
import { MemoryManager } from './services/memoryManager';
import { CelWipeTransition, type CelWipeStage, type CelWipeMode } from './components/ui/CelWipeTransition';

export const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [vaultState, setVaultState] = useState<VaultCoreState>('idle');
  const [vaultProgress, setVaultProgress] = useState<number>(0);

  // 2D Hand-Drawn Cel Wipe Transition State (Chris Guyot Style)
  const [celWipeStage, setCelWipeStage] = useState<CelWipeStage>('idle');
  const [celWipeMode, setCelWipeMode] = useState<CelWipeMode>('full');
  const pendingNavRef = useRef<{ type: 'tool' | 'hub'; toolId?: string } | null>(null);
  const isNavigatingRef = useRef<boolean>(false);

  // Simplified Telemetry Logger for active tools
  const logTelemetry = useCallback(
    (message: string, level: 'info' | 'warn' | 'success' | 'alert' = 'info') => {
      console.log(`[${level.toUpperCase()}] ${message}`);
    },
    []
  );

  // Perform route swap at the exact 100% peak covered frame (Frame 6)
  const handlePeakCover = useCallback(() => {
    const nav = pendingNavRef.current;
    if (!nav) return;

    MemoryManager.revokeAll();

    if (nav.type === 'tool' && nav.toolId) {
      const targetTool = getToolById(nav.toolId);
      window.history.pushState({ page: 'tool', toolId: nav.toolId }, '', `#/${nav.toolId}`);
      setActiveToolId(nav.toolId);
      setVaultState('idle');
      setVaultProgress(0);
      if (targetTool) {
        logTelemetry(`Engaged tool chamber: ${targetTool.name} [${targetTool.serialNumber}]`, 'info');
      }
    } else {
      setActiveToolId(null);
      setVaultState('idle');
      setVaultProgress(0);
      window.history.pushState({ page: 'landing', toolId: null }, '', window.location.pathname + window.location.search);
      logTelemetry('Returned to Cryptic master landing stage', 'info');
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [logTelemetry]);

  // Transition completion callback after liquid tendrils dissolve
  const handleWipeComplete = useCallback(() => {
    setCelWipeStage('idle');
    pendingNavRef.current = null;
    isNavigatingRef.current = false;
  }, []);

  // Core Tactical Navigation with Animated Cel Wipe
  const triggerWipeNavigation = useCallback(
    (type: 'tool' | 'hub', toolId?: string, _initialFiles?: File[]) => {
      if (isNavigatingRef.current) return;
      if (type === 'tool' && toolId === activeToolId) return;
      if (type === 'hub' && !activeToolId) return;

      isNavigatingRef.current = true;
      pendingNavRef.current = { type, toolId };
      setCelWipeMode('full');
      setCelWipeStage('active');

      // Safety timeout to prevent any locked state
      setTimeout(() => {
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false;
          setCelWipeStage('idle');
        }
      }, 950);
    },
    [activeToolId]
  );

  // Synchronize browser history and handle browser back button
  useEffect(() => {
    // 1. Check initial hash on mount
    const hash = window.location.hash.replace(/^#\/?/, '');
    const initialTool = hash ? getToolById(hash)?.id : null;

    if (initialTool) {
      window.history.replaceState({ page: 'landing', toolId: null }, '', window.location.pathname);
      window.history.pushState({ page: 'tool', toolId: initialTool }, '', `#/${initialTool}`);
      setActiveToolId(initialTool);
    } else {
      window.history.replaceState({ page: 'landing', toolId: null }, '', window.location.pathname);
      setActiveToolId(null);
    }

    // Trigger initial screen entrance cel reveal
    setCelWipeMode('reveal');
    setCelWipeStage('active');

    // 2. Listen for browser back / forward navigation
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      const currentHash = window.location.hash.replace(/^#\/?/, '');

      if (!currentHash || !state || state.page === 'landing' || !state.toolId) {
        if (activeToolId !== null) {
          triggerWipeNavigation('hub');
        }
      } else {
        const targetTool = getToolById(state.toolId || currentHash);
        if (targetTool && targetTool.id !== activeToolId) {
          triggerWipeNavigation('tool', targetTool.id);
        }
      }
    };

    const handleHashChange = () => {
      const currentHash = window.location.hash.replace(/^#\/?/, '');
      if (!currentHash) {
        if (activeToolId !== null) {
          triggerWipeNavigation('hub');
        }
      } else {
        const targetTool = getToolById(currentHash);
        if (targetTool && targetTool.id !== activeToolId) {
          triggerWipeNavigation('tool', targetTool.id);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activeToolId, triggerWipeNavigation]);

  // Tool Transition: cleanup previous tool URLs and manage history
  const handleSelectTool = (toolId: string, initialFiles?: File[]) => {
    triggerWipeNavigation('tool', toolId, initialFiles);
  };

  const handleReturnToHub = () => {
    triggerWipeNavigation('hub');
  };

  const handleProcessStart = useCallback((taskName: string) => {
    setVaultState('processing');
    setVaultProgress(10);
    logTelemetry(`Task initiated: ${taskName}`, 'info');
  }, [logTelemetry]);

  const handleProcessComplete = useCallback((details?: string) => {
    setVaultProgress(100);
    setVaultState('complete');
    logTelemetry(`Task executed cleanly: ${details || 'OK'}`, 'success');

    // Return to idle after visual snap
    setTimeout(() => {
      setVaultState('idle');
      setVaultProgress(0);
    }, 1200);
  }, [logTelemetry]);

  const handleProgress = useCallback((percent: number) => {
    setVaultProgress(percent);
  }, []);

  const handleRegisterCleanup = useCallback((cleanupFn: () => void) => {
    MemoryManager.registerCleanup(cleanupFn);
  }, []);

  const handleRegisterBlobUrl = useCallback((url: string) => {
    MemoryManager.registerUrl(url);
  }, []);

  const activeTool = activeToolId ? getToolById(activeToolId) : null;
  const ActiveToolComponent = activeTool ? activeTool.component : null;

  return (
    <div className="min-h-screen bg-[#ECE9E1] dark:bg-[#0D1017] text-[#111622] dark:text-[#F1F5F9] flex flex-col font-sans selection:bg-[#D21319] selection:text-white transition-colors duration-300">
      {/* 2D Hand-Drawn Cel Wipe Transition (Chris Guyot Style) */}
      <CelWipeTransition
        stage={celWipeStage}
        mode={celWipeMode}
        onPeakCover={handlePeakCover}
        onComplete={handleWipeComplete}
        colorTheme="cryptic-crimson"
      />

      {!activeTool ? (
        /* ========================================================================= */
        /* CRYPTIC LANDING PAGE (Clean Full-Width Layout, No Left Spine)              */
        /* ========================================================================= */
        <CrypticLandingPage
          onSelectTool={handleSelectTool}
          vaultState={vaultState}
          vaultProgress={vaultProgress}
        />
      ) : (
        /* ========================================================================= */
        /* ACTIVE TOOL STUDIO VIEW                                                   */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col pb-32 relative">
          {/* Distinct Sacred Geometry Mandala Art for this specific tool screen */}
          <ScreenMandalaArt toolId={activeTool.id} />

          {/* Top Telemetry & Control Rail */}
          <TopTelemetryBar
            activeToolName={activeTool.name}
            onReturnToHub={handleReturnToHub}
          />

          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
            <HardwareGrid
              headerTitle={activeTool.name}
              headerSubtitle={activeTool.tagline}
              serialNumber={activeTool.serialNumber}
            >
              {ActiveToolComponent && (
                <ActiveToolComponent
                  onProcessStart={handleProcessStart}
                  onProcessComplete={handleProcessComplete}
                  onProgress={handleProgress}
                  logTelemetry={logTelemetry}
                  registerCleanUp={handleRegisterCleanup}
                  registerBlobUrl={handleRegisterBlobUrl}
                />
              )}
            </HardwareGrid>
          </main>
        </div>
      )}

      {/* Global Persistent Magnifying Apple-Style Dock (Mounted on All Pages & Tools) */}
      <AppleStyleDock
        activeToolId={activeToolId}
        onSelectTool={handleSelectTool}
        onReturnHome={handleReturnToHub}
      />
    </div>
  );
};

export default App;
