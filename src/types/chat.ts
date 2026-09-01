export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    queryType?: string;
    modelsUsed?: string[];
    confidence?: number;
    processingTime?: number;
    evidence?: EvidenceItem[];
    modelTrace?: ModelTraceStep[];
  };
}

export interface EvidenceItem {
  id: string;
  type: 'region' | 'statistic' | 'comparison' | 'overlay';
  label: string;
  description: string;
  confidence: number;
  imageRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  data?: Record<string, unknown>;
}

export interface ModelTraceStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  model?: string;
  startTime?: Date;
  endTime?: Date;
  output?: unknown;
  confidence?: number;
  progress?: number;
  children?: ModelTraceStep[];
}

export interface SuggestedQuery {
  id: string;
  text: string;
  category: 'analysis' | 'detection' | 'change' | 'multimodal' | 'general';
  icon?: string;
}