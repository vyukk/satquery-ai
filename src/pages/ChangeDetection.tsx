import { useWorkspace } from '../context/WorkspaceContext';
// TODO: Replace with API calls
// POST /api/analysis/query for change detection
// GET /api/datasets for satellite images
const mockChangeDetectionResponse = {
  id: 'msg-002',
  role: 'assistant' as const,
  content: 'Change detection results pending from backend...',
  timestamp: new Date(),
};

const mockSatelliteImages: any[] = [];
import { clsx } from 'clsx';
import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Layers, 
  Target, 
  Maximize, 
  Minimize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  MapPin,
  BarChart2,
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Separator } from '@/components/ui/Separator';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Tabs, TabsList, TabTrigger, TabsContent } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatConfidence, formatArea, formatDate, formatResolution, formatCoordinates } from '../utils/formatUtils';

const CHANGE_STATS = [
  { label: 'New Built-up Area', value: '+14.8 ha', change: 14.8, type: 'gain', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20', icon: Plus },
  { label: 'Vegetation Loss', value: '-9.2 ha', change: -9.2, type: 'loss', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20', icon: Minus },
  { label: 'Water Extension', value: '+2.1 ha', change: 2.1, type: 'gain', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/20', icon: Plus },
  { label: 'Total Changed Area', value: '26.1 ha', change: 26.1, type: 'total', color: 'text-space-100', bgColor: 'bg-cyan-500/10 border-cyan-500/20', icon: BarChart2 },
];

const CHANGE_REGIONS = [
  { id: 'cr-1', label: 'Northern Urban Expansion', type: 'new-builtup', confidence: 0.88, area: 14.8, coords: { x: 0.58, y: 0.12, w: 0.22, h: 0.18 } },
  { id: 'cr-2', label: 'Agricultural Conversion', type: 'vegetation-loss', confidence: 0.85, area: 9.2, coords: { x: 0.45, y: 0.35, w: 0.15, h: 0.12 } },
  { id: 'cr-3', label: 'Reservoir Expansion', type: 'water-gain', confidence: 0.91, area: 2.1, coords: { x: 0.22, y: 0.68, w: 0.12, h: 0.10 } },
];

export function ChangeDetection() {
  const { images, selectedImageId, comparisonImageId, selectImage, setComparisonImage, setActiveLayer, activeLayer } = useWorkspace();
  const [opacity, setOpacity] = useState(50);
  const [viewMode, setViewMode] = useState<'before' | 'after' | 'overlay' | 'change-map' | 'difference'>('overlay');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);

  const beforeImage = images.find(img => img.id === selectedImageId) || mockSatelliteImages[3];
  const afterImage = images.find(img => img.id === comparisonImageId) || mockSatelliteImages[4];

  const viewModes = [
    { id: 'before', label: 'Before', icon: RotateCcw },
    { id: 'after', label: 'After', icon: RotateCcw },
    { id: 'overlay', label: 'Overlay', icon: Layers },
    { id: 'change-map', label: 'Change Map', icon: Target },
    { id: 'difference', label: 'Difference', icon: Minus },
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-space-900">
      <div className="p-4 border-b border-space-800 bg-space-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
              <GitCompare className="w-6 h-6 text-space-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-space-100">TEMPORAL CHANGE ANALYSIS</h1>
              <p className="text-sm text-space-400">Compare multi-temporal observations to detect surface changes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" className="font-mono">AI EXPLANATION READY</Badge>
            <Badge variant="primary" size="sm" className="font-mono">{formatConfidence(0.897)}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {viewModes.map(mode => (
            <Tooltip key={mode.id} content={mode.label}>
              <button
                onClick={() => {
                  const nextMode = mode.id as 'before' | 'after' | 'overlay' | 'change-map' | 'difference';
                  setViewMode(nextMode);
                  const mappedLayer = nextMode === 'before' || nextMode === 'after' ? 'optical' : nextMode;
                  setActiveLayer(mappedLayer as 'optical' | 'sar' | 'overlay' | 'change-map');
                }}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  viewMode === mode.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-space-400 hover:text-space-100 hover:bg-space-800'
                )}
              >
                <mode.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={clsx(
          'flex-1 relative',
          viewMode === 'overlay' || viewMode === 'change-map' || viewMode === 'difference' ? '' : 'border-r border-space-800'
        )}>
          <ImageViewer 
            image={beforeImage} 
            label="BEFORE"
            date={formatDate(beforeImage.acquisitionDate)}
            sensor={beforeImage.sensor}
            resolution={formatResolution(beforeImage.resolution)}
            coords={formatCoordinates(beforeImage.location.lat, beforeImage.location.lng)}
            viewMode={viewMode}
            opacity={opacity}
            isReference={true}
          />
        </div>

        {viewMode === 'overlay' || viewMode === 'change-map' || viewMode === 'difference' ? (
          <div className="flex-1 relative">
            <ImageViewer 
              image={afterImage} 
              label="AFTER"
              date={formatDate(afterImage.acquisitionDate)}
              sensor={afterImage.sensor}
              resolution={formatResolution(afterImage.resolution)}
              coords={formatCoordinates(afterImage.location.lat, afterImage.location.lng)}
              viewMode={viewMode}
              opacity={opacity}
              isReference={false}
            />
          </div>
        ) : (
          <div className="flex-1 relative">
            <ImageViewer 
              image={afterImage} 
              label="AFTER"
              date={formatDate(afterImage.acquisitionDate)}
              sensor={afterImage.sensor}
              resolution={formatResolution(afterImage.resolution)}
              coords={formatCoordinates(afterImage.location.lat, afterImage.location.lng)}
              viewMode={viewMode}
              opacity={opacity}
              isReference={false}
            />
          </div>
        )}

        <div className="w-80 lg:w-96 border-l border-space-800 bg-space-900/50 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-space-800">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-400" />
                CHANGE MAP CONTROLS
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(!showAnalysis)}>
                {showAnalysis ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-space-400 font-mono mb-2 block">OPACITY: {opacity}%</label>
                <Slider value={opacity} onChange={(value) => setOpacity(Array.isArray(value) ? value[0] ?? 0 : value)} min={0} max={100} step={5} />
              </div>

              <Separator />

              <div>
                <label className="text-xs text-space-400 font-mono mb-2 block">DETECTED CHANGES</label>
                <div className="space-y-2">
                  {CHANGE_STATS.map((stat, index) => (
                    <div key={`${stat.label}-${index}`} className={clsx('p-3 rounded-lg border', stat.bgColor)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <stat.icon className={clsx('w-4 h-4', stat.color)} />
                          <span className="font-medium text-space-100 text-sm">{stat.label}</span>
                        </div>
                        <span className={clsx('font-mono text-sm font-semibold', stat.color)}>{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 border-t border-space-800">
            <CardTitle className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              CHANGE REGIONS
            </CardTitle>
            <div className="space-y-2">
              {CHANGE_REGIONS.map(region => (
                <ChangeRegionCard 
                  key={region.id} 
                  region={region} 
                  isSelected={selectedRegion === region.id}
                  onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                />
              ))}
            </div>
          </div>

          {showAnalysis && (
            <div className="p-4 border-t border-space-800">
              <CardTitle className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                AI EXPLANATION
              </CardTitle>
              <div className="prose prose-sm prose-invert max-w-none text-space-300 text-sm leading-relaxed">
                {mockChangeDetectionResponse.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ 
  image, 
  label, 
  date, 
  sensor, 
  resolution, 
  coords, 
  viewMode, 
  opacity, 
  isReference 
}: { 
  image: any;
  label: string;
  date: string;
  sensor: string;
  resolution: string;
  coords: string;
  viewMode: string;
  opacity: number;
  isReference: boolean;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between p-3 border-b border-space-800 bg-space-900/50">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-space-800 border border-space-700 rounded text-xs font-mono text-space-400">{label}</span>
          <Badge variant="outline" size="sm" className="font-mono">
            {image.modality.toUpperCase()} • {resolution}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="Fullscreen">
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
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
                <p className="font-mono text-lg text-space-100">{image.filename}</p>
                <p className="text-space-400 text-sm mt-1">{sensor} • {date} • {resolution}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-space-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {coords}
                </span>
              </div>
            </div>
          </div>

          {viewMode === 'overlay' && !isReference && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-teal-500/20" style={{ opacity: opacity / 100 }} />
          )}
          
          {viewMode === 'change-map' && !isReference && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-amber-500/10 to-teal-500/30" style={{ opacity: opacity / 100 }} />
          )}

          {viewMode === 'difference' && !isReference && (
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/40 via-transparent to-cyan-500/40" style={{ opacity: opacity / 100 }} />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border-t border-space-800 bg-space-900/50">
        <div className="flex items-center gap-4 text-xs text-space-500">
          <span className="flex items-center gap-1.5 font-mono">
            <MapPin className="w-3 h-3" />
            {coords}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-space-500">
          <span className="flex items-center gap-1.5 font-mono">
            <BarChart2 className="w-3 h-3" />
            {resolution}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChangeRegionCard({ region, isSelected, onClick }: { region: any; isSelected: boolean; onClick: () => void }) {
  const typeColors: Record<'new-builtup' | 'vegetation-loss' | 'water-gain', string> = {
    'new-builtup': 'text-red-400 bg-red-500/10 border-red-500/20',
    'vegetation-loss': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'water-gain': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  const regionType = String(region.type) as keyof typeof typeColors;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'card p-3 text-left transition-all',
        isSelected && 'border-cyan-500/50 shadow-glow-cyan'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className={typeColors[regionType] ?? typeColors['new-builtup']}>
            {region.label}
          </Badge>
        </div>
        <Badge variant="success" size="sm" className="font-mono">
          {formatConfidence(region.confidence)}
        </Badge>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-space-400">
        <span className="flex items-center gap-1 font-mono">
          <MapPin className="w-3 h-3" />
          {formatArea(region.area)}
        </span>
        <span className="flex items-center gap-1 font-mono">
          X: {(region.coords.x * 100).toFixed(0)}%
        </span>
        <span className="flex items-center gap-1 font-mono">
          Y: {(region.coords.y * 100).toFixed(0)}%
        </span>
      </div>
    </button>
  );
}

import { GitCompare } from 'lucide-react';