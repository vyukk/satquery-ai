# Integration Plan: Connecting Backend Models to Frontend

## Overview
This document outlines the steps to replace mock data with real API calls to your backend models and services.

---

## Phase 1: API Integration Architecture

### 1.1 Environment Configuration
- [ ] Create `.env.local` with backend API endpoints
  ```env
  VITE_API_URL=http://localhost:8000/api
  VITE_WS_URL=ws://localhost:8000/ws
  ```
- [ ] Update `src/lib/api.ts` with real endpoint URLs
- [ ] Add request/response interceptors for auth tokens

### 1.2 API Client Setup
- [ ] Create API service layer in `src/services/apiClient.ts`
  - Authentication (JWT tokens from `security.py`)
  - Image upload handling
  - Dataset CRUD operations
  - WebSocket for real-time analysis results
- [ ] Add error handling and retry logic
- [ ] Implement request/response logging

---

## Phase 2: Model Registry Integration

### 2.1 Specialist Models (`/backend/routers/models_registry.py`)
- [ ] Replace `mockSpecialistModels` in `src/data/mockResponses.ts`
- [ ] Fetch models list from `GET /api/models/specialists`
- [ ] Update [src/pages/Models.tsx](src/pages/Models.tsx)
  ```typescript
  // Replace: const filteredModels = mockSpecialistModels.filter(...)
  // With: useEffect(() => { fetchModels(); }, [])
  ```
- [ ] Display real model status and capabilities
- [ ] Hook "Use Model" button to actual model deployment/invocation

### 2.2 Model Invocation
- [ ] Create model execution flow:
  - POST to `/api/models/{model_id}/invoke` with parameters
  - Track job status via `/api/jobs/{job_id}`
  - Stream results via WebSocket or polling

---

## Phase 3: Image & Dataset Management

### 3.1 Image Upload (`/backend/routers/images.py`)
- [ ] Replace mock dataset images with real upload
- [ ] Update [src/components/workspace/ImageInputPanel.tsx](src/components/workspace/ImageInputPanel.tsx)
  ```typescript
  // Hook onDrop to: POST /api/images/upload
  // Replace: mockDatasetSamples with: GET /api/datasets
  ```
- [ ] Implement progress tracking for large files
- [ ] Display real image metadata (sensor, date, resolution, location)

### 3.2 Dataset Catalog (`/backend/routers/datasets.py`)
- [ ] Fetch datasets from `GET /api/datasets`
- [ ] Update [src/pages/Datasets.tsx](src/pages/Datasets.tsx)
  - Replace `mockSatelliteImages` with real API pagination
  - Implement search/filter via query params
  - Update dataset browser with real thumbnails

---

## Phase 4: Analysis & Query Processing

### 4.1 Analysis Router (`/backend/routers/analysis.py`)
- [ ] Create analysis service in `src/services/analysisService.ts`
- [ ] Hook analysis request to `POST /api/analysis/query`
- [ ] Track analysis job via `GET /api/analysis/jobs/{job_id}`
- [ ] Stream real model trace data via WebSocket

### 4.2 Update Analysis Components
- [ ] [src/components/workspace/AssistantPanel.tsx](src/components/workspace/AssistantPanel.tsx)
  - Replace mock chat with real analysis queries
  - Stream responses from backend
- [ ] [src/components/workspace/AnalysisResultPanel.tsx](src/components/workspace/AnalysisResultPanel.tsx)
  - Display real analysis results from API
  - Render actual model traces and evidence
- [ ] Implement result caching and history management

---

## Phase 5: Orchestration & Specialist Workflow

### 5.1 Specialist Orchestration (`/backend/services/orchestrator.py`)
- [ ] Replace mock orchestration steps with real workflow data
- [ ] Update [src/components/workspace/OrchestrationPanel.tsx](src/components/workspace/OrchestrationPanel.tsx)
  - Connect to `GET /api/orchestration/tasks/{query_id}`
  - Display real specialist routing and inference traces
  - Show actual model composition and execution order

### 5.2 Specialist Services (`/backend/services/specialist.py`)
- [ ] Hook specialist model invocations
  - Land cover classification
  - Change detection
  - Object detection
  - Multimodal fusion
- [ ] Display real confidence scores and processing times

---

## Phase 6: Analysis History & Export

### 6.1 History Management (`/backend/routers/analysis.py`)
- [ ] Replace `mockHistoryAnalyses` in [src/pages/History.tsx](src/pages/History.tsx)
- [ ] Fetch user's analysis history from `GET /api/analysis/history`
- [ ] Implement pagination and filtering

### 6.2 Export & Reporting
- [ ] Hook export buttons to `POST /api/analysis/{id}/export?format=pdf|html|json`
- [ ] Stream generated reports to client
- [ ] Implement report templates from actual analysis results

---

## Phase 7: Change Detection & Multimodal Features

### 7.1 Change Detection (`/backend/routers/analysis.py` → change detection endpoints)
- [ ] Replace mock change detection data in [src/pages/ChangeDetection.tsx](src/pages/ChangeDetection.tsx)
- [ ] Connect to real change detection model via API
- [ ] Display actual before/after comparisons

### 7.2 Multimodal Analysis (`/backend/routers/analysis.py` → multimodal endpoints)
- [ ] Replace mock multimodal data in [src/pages/Multimodal.tsx](src/pages/Multimodal.tsx)
- [ ] Display real optical + SAR fusion results
- [ ] Show actual evidence from both modalities

---

## Phase 8: Authentication & User Context

### 8.1 User Management
- [ ] Implement login/signup flow
- [ ] Store JWT tokens in localStorage/sessionStorage
- [ ] Add auth header to all API requests
- [ ] Handle token refresh

### 8.2 User Workspace Context
- [ ] Replace mock workspace state with API-backed state
- [ ] Persist user preferences to backend
- [ ] Sync across browser tabs/sessions

---

## Implementation Priority

### High Priority (Start Here)
1. Setup API client + env config
2. Implement image upload flow
3. Connect specialist model registry
4. Hook analysis query endpoint

### Medium Priority
5. Replace dataset mock data
6. Connect analysis history
7. Implement orchestration tracking

### Lower Priority (Polish)
8. Add real-time WebSocket updates
9. Implement export/reporting
10. Add user authentication layer

---

## Code Cleanup Checklist

- [ ] Remove `src/data/mockResponses.ts`
- [ ] Remove `src/data/mockDatasets.ts`
- [ ] Remove `import { mock* }` from all components
- [ ] Update `src/lib/api.ts` with real endpoints
- [ ] Add TypeScript types for API responses
- [ ] Remove unused utility functions
- [ ] Add error boundaries for API failures
- [ ] Add loading states for all async operations

---

## Testing & Validation

- [ ] Test each API endpoint in isolation
- [ ] Verify image upload with various file sizes
- [ ] Test analysis query with different model combinations
- [ ] Validate real-time WebSocket connections
- [ ] Performance test with large datasets
- [ ] End-to-end test of complete workflows

---

## Backend Endpoints Reference

```
Authentication:
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh

Images & Datasets:
POST   /api/images/upload
GET    /api/images/{id}
GET    /api/datasets
GET    /api/datasets/{id}

Models:
GET    /api/models/specialists
GET    /api/models/{id}
POST   /api/models/{id}/invoke

Analysis:
POST   /api/analysis/query
GET    /api/analysis/jobs/{job_id}
GET    /api/analysis/history
GET    /api/analysis/{id}/export

Orchestration:
GET    /api/orchestration/tasks/{query_id}
WebSocket: /ws/analysis/{job_id}
```

---

## Notes

- Always include proper error handling and user feedback
- Implement pagination for large dataset results
- Use React Query or SWR for data fetching and caching
- Add loading skeletons and progress indicators
- Test API connection before deploying to production
