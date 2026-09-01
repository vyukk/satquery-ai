import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { WorkspaceState, WorkspaceActions } from '../types/workspace';
import type { SatelliteImage } from '../types/satellite';
import type { ChatMessage } from '../types/chat';
import type { AnalysisResult } from '../types/analysis';
import type { OrchestrationState, OrchestrationStep } from '../types/orchestration';
import type { DatasetSample } from '../types/satellite';
// TODO: Replace with API call to GET /api/datasets
const mockDatasetSamples: any[] = [];

interface WorkspaceContextValue extends WorkspaceState, WorkspaceActions {}

const initialState: WorkspaceState = {
  images: [],
  selectedImageId: null,
  comparisonImageId: null,
  leftPanelOpen: true,
  rightPanelOpen: true,
  orchestrationPanelOpen: false,
  analysisPanelOpen: false,
  activeLayer: 'optical',
  zoom: 1,
  center: { x: 0.5, y: 0.5 },
  currentAnalysis: null,
  analysisHistory: [],
  messages: [],
  isProcessing: false,
  orchestrationState: null,
  availableDatasets: mockDatasetSamples,
};

type WorkspaceAction =
  | { type: 'ADD_IMAGE'; payload: SatelliteImage }
  | { type: 'REMOVE_IMAGE'; payload: string }
  | { type: 'SELECT_IMAGE'; payload: string | null }
  | { type: 'SET_COMPARISON_IMAGE'; payload: string | null }
  | { type: 'SET_IMAGE_VISIBILITY'; payload: { id: string; visible: boolean } }
  | { type: 'TOGGLE_LEFT_PANEL' }
  | { type: 'TOGGLE_RIGHT_PANEL' }
  | { type: 'TOGGLE_ORCHESTRATION_PANEL' }
  | { type: 'TOGGLE_ANALYSIS_PANEL' }
  | { type: 'SET_LEFT_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_RIGHT_PANEL_OPEN'; payload: boolean }
  | { type: 'SET_ACTIVE_LAYER'; payload: 'optical' | 'sar' | 'overlay' | 'change-map' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_CENTER'; payload: { x: number; y: number } }
  | { type: 'RESET_VIEW' }
  | { type: 'SET_CURRENT_ANALYSIS'; payload: AnalysisResult | null }
  | { type: 'ADD_TO_HISTORY'; payload: AnalysisResult }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<ChatMessage> } }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_ORCHESTRATION_STATE'; payload: OrchestrationState | null }
  | { type: 'UPDATE_ORCHESTRATION_STEP'; payload: { stepId: string; updates: Partial<OrchestrationStep> } }
  | { type: 'START_ORCHESTRATION'; payload: string }
  | { type: 'COMPLETE_ORCHESTRATION' }
  | { type: 'RESET_WORKSPACE' };

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'ADD_IMAGE':
      return {
        ...state,
        images: [...state.images, action.payload],
        selectedImageId: state.selectedImageId ?? action.payload.id,
      };
    
    case 'REMOVE_IMAGE':
      return {
        ...state,
        images: state.images.filter(img => img.id !== action.payload),
        selectedImageId: state.selectedImageId === action.payload ? null : state.selectedImageId,
        comparisonImageId: state.comparisonImageId === action.payload ? null : state.comparisonImageId,
      };
    
    case 'SELECT_IMAGE':
      return { ...state, selectedImageId: action.payload };
    
    case 'SET_COMPARISON_IMAGE':
      return { ...state, comparisonImageId: action.payload };
    case 'SET_IMAGE_VISIBILITY':
      return {
        ...state,
        images: state.images.map(img =>
          img.id === action.payload.id ? { ...img, visible: action.payload.visible } : img
        ),
      };

    
    case 'TOGGLE_LEFT_PANEL':
      return { ...state, leftPanelOpen: !state.leftPanelOpen };
    
    case 'TOGGLE_RIGHT_PANEL':
      return { ...state, rightPanelOpen: !state.rightPanelOpen };
    
    case 'TOGGLE_ORCHESTRATION_PANEL':
      return { ...state, orchestrationPanelOpen: !state.orchestrationPanelOpen };
    
    case 'TOGGLE_ANALYSIS_PANEL':
      return { ...state, analysisPanelOpen: !state.analysisPanelOpen };
    
    case 'SET_LEFT_PANEL_OPEN':
      return { ...state, leftPanelOpen: action.payload };
    
    case 'SET_RIGHT_PANEL_OPEN':
      return { ...state, rightPanelOpen: action.payload };
    
    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayer: action.payload };
    
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.1, Math.min(10, action.payload)) };
    
    case 'SET_CENTER':
      return { ...state, center: action.payload };
    
    case 'RESET_VIEW':
      return { ...state, zoom: 1, center: { x: 0.5, y: 0.5 } };
    
    case 'SET_CURRENT_ANALYSIS':
      return { ...state, currentAnalysis: action.payload };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        analysisHistory: [action.payload, ...state.analysisHistory].slice(0, 50),
      };
    
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        ),
      };
    
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    
    case 'SET_ORCHESTRATION_STATE':
      return { ...state, orchestrationState: action.payload };
    
    case 'UPDATE_ORCHESTRATION_STEP':
      if (!state.orchestrationState) return state;
      return {
        ...state,
        orchestrationState: {
          ...state.orchestrationState,
          steps: state.orchestrationState.steps.map(step =>
            step.id === action.payload.stepId ? { ...step, ...action.payload.updates } : step
          ),
          overallProgress: state.orchestrationState.steps.reduce((acc, step) => {
            const s = step.id === action.payload.stepId ? { ...step, ...action.payload.updates } : step;
            return acc + s.progress;
          }, 0) / state.orchestrationState.steps.length,
        },
      };
    
    case 'START_ORCHESTRATION':
      return {
        ...state,
        orchestrationState: {
          query: action.payload,
          queryClassification: '',
          taskPlan: [],
          selectedSpecialists: [],
          currentStep: 'query-understanding',
          overallProgress: 0,
          steps: [
            {
              id: 'query-understanding',
              name: 'Query Understanding',
              description: 'Analyzing query intent and classifying request type',
              status: 'running',
              progress: 0,
            },
            {
              id: 'task-planning',
              name: 'Task Planning',
              description: 'Determining required modalities and analysis steps',
              status: 'pending',
              progress: 0,
            },
            {
              id: 'specialist-selection',
              name: 'Specialist Selection',
              description: 'Selecting appropriate specialist models for the task',
              status: 'pending',
              progress: 0,
            },
            {
              id: 'execution',
              name: 'Execution',
              description: 'Running specialist models on imagery',
              status: 'pending',
              progress: 0,
            },
            {
              id: 'evidence-synthesis',
              name: 'Evidence Synthesis',
              description: 'Combining results and generating grounded answer',
              status: 'pending',
              progress: 0,
            },
          ],
          isComplete: false,
        },
      };
    
    case 'COMPLETE_ORCHESTRATION':
      if (!state.orchestrationState) return state;
      return {
        ...state,
        orchestrationState: {
          ...state.orchestrationState,
          steps: state.orchestrationState.steps.map(s => ({ ...s, status: 'completed' as const, progress: 100 })),
          overallProgress: 100,
          isComplete: true,
        },
      };
    
    case 'RESET_WORKSPACE':
      return initialState;
    
    default:
      return state;
  }
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  const actions: WorkspaceActions = {
    addImage: (image) => dispatch({ type: 'ADD_IMAGE', payload: image }),
    removeImage: (id) => dispatch({ type: 'REMOVE_IMAGE', payload: id }),
    selectImage: (id) => dispatch({ type: 'SELECT_IMAGE', payload: id }),
    setComparisonImage: (id) => dispatch({ type: 'SET_COMPARISON_IMAGE', payload: id }),
    setImageVisibility: (id, visible) => dispatch({ type: 'SET_IMAGE_VISIBILITY', payload: { id, visible } }),
    toggleLeftPanel: () => dispatch({ type: 'TOGGLE_LEFT_PANEL' }),
    toggleRightPanel: () => dispatch({ type: 'TOGGLE_RIGHT_PANEL' }),
    toggleOrchestrationPanel: () => dispatch({ type: 'TOGGLE_ORCHESTRATION_PANEL' }),
    toggleAnalysisPanel: () => dispatch({ type: 'TOGGLE_ANALYSIS_PANEL' }),
    setLeftPanelOpen: (open) => dispatch({ type: 'SET_LEFT_PANEL_OPEN', payload: open }),
    setRightPanelOpen: (open) => dispatch({ type: 'SET_RIGHT_PANEL_OPEN', payload: open }),
    setActiveLayer: (layer) => dispatch({ type: 'SET_ACTIVE_LAYER', payload: layer }),
    setZoom: (zoom) => dispatch({ type: 'SET_ZOOM', payload: zoom }),
    setCenter: (center) => dispatch({ type: 'SET_CENTER', payload: center }),
    resetView: () => dispatch({ type: 'RESET_VIEW' }),
    setCurrentAnalysis: (analysis) => dispatch({ type: 'SET_CURRENT_ANALYSIS', payload: analysis }),
    addToHistory: (analysis) => dispatch({ type: 'ADD_TO_HISTORY', payload: analysis }),
    addMessage: (message) => dispatch({ type: 'ADD_MESSAGE', payload: message }),
    updateMessage: (id, updates) => dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } }),
    setProcessing: (processing) => dispatch({ type: 'SET_PROCESSING', payload: processing }),
    clearMessages: () => dispatch({ type: 'CLEAR_MESSAGES' }),
    setOrchestrationState: (state) => dispatch({ type: 'SET_ORCHESTRATION_STATE', payload: state }),
    updateOrchestrationStep: (stepId, updates) => dispatch({ type: 'UPDATE_ORCHESTRATION_STEP', payload: { stepId, updates } }),
    startOrchestration: (query) => dispatch({ type: 'START_ORCHESTRATION', payload: query }),
    completeOrchestration: () => dispatch({ type: 'COMPLETE_ORCHESTRATION' }),
    resetWorkspace: () => dispatch({ type: 'RESET_WORKSPACE' }),
  };

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('satquery-workspace');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore non-sensitive state
        dispatch({ type: 'SET_LEFT_PANEL_OPEN', payload: parsed.leftPanelOpen ?? true });
        dispatch({ type: 'SET_RIGHT_PANEL_OPEN', payload: parsed.rightPanelOpen ?? true });
      } catch (e) {
        console.warn('Failed to restore workspace state:', e);
      }
    }
  }, []);

  useEffect(() => {
    const toSave = {
      leftPanelOpen: state.leftPanelOpen,
      rightPanelOpen: state.rightPanelOpen,
    };
    localStorage.setItem('satquery-workspace', JSON.stringify(toSave));
  }, [state.leftPanelOpen, state.rightPanelOpen]);

  return (
    <WorkspaceContext.Provider value={{ ...state, ...actions }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
