export interface AnalysisResult {
  id: string;
  query: string;
  timestamp: Date;
  imageIds: string[];
  answer: string;
  confidence: number;
  keyFindings: KeyFinding[];
  evidence: EvidenceItem[];
  modelTrace: ModelTraceStep[];
  processingTime: number;
  queryType: 'landcover' | 'detection' | 'change' | 'multimodal' | 'general';
}

export interface KeyFinding {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  confidence: number;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface EvidenceItem {
  id: string;
  type: 'region' | 'statistic' | 'comparison' | 'overlay' | 'chart';
  label: string;
  description: string;
  confidence: number;
  thumbnailUrl?: string;
  imageRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  data?: Record<string, unknown>;
  chartData?: ChartDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
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

export interface ExportReport {
  id: string;
  analysisId: string;
  generatedAt: Date;
  format: 'pdf' | 'html' | 'json';
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'table' | 'chart' | 'metadata';
  order: number;
}