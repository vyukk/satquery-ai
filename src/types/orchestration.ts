export interface OrchestrationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  model?: string;
  input?: unknown;
  output?: unknown;
  startTime?: Date;
  endTime?: Date;
  children?: OrchestrationStep[];
}

export interface OrchestrationState {
  query: string;
  queryClassification: string;
  taskPlan: string[];
  selectedSpecialists: SpecialistModel[];
  currentStep: string;
  overallProgress: number;
  steps: OrchestrationStep[];
  isComplete: boolean;
  error?: string;
}

export interface SpecialistModel {
  id: string;
  name: string;
  type: 'vlm' | 'change-detection' | 'sar-analysis' | 'geospatial' | 'classification' | 'detection';
  description: string;
  capabilities: string[];
  inputModalities: string[];
  status: 'available' | 'loading' | 'processing' | 'unavailable';
  latency?: number; // ms
  confidence?: number;
}

export interface QueryClassification {
  primaryType: 'landcover' | 'detection' | 'change' | 'multimodal' | 'general';
  requiredModalities: string[];
  spatialScope: 'local' | 'regional' | 'global';
  temporalScope?: 'single' | 'multi-temporal';
  confidence: number;
}

export interface TaskPlan {
  steps: PlannedStep[];
  estimatedTime: number;
  requiredModels: string[];
}

export interface PlannedStep {
  id: string;
  name: string;
  description: string;
  modelId: string;
  dependencies: string[];
  parallel: boolean;
}