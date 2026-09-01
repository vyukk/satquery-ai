import { useWorkspace } from '../../context/WorkspaceContext';
// TODO: Replace with API calls to POST /api/analysis/query
// Mock responses will be replaced with real API responses
const mockChatResponse = {
  id: 'msg-001',
  role: 'assistant' as const,
  content: 'Response pending from backend...',
  timestamp: new Date(),
};

const mockChangeDetectionResponse = {
  id: 'msg-002',
  role: 'assistant' as const,
  content: 'Change detection analysis pending...',
  timestamp: new Date(),
};

const mockMultimodalResponse = {
  id: 'msg-003',
  role: 'assistant' as const,
  content: 'Multimodal fusion analysis pending...',
  timestamp: new Date(),
};
import type { ChatMessage, SuggestedQuery } from '../../types/chat';
import { clsx } from 'clsx';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Loader2, 
  Zap, 
  Brain, 
  Target, 
  Layers, 
  Copy,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabTrigger, TabsContent } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatConfidence, formatDuration } from '../../utils/formatUtils';
import { OrchestrationPanel } from './OrchestrationPanel';
import { AnalysisResultPanel } from './AnalysisResultPanel';

const SUGGESTED_QUERIES: SuggestedQuery[] = [
  { id: '1', text: 'What is the land cover classification of this area?', category: 'analysis', icon: '🌲' },
  { id: '2', text: 'Compare these two images and identify changes', category: 'change', icon: '🔄' },
  { id: '3', text: 'Analyze optical and SAR imagery together', category: 'multimodal', icon: '📊' },
  { id: '4', text: 'Detect buildings and infrastructure in this scene', category: 'detection', icon: '🏢' },
  { id: '5', text: 'Calculate NDVI and vegetation health metrics', category: 'analysis', icon: '🌿' },
  { id: '6', text: 'Map water bodies and assess water quality', category: 'analysis', icon: '💧' },
];

const MOCK_RESPONSES: Record<string, ChatMessage> = {
  'landcover': mockChatResponse,
  'change': mockChangeDetectionResponse,
  'multimodal': mockMultimodalResponse,
};

function getMockResponse(query: string): ChatMessage {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('change') || lowerQuery.includes('compare') || lowerQuery.includes('between')) {
    return MOCK_RESPONSES.change;
  }
  if (lowerQuery.includes('sar') || lowerQuery.includes('optical') || lowerQuery.includes('multimodal') || lowerQuery.includes('fusion')) {
    return MOCK_RESPONSES.multimodal;
  }
  return MOCK_RESPONSES.landcover;
}

export function AssistantPanel() {
  const { 
    messages, 
    isProcessing, 
    addMessage, 
    updateMessage, 
    setProcessing, 
    clearMessages,
    startOrchestration,
    completeOrchestration,
    orchestrationState,
  } = useWorkspace();
  
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showOrchestration, setShowOrchestration] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setProcessing(true);
    startOrchestration(inputValue.trim());
    setShowSuggestions(false);
    setShowOrchestration(true);

    const query = inputValue.trim();
    setInputValue('');

    // Simulate processing
    const processingSteps = [
      { step: 'query-understanding', progress: 20, delay: 500 },
      { step: 'task-planning', progress: 40, delay: 1000 },
      { step: 'specialist-selection', progress: 60, delay: 1500 },
      { step: 'execution', progress: 85, delay: 3000 },
      { step: 'evidence-synthesis', progress: 100, delay: 4000 },
    ];

    for (const { progress, delay } of processingSteps) {
      await new Promise(resolve => setTimeout(resolve, delay));
      if (orchestrationState) {
        updateMessage(userMessage.id, { 
          metadata: { 
            ...userMessage.metadata, 
            confidence: progress / 100
          } 
        });
      }
    }

    const mockResponse = getMockResponse(query);
    const assistantMessage: ChatMessage = {
      ...mockResponse,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };

    addMessage(assistantMessage);
    setProcessing(false);
    completeOrchestration();
    setShowAnalysis(true);
  };

  const handleSuggestionClick = (query: string) => {
    setInputValue(query);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-space-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 border-b border-space-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-space-950" />
          </div>
          <div>
            <h2 className="font-semibold text-space-100">SATQUERY AI</h2>
            <StatusBadge status={isProcessing ? 'processing' : 'online'} label="Agent Online" size="sm" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="Show Orchestration">
            <Button variant="ghost" size="sm" onClick={() => setShowOrchestration(!showOrchestration)} className={showOrchestration ? 'bg-cyan-500/10 text-cyan-400' : ''}>
              <Zap className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Show Analysis">
            <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(!showAnalysis)} className={showAnalysis ? 'bg-teal-500/10 text-teal-400' : ''}>
              <Target className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Clear Chat">
            <Button variant="ghost" size="sm" onClick={clearMessages}>
              <MessageSquare className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <Tabs defaultValue="chat" className="flex-1 overflow-hidden">
        <TabsList className="border-b border-space-800 bg-space-900/50">
          <TabTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Chat
          </TabTrigger>
          <TabTrigger value="orchestration">
            <Zap className="w-4 h-4 mr-1.5" />
            Orchestration
          </TabTrigger>
          <TabTrigger value="analysis">
            <Target className="w-4 h-4 mr-1.5" />
            Analysis
          </TabTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
            {messages.length === 0 && showSuggestions && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center text-space-500 py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-space-700 mb-3" />
                  <p className="text-sm">Ask a question about the loaded imagery</p>
                </div>
                <div>
                  <p className="text-xs text-space-500 uppercase tracking-wider mb-2">SUGGESTED QUERIES</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUERIES.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="h-auto px-3 py-2 text-left min-w-[200px] justify-start"
                      >
                        <span className="mr-2">{suggestion.icon}</span>
                        <span className="text-xs">{suggestion.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isProcessing && (
              <ProcessingIndicator />
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-space-800 bg-space-900/50">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the imagery... (Enter to send, Shift+Enter for new line)"
                className="flex-1 input-field min-h-[44px] max-h-32 resize-none pr-12 bg-space-800"
                rows={1}
                disabled={isProcessing}
                aria-label="Query input"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inputValue.trim() || isProcessing}
                loading={isProcessing}
                className="h-[44px] flex-shrink-0"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-space-600 mt-1 text-right">
              Enter to send • Shift+Enter for new line
            </p>
          </form>
        </TabsContent>

        <TabsContent value="orchestration" className="flex-1 overflow-hidden">
          <OrchestrationPanel isOpen={true} onClose={() => setShowOrchestration(false)} />
        </TabsContent>

        <TabsContent value="analysis" className="flex-1 overflow-hidden">
          <AnalysisResultPanel isOpen={true} onClose={() => setShowAnalysis(false)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={clsx('flex gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', isUser ? 'bg-space-800' : 'bg-gradient-to-br from-cyan-500 to-teal-500')}>
        {isUser ? (
          <svg className="w-4 h-4 text-space-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <Brain className="w-4 h-4 text-space-950" />
        )}
      </div>
      <div className={clsx('flex-1 max-w-[calc(100%-3rem)]', isUser && 'text-right')}>
        <div className={clsx(
          'rounded-2xl px-4 py-3',
          isUser 
            ? 'bg-cyan-500/10 border border-cyan-500/20 text-space-100' 
            : 'bg-space-800 border border-space-700 text-space-200'
        )}>
          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">{message.content}</div>
          
          {message.metadata && !isUser && (
            <div className="mt-3 pt-3 border-t border-space-700 space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Badge variant="primary" size="sm">
                  <Brain className="w-3 h-3 mr-1" />
                  {message.metadata.modelsUsed?.join(', ') || 'Remote Sensing VLM'}
                </Badge>
                <Badge variant="success" size="sm">
                  <Target className="w-3 h-3 mr-1" />
                  {formatConfidence(message.metadata.confidence || 0)}
                </Badge>
                <Badge variant="outline" size="sm">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDuration(message.metadata.processingTime || 0)}
                </Badge>
              </div>
              {message.metadata.evidence && message.metadata.evidence.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.metadata.evidence.slice(0, 3).map((evidence) => (
                    <Badge key={evidence.id} variant="outline" size="sm" className="text-xs">
                      {evidence.label} ({formatConfidence(evidence.confidence)})
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 mt-1.5">
          <span className="text-xs text-space-500">{message.timestamp.toLocaleTimeString()}</span>
          {!isUser && (
            <Tooltip content="Copy to clipboard">
              <button className="p-1 text-space-500 hover:text-space-300 transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

function ProcessingIndicator() {
  const steps = [
    { label: 'Understanding query...', icon: Brain },
    { label: 'Selecting specialist model...', icon: Zap },
    { label: 'Analyzing imagery...', icon: Target },
    { label: 'Extracting evidence...', icon: Layers },
    { label: 'Generating response...', icon: Sparkles },
  ];

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
        <Loader2 className="w-4 h-4 text-space-950 animate-spin" />
      </div>
      <div className="flex-1">
        <div className="bg-space-800 border border-space-700 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-space-300 mb-3">
            <span className="font-mono text-cyan-400">PROCESSING</span>
            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center gap-2 text-xs text-space-400">
                <step.icon className="w-3.5 h-3.5 text-cyan-500/50" />
                <span>{step.label}</span>
                <div className="flex-1 h-1 bg-space-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: index < 3 ? '100%' : index === 3 ? '60%' : '20%' }}
                    transition={{ duration: 0.8, delay: index * 0.3, ease: 'easeOut' }}
                    className="h-full bg-cyan-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';