export interface WorkspaceState {
  // Images
  images: SatelliteImage[];
  selectedImageId: string | null;
  comparisonImageId: string | null;
  
  // UI State
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  orchestrationPanelOpen: boolean;
  analysisPanelOpen: boolean;
  
  // View State
  activeLayer: 'optical' | 'sar' | 'overlay' | 'change-map';
  zoom: number;
  center: { x: number; y: number };
  
  // Analysis
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  
  // Chat
  messages: ChatMessage[];
  isProcessing: boolean;
  
  // Orchestration
  orchestrationState: OrchestrationState | null;

  // Datasets
  availableDatasets: DatasetSample[];
}

export interface WorkspaceActions {
  // Image actions
  addImage: (image: SatelliteImage) => void;
  removeImage: (id: string) => void;
  selectImage: (id: string | null) => void;
  setComparisonImage: (id: string | null) => void;
  setImageVisibility: (id: string, visible: boolean) => void;
  
  // UI actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleOrchestrationPanel: () => void;
  toggleAnalysisPanel: () => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  
  // View actions
  setActiveLayer: (layer: 'optical' | 'sar' | 'overlay' | 'change-map') => void;
  setZoom: (zoom: number) => void;
  setCenter: (center: { x: number; y: number }) => void;
  resetView: () => void;
  
  // Analysis actions
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  addToHistory: (analysis: AnalysisResult) => void;
  
  // Chat actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setProcessing: (processing: boolean) => void;
  clearMessages: () => void;
  
  // Orchestration actions
  setOrchestrationState: (state: OrchestrationState | null) => void;
  updateOrchestrationStep: (stepId: string, updates: Partial<OrchestrationStep>) => void;
  startOrchestration: (query: string) => void;
  completeOrchestration: () => void;
  
  // Reset
  resetWorkspace: () => void;
}

import type { SatelliteImage } from './satellite';
import type { ChatMessage } from './chat';
import type { AnalysisResult } from './analysis';
import type { OrchestrationState, OrchestrationStep } from './orchestration';
import type { DatasetSample } from './satellite';