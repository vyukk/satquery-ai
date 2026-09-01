import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { PageTransition } from './components/layout/PageTransition';
import { Landing } from './pages/Landing';
import { Workspace } from './pages/Workspace';
import { ChangeDetection } from './pages/ChangeDetection';
import { Multimodal } from './pages/Multimodal';
import { Datasets } from './pages/Datasets';
import { Models } from './pages/Models';
import { History } from './pages/History';
import { About } from './pages/About';
import './index.css';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/workspace" element={<Workspace />} />
      <Route path="/change-detection" element={<ChangeDetection />} />
      <Route path="/multimodal" element={<Multimodal />} />
      <Route path="/datasets" element={<Datasets />} />
      <Route path="/models" element={<Models />} />
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-space-950">
            <Header />
            <main className="pt-14 min-h-screen">
              <AnimatePresence mode="wait">
                <PageTransition>
                  <AppRoutes />
                </PageTransition>
              </AnimatePresence>
            </main>
          </div>
        </BrowserRouter>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}

export default App;