// API Client for SatQuery AI Backend
// Auto-generated types should match backend Pydantic schemas

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers = {}, ...fetchOptions } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    request<{ access_token: string; token_type: string; user: UserResponse }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: UserResponse }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  me: () => request<UserResponse>('/auth/me'),
};

// Datasets API
export const datasetsApi = {
  list: (params?: { modality?: string; sensor?: string; region?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return request<DatasetSample[]>(`/datasets?${searchParams.toString()}`);
  },

  get: (id: string) => request<DatasetSample>(`/datasets/${id}`),
};

// Images API
export const imagesApi = {
  upload: (file: File, metadata?: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    return request<ImageUploadResponse>('/images/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type with boundary
    });
  },

  list: (params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return request<SatelliteImage[]>(`/images?${searchParams.toString()}`);
  },

  get: (id: string) => request<SatelliteImage>(`/images/${id}`),

  getFile: (id: string) => `${API_BASE}/images/${id}/file`,

  getThumbnail: (id: string) => `${API_BASE}/images/${id}/thumbnail`,
};

// Models Registry API
export const modelsApi = {
  list: (params?: { type?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return request<SpecialistModel[]>(`/models?${searchParams.toString()}`);
  },

  get: (id: string) => request<SpecialistModel>(`/models/${id}`),
};

// Analysis API
export const analysisApi = {
  run: (data: { query: string; image_ids: string[]; comparison_image_id?: string }) =>
    request<AnalysisResponse>('/analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  history: (params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    return request<AnalysisResult[]>(`/analysis/history?${searchParams.toString()}`);
  },

  get: (id: string) => request<AnalysisResult>(`/analysis/${id}`),
};

// Health check
export const healthApi = {
  check: () => request<{ status: string; version: string; timestamp: string }>('/health'),
};

// Type definitions matching backend schemas
export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Location {
  lat: number;
  lng: number;
  bbox?: number[] | null; // [minLng, minLat, maxLng, maxLat]
}

export type Modality = 'optical' | 'sar' | 'multispectral' | 'hyperspectral';

export interface SatelliteImage {
  id: string;
  filename: string;
  name: string | null;
  modality: Modality;
  sensor: string;
  resolution: number;
  acquisitionDate: string;
  location: Location;
  crs: string;
  format: string;
  fileSize: number;
  width: number;
  height: number;
  bands: string[] | null;
  metadata: Record<string, unknown>;
  visible: boolean;
  bounds: number[] | null;
  thumbnailUrl: string | null;
  url: string | null;
}

export interface DatasetSample {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  image: SatelliteImage;
  tags: string[];
}

export interface SpecialistModel {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  inputModalities: string[];
  status: 'available' | 'busy' | 'offline';
  latency: number;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EvidenceItem {
  id: string;
  type: 'region' | 'statistic' | 'comparison' | 'overlay';
  label: string;
  description: string;
  confidence: number;
  imageRegion?: BoundingBox | null;
  data?: Record<string, unknown> | null;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface OrchestrationStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  progress: number;
  model?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  children?: OrchestrationStep[] | null;
}

export interface KeyFinding {
  id: string;
  label: string;
  value: number;
  confidence: number;
  icon?: string | null;
  unit?: string | null;
}

export type QueryType = 'landcover' | 'change' | 'multimodal' | 'detection' | 'general';

export interface AnalysisResult {
  id: string;
  query: string;
  timestamp: string;
  imageIds: string[];
  answer: string;
  confidence: number;
  keyFindings: KeyFinding[];
  evidence: EvidenceItem[];
  modelTrace: OrchestrationStep[];
  processingTime: number;
  queryType: QueryType;
  modelsUsed?: string[] | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
}

export interface AnalysisResponse {
  message: ChatMessage;
  analysis: AnalysisResult;
  orchestration: OrchestrationState;
}

export interface OrchestrationState {
  query: string;
  queryClassification: string;
  taskPlan: string[];
  selectedSpecialists: string[];
  currentStep: string;
  overallProgress: number;
  steps: OrchestrationStep[];
  isComplete: boolean;
  answer?: string | null;
  confidence?: number | null;
  keyFindings?: KeyFinding[] | null;
}

export interface ImageUploadResponse {
  image: SatelliteImage;
  message: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}