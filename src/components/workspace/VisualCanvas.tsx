import { useWorkspace } from '../../context/WorkspaceContext';
// TODO: Replace with API call to GET /api/datasets/{id}/images
const mockSatelliteImages: any[] = [];
import type { SatelliteImage } from '../../types/satellite';
import { clsx } from 'clsx';
import { useRef, useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Layers, 
  MapPin, 
  Target,
  Eye,
  EyeOff,
  Box,
  Move,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { formatCoordinates, formatDate, formatResolution } from '../../utils/formatUtils';

export function VisualCanvas() {
  const { 
    images, 
    selectedImageId, 
    comparisonImageId, 
    activeLayer, 
    zoom, 
    center, 
    setActiveLayer, 
    setZoom, 
    setCenter, 
    resetView 
  } = useWorkspace();

  const selectedImage = images.find(img => img.id === selectedImageId);
  const comparisonImage = images.find(img => img.id === comparisonImageId);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [showScale, setShowScale] = useState(true);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(Math.max(0.1, Math.min(10, zoom * delta)));
  };

  const handleZoomIn = () => setZoom(Math.min(10, zoom * 1.5));
  const handleZoomOut = () => setZoom(Math.max(0.1, zoom / 1.5));
  const handleResetView = () => {
    setZoom(1);
    setCenter({ x: 0.5, y: 0.5 });
  };
  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && canvasRef.current) {
      canvasRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const getLayerLabel = (layer: string) => {
    const labels: Record<string, string> = {
      optical: 'Optical',
      sar: 'SAR',
      overlay: 'Overlay',
      'change-map': 'Change Map',
    };
    return labels[layer] || layer;
  };

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case 'optical': return Eye;
      case 'sar': return Layers;
      case 'overlay': return Box;
      case 'change-map': return Target;
      default: return Eye;
    }
  };

  if (!selectedImage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-space-900 relative" ref={canvasRef}>
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-xl bg-space-800 border border-space-700 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 sat-grid opacity-30" />
            <svg className="w-12 h-12 text-space-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-space-100">No Image Selected</h3>
            <p className="text-space-400 mt-1">Load an image from the left panel to begin analysis</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-space-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Coordinates
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Scale
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Layers
            </span>
          </div>
        </div>
      </div>
    );
  }

  const LayerIcon = getLayerIcon(activeLayer);

  return (
    <div 
      className="flex-1 flex flex-col bg-space-900 relative overflow-hidden" 
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      onMouseLeave={() => setMousePosition(null)}
    >
      <div className="flex items-center justify-between p-3 border-b border-space-800 bg-space-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-space-100 text-lg">VISUAL ANALYSIS</h2>
          <Badge variant="outline" size="sm" className="font-mono">
            {selectedImage.modality.toUpperCase()} • {formatResolution(selectedImage.resolution)}
          </Badge>
        </div>

        <div className="flex items-center gap-1 bg-space-800 rounded-lg p-1 border border-space-700">
          {(['optical', 'sar', 'overlay', 'change-map'] as const).map(layer => {
            const isAvailable = layer === 'optical' || 
              (layer === 'sar' && comparisonImage?.modality === 'sar') ||
              (layer === 'overlay' && comparisonImage) ||
              (layer === 'change-map' && comparisonImage);
            
            return (
              <Tooltip key={layer} content={getLayerLabel(layer)}>
                <button
                  onClick={() => isAvailable && setActiveLayer(layer)}
                  disabled={!isAvailable}
                  className={clsx(
                    'p-2 rounded-md transition-all duration-150 flex items-center gap-1.5',
                    activeLayer === layer
                      ? 'bg-space-900 text-cyan-400 shadow-sm'
                      : 'text-space-500 hover:text-space-200 hover:bg-space-700',
                    !isAvailable && 'opacity-40 cursor-not-allowed'
                  )}
                  aria-label={getLayerLabel(layer)}
                  aria-pressed={activeLayer === layer}
                >
                  <LayerIcon className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">{getLayerLabel(layer)}</span>
                </button>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="Zoom In">
            <Button variant="ghost" size="sm" onClick={handleZoomIn} aria-label="Zoom in">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={`Zoom: ${Math.round(zoom * 100)}%`}>
            <Button variant="ghost" size="sm" onClick={handleResetView} aria-label="Reset view">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Zoom Out">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} aria-label="Zoom out">
              <ZoomOut className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <Button variant="ghost" size="sm" onClick={handleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{ 
            transform: `translate(${-center.x * 100}%, ${-center.y * 100}%) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <div className="w-full h-full relative sat-grid">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md p-8">
                <div className="w-32 h-32 mx-auto rounded-xl bg-space-800 border border-space-700 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10" />
                  <div className="absolute inset-0 sat-grid opacity-30" />
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 text-space-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-mono text-lg text-space-100">{selectedImage.filename}</p>
                  <p className="text-space-400 text-sm mt-1">
                    {selectedImage.sensor} • {formatDate(selectedImage.acquisitionDate)} • {formatResolution(selectedImage.resolution)}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-space-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {formatCoordinates(selectedImage.location.lat, selectedImage.location.lng)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {formatResolution(selectedImage.resolution)}
                  </span>
                </div>
              </div>
            </div>

            {mousePosition && showCoordinates && (
              <div className="absolute bottom-4 right-4 bg-space-900/90 backdrop-blur-sm border border-space-700 rounded-lg px-3 py-2 text-xs font-mono text-space-300 pointer-events-none">
                X: {(mousePosition.x * 100).toFixed(1)}% Y: {(mousePosition.y * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        {comparisonImage && activeLayer !== 'optical' && (
          <div className="absolute inset-0 opacity-50 transition-opacity duration-300">
            <div className="w-full h-full relative sat-grid">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2 max-w-xs p-4">
                  <div className="w-16 h-16 mx-auto rounded-lg bg-space-800 border border-space-700 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 sat-grid opacity-30" />
                    <Layers className="w-8 h-8 text-space-500" />
                  </div>
                  <p className="font-mono text-sm text-space-400">{comparisonImage.filename}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeLayer === 'change-map' && comparisonImage && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-teal-500/20 animate-pulse-slow" />
        )}
      </div>

      <div className="flex items-center justify-between p-3 border-t border-space-800 bg-space-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-xs text-space-500">
          {showCoordinates && mousePosition && (
            <span className="flex items-center gap-1.5 font-mono">
              <MapPin className="w-3 h-3" />
              X: {(mousePosition.x * 100).toFixed(2)}% Y: {(mousePosition.y * 100).toFixed(2)}%
            </span>
          )}
          {showCoordinates && selectedImage && (
            <span className="flex items-center gap-1.5 font-mono">
              <MapPin className="w-3 h-3" />
              {formatCoordinates(selectedImage.location.lat, selectedImage.location.lng)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-space-500">
          <span className="flex items-center gap-1.5 font-mono">
            <Target className="w-3 h-3" />
            Scale: {Math.round(zoom * 100)}%
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <Layers className="w-3 h-3" />
            {getLayerLabel(activeLayer)}
          </span>
        </div>
      </div>
    </div>
  );
}