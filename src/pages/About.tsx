import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Layers, 
  Target, 
  Zap, 
  Brain, 
  Shield, 
  Eye, 
  Code, 
  Cpu, 
  GitBranch,
  ArrowRight,
  ExternalLink,
  Database,
  BarChart2,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-space-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Smart India Hackathon 2026 • SIH26167
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-space-100 tracking-tight mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">SatQuery AI</span>
            <br />
            Architecture Overview
          </h1>
          <p className="text-lg text-space-400 leading-relaxed">
            An agentic Vision-Language Assistant for querying, comparing, and interpreting 
            multimodal remote-sensing imagery through natural language.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-space-800/50 border-b border-space-700 p-6">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-space-950" />
                </div>
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-space-100">Challenge</h3>
                  <p className="text-space-300 text-sm leading-relaxed">
                    Remote-sensing data is powerful but difficult to interpret without specialized knowledge. 
                    Existing tools require expert-level training and domain expertise.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-space-100">Our Solution</h3>
                  <p className="text-space-300 text-sm leading-relaxed">
                    SatQuery AI provides a natural-language interface that allows users to query 
                    satellite imagery and receive evidence-grounded answers powered by specialist AI models.
                  </p>
                </div>
              </div>
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-cyan-300 text-sm font-medium">Problem ID: SIH26167</p>
                <p className="text-cyan-400 text-xs mt-1">
                  "SatQuery AI – An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Text Queries"
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-space-100 tracking-tight mb-4">System Architecture</h2>
            <p className="text-space-400">End-to-end agentic pipeline for remote sensing intelligence</p>
          </div>

          <Card className="overflow-hidden bg-gradient-to-b from-space-900 to-space-950">
            <CardContent className="p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                <ArchitectureStep 
                  icon={<Brain className="w-6 h-6" />}
                  title="USER"
                  subtitle="Natural Language Query"
                  color="cyan"
                  isLast={false}
                />
                
                <ArchitectureStep 
                  icon={<Code className="w-6 h-6" />}
                  title="WEB APPLICATION"
                  subtitle="React + TypeScript Frontend"
                  color="cyan"
                  isLast={false}
                />
                
                <ArchitectureStep 
                  icon={<Zap className="w-6 h-6" />}
                  title="QUERY UNDERSTANDING"
                  subtitle="Intent classification, entity extraction, query planning"
                  color="teal"
                  isLast={false}
                />
                
                <ArchitectureStep 
                  icon={<Cpu className="w-6 h-6" />}
                  title="AGENTIC ORCHESTRATOR"
                  subtitle="Routes queries to specialist models based on task requirements"
                  color="amber"
                  isLast={false}
                />
                
                <div className="grid grid-cols-3 gap-4 py-4">
                  <AgentCard 
                    title="VLM Agent"
                    subtitle="Remote Sensing Vision-Language Model"
                    icon={<Eye className="w-5 h-5" />}
                    capabilities={['Image understanding', 'VQA', 'Captioning', 'Land cover interpretation']}
                  />
                  <AgentCard 
                    title="SAR Agent"
                    subtitle="Synthetic Aperture Radar Specialist"
                    icon={<Layers className="w-5 h-5" />}
                    capabilities={['Backscatter analysis', 'Structural features', 'Moisture detection']}
                  />
                  <AgentCard 
                    title="Change Detector"
                    subtitle="Temporal Analysis Model"
                    icon={<GitBranch className="w-5 h-5" />}
                    capabilities={['Change localization', 'Change classification', 'Magnitude estimation']}
                  />
                </div>
                
                <ArchitectureStep 
                  icon={<Layers className="w-6 h-6" />}
                  title="EVIDENCE FUSION"
                  subtitle="Cross-model validation, confidence aggregation, region alignment"
                  color="cyan"
                  isLast={false}
                />
                
                <ArchitectureStep 
                  icon={<Shield className="w-6 h-6" />}
                  title="ANSWER GENERATION"
                  subtitle="Grounded response synthesis with evidence citations"
                  color="teal"
                  isLast={false}
                />
                
                <ArchitectureStep 
                  icon={<Target className="w-6 h-6" />}
                  title="EVIDENCE-GROUNDED RESULT"
                  subtitle="Answer + confidence scores + visual evidence + model trace"
                  color="cyan"
                  isLast={true}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-space-100 tracking-tight mb-4">Data Flow</h2>
            <p className="text-space-400">From raw satellite imagery to actionable intelligence</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Input Data', desc: 'GeoTIFF, SAR, Multispectral imagery ingestion', icon: Database, color: 'cyan' },
              { step: '02', title: 'Preprocessing', desc: 'Registration, alignment, spectral normalization', icon: Layers, color: 'teal' },
              { step: '03', title: 'Specialist Analysis', desc: 'Model-specific feature extraction and interpretation', icon: Cpu, color: 'amber' },
              { step: '04', title: 'Results', desc: 'Evidence-grounded answers with confidence scores', icon: BarChart2, color: 'cyan' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Card variant="hover" className="h-full">
                  <div className="text-3xl font-bold font-mono text-space-800 mb-2">{item.step}</div>
                  <div className={`w-10 h-10 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-3`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                  </div>
                  <h3 className="font-semibold text-space-100 mb-1">{item.title}</h3>
                  <p className="text-xs text-space-400">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-space-100 tracking-tight mb-4">Key Innovations</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Agentic Model Routing', desc: 'Automatically selects specialist models based on query requirements rather than using a single monolithic model', icon: Zap },
              { title: 'Multimodal Native', desc: 'Designed from ground up for optical, SAR, and multispectral data fusion with complementary evidence', icon: Layers },
              { title: 'Evidence-Grounded', desc: 'Every answer includes visual evidence, confidence scores, and full model traceability', icon: Shield },
              { title: 'Temporal Analysis', desc: 'Built-in change detection with before/after comparison and quantified change statistics', icon: GitBranch },
              { title: 'Geospatial Intelligence', desc: 'Native support for GeoTIFF, CRS transformations, and coordinate-aware analysis', icon: MapPin },
              { title: 'Visual Orchestration', desc: 'Users can see exactly which models are being used and how decisions are being made', icon: Eye },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
              >
                <Card variant="hover" className="h-full">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-space-100 mb-2">{item.title}</h3>
                  <p className="text-space-400 text-sm">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-space-100">Ready to Explore?</h2>
              <p className="text-space-400 max-w-xl mx-auto">
                Try SatQuery AI with sample datasets or upload your own satellite imagery.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/workspace">
                  <Button size="lg">
                    Launch Workspace
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/datasets">
                  <Button variant="secondary" size="lg">
                    Explore Datasets
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ArchitectureStep({ 
  icon, 
  title, 
  subtitle, 
  color, 
  isLast 
}: { 
  icon: React.ReactNode; 
  title: string; 
  subtitle: string; 
  color: string; 
  isLast: boolean; 
}) {
  const colors: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    teal: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {!isLast && (
        <div className="w-px h-4 bg-space-600 absolute -bottom-6" />
      )}
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-center">
        <div className="font-mono text-xs text-space-400 uppercase tracking-wider">{title}</div>
        <div className="text-sm text-space-300 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}

function AgentCard({ 
  title, 
  subtitle, 
  icon, 
  capabilities 
}: { 
  title: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  capabilities: string[]; 
}) {
  return (
    <Card variant="hover" className="h-full">
      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-space-100 text-sm">{title}</h4>
      <p className="text-xs text-space-400 mt-1 mb-3">{subtitle}</p>
      <div className="space-y-1">
        {capabilities.map((cap, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-space-500">
            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
            {cap}
          </div>
        ))}
      </div>
    </Card>
  );
}