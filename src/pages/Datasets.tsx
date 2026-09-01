// TODO: Replace with API call to GET /api/datasets with pagination
const mockDatasetSamples: any[] = [];
import { clsx } from 'clsx';
import { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Image,
  MapPin,
  Calendar,
  Settings,
  Download,
  Eye,
  Database,
  Tag,
  Sun,
  Cloud,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { Tabs, TabsList, TabTrigger, TabsContent } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatDate, formatResolution, formatFileSize, formatCoordinates } from '../utils/formatUtils';
import { useWorkspace } from '../context/WorkspaceContext';

const MODALITY_FILTERS = [
  { value: 'all', label: 'All Modalities' },
  { value: 'optical', label: 'Optical' },
  { value: 'sar', label: 'SAR' },
  { value: 'multispectral', label: 'Multispectral' },
  { value: 'hyperspectral', label: 'Hyperspectral' },
];

const SENSOR_FILTERS = [
  { value: 'all', label: 'All Sensors' },
  { value: 'Cartosat-2A', label: 'Cartosat-2A' },
  { value: 'Cartosat-3', label: 'Cartosat-3' },
  { value: 'Sentinel-2A MSI', label: 'Sentinel-2A MSI' },
  { value: 'Sentinel-1A C-SAR', label: 'Sentinel-1A C-SAR' },
  { value: 'Landsat-9 OLI-2', label: 'Landsat-9 OLI-2' },
  { value: 'RISAT-2B X-SAR', label: 'RISAT-2B X-SAR' },
];

const RESOLUTION_FILTERS = [
  { value: 'all', label: 'All Resolutions' },
  { value: 'high', label: 'High (< 1m)' },
  { value: 'medium', label: 'Medium (1-10m)' },
  { value: 'low', label: 'Low (> 10m)' },
];

const REGION_FILTERS = [
  { value: 'all', label: 'All Regions' },
  { value: 'india', label: 'India' },
  { value: 'global', label: 'Global' },
];

export function Datasets() {
  const { addImage } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [sensorFilter, setSensorFilter] = useState('all');
  const [resolutionFilter, setResolutionFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDatasets = mockDatasetSamples.filter((dataset: any) => {
    const matchesSearch = dataset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesModality = modalityFilter === 'all' || dataset.image.modality === modalityFilter;
    const matchesSensor = sensorFilter === 'all' || dataset.image.sensor === sensorFilter;
    const matchesResolution = resolutionFilter === 'all' || 
      (resolutionFilter === 'high' && dataset.image.resolution < 1) ||
      (resolutionFilter === 'medium' && dataset.image.resolution >= 1 && dataset.image.resolution <= 10) ||
      (resolutionFilter === 'low' && dataset.image.resolution > 10);
    const matchesRegion = regionFilter === 'all' || 
      (regionFilter === 'india' && dataset.tags.includes('india'));

    return matchesSearch && matchesModality && matchesSensor && matchesResolution && matchesRegion;
  });

  const hasActiveFilters = modalityFilter !== 'all' || sensorFilter !== 'all' || 
    resolutionFilter !== 'all' || regionFilter !== 'all';

  const clearFilters = () => {
    setModalityFilter('all');
    setSensorFilter('all');
    setResolutionFilter('all');
    setRegionFilter('all');
  };

  const handleDatasetClick = (dataset: typeof mockDatasetSamples[0]) => {
    addImage(dataset.image);
    setSelectedDataset(dataset.id);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-space-900">
      <div className="p-4 border-b border-space-800 bg-space-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-space-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-space-100">DATASET BROWSER</h1>
              <p className="text-sm text-space-400">Explore and load curated remote sensing datasets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm" className="font-mono">{mockDatasetSamples.length} datasets</Badge>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span className="hidden sm:inline">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-space-500">
                  <Filter className="w-3.5 h-3.5" />
                  <span>FILTERS</span>
                </div>
                <Select
                  value={modalityFilter}
                  onChange={setModalityFilter}
                  options={MODALITY_FILTERS}
                  placeholder="Modality"
                  className="w-40"
                />
                <Select
                  value={sensorFilter}
                  onChange={setSensorFilter}
                  options={SENSOR_FILTERS}
                  placeholder="Sensor"
                  className="w-48"
                />
                <Select
                  value={resolutionFilter}
                  onChange={setResolutionFilter}
                  options={RESOLUTION_FILTERS}
                  placeholder="Resolution"
                  className="w-40"
                />
                <Select
                  value={regionFilter}
                  onChange={setRegionFilter}
                  options={REGION_FILTERS}
                  placeholder="Region"
                  className="w-40"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredDatasets.map((dataset, index) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <DatasetCard 
                    dataset={dataset} 
                    isSelected={selectedDataset === dataset.id}
                    onClick={() => handleDatasetClick(dataset)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredDatasets.map((dataset, index) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <DatasetListItem 
                    dataset={dataset} 
                    isSelected={selectedDataset === dataset.id}
                    onClick={() => handleDatasetClick(dataset)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredDatasets.length === 0 && (
          <div className="flex items-center justify-center h-64 text-space-500">
            <div className="text-center">
              <Database className="w-16 h-16 mx-auto text-space-700 mb-4" />
              <p className="text-lg">No datasets found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DatasetCard({ dataset, isSelected, onClick }: { dataset: (typeof mockDatasetSamples)[number]; isSelected: boolean; onClick: () => void }) {
  const modalityColors: Record<string, string> = {
    optical: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    sar: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    multispectral: 'text-green-400 bg-green-500/10 border-green-500/20',
    hyperspectral: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  };

  const modalityIcons: Record<string, typeof Sun> = {
    optical: Sun,
    sar: Cloud,
    multispectral: Image,
    hyperspectral: Settings,
  };
  const ModalityIcon = modalityIcons[dataset.image.modality] || Sun;

  return (
    <Card 
      variant={isSelected ? 'hover' : 'default'} 
      className={clsx('cursor-pointer h-full transition-all', isSelected && 'border-cyan-500/50 shadow-glow-cyan')}
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden rounded-lg bg-space-800 border border-space-700 mb-3">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />
        <div className="absolute inset-0 sat-grid opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ModalityIcon className="w-12 h-12 text-space-500" />
        </div>
        {isSelected && (
          <div className="absolute inset-0 bg-cyan-500/10 border-2 border-cyan-500 pointer-events-none" />
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" size="sm" className={modalityColors[dataset.image.modality]}>
            {dataset.image.modality.toUpperCase()}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-sm truncate">{dataset.name}</CardTitle>
        <p className="text-xs text-space-500 line-clamp-2">{dataset.description}</p>
      </CardHeader>

      <CardContent className="pt-2 space-y-2">
        <div className="flex flex-wrap gap-1">
          {dataset.tags.slice(0, 4).map((tag: string) => (
            <Badge key={tag} variant="outline" size="sm" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-space-400">
            <MapPin className="w-3 h-3" />
            <span className="font-mono">{formatCoordinates(dataset.image.location.lat, dataset.image.location.lng)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-space-400">
            <Calendar className="w-3 h-3" />
            <span className="font-mono">{formatDate(dataset.image.acquisitionDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-space-400">
            <Settings className="w-3 h-3" />
            <span className="font-mono">{formatResolution(dataset.image.resolution)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-space-400">
            <Database className="w-3 h-3" />
            <span className="font-mono">{formatFileSize(dataset.image.fileSize)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-space-500">{dataset.image.sensor}</span>
          <Button variant="ghost" size="sm" className={isSelected ? 'text-teal-400' : ''}>
            {isSelected ? <Eye className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DatasetListItem({ dataset, isSelected, onClick }: { dataset: (typeof mockDatasetSamples)[number]; isSelected: boolean; onClick: () => void }) {
  const modalityColors: Record<string, string> = {
    optical: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    sar: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    multispectral: 'text-green-400 bg-green-500/10 border-green-500/20',
    hyperspectral: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  };

  return (
    <Card 
      variant={isSelected ? 'hover' : 'default'} 
      className={clsx('cursor-pointer transition-all', isSelected && 'border-cyan-500/50')}
      onClick={onClick}
      padding="md"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-space-800 border border-space-700 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5" />
          <div className="absolute inset-0 sat-grid opacity-30" />
          <Image className="w-8 h-8 text-space-500 relative" />
          <Badge variant="outline" size="sm" className={clsx('absolute bottom-1 right-1', modalityColors[dataset.image.modality])}>
            {dataset.image.modality.toUpperCase()}
          </Badge>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-space-100 truncate">{dataset.name}</h4>
            {isSelected && <span className="text-teal-400 font-mono text-xs">ACTIVE</span>}
          </div>
          <p className="text-xs text-space-500 truncate">{dataset.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {dataset.tags.slice(0, 5).map((tag: string) => (
              <Badge key={tag} variant="outline" size="sm" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-1.5 text-xs text-space-400">
            <span className="font-mono">{formatResolution(dataset.image.resolution)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-space-400">
            <span className="font-mono">{formatDate(dataset.image.acquisitionDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-space-400">
            <span className="font-mono">{formatFileSize(dataset.image.fileSize)}</span>
          </div>
          <Button variant="ghost" size="sm" className={isSelected ? 'text-teal-400' : ''}>
            {isSelected ? <Eye className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}