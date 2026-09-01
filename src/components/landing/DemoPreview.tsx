import { motion } from 'framer-motion';
import { CheckCircle, Terminal, Zap, Eye, Layers } from 'lucide-react';
import { clsx } from 'clsx';

const demoSteps = [
  { id: 1, label: 'Upload Image', icon: Eye, duration: 800 },
  { id: 2, label: 'Enter Query', icon: Terminal, duration: 600 },
  { id: 3, label: 'Agentic Routing', icon: Zap, duration: 1200 },
  { id: 4, label: 'Model Execution', icon: Layers, duration: 1500 },
  { id: 5, label: 'Evidence Synthesis', icon: CheckCircle, duration: 1000 },
  { id: 6, label: 'Grounded Answer', icon: CheckCircle, duration: 800 },
];

export function DemoPreview() {
  return (
    <section className="py-20 bg-space-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-space-100 tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-lg text-space-400">
            Watch SatQuery AI process a land-cover classification query end-to-end
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="relative">
            <div className="aspect-video bg-space-900 rounded-xl border border-space-700 overflow-hidden relative shadow-panel">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />
              <div className="absolute inset-0 sat-grid opacity-20" />
              
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                  <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-mono">
                    <span className="px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20">DEMO MODE</span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  </div>
                  
                  <div className="bg-space-950 border border-space-700 rounded-lg p-4 text-left space-y-3 font-mono text-sm">
                    <div className="flex justify-between text-space-400">
                      <span>QUERY</span>
                      <span className="text-cyan-400">"Identify land-cover..."</span>
                    </div>
                    <div className="h-px bg-space-700" />
                    <div className="space-y-2 text-space-300">
                      <div className="flex justify-between">
                        <span>Built-up</span>
                        <span className="text-red-400 font-medium">38.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agriculture</span>
                        <span className="text-amber-400 font-medium">31.4%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vegetation</span>
                        <span className="text-teal-400 font-medium">20.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water</span>
                        <span className="text-cyan-400 font-medium">9.6%</span>
                      </div>
                    </div>
                    <div className="h-px bg-space-700" />
                    <div className="flex justify-between text-space-400">
                      <span>CONFIDENCE</span>
                      <span className="text-teal-400 font-medium">93.4%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="flex gap-2">
                  <div className="w-24 h-12 bg-space-950 border border-space-700 rounded flex items-center justify-center text-xs text-space-400">Optical</div>
                  <div className="w-24 h-12 bg-space-950 border border-space-700 rounded flex items-center justify-center text-xs text-space-400">SAR</div>
                  <div className="w-24 h-12 bg-space-950 border border-cyan-500/30 rounded flex items-center justify-center text-xs text-cyan-400">Overlay</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-space-500">
                  <span>28.61°N, 77.21°E</span>
                  <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                  <span>1.0 m/px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-space-100">Agentic Orchestration Pipeline</h3>
                <div className="flex items-center gap-2 text-sm text-space-400">
                  <span className="w-2 h-2 bg-teal-500 rounded-full" />
                  <span>Live</span>
                </div>
              </div>
              <div className="space-y-3">
                {demoSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-space-950/50 rounded-lg border border-space-800 group"
                  >
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300',
                      index < 3 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 
                      index < 5 ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    )}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-space-100">{step.label}</div>
                      <div className="w-full h-1.5 bg-space-800 rounded-full overflow-hidden mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: index < 3 ? '100%' : index < 5 ? '60%' : '20%' }}
                          transition={{ duration: step.duration / 1000, delay: index * 0.2, ease: 'easeOut' }}
                          className={clsx(
                            'h-full rounded-full transition-all',
                            index < 3 ? 'bg-cyan-500' : index < 5 ? 'bg-teal-500' : 'bg-green-500'
                          )}
                        />
                      </div>
                    </div>
                    <div className="text-xs font-mono text-space-400 w-16 text-right">
                      {index < 3 ? '✓' : index < 5 ? '▶' : '⏳'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-space-100 mb-4">Key Differentiators</h3>
              <div className="space-y-3">
                {[
                  { label: 'Not a generic chatbot', desc: 'Specialized for remote sensing domain', icon: Zap },
                  { label: 'Agentic model routing', desc: 'Automatically selects VLM, SAR, Change Detection models', icon: Layers },
                  { label: 'Evidence-grounded', desc: 'Visual evidence + confidence scores for every claim', icon: CheckCircle },
                  { label: 'Multimodal native', desc: 'Optical + SAR + Multispectral fusion built-in', icon: Eye },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-space-950/50 rounded-lg border border-space-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-medium text-space-100 text-sm">{item.label}</div>
                      <div className="text-space-400 text-xs mt-0.5">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}