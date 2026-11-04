import React from 'react';

export type ToolCategory = 'pdf' | 'optics' | 'cryptography' | 'privacy';

export type ToolStatus = 'ready' | 'beta' | 'experimental';

export type TelemetryLevel = 'info' | 'warn' | 'success' | 'alert';

export interface TelemetryEntry {
  id: string;
  timestamp: string; // e.g. "12:04:01.334"
  message: string;
  level: TelemetryLevel;
  tag?: string;
}

export interface ToolComponentProps {
  onProcessStart: (taskName: string) => void;
  onProcessComplete: (details?: string) => void;
  onProgress: (percent: number) => void;
  logTelemetry: (message: string, level?: TelemetryLevel, tag?: string) => void;
  registerCleanUp: (cleanupFn: () => void) => void;
  registerBlobUrl: (url: string) => void;
}

export interface ToolDefinition {
  id: string;
  serialNumber: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  status: ToolStatus;
  component: React.ComponentType<ToolComponentProps>;
  accentColor: string;
  specs: string[];
}

export type VaultCoreState = 'idle' | 'file-hover' | 'processing' | 'complete';
