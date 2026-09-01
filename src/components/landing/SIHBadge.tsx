import { Award, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface SIHBadgeProps {
  className?: string;
}

export function SIHBadge({ className }: SIHBadgeProps) {
  return (
    <div className={clsx(
      'inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-space-900 to-space-800 border border-cyan-500/30 rounded-xl shadow-glow-cyan',
      className
    )}>
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
        <Award className="w-6 h-6 text-space-950" />
      </div>
      <div className="text-left">
        <div className="font-bold text-space-100 text-sm tracking-wide">SMART INDIA HACKATHON 2026</div>
        <div className="font-mono text-cyan-400 text-lg font-semibold">SIH26167</div>
        <div className="text-space-400 text-xs mt-1">
          SatQuery AI — Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis
        </div>
      </div>
    </div>
  );
}

export function SIHCompactBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
      <span className="font-mono text-xs font-semibold text-cyan-400">SIH26167</span>
    </div>
  );
}