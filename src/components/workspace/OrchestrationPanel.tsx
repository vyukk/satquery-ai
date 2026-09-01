import { useWorkspace } from '../../context/WorkspaceContext';
import type { OrchestrationStep, SpecialistModel } from '../../types/orchestration';
// TODO: Replace with API call to GET /api/orchestration/tasks/{query_id}
const mockOrchestrationSteps: any[] = [];
import { clsx } from 'clsx';
import { useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Brain, 
  Zap, 
  Target, 
  Layers, 
  Search,
  ChevronDown,
  ChevronUp,
  Cpu,
  BarChart2,
  MapPin,
  Settings,
  GitCompare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { formatDuration } from '../../utils/formatUtils';

const STEP_ICONS: Record<string, typeof Brain> = {
  'query-understanding': Search,
  'task-planning': Brain,
  'specialist-selection': Zap,
  'execution': Target,
  'evidence-synthesis': Layers,
};

const STEP_LABELS: Record<string, string> = {
  'query-understanding': 'QUERY UNDERSTANDING',
  'task-planning': 'TASK PLANNER',
  'specialist-selection': 'SPECIALIST SELECTION',
  'execution': 'EXECUTION',
  'evidence-synthesis': 'EVIDENCE SYNTHESIS',
};

interface OrchestrationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrchestrationPanel({ isOpen: _isOpen, onClose }: OrchestrationPanelProps) {
  const { orchestrationState } = useWorkspace();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (!orchestrationState) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-space-800 flex items-center justify-between">
          <h2 className="font-semibold text-space-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            AGENTIC ORCHESTRATION
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center text-space-500">
          <p className="text-sm">Submit a query to see the agentic orchestration in action</p>
        </div>
      </div>
    );
  }

  const steps = orchestrationState.steps.length > 0 ? orchestrationState.steps : mockOrchestrationSteps;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-space-800 flex items-center justify-between">
        <h2 className="font-semibold text-space-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          AGENTIC ORCHESTRATION
        </h2>
        <div className="flex items-center gap-2">
          <CircularProgress 
            value={orchestrationState.overallProgress} 
            size={36} 
            strokeWidth={3} 
            variant="default"
            showLabel
            label={`${Math.round(orchestrationState.overallProgress)}%`}
          />
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-space-800">
        <div className="text-xs text-space-400 font-mono mb-2">USER QUERY</div>
        <div className="bg-space-800 border border-space-700 rounded-lg p-3 font-mono text-sm text-space-200">
          {orchestrationState.query}
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {steps.map((step: OrchestrationStep, index: number) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative"
            >
              <OrchestrationStepComponent 
                step={step} 
                index={index}
                isLast={index === steps.length - 1}
                expandedSteps={expandedSteps}
                setExpandedSteps={setExpandedSteps}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {orchestrationState.selectedSpecialists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="text-xs text-space-400 font-mono uppercase tracking-wider mb-3">SELECTED SPECIALISTS</div>
            <div className="space-y-2">
              {orchestrationState.selectedSpecialists.map((specialist) => (
                <SpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </div>
          </motion.div>
        )}

        {!orchestrationState.isComplete && orchestrationState.overallProgress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              <div>
                <p className="font-medium text-cyan-400">Orchestration in progress...</p>
                <p className="text-xs text-space-400">
                  Current step: {STEP_LABELS[orchestrationState.currentStep] || orchestrationState.currentStep}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OrchestrationStepComponent({ 
  step, 
  index: _index, 
  isLast, 
  expandedSteps, 
  setExpandedSteps 
}: { 
  step: OrchestrationStep;
  index: number;
  isLast: boolean;
  expandedSteps: Set<string>;
  setExpandedSteps: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const isExpanded = expandedSteps.has(step.id);
  const StepIcon = STEP_ICONS[step.id] || Brain;
  const stepLabel = STEP_LABELS[step.id] || step.name.toUpperCase();

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-teal-400" />;
      case 'running': return <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <div className="w-5 h-5 text-space-600" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed': return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
      case 'running': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'failed': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-space-500 border-space-600 bg-space-800';
    }
  };

  const toggleExpanded = () => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step.id)) {
        next.delete(step.id);
      } else {
        next.add(step.id);
      }
      return next;
    });
  };

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-space-700" />
      )}

      <div className="flex items-start gap-3">
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10',
          getStatusColor()
        )}>
          {getStatusIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <StepIcon className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-xs text-space-400 uppercase tracking-wider">{stepLabel}</span>
            <Progress value={step.progress} max={100} size="sm" showLabel className="w-32" />
          </div>

          <div className="ml-10 space-y-2">
            <p className="text-sm text-space-300">{step.description}</p>
            
            {step.model && (
              <div className="flex items-center gap-2 text-xs text-space-400">
                <Cpu className="w-3 h-3" />
                <span className="font-mono">{step.model}</span>
              </div>
            )}

            {step.children && step.children.length > 0 && (
              <div className="ml-4 mt-2 space-y-2 border-l border-space-700 pl-3">
                {step.children.map((child) => (
                  <div key={child.id} className="flex items-center gap-2 text-xs">
                    <div className={clsx(
                      'w-2 h-2 rounded-full',
                      child.status === 'completed' && 'bg-teal-400',
                      child.status === 'running' && 'bg-cyan-400 animate-pulse',
                      child.status === 'pending' && 'bg-space-600',
                      child.status === 'failed' && 'bg-red-400'
                    )} />
                    <span className="text-space-300">{child.name}</span>
                    <Progress value={child.progress} max={100} size="sm" className="w-24" />
                  </div>
                ))}
              </div>
            )}

            {isExpanded && step.output !== undefined && step.output !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-space-800 border border-space-700 rounded-lg"
              >
                <div className="font-mono text-xs text-space-400 mb-2">OUTPUT</div>
                <pre className="text-xs text-space-300 overflow-x-auto max-h-32 overflow-y-auto">
                  {String(step.output)}
                </pre>
              </motion.div>
            )}
          </div>
        </div>

        <button
          onClick={toggleExpanded}
          className="ml-2 mt-1 flex-shrink-0 p-1 text-space-500 hover:text-space-300 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function SpecialistCard({ specialist }: { specialist: SpecialistModel }) {
  const typeIcons: Record<string, typeof Cpu> = {
    vlm: Brain,
    'change-detection': GitCompare,
    'sar-analysis': Settings,
    geospatial: MapPin,
    classification: BarChart2,
    detection: Target,
  };
  const TypeIcon = typeIcons[specialist.type] || Cpu;

  return (
    <div className="card p-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <TypeIcon className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-space-100 text-sm">{specialist.name}</span>
            <Badge variant="outline" size="sm" className={specialist.status === 'available' ? 'text-teal-400 border-teal-500/30' : 'text-space-500'}>
              {specialist.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-space-500 mt-0.5">{specialist.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {specialist.capabilities.slice(0, 3).map((cap, i) => (
              <Badge key={i} variant="outline" size="sm" className="text-[10px]">
                {cap}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-space-400">
          {specialist.latency && (
            <span className="font-mono">{formatDuration(specialist.latency)}</span>
          )}
          {specialist.confidence && (
            <span className="font-mono text-teal-400">{Math.round(specialist.confidence * 100)}%</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ 
  value, 
  size = 36, 
  strokeWidth = 3, 
  variant = 'default', 
  showLabel = false, 
  label 
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number; 
  variant?: 'default' | 'success' | 'warning' | 'danger'; 
  showLabel?: boolean; 
  label?: string; 
}) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const variantStyles = {
    default: 'text-cyan-500',
    success: 'text-teal-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-space-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={clsx('transition-all duration-500', variantStyles[variant])}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-medium text-space-100" style={{ fontSize: size * 0.22 }}>
            {label ?? `${percentage.toFixed(0)}%`}
          </span>
        </div>
      )}
    </div>
  );
}