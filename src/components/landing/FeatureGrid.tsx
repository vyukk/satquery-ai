import { motion } from 'framer-motion';
import { 
  Image, 
  Layers, 
  GitCompare, 
  Cpu, 
  Search, 
  Shield, 
  Map,
  BarChart3,
} from 'lucide-react';

const capabilities = [
  {
    icon: Search,
    title: 'Visual Question Answering',
    description: 'Ask natural language questions about satellite imagery and receive detailed, evidence-grounded answers.',
    features: ['Land cover identification', 'Object detection', 'Scene description', 'Spatial reasoning'],
  },
  {
    icon: Image,
    title: 'Single Image Analysis',
    description: 'Comprehensive analysis of individual satellite scenes across multiple spectral bands.',
    features: ['Classification', 'Detection', 'Segmentation', 'Metadata extraction'],
  },
  {
    icon: Layers,
    title: 'Multimodal Fusion',
    description: 'Joint analysis of optical, SAR, and multispectral imagery for complementary insights.',
    features: ['Optical + SAR', 'Cross-validation', 'Gap filling', 'Confidence fusion'],
  },
  {
    icon: GitCompare,
    title: 'Temporal Change Detection',
    description: 'Compare multi-temporal observations to detect and quantify surface changes.',
    features: ['Change localization', 'Change classification', 'Magnitude estimation', 'Trend analysis'],
  },
  {
    icon: Cpu,
    title: 'Agentic Orchestration',
    description: 'Intelligent model routing that selects and chains specialist models automatically.',
    features: ['Query classification', 'Task planning', 'Model selection', 'Evidence synthesis'],
  },
  {
    icon: Shield,
    title: 'Evidence-Grounded Results',
    description: 'Every answer includes confidence scores, visual evidence, and full model traceability.',
    features: ['Confidence scoring', 'Visual evidence', 'Model trace', 'Export reports'],
  },
  {
    icon: Map,
    title: 'Geospatial Intelligence',
    description: 'Native support for geospatial data formats, projections, and spatial operations.',
    features: ['GeoTIFF support', 'CRS handling', 'Coordinate display', 'Area calculation'],
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Rich visualizations including charts, heatmaps, and statistical summaries.',
    features: ['Land cover stats', 'Change metrics', 'Confidence distributions', 'Temporal trends'],
  },
];

export function FeatureGrid() {
  return (
    <section className="py-20 bg-space-950/50 border-y border-space-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-space-100 tracking-tight mb-4">
            Built for Remote Sensing Intelligence
          </h2>
          <p className="text-lg text-space-400">
            Every capability designed specifically for satellite imagery analysis workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="card-hover group p-6 h-full"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/20 transition-all duration-300">
                <capability.icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-space-100 mb-2">{capability.title}</h3>
              <p className="text-space-400 text-sm mb-4">{capability.description}</p>
              <ul className="space-y-1.5">
                {capability.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-space-500 group-hover:text-space-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-cyan-500/30 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}