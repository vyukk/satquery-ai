// TODO: Replace with API call to GET /api/models/specialists
const mockSpecialistModels: any[] = [];
import { clsx } from 'clsx';
import { useState } from 'react';
import type { SpecialistModel } from '../types/orchestration';
import { 
  Brain, 
  GitCompare, 
  Settings, 
  MapPin, 
  BarChart2, 
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Eye,
  ArrowRight,
  Zap,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Separator } from '@/components/ui/Separator';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabTrigger, TabsContent } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatDuration } from '../utils/formatUtils';

const MODEL_CATEGORIES = [
  { id: 'all', label: 'All Models', icon: Cpu },
  { id: 'vlm', label: 'Vision-Language', icon: Brain },
  { id: 'change-detection', label: 'Change Detection', icon: GitCompare },
  { id: 'sar-analysis', label: 'SAR Analysis', icon: Settings },
  { id: 'geospatial', label: 'Geospatial', icon: MapPin },
  { id: 'classification', label: 'Classification', icon: BarChart2 },
  { id: 'detection', label: 'Object Detection', icon: Target },
];

export function Models() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredModels = mockSpecialistModels.filter(model => 
    activeCategory === 'all' || model.type === activeCategory
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-space-900">
      <div className="p-4 border-b border-space-800 bg-space-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-space-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-space-100">SPECIALIST MODEL REGISTRY</h1>
              <p className="text-sm text-space-400">Available AI models for remote sensing analysis tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm" className="font-mono">{mockSpecialistModels.length} models</Badge>
            <StatusBadge status="online" label="Registry Online" size="sm" />
          </div>
        </div>

        <Tabs defaultValue={activeCategory} onChange={(value) => setActiveCategory(value)} className="w-full">
          <TabsList className="bg-space-800 border border-space-700 flex-wrap gap-1">
            {MODEL_CATEGORIES.map(category => (
              <TabTrigger key={category.id} value={category.id} className="gap-1.5">
                <category.icon className="w-4 h-4" />
                {category.label}
              </TabTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ModelCard 
                model={model} 
                isExpanded={showDetails === model.id}
                onToggle={() => setShowDetails(showDetails === model.id ? null : model.id)}
              />
            </motion.div>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="flex items-center justify-center h-64 text-space-500">
            <div className="text-center">
              <Cpu className="w-16 h-16 mx-auto text-space-700 mb-4" />
              <p className="text-lg">No models in this category</p>
            </div>
          </div>
        )}

        {showDetails && (
          <ModelDetailModal 
            model={mockSpecialistModels.find(m => m.id === showDetails)!}
            onClose={() => setShowDetails(null)}
          />
        )}
      </div>
    </div>
  );
}

function ModelCard({ model, isExpanded, onToggle }: { model: SpecialistModel; isExpanded: boolean; onToggle: () => void }) {
  const typeIcons = {
    vlm: Brain,
    'change-detection': GitCompare,
    'sar-analysis': Settings,
    geospatial: MapPin,
    classification: BarChart2,
    detection: Target,
  };
  const TypeIcon = typeIcons[model.type] || Cpu;

  const typeLabels: Record<string, string> = {
    vlm: 'VISION-LANGUAGE',
    'change-detection': 'CHANGE DETECTION',
    'sar-analysis': 'SAR ANALYSIS',
    geospatial: 'GEOSPATIAL',
    classification: 'CLASSIFICATION',
    detection: 'OBJECT DETECTION',
  };

  return (
    <Card variant="hover" className="h-full flex flex-col" onClick={onToggle}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{model.name}</CardTitle>
                <StatusBadge status={model.status === 'available' ? 'online' : 'offline'} label={model.status === 'available' ? 'Online' : 'Offline'} size="sm" />
              </div>
              <Badge variant="outline" size="sm" className="text-xs font-mono mt-1">
                {typeLabels[model.type] || model.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-space-400 mb-4 flex-1">{model.description}</p>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-space-500">CAPABILITIES</span>
              <span className="font-mono text-space-400">{model.capabilities.length} tasks</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {model.capabilities.slice(0, 4).map((cap, i) => (
                <Badge key={i} variant="outline" size="sm" className="text-[10px]">
                  {cap}
                </Badge>
              ))}
              {model.capabilities.length > 4 && (
                <Badge variant="outline" size="sm" className="text-[10px] text-space-500">
                  +{model.capabilities.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <MetricItem 
              label="INPUT" 
              value={model.inputModalities.join(', ').toUpperCase()} 
              icon={Layers} 
            />
            <MetricItem 
              label="LATENCY" 
              value={formatDuration(model.latency || 0)} 
              icon={Zap} 
            />
            <MetricItem 
              label="CONFIDENCE" 
              value={`${Math.round((model.confidence || 0) * 100)}%`} 
              icon={Target} 
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-space-800 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggle(); }} className="flex-1">
            {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="ml-1">{isExpanded ? 'Hide Details' : 'View Details'}</span>
          </Button>
          <Button variant="primary" size="sm" className="flex-1 justify-center">
            <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
            Use Model
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Layers }) {
  return (
    <div className="p-2 bg-space-800 rounded border border-space-700">
      <div className="flex items-center gap-1.5 text-xs text-space-500 mb-1">
        <Icon className="w-3 h-3" />
        <span className="font-mono">{label}</span>
      </div>
      <p className="font-mono text-sm text-space-100 truncate">{value}</p>
    </div>
  );
}

function ModelDetailModal({ model, onClose }: { model: SpecialistModel; onClose: () => void }) {
  const typeIcons = {
    vlm: Brain,
    'change-detection': GitCompare,
    'sar-analysis': Settings,
    geospatial: MapPin,
    classification: BarChart2,
    detection: Target,
  };
  const TypeIcon = typeIcons[model.type] || Cpu;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-space-900 border border-space-700 rounded-xl shadow-panel animate-in">
        <div className="p-4 border-b border-space-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center">
              <TypeIcon className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-space-100">{model.name}</h2>
              <StatusBadge status={model.status === 'available' ? 'online' : 'offline'} label={model.status === 'available' ? 'Online' : 'Offline'} size="sm" />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="section-title">DESCRIPTION</h3>
            <p className="text-space-300">{model.description}</p>
          </div>

          <div>
            <h3 className="section-title">CAPABILITIES</h3>
            <div className="flex flex-wrap gap-2">
              {model.capabilities.map((cap, i) => (
                <Badge key={i} variant="primary" size="sm">{cap}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="section-title">INPUT MODALITIES</h3>
            <div className="flex flex-wrap gap-2">
              {model.inputModalities.map((mod: string, i: number) => (
                <Badge key={i} variant="outline" size="sm" className="font-mono">{mod.toUpperCase()}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-space-800 rounded border border-space-700 text-center">
              <div className="text-2xl font-bold font-mono text-cyan-400">{formatDuration(model.latency || 0)}</div>
              <div className="text-xs text-space-500 mt-1">AVG LATENCY</div>
            </div>
            <div className="p-3 bg-space-800 rounded border border-space-700 text-center">
              <div className="text-2xl font-bold font-mono text-teal-400">{Math.round((model.confidence || 0) * 100)}%</div>
              <div className="text-xs text-space-500 mt-1">CONFIDENCE</div>
            </div>
            <div className="p-3 bg-space-800 rounded border border-space-700 text-center">
              <div className="text-2xl font-bold font-mono text-space-100">{model.capabilities.length}</div>
              <div className="text-xs text-space-500 mt-1">TASKS SUPPORTED</div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="section-title">TECHNICAL SPECIFICATIONS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-space-400">Model Type</span>
                <span className="font-mono text-space-100">{model.type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Status</span>
                <StatusBadge status={model.status === 'available' ? 'online' : 'offline'} label={model.status === 'available' ? 'Online' : 'Offline'} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Supported Modalities</span>
                <span className="font-mono text-space-100">{model.inputModalities.length}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-space-800">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="primary">
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
              Deploy Model
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


import { EyeOff } from 'lucide-react';