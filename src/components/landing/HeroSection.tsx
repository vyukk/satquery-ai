import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield, Layers, Search, ExternalLink } from 'lucide-react';
import { Button } from '../ui';

interface HeroSectionProps {
  onLaunchWorkspace: () => void;
  onExploreArchitecture: () => void;
}

export function HeroSection({ onLaunchWorkspace, onExploreArchitecture }: HeroSectionProps) {
  const features = [
    { icon: Search, title: 'Natural Language Queries', desc: 'Ask questions about satellite imagery in plain English' },
    { icon: Layers, title: 'Multimodal Fusion', desc: 'Combine optical, SAR, and multispectral data seamlessly' },
    { icon: Zap, title: 'Agentic Orchestration', desc: 'AI automatically selects the right specialist models' },
    { icon: Shield, title: 'Evidence-Grounded', desc: 'Every answer backed by confidence scores and visual evidence' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 sat-grid opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Smart India Hackathon 2026 • SIH26167
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-space-100 tracking-tight leading-tight mb-6">
            Ask Questions.
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Extract Intelligence From Earth.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-space-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            SatQuery AI is an agentic vision-language assistant for querying, comparing, and interpreting 
            multimodal remote-sensing imagery through natural language.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" onClick={onLaunchWorkspace} className="group w-full sm:w-auto">
              <span className="flex items-center gap-2">
                Launch Workspace
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <Button variant="secondary" size="lg" onClick={onExploreArchitecture} className="w-full sm:w-auto">
              <span className="flex items-center gap-2">
                Explore Architecture
                <ExternalLink className="w-4 h-4" />
              </span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-space-500">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-500" />
              Optical + SAR + Multispectral
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-teal-500" />
              Agentic AI Orchestration
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-500" />
              Evidence-Grounded Results
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          className="mt-20 relative"
        >
          <div className="relative">
            <div className="aspect-video bg-space-900 rounded-xl border border-space-700 overflow-hidden relative shadow-panel">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />
              <div className="absolute inset-0 sat-grid opacity-20" />
              
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                  <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm font-mono">
                    <span className="px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20">LIVE DEMO</span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                  </div>
                  
                  <div className="bg-space-950 border border-space-700 rounded-lg p-4 text-left space-y-3 font-mono text-sm">
                    <div className="flex justify-between text-space-400">
                      <span>QUERY</span>
                      <span className="text-cyan-400">"Identify land-cover classes..."</span>
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
                    <div className="flex justify-between text-space-400">
                      <span>MODELS</span>
                      <span className="text-cyan-400">VLM + Classifier</span>
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

            <motion.div
              className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse-slow"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="card-hover group p-6"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:border-cyan-500/50 transition-colors">
                <feature.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-space-100 mb-2">{feature.title}</h3>
              <p className="text-space-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}