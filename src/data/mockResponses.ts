import type { ChatMessage, EvidenceItem, ModelTraceStep } from '../types/chat';
import type { AnalysisResult, KeyFinding, EvidenceItem as AnalysisEvidenceItem } from '../types/analysis';
import type { OrchestrationStep, SpecialistModel } from '../types/orchestration';

export const mockSpecialistModels: SpecialistModel[] = [
  {
    id: 'vlm-001',
    name: 'Remote Sensing VLM',
    type: 'vlm',
    description: 'Vision-Language Model fine-tuned for remote sensing imagery understanding',
    capabilities: [
      'Image captioning',
      'Visual question answering',
      'Land-cover classification',
      'Object detection',
      'Scene description',
    ],
    inputModalities: ['optical', 'multispectral'],
    status: 'available',
    latency: 1200,
    confidence: 0.94,
  },
  {
    id: 'cd-001',
    name: 'Change Detection Model',
    type: 'change-detection',
    description: 'Siamese network for temporal change detection and localization',
    capabilities: [
      'Temporal comparison',
      'Change localization',
      'Change classification',
      'Change magnitude estimation',
    ],
    inputModalities: ['optical', 'multispectral', 'sar'],
    status: 'available',
    latency: 2500,
    confidence: 0.89,
  },
  {
    id: 'sar-001',
    name: 'SAR Analysis Model',
    type: 'sar-analysis',
    description: 'Specialized model for SAR imagery interpretation and backscatter analysis',
    capabilities: [
      'SAR interpretation',
      'Backscatter analysis',
      'Structural feature detection',
      'Surface deformation monitoring',
      'Flood extent mapping',
    ],
    inputModalities: ['sar'],
    status: 'available',
    latency: 1800,
    confidence: 0.91,
  },
  {
    id: 'geo-001',
    name: 'Geospatial Analysis Engine',
    type: 'geospatial',
    description: 'Geospatial processing engine for spatial queries and coordinate operations',
    capabilities: [
      'CRS transformation',
      'GeoTIFF processing',
      'Spatial queries',
      'Region extraction',
      'Area calculation',
      'Coordinate conversion',
    ],
    inputModalities: ['all'],
    status: 'available',
    latency: 500,
    confidence: 0.99,
  },
  {
    id: 'cls-001',
    name: 'Land Cover Classifier',
    type: 'classification',
    description: 'Deep learning classifier for land cover types',
    capabilities: [
      'Multi-class land cover classification',
      'Confidence scoring',
      'Hierarchical classification',
    ],
    inputModalities: ['optical', 'multispectral'],
    status: 'available',
    latency: 800,
    confidence: 0.96,
  },
  {
    id: 'det-001',
    name: 'Object Detection Model',
    type: 'detection',
    description: 'YOLOv8-based detector for remote sensing objects',
    capabilities: [
      'Vehicle detection',
      'Building detection',
      'Ship detection',
      'Aircraft detection',
      'Infrastructure detection',
    ],
    inputModalities: ['optical', 'sar'],
    status: 'available',
    latency: 600,
    confidence: 0.92,
  },
];

export const mockOrchestrationSteps: OrchestrationStep[] = [
  {
    id: 'query-understanding',
    name: 'Query Understanding',
    description: 'Analyzing query intent and classifying request type',
    status: 'completed',
    progress: 100,
    model: 'Query Classifier',
    startTime: new Date(Date.now() - 15000),
    endTime: new Date(Date.now() - 14000),
  },
  {
    id: 'task-planning',
    name: 'Task Planning',
    description: 'Determining required modalities and analysis steps',
    status: 'completed',
    progress: 100,
    model: 'Task Planner',
    startTime: new Date(Date.now() - 14000),
    endTime: new Date(Date.now() - 13000),
  },
  {
    id: 'specialist-selection',
    name: 'Specialist Selection',
    description: 'Selecting appropriate specialist models for the task',
    status: 'completed',
    progress: 100,
    model: 'Model Router',
    startTime: new Date(Date.now() - 13000),
    endTime: new Date(Date.now() - 12000),
  },
  {
    id: 'execution',
    name: 'Execution',
    description: 'Running specialist models on imagery',
    status: 'completed',
    progress: 100,
    model: 'Remote Sensing VLM, Land Cover Classifier',
    startTime: new Date(Date.now() - 12000),
    endTime: new Date(Date.now() - 6000),
    children: [
      {
        id: 'execution-vlm',
        name: 'Remote Sensing VLM',
        description: 'Analyzing image content and generating description',
        status: 'completed',
        progress: 100,
        model: 'Remote Sensing VLM',
        startTime: new Date(Date.now() - 12000),
        endTime: new Date(Date.now() - 8000),
      },
      {
        id: 'execution-cls',
        name: 'Land Cover Classifier',
        description: 'Classifying land cover types with confidence scores',
        status: 'completed',
        progress: 100,
        model: 'Land Cover Classifier',
        startTime: new Date(Date.now() - 10000),
        endTime: new Date(Date.now() - 6000),
      },
    ],
  },
  {
    id: 'evidence-synthesis',
    name: 'Evidence Synthesis',
    description: 'Combining results and generating grounded answer',
    status: 'completed',
    progress: 100,
    model: 'Answer Generator',
    startTime: new Date(Date.now() - 6000),
    endTime: new Date(Date.now() - 3000),
  },
];

export const mockChatResponse: ChatMessage = {
  id: 'msg-002',
  role: 'assistant',
  content: `The scene contains four dominant land-cover classes:

• **Built-up area** — 38% (urban/industrial zones)
• **Agricultural land** — 31% (croplands, plantations)
• **Vegetation** — 21% (forests, parks, scrubland)
• **Water bodies** — 10% (rivers, lakes, reservoirs)

The built-up regions are concentrated in the central and northern sectors, showing typical urban sprawl patterns with dense cores and peripheral expansion. Agricultural lands dominate the southern and eastern portions, with clear field boundaries visible at this resolution.`,
  timestamp: new Date(),
  metadata: {
    queryType: 'landcover',
    modelsUsed: ['Remote Sensing VLM', 'Land Cover Classifier'],
    confidence: 0.934,
    processingTime: 4200,
    evidence: [
      {
        id: 'ev-001',
        type: 'region',
        label: 'Central Business District',
        description: 'High-density built-up area with 94% confidence',
        confidence: 0.94,
        imageRegion: { x: 0.35, y: 0.28, width: 0.25, height: 0.22 },
      },
      {
        id: 'ev-002',
        type: 'region',
        label: 'Northern Industrial Zone',
        description: 'Industrial built-up area with 91% confidence',
        confidence: 0.91,
        imageRegion: { x: 0.62, y: 0.15, width: 0.18, height: 0.20 },
      },
      {
        id: 'ev-003',
        type: 'statistic',
        label: 'Land Cover Statistics',
        description: 'Class percentages derived from pixel-level classification',
        confidence: 0.96,
        data: {
          builtup: 38.2,
          agriculture: 31.4,
          vegetation: 20.8,
          water: 9.6,
        },
      },
    ],
    modelTrace: mockOrchestrationSteps,
  },
};

export const mockAnalysisResult: AnalysisResult = {
  id: 'analysis-001',
  query: 'Identify the major land-cover classes in this scene and highlight the built-up regions.',
  timestamp: new Date(),
  imageIds: ['img-001'],
  answer: `The scene contains four dominant land-cover classes:

• **Built-up area** — 38% (urban/industrial zones)
• **Agricultural land** — 31% (croplands, plantations)
• **Vegetation** — 21% (forests, parks, scrubland)
• **Water bodies** — 10% (rivers, lakes, reservoirs)

The built-up regions are concentrated in the central and northern sectors, showing typical urban sprawl patterns with dense cores and peripheral expansion. Agricultural lands dominate the southern and eastern portions, with clear field boundaries visible at this resolution.`,
  confidence: 0.934,
  keyFindings: [
    {
      id: 'kf-001',
      label: 'Land-cover classes',
      value: 4,
      confidence: 0.96,
      icon: '🏷️',
    },
    {
      id: 'kf-002',
      label: 'Detected objects',
      value: 23,
      confidence: 0.91,
      icon: '🎯',
    },
    {
      id: 'kf-003',
      label: 'Built-up regions',
      value: 7,
      unit: 'distinct zones',
      confidence: 0.89,
      icon: '🏙️',
    },
    {
      id: 'kf-004',
      label: 'Overall confidence',
      value: 93.4,
      unit: '%',
      confidence: 0.934,
      icon: '📊',
    },
  ],
  evidence: [
    {
      id: 'ev-001',
      type: 'region',
      label: 'Central Business District',
      description: 'High-density built-up area with 94% confidence',
      confidence: 0.94,
      imageRegion: { x: 0.35, y: 0.28, width: 0.25, height: 0.22 },
      data: { classId: 'builtup', areaHa: 42.5 },
    },
    {
      id: 'ev-002',
      type: 'region',
      label: 'Northern Industrial Zone',
      description: 'Industrial built-up area with 91% confidence',
      confidence: 0.91,
      imageRegion: { x: 0.62, y: 0.15, width: 0.18, height: 0.20 },
      data: { classId: 'builtup', areaHa: 28.3 },
    },
    {
      id: 'ev-003',
      type: 'statistic',
      label: 'Land Cover Statistics',
      description: 'Class percentages derived from pixel-level classification',
      confidence: 0.96,
      data: {
        builtup: 38.2,
        agriculture: 31.4,
        vegetation: 20.8,
        water: 9.6,
      },
      chartData: [
        { label: 'Built-up', value: 38.2, color: '#ef4444' },
        { label: 'Agriculture', value: 31.4, color: '#f59e0b' },
        { label: 'Vegetation', value: 20.8, color: '#14b8a6' },
        { label: 'Water', value: 9.6, color: '#06b6d4' },
      ],
    },
  ],
  modelTrace: mockOrchestrationSteps,
  processingTime: 4200,
  queryType: 'landcover',
};

export const mockChangeDetectionResponse: ChatMessage = {
  id: 'msg-003',
  role: 'assistant',
  content: `The analysis indicates significant changes between the two observations:

**Key Changes Detected:**
• **New built-up area**: +14.8 hectares (northern boundary expansion)
• **Vegetation loss**: -9.2 hectares (agricultural to urban conversion)
• **Water extension**: +2.1 hectares (reservoir expansion)

The most prominent change is the expansion of built-up land along the northern boundary of the urban area, accompanied by a corresponding reduction in agricultural vegetation. This pattern is consistent with urban sprawl and infrastructure development. The reservoir to the southeast shows a measurable increase in water extent, likely due to seasonal variation or water management.`,
  timestamp: new Date(),
  metadata: {
    queryType: 'change',
    modelsUsed: ['Change Detection Model', 'Remote Sensing VLM', 'Geospatial Analysis Engine'],
    confidence: 0.897,
    processingTime: 6800,
    evidence: [
      {
        id: 'ev-004',
        type: 'comparison',
        label: 'New Built-up Area',
        description: '14.8 ha of new construction detected',
        confidence: 0.88,
        imageRegion: { x: 0.58, y: 0.12, width: 0.22, height: 0.18 },
        data: { changeType: 'new-builtup', areaHa: 14.8, beforeClass: 'agriculture', afterClass: 'builtup' },
      },
      {
        id: 'ev-005',
        type: 'comparison',
        label: 'Vegetation Loss',
        description: '9.2 ha of agricultural land converted',
        confidence: 0.85,
        imageRegion: { x: 0.45, y: 0.35, width: 0.15, height: 0.12 },
        data: { changeType: 'vegetation-loss', areaHa: -9.2 },
      },
      {
        id: 'ev-006',
        type: 'statistic',
        label: 'Change Statistics',
        description: 'Summary of all detected changes',
        confidence: 0.91,
        data: {
          newBuiltup: 14.8,
          vegetationLoss: -9.2,
          waterExtension: 2.1,
          totalChangedArea: 26.1,
        },
      },
    ],
    modelTrace: [
      ...mockOrchestrationSteps.slice(0, 3),
      {
        ...mockOrchestrationSteps[3],
        model: 'Change Detection Model, Remote Sensing VLM',
        children: [
          {
            id: 'execution-cd',
            name: 'Change Detection Model',
            description: 'Computing difference map and localizing changes',
            status: 'completed',
            progress: 100,
            model: 'Change Detection Model',
            startTime: new Date(Date.now() - 12000),
            endTime: new Date(Date.now() - 7000),
          },
          {
            id: 'execution-vlm-2',
            name: 'Remote Sensing VLM',
            description: 'Interpreting change semantics and generating descriptions',
            status: 'completed',
            progress: 100,
            model: 'Remote Sensing VLM',
            startTime: new Date(Date.now() - 8000),
            endTime: new Date(Date.now() - 4000),
          },
        ],
      },
      mockOrchestrationSteps[4],
    ],
  },
};

export const mockMultimodalResponse: ChatMessage = {
  id: 'msg-004',
  role: 'assistant',
  content: `**Multimodal Fusion Analysis: Optical + SAR**

**OPTICAL (Sentinel-2)**
Visible surface characteristics detected:
- Spectral signatures indicate healthy vegetation (high NIR reflectance)
- Urban areas show high reflectance in visible bands
- Water bodies show strong absorption in NIR/SWIR

**SAR (Sentinel-1)**
Structural and moisture-related response detected:
- High VV backscatter from urban structures (double-bounce)
- Low backscatter from smooth water surfaces
- Moderate VH from volume scattering in vegetation

**FUSED INTERPRETATION**
Both modalities indicate a **high-confidence built-up region** in the northern sector (confidence: 94%). The optical data confirms surface materials while SAR reveals structural density. Agricultural areas show complementary signals: optical shows crop health via NDVI, SAR shows surface roughness and moisture.

**Discrepancy Note**: SAR detects additional linear features (possible fence lines or drainage) not clearly visible in optical due to shadow/cloud effects.`,
  timestamp: new Date(),
  metadata: {
    queryType: 'multimodal',
    modelsUsed: ['SAR Analysis Model', 'Remote Sensing VLM', 'Geospatial Analysis Engine'],
    confidence: 0.912,
    processingTime: 5400,
    evidence: [
      {
        id: 'ev-007',
        type: 'region',
        label: 'Fused Built-up Detection',
        description: 'Both optical and SAR confirm urban structures',
        confidence: 0.94,
        imageRegion: { x: 0.40, y: 0.25, width: 0.30, height: 0.25 },
        data: { opticalConfidence: 0.92, sarConfidence: 0.91 },
      },
      {
        id: 'ev-008',
        type: 'comparison',
        label: 'Modality Agreement',
        description: 'Cross-validation of detections across modalities',
        confidence: 0.89,
        data: {
          agreement: 0.87,
          opticalOnly: 3,
          sarOnly: 2,
          both: 18,
        },
      },
    ],
    modelTrace: [
      ...mockOrchestrationSteps.slice(0, 3),
      {
        ...mockOrchestrationSteps[3],
        model: 'SAR Analysis Model, Remote Sensing VLM',
        children: [
          {
            id: 'execution-sar',
            name: 'SAR Analysis Model',
            description: 'Analyzing backscatter patterns and structural features',
            status: 'completed',
            progress: 100,
            model: 'SAR Analysis Model',
            startTime: new Date(Date.now() - 12000),
            endTime: new Date(Date.now() - 7000),
          },
          {
            id: 'execution-vlm-3',
            name: 'Remote Sensing VLM',
            description: 'Fusing optical and SAR interpretations',
            status: 'completed',
            progress: 100,
            model: 'Remote Sensing VLM',
            startTime: new Date(Date.now() - 8000),
            endTime: new Date(Date.now() - 4000),
          },
        ],
      },
      mockOrchestrationSteps[4],
    ],
  },
};

export const mockHistoryAnalyses: AnalysisResult[] = [
  {
    ...mockAnalysisResult,
    id: 'analysis-001',
    query: 'Identify the major land-cover classes in this scene and highlight the built-up regions.',
    timestamp: new Date(Date.now() - 86400000),
    imageIds: ['img-001'],
    confidence: 0.934,
    queryType: 'landcover',
  },
  {
    ...mockChangeDetectionResponse,
    id: 'analysis-002',
    query: 'What changed between these two observations?',
    timestamp: new Date(Date.now() - 172800000),
    imageIds: ['img-004', 'img-005'],
    confidence: 0.897,
    queryType: 'change',
  } as unknown as AnalysisResult,
  {
    ...mockMultimodalResponse,
    id: 'analysis-003',
    query: 'Compare optical and SAR observations of the same area.',
    timestamp: new Date(Date.now() - 259200000),
    imageIds: ['img-001', 'img-003'],
    confidence: 0.912,
    queryType: 'multimodal',
  } as unknown as AnalysisResult,
];