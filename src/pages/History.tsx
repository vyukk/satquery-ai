// TODO: Replace with API call to GET /api/analysis/history
const mockHistoryAnalyses: any[] = [];
import { clsx } from 'clsx';
import { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Clock,
  Target,
  Layers,
  Brain,
  MapPin,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { Tabs, TabsList, TabTrigger, TabsContent } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal, ConfirmDialog, Drawer } from '@/components/ui/Modal';
import { formatConfidence, formatDate, formatDuration, formatCoordinates } from '../utils/formatUtils';
import { useWorkspace } from '../context/WorkspaceContext';

const TYPE_FILTERS = [
  { value: 'all', label: 'All Types' },
  { value: 'landcover', label: 'Land Cover' },
  { value: 'change', label: 'Change Detection' },
  { value: 'multimodal', label: 'Multimodal' },
  { value: 'detection', label: 'Object Detection' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High Confidence (>90%)' },
  { value: 'medium', label: 'Medium (70-90%)' },
  { value: 'low', label: 'Low (<70%)' },
];

const TYPE_ICONS: Record<string, typeof Brain> = {
  landcover: Brain,
  change: Layers,
  multimodal: Target,
  detection: MapPin,
  general: Brain,
};

const TYPE_LABELS: Record<string, string> = {
  landcover: 'Land Cover Analysis',
  change: 'Temporal Change Detection',
  multimodal: 'Multimodal Fusion',
  detection: 'Object Detection',
  general: 'General Analysis',
};

export function History() {
  const { addImage } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'type'>('date');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  const filteredAnalyses = mockHistoryAnalyses
    .filter(analysis => {
      const matchesSearch = analysis.query.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || analysis.queryType === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'high' && analysis.confidence > 0.9) ||
        (statusFilter === 'medium' && analysis.confidence > 0.7 && analysis.confidence <= 0.9) ||
        (statusFilter === 'low' && analysis.confidence <= 0.7);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return b.timestamp.getTime() - a.timestamp.getTime();
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      return a.queryType.localeCompare(b.queryType);
    });

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || searchQuery !== '';

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const handleReopen = (analysis: typeof mockHistoryAnalyses[0]) => {
    // In a real app, this would restore the workspace state
    alert(`Reopening analysis: ${analysis.query}`);
  };

  const handleDelete = (id: string) => {
    // In a real app, this would delete from history
    alert(`Delete analysis ${id}`);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-space-900">
      <div className="p-4 border-b border-space-800 bg-space-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-space-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-space-100">ANALYSIS HISTORY</h1>
              <p className="text-sm text-space-400">Previous analyses and query results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm" className="font-mono">{mockHistoryAnalyses.length} analyses</Badge>
            <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}>
              {viewMode === 'list' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as 'all' | 'landcover' | 'change' | 'multimodal' | 'detection')}
              options={TYPE_FILTERS}
              placeholder="Type"
              className="w-44"
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'all' | 'high' | 'medium' | 'low')}
              options={STATUS_FILTERS}
              placeholder="Confidence"
              className="w-48"
            />
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as 'date' | 'confidence' | 'type')}
              options={[
                { value: 'date', label: 'Date (Newest)' },
                { value: 'confidence', label: 'Confidence' },
                { value: 'type', label: 'Type' },
              ]}
              placeholder="Sort"
              className="w-40"
            />
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AnalysisListItem 
                    analysis={analysis} 
                    isSelected={selectedAnalysis === analysis.id}
                    onClick={() => setSelectedAnalysis(selectedAnalysis === analysis.id ? null : analysis.id)}
                    onViewDetail={() => { setSelectedAnalysis(analysis.id); setShowDetail(true); }}
                    onReopen={() => handleReopen(analysis)}
                    onDelete={() => handleDelete(analysis.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredAnalyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AnalysisCard 
                    analysis={analysis} 
                    onClick={() => handleReopen(analysis)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredAnalyses.length === 0 && (
          <div className="flex items-center justify-center h-64 text-space-500">
            <div className="text-center">
              <Clock className="w-16 h-16 mx-auto text-space-700 mb-4" />
              <p className="text-lg">No analyses found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {selectedAnalysis && showDetail && (
        <AnalysisDetailModal 
          analysis={mockHistoryAnalyses.find(a => a.id === selectedAnalysis)!}
          onClose={() => { setSelectedAnalysis(null); setShowDetail(false); }}
        />
      )}
    </div>
  );
}

function AnalysisListItem({ 
  analysis, 
  isSelected, 
  onClick,
  onViewDetail,
  onReopen, 
  onDelete 
}: { 
  analysis: (typeof mockHistoryAnalyses)[number]; 
  isSelected: boolean; 
  onClick: () => void; 
  onViewDetail: () => void;
  onReopen: () => void; 
  onDelete: () => void; 
}) {
  const TypeIcon = TYPE_ICONS[analysis.queryType] || Brain;

  return (
    <Card 
      variant={isSelected ? 'hover' : 'default'} 
      className={clsx('cursor-pointer transition-all', isSelected && 'border-cyan-500/50 shadow-glow-cyan')}
      onClick={onClick}
      padding="md"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <TypeIcon className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-space-100 truncate">{TYPE_LABELS[analysis.queryType] || analysis.queryType}</h4>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm" className="font-mono">
                {formatConfidence(analysis.confidence)}
              </Badge>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {analysis.imageIds.length} image{analysis.imageIds.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-space-400 truncate mb-2">{analysis.query}</p>
          <div className="flex items-center gap-4 text-xs text-space-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(analysis.timestamp)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(analysis.processingTime)}
            </span>
            <span className="flex items-center gap-1 font-mono">
              {analysis.imageIds.map((id: string, i: number) => (
                <span key={i} className="px-1.5 py-0.5 bg-space-800 rounded border border-space-700 text-[10px]">
                  IMG-{i + 1}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="View Details">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onViewDetail(); }}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Reopen Analysis">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onReopen(); }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}

function AnalysisCard({ analysis, onClick }: { analysis: (typeof mockHistoryAnalyses)[number]; onClick: () => void }) {
  const TypeIcon = TYPE_ICONS[analysis.queryType] || Brain;

  return (
    <Card variant="hover" className="h-full flex flex-col cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-sm">{TYPE_LABELS[analysis.queryType] || analysis.queryType}</CardTitle>
              <Badge variant="success" size="sm" className="font-mono mt-1">{formatConfidence(analysis.confidence)}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-2">
        <p className="text-sm text-space-400 line-clamp-3 mb-4 flex-1">{analysis.query}</p>

        <Separator />

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-space-500">Date</span>
            <span className="font-mono text-space-300">{formatDate(analysis.timestamp)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-space-500">Processing Time</span>
            <span className="font-mono text-space-300">{formatDuration(analysis.processingTime)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-space-500">Images</span>
            <span className="font-mono text-space-300">{analysis.imageIds.length}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-space-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {analysis.imageIds.map((id: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-space-800 rounded border border-space-700 text-[10px] font-mono">
                IMG-{i + 1}
              </span>
            ))}
          </div>
          <Button variant="primary" size="sm" className="flex-1 max-w-xs justify-center">
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Reopen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalysisDetailModal({ analysis, onClose }: { analysis: (typeof mockHistoryAnalyses)[number]; onClose: () => void }) {
  const TypeIcon = TYPE_ICONS[analysis.queryType] || Brain;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-space-900 border border-space-700 rounded-xl shadow-panel animate-in">
        <div className="p-4 border-b border-space-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <TypeIcon className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-space-100">{TYPE_LABELS[analysis.queryType] || analysis.queryType}</h2>
              <Badge variant="success" size="sm" className="font-mono">{formatConfidence(analysis.confidence)}</Badge>
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
            <h3 className="section-title">QUERY</h3>
            <p className="text-space-300 font-mono text-sm bg-space-800 p-3 rounded border border-space-700">
              {analysis.query}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="section-title">AI ANSWER</h3>
            <div className="prose prose-sm prose-invert max-w-none text-space-300 text-sm leading-relaxed bg-space-800 p-4 rounded border border-space-700">
              {analysis.answer}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-space-800 rounded border border-space-700 text-center">
              <div className="text-2xl font-bold font-mono text-teal-400">{formatConfidence(analysis.confidence)}</div>
              <div className="text-xs text-space-500 mt-1">OVERALL CONFIDENCE</div>
            </div>
            <div className="p-3 bg-space-800 rounded border border-space-700 text-center">
              <div className="text-2xl font-bold font-mono text-space-100">{formatDuration(analysis.processingTime)}</div>
              <div className="text-xs text-space-500 mt-1">PROCESSING TIME</div>
            </div>
          </div>

          {analysis.keyFindings && analysis.keyFindings.length > 0 && (
            <div>
              <h3 className="section-title">KEY FINDINGS</h3>
              <div className="grid grid-cols-2 gap-3">
                {analysis.keyFindings.map((finding: any) => (
                  <div key={finding.id} className="p-3 bg-space-800 rounded border border-space-700">
                    <p className="text-xs text-space-500 uppercase tracking-wider mb-1">{finding.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-space-100">{finding.value}</span>
                      {finding.unit && <span className="text-sm text-space-400">{finding.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-space-800">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={() => { onClose(); alert('Reopening analysis...') }}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reopen Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


