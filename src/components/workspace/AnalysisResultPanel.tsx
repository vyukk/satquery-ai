import { useWorkspace } from '../../context/WorkspaceContext';
import type { AnalysisResult, KeyFinding, EvidenceItem } from '../../types/analysis';
import { clsx } from 'clsx';

// TODO: Replace with API call to GET /api/analysis/{id}
const mockAnalysisResult: AnalysisResult = {
  id: 'analysis-001',
  query: 'Load from API',
  timestamp: new Date(),
  imageIds: [],
  answer: 'Analysis result pending...',
  confidence: 0,
  keyFindings: [],
  evidence: [],
  modelTrace: [],
  processingTime: 0,
  queryType: 'general' as const,
};
import { 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Eye, 
  Copy, 
  Download,
  BarChart2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Hash,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Separator } from '@/components/ui/Separator';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Modal, ConfirmDialog, Drawer } from '@/components/ui/Modal';
import { formatConfidence, formatDuration } from '../../utils/formatUtils';
import { useState } from 'react';

interface AnalysisResultPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisResultPanel({ isOpen: _isOpen, onClose }: AnalysisResultPanelProps) {
  const { currentAnalysis } = useWorkspace();
  const analysis = currentAnalysis || mockAnalysisResult;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['answer', 'findings']));
  const [showExportModal, setShowExportModal] = useState(false);

  if (!analysis && !currentAnalysis) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-space-800 flex items-center justify-between">
          <h2 className="font-semibold text-space-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-400" />
            ANALYSIS RESULTS
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-space-500">
          <p className="text-sm">Run an analysis to see results here</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-space-800 flex items-center justify-between">
        <h2 className="font-semibold text-space-100 flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-400" />
          ANALYSIS RESULTS
        </h2>
        <div className="flex items-center gap-2">
          <Tooltip content="Export Report">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Copy Answer">
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(analysis.answer)}>
              <Copy className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnalysisSection 
          id="answer"
          title="AI ANSWER"
          icon={<Hash className="w-5 h-5" />}
          expanded={expandedSections.has('answer')}
          onToggle={() => toggleSection('answer')}
        >
          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-space-200 leading-relaxed">
            {analysis.answer}
          </div>
        </AnalysisSection>

        <AnalysisSection 
          id="findings"
          title="KEY FINDINGS"
          icon={<BarChart2 className="w-5 h-5" />}
          expanded={expandedSections.has('findings')}
          onToggle={() => toggleSection('findings')}
        >
          <div className="grid grid-cols-2 gap-3">
            {analysis.keyFindings.map((finding) => (
              <KeyFindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </AnalysisSection>

        <AnalysisSection 
          id="evidence"
          title="EVIDENCE"
          icon={<Eye className="w-5 h-5" />}
          expanded={expandedSections.has('evidence')}
          onToggle={() => toggleSection('evidence')}
        >
          <div className="space-y-3">
            {analysis.evidence.map((evidence) => (
              <EvidenceCard key={evidence.id} evidence={evidence} />
            ))}
          </div>
        </AnalysisSection>

        <AnalysisSection 
          id="trace"
          title="MODEL TRACE"
          icon={<Layers className="w-5 h-5" />}
          expanded={expandedSections.has('trace')}
          onToggle={() => toggleSection('trace')}
        >
          <ModelTraceView trace={analysis.modelTrace} />
        </AnalysisSection>

        <div className="pt-4 border-t border-space-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-space-400">
              <Target className="w-3.5 h-3.5" />
              <span className="font-mono text-teal-400">{formatConfidence(analysis.confidence)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-space-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-mono">{formatDuration(analysis.processingTime)}</span>
            </span>
          </div>
          <Badge variant="primary" size="sm" className="font-mono">
            {analysis.queryType.toUpperCase()}
          </Badge>
        </div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} analysis={analysis} />
    </div>
  );
}

function AnalysisSection({ 
  id: _id, 
  title, 
  icon, 
  expanded, 
  onToggle, 
  children 
}: { 
  id: string;
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 pb-0 flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            {icon}
          </div>
          <span className="section-title">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={expanded ? 100 : 0} max={100} size="sm" className="w-20" variant="success" />
          {expanded ? <ChevronUp className="w-4 h-4 text-space-400" /> : <ChevronDown className="w-4 h-4 text-space-400" />}
        </div>
      </CardHeader>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-2">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function KeyFindingCard({ finding }: { finding: KeyFinding }) {
  const trendIcons = {
    up: <svg className="w-3 h-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
    down: <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
    stable: <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>,
  };

  return (
    <Card variant="hover" padding="md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-space-500 uppercase tracking-wider mb-1">{finding.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-space-100">{finding.value}</span>
            {finding.unit && <span className="text-sm text-space-400">{finding.unit}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {finding.trend && trendIcons[finding.trend]}
          <Badge variant="success" size="sm" className="font-mono">
            {formatConfidence(finding.confidence)}
          </Badge>
        </div>
      </div>
      {finding.icon && (
        <div className="mt-3 pt-3 border-t border-space-800 flex items-center justify-between">
          <span className="text-xs text-space-500">{finding.icon} Confidence</span>
          <Progress value={finding.confidence * 100} max={100} size="sm" className="w-24" variant="success" />
        </div>
      )}
    </Card>
  );
}

function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  const typeIcons: Record<string, typeof MapPin> = {
    region: MapPin,
    statistic: BarChart2,
    comparison: Layers,
    overlay: Eye,
    chart: BarChart2,
  };
  const TypeIcon = typeIcons[evidence.type] || MapPin;

  return (
    <Card variant="hover" padding="md">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <TypeIcon className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-space-100 text-sm">{evidence.label}</h4>
            <Badge variant="success" size="sm" className="font-mono">
              {formatConfidence(evidence.confidence)}
            </Badge>
          </div>
          <p className="text-xs text-space-400 mt-1">{evidence.description}</p>
          
          {evidence.imageRegion && (
            <div className="mt-2 flex items-center gap-2 text-xs text-space-500">
              <span className="font-mono bg-space-800 px-2 py-0.5 rounded">
                X: {(evidence.imageRegion.x * 100).toFixed(1)}%
              </span>
              <span className="font-mono bg-space-800 px-2 py-0.5 rounded">
                Y: {(evidence.imageRegion.y * 100).toFixed(1)}%
              </span>
              <span className="font-mono bg-space-800 px-2 py-0.5 rounded">
                W: {(evidence.imageRegion.width * 100).toFixed(1)}%
              </span>
              <span className="font-mono bg-space-800 px-2 py-0.5 rounded">
                H: {(evidence.imageRegion.height * 100).toFixed(1)}%
              </span>
            </div>
          )}

          {evidence.data && Object.keys(evidence.data).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(evidence.data).slice(0, 4).map(([key, value]) => (
                <Badge key={key} variant="outline" size="sm" className="text-[10px]">
                  {key}: {typeof value === 'number' ? value.toFixed(1) : String(value)}
                </Badge>
              ))}
            </div>
          )}

          {evidence.chartData && evidence.chartData.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {evidence.chartData.map((point, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: point.color || '#06b6d4' }} />
                  <span className="text-xs text-space-300 flex-1">{point.label}</span>
                  <Progress value={point.value} max={100} size="sm" className="w-24" variant="default" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ModelTraceView({ trace }: { trace: Array<{
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  model?: string;
  startTime?: Date;
  endTime?: Date;
  output?: unknown;
  confidence?: number;
  progress?: number;
  children?: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    description: string;
    model?: string;
    startTime?: Date;
    endTime?: Date;
    output?: unknown;
    confidence?: number;
    progress?: number;
  }>;
}> }) {
  return (
    <div className="space-y-3">
      {trace.map((step, index) => (
        <ModelTraceStep key={step.id} step={step} index={index} />
      ))}
    </div>
  );
}

function ModelTraceStep({ step }: { step: {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  model?: string;
  startTime?: Date;
  endTime?: Date;
  output?: unknown;
  confidence?: number;
  progress?: number;
  children?: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    description: string;
    model?: string;
    startTime?: Date;
    endTime?: Date;
    output?: unknown;
    confidence?: number;
    progress?: number;
  }>;
}, index: number }) {
  const getStatusColor = () => {
    switch (step.status) {
      case 'completed': return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'running': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-space-500 bg-space-800 border-space-600';
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'running': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <Card variant="hover" padding="md" className="relative">
      <div className="flex items-start gap-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', getStatusColor())}>
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-space-100 text-sm">{step.name}</span>
            {step.model && (
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {step.model}
              </Badge>
            )}
            {step.confidence && (
              <Badge variant="success" size="sm" className="font-mono">
                {formatConfidence(step.confidence)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-space-400 ml-10">{step.description}</p>
          
          {step.children && step.children.length > 0 && (
            <div className="ml-10 mt-2 space-y-1.5 border-l border-space-700 pl-3">
              {step.children.map((child) => (
                <div key={child.id} className="flex items-center gap-2 text-xs">
                  <div className={clsx(
                    'w-1.5 h-1.5 rounded-full',
                    child.status === 'completed' && 'bg-teal-400',
                    child.status === 'running' && 'bg-cyan-400 animate-pulse',
                    child.status === 'pending' && 'bg-space-600',
                    child.status === 'failed' && 'bg-red-400'
                  )} />
                  <span className="text-space-300 flex-1">{child.name}</span>
                  <Progress value={child.progress ?? 0} max={100} size="sm" className="w-20" variant="default" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ExportModal({ isOpen, onClose, analysis: _analysis }: { isOpen: boolean; onClose: () => void; analysis: AnalysisResult }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Export Analysis Report" 
      description="Generate a professional analysis report for sharing or archival"
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 card cursor-pointer hover:border-cyan-500/30 transition-colors">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
            <div className="flex-1">
              <p className="font-medium text-space-100 text-sm">Full Report (PDF)</p>
              <p className="text-xs text-space-500">Complete analysis with evidence, charts, and model trace</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 card cursor-pointer hover:border-cyan-500/30 transition-colors">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
            <div className="flex-1">
              <p className="font-medium text-space-100 text-sm">Executive Summary (HTML)</p>
              <p className="text-xs text-space-500">Condensed version for quick review</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 card cursor-pointer hover:border-cyan-500/30 transition-colors">
            <input type="checkbox" className="w-4 h-4 accent-cyan-500" />
            <div className="flex-1">
              <p className="font-medium text-space-100 text-sm">Raw Data (JSON)</p>
              <p className="text-xs text-space-500">Structured data for programmatic access</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 card cursor-pointer hover:border-cyan-500/30 transition-colors">
            <input type="checkbox" className="w-4 h-4 accent-cyan-500" />
            <div className="flex-1">
              <p className="font-medium text-space-100 text-sm">Evidence Pack (ZIP)</p>
              <p className="text-xs text-space-500">All imagery crops and visual evidence</p>
            </div>
          </label>
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onClose(); alert('Report generation simulated - would create PDF/HTML/JSON in production') }}>
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { Loader2 } from 'lucide-react';