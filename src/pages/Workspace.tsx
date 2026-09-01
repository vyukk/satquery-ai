import { useWorkspace } from '../context/WorkspaceContext';
import { ImageInputPanel } from '../components/workspace/ImageInputPanel';
import { VisualCanvas } from '../components/workspace/VisualCanvas';
import { AssistantPanel } from '../components/workspace/AssistantPanel';
import { clsx } from 'clsx';

export function Workspace() {
  const { leftPanelOpen, rightPanelOpen, setLeftPanelOpen, setRightPanelOpen } = useWorkspace();

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      <aside
        className={clsx(
          'flex-shrink-0 w-80 lg:w-96 border-r border-space-800 bg-space-900/50 backdrop-blur-sm transition-all duration-300 ease-in-out overflow-y-auto',
          leftPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto'
        )}
        aria-label="Image input panel"
      >
        <ImageInputPanel />
      </aside>

      <div className={clsx(
        'flex-1 flex flex-col min-w-0 relative',
        rightPanelOpen ? 'lg:pr-96' : 'lg:pr-0'
      )}>
        <VisualCanvas />
      </div>

      <aside
        className={clsx(
          'fixed lg:relative inset-y-0 right-0 z-30 w-96 border-l border-space-800 bg-space-900/50 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col',
          rightPanelOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto'
        )}
        aria-label="AI assistant panel"
      >
        <AssistantPanel />
      </aside>

      {!leftPanelOpen && (
        <button
          onClick={() => setLeftPanelOpen(true)}
          className="fixed left-4 top-20 z-20 lg:hidden btn-primary shadow-glow-cyan"
          aria-label="Open image panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="fixed right-4 top-20 z-20 lg:hidden btn-primary shadow-glow-cyan"
          aria-label="Open assistant panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
}