import { useWorkspace } from '../context/WorkspaceContext';
// TODO: Replace with API call to GET /api/datasets
const mockSatelliteImages: any[] = [];
import { clsx } from 'clsx';
import { useState } from 'react';
import type { SatelliteImage } from '../types/satellite';
import { 
  Eye, 
  EyeOff, 
  Layers, 
  Target, 
  Maximize, 
  Minimize,
  RotateCcw,
  MapPin,
  BarChart2,
  CheckCircle2,
  ArrowLeftRight,
  RefreshCw,
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

const FUSION_EVIDENCE = [
  {
    id: 'fe-1',
    label: 'Urban Core',
    optical: { detected: true, confidence: 0.92, features: ['High reflectance', 'Geometric patterns'] },
    sar: { detected: true, confidence: 0.91, features: ['Double-bounce scattering', 'High coherence'] },
    fused: { confidence: 0.94, agreement: 'HIGH' },
  },
  {
    id: 'fe-2',
    label: 'Agricultural Fields',
    optical: { detected: true, confidence: 0.89, features: ['NDVI > 0.6', 'Regular patterns'] },
    sar: { detected: true, confidence: 0.76, features: ['Volume scattering', 'Moderate backscatter'] },
    fused: { confidence: 0.85, agreement: 'MODERATE' },
  },
  {
    id: 'fe-3',
    label: 'Water Bodies',
    optical: { detected: true, confidence: 0.96, features: ['NIR absorption', 'Low reflectance'] },
    sar: { detected: true, confidence: 0.98, features: ['Specular reflection', 'Near-zero backscatter'] },
    fused: { confidence: 0.97, agreement: 'VERY HIGH' },
  },
];

const MODALITY_AGREEMENT = {
  both: 18,
  opticalOnly: 3,
  sarOnly: 2,
};

export function Multimodal() {
  const { images, selectedImageId, comparisonImageId, setActiveLayer, activeLayer } = useWorkspace();
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'swipe'>('side-by-side');
  const [swipePosition, setSwipePosition] = useState(50);
  const [opacity, setOpacity] = useState(50);
  const [showAnalysis, setShowAnalysis] = useState(true);

  const opticalImage = images.find(img => img.id === selectedImageId) || mockSatelliteImages[1];
  const sarImage = images.find(img => img.id === comparisonImageId) || mockSatelliteImages[2];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-space-900">
      <div className="p-4 border-b border-space-800 bg-space-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Layers className="w-6 h-6 text-space-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-space-100">MULTIMODAL FUSION</h1>
              <p className="text-sm text-space-400">Joint analysis of optical and SAR imagery for complementary insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" className="font-mono">FUSION COMPLETE</Badge>
            <Badge variant="primary" size="sm" className="font-mono">{formatConfidence(0.912)}</Badge>
          </div>
        </div>

        <Tabs defaultValue={viewMode} onChange={(value) => setViewMode(value as 'side-by-side' | 'overlay' | 'swipe')} className="w-full">
          <TabsList className="bg-space-800 border border-space-700">
            <TabTrigger value="side-by-side">
              <Eye className="w-4 h-4 mr-1.5" />
              Side-by-Side
            </TabTrigger>
            <TabTrigger value="overlay">
              <Layers className="w-4 h-4 mr-1.5" />
              Overlay
            </TabTrigger>
            <TabTrigger value="swipe">
              <ArrowLeftRight className="w-4 h-4 mr-1.5" />
              Swipe Compare
            </TabTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <TabsContent value="side-by-side" className="flex-1 flex">
          <ImagePanel 
            image={opticalImage} 
            label="OPTICAL IMAGE"
            modality="optical"
            badgeColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
          />
          <div className="w-px bg-space-800" />
          <ImagePanel 
            image={sarImage} 
            label="SAR IMAGE"
            modality="sar"
            badgeColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
          />
        </TabsContent>

        <TabsContent value="overlay" className="flex-1 relative">
          <ImagePanel 
            image={opticalImage} 
            label="OPTICAL (BASE)"
            modality="optical"
            badgeColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
            fullScreen
          />
          <div className="absolute inset-0" style={{ opacity: opacity / 100 }}>
            <ImagePanel 
              image={sarImage} 
              label="SAR (OVERLAY)"
              modality="sar"
              badgeColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
              fullScreen
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="card p-3 max-w-md mx-auto">
              <label className="text-xs text-space-400 font-mono mb-2 block">SAR OPACITY: {opacity}%</label>
              <Slider value={opacity} onChange={(value) => setOpacity(Number(value))} min={0} max={100} step={5} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="swipe" className="flex-1 relative">
          <ImagePanel 
            image={opticalImage} 
            label="OPTICAL"
            modality="optical"
            badgeColor="text-amber-400 bg-amber-500/10 border-amber-500/20"
            fullScreen
          />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - swipePosition}% 0 0)` }}>
            <ImagePanel 
              image={sarImage} 
              label="SAR"
              modality="sar"
              badgeColor="text-purple-400 bg-purple-500/10 border-purple-500/20"
              fullScreen
            />
          </div>
          <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none">
            <div className="absolute top-0 bottom-0 w-1 bg-cyan-500/50" style={{ left: `${swipePosition}%` }} />
            <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-auto">
              <div 
                className="w-10 h-10 rounded-full bg-space-900/90 backdrop-blur-sm border border-space-700 flex items-center justify-center cursor-ew-resize active:scale-110 transition-transform"
                style={{ left: `${swipePosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={(e) => {
                  const handleMove = (moveEvent: MouseEvent) => {
                    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                    if (rect) {
                      const percent = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                      setSwipePosition(percent);
                    }
                  };
                  const handleUp = () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleUp);
                  };
                  document.addEventListener('mousemove', handleMove);
                  document.addEventListener('mouseup', handleUp);
                }}
              >
                <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>
        </TabsContent>

        <div className="w-80 lg:w-96 border-l border-space-800 bg-space-900/50 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-space-800">
            <CardTitle className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              COMPLEMENTARY EVIDENCE
            </CardTitle>
            <div className="space-y-3">
              {FUSION_EVIDENCE.map((evidence) => (
                <FusionEvidenceCard key={evidence.id} evidence={evidence} />
              ))}
            </div>
          </div>

          <Separator className="mx-4" />

          <div className="p-4 border-b border-space-800">
            <CardTitle className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              MODALITY AGREEMENT
            </CardTitle>
            <div className="space-y-3">
              <AgreementBar label="Both Modalities" value={MODALITY_AGREEMENT.both} total={23} color="teal" />
              <AgreementBar label="Optical Only" value={MODALITY_AGREEMENT.opticalOnly} total={23} color="amber" />
              <AgreementBar label="SAR Only" value={MODALITY_AGREEMENT.sarOnly} total={23} color="purple" />
            </div>
          </div>

          <Separator className="mx-4" />

          {showAnalysis && (
            <div className="p-4 flex-1 overflow-y-auto">
              <CardTitle className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-teal-400" />
                FUSED INTERPRETATION
              </CardTitle>
              <div className="prose prose-sm prose-invert max-w-none text-space-300 text-sm leading-relaxed space-y-3">
                <p><strong>OPTICAL (Sentinel-2)</strong></p>
                <p>Visible surface characteristics detected: healthy vegetation (high NIR reflectance), urban areas (high visible reflectance), water bodies (strong NIR/SWIR absorption).</p>
                <p><strong>SAR (Sentinel-1)</strong></p>
                <p>Structural and moisture-related response detected: high VV backscatter from urban structures (double-bounce), low backscatter from smooth water, moderate VH from vegetation volume scattering.</p>
                <p><strong>FUSED INTERPRETATION</strong></p>
                <p>Both modalities indicate a <span className="text-teal-400 font-semibold">high-confidence built-up region</span> in the northern sector (confidence: 94%). Optical confirms surface materials while SAR reveals structural density.</p>
                <p className="text-amber-400"><strong>Discrepancy Note:</strong> SAR detects additional linear features (possible fence lines or drainage) not clearly visible in optical due to shadow/cloud effects.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImagePanel({ 
  image, 
  label, 
  modality, 
  badgeColor, 
  fullScreen = false 
}: { 
  image: any;
  label: string;
  modality: string;
  badgeColor: string;
  fullScreen?: boolean;
}) {
  return (
    <div className={clsx('flex flex-col relative overflow-hidden', fullScreen ? 'absolute inset-0' : 'flex-1')}>
      <div className="flex items-center justify-between p-3 border-b border-space-800 bg-space-900/50">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-space-800 border border-space-700 rounded text-xs font-mono text-space-400">{label}</span>
          <Badge variant="outline" size="sm" className={clsx('font-mono', badgeColor)}>
            {modality.toUpperCase()} • {formatResolution(image.resolution)}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {fullScreen && (
            <Tooltip content="Reset View">
              <Button variant="ghost" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className={clsx('flex-1 relative overflow-hidden', fullScreen ? 'h-full' : '')}>
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
                <p className="text-space-400 text-sm mt-1">{image.sensor} • {formatDate(image.acquisitionDate)} • {formatResolution(image.resolution)}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-space-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {formatCoordinates(image.location.lat, image.location.lng)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border-t border-space-800 bg-space-900/50">
        <div className="flex items-center gap-4 text-xs text-space-500">
          <span className="flex items-center gap-1.5 font-mono">
            <MapPin className="w-3 h-3" />
            {formatCoordinates(image.location.lat, image.location.lng)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-space-500">
          <span className="flex items-center gap-1.5 font-mono">
            <BarChart2 className="w-3 h-3" />
            {formatResolution(image.resolution)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FusionEvidenceCard({ evidence }: { evidence: any }) {
  const agreementColors = {
    'HIGH': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    'MODERATE': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'VERY HIGH': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <Card variant="hover" padding="md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-medium text-space-100 text-sm">{evidence.label}</h4>
          <Badge variant="outline" size="sm" className={agreementColors[evidence.fused.agreement as keyof typeof agreementColors]}>
            Agreement: {evidence.fused.agreement}
          </Badge>
        </div>
        <Badge variant="success" size="sm" className="font-mono">
          {formatConfidence(evidence.fused.confidence)}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="p-2 bg-space-800 rounded border border-space-700">
          <div className="flex items-center gap-1.5 text-xs mb-1">
            <Eye className="w-3 h-3 text-amber-400" />
            <span className="font-medium text-amber-400">OPTICAL</span>
            <Badge variant="success" size="sm" className="font-mono ml-auto">{formatConfidence(evidence.optical.confidence)}</Badge>
          </div>
          <ul className="text-xs text-space-400 space-y-0.5 ml-5">
            {evidence.optical.features.map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-amber-500 rounded-full" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-2 bg-space-800 rounded border border-space-700">
          <div className="flex items-center gap-1.5 text-xs mb-1">
            <Layers className="w-3 h-3 text-purple-400" />
            <span className="font-medium text-purple-400">SAR</span>
            <Badge variant="success" size="sm" className="font-mono ml-auto">{formatConfidence(evidence.sar.confidence)}</Badge>
          </div>
          <ul className="text-xs text-space-400 space-y-0.5 ml-5">
            {evidence.sar.features.map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-purple-500 rounded-full" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function AgreementBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = (value / total) * 100;
  const colors = {
    teal: 'bg-teal-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-space-300">{label}</span>
        <span className="font-mono text-space-100">{value} / {total}</span>
      </div>
      <div className="h-2 bg-space-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', colors[color as keyof typeof colors])}
        />
      </div>
    </div>
  );
}

import { GitCompare } from 'lucide-react';