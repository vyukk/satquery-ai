import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { DemoPreview } from '../components/landing/DemoPreview';
import { SIHCompactBadge } from '../components/landing/SIHBadge';

export function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection
        onLaunchWorkspace={() => navigate('/workspace')}
        onExploreArchitecture={() => navigate('/about')}
      />
      <FeatureGrid />
      <DemoPreview />
      
      <footer className="py-12 border-t border-space-800/50 bg-space-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-space-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-semibold text-space-100">SatQuery AI</span>
            </div>
            
            <div className="flex items-center gap-4">
              <SIHCompactBadge />
            </div>
            
            <div className="flex items-center gap-6 text-sm text-space-500">
              <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">API Reference</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-space-800/50 text-center text-xs text-space-600">
            Built for Smart India Hackathon 2026 • Problem Statement SIH26167
          </div>
        </div>
      </footer>
    </>
  );
}