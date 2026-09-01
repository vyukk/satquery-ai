export interface SatelliteImage {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  name?: string;
  modality: 'optical' | 'sar' | 'multispectral' | 'hyperspectral';
  sensor: string;
  resolution: number; // meters per pixel
  acquisitionDate: Date;
  location: {
    lat: number;
    lng: number;
    bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  };
  crs: string; // Coordinate Reference System
  format: string;
  fileSize: number; // bytes
  width: number;
  height: number;
  bands?: string[];
  metadata: Record<string, unknown>;
  visible?: boolean;
  bounds?: [number, number, number, number];
}

export interface ImageUpload {
  file: File;
  preview: string;
  metadata?: Partial<SatelliteImage>;
  status: 'pending' | 'processing' | 'ready' | 'error';
  error?: string;
}

export interface DatasetSample {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  image: SatelliteImage;
  tags: string[];
}

export interface BoundingBox {
  id: string;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  width: number; // normalized 0-1
  height: number; // normalized 0-1
  label: string;
  confidence: number;
  classId: string;
  color: string;
  metadata?: Record<string, unknown>;
}

export interface DetectionRegion {
  id: string;
  boundingBox: BoundingBox;
  label: string;
  confidence: number;
  area: number; // hectares
  properties: Record<string, unknown>;
}