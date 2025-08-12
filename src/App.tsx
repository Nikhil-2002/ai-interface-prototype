import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Send, 
  Plus, 
  MessageSquare, 
  Download, 
  Menu,
  X,
  Zap,
  Save,
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { mockApi } from './services/mockApi';
import { ChatMessage, AIModel, PromptTemplate } from './types';
import Button from './components/Button';
import Slider from './components/Slider';
import Modal from './components/Modal';
import ChatBubble from './components/ChatBubble';
import ModelSelector from './components/ModelSelector';
import ThemeToggle from './components/ThemeToggle';

const AppContent: React.FC = () => {
  const {
    currentModel,
    parameters,
    currentSession,
    sessions,
    templates,
    isLoading,
    error,
    setCurrentModel,
    updateParameters,
    createNewSession,
    updateSession,
    deleteSession,
    setCurrentSession,
    addTemplate,
    setLoading,
    setError
  } = useApp();
  
  const [models, setModels] = useState<AIModel[]>([]);
  const [prompt, setPrompt] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parametersPanelOpen, setParametersPanelOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('General');
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  const currentSessionData = sessions.find(s => s.id === currentSession);
  const messages = useMemo(() => currentSessionData?.messages || [], [currentSessionData?.messages]);
  
  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true, 'Loading models...');
        const modelsList = await mockApi.getModels();
        setModels(modelsList);
      } catch (err) {
        setError('Failed to load models');
      } finally {
        setLoading(false);
      }
    };
    
    loadModels();
  }, [setLoading, setError]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = promptTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [prompt]);
  
  const handleSendMessage = async () => {
    if (!prompt.trim() || isLoading) return;
    
    const messageContent = prompt.trim();
    setPrompt('');
    
    // Create new session if none exists
    if (!currentSession) {
      createNewSession();
    }
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    
    const sessionId = currentSession || sessions[0]?.id;
    if (sessionId) {
      const updatedMessages = [...messages, userMessage];
      updateSession(sessionId, { 
        messages: updatedMessages,
        title: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : '')
      });
    }
    
    try {
      setLoading(true, 'Generating response...');
      
      // Create streaming message
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      
      setStreamingMessage(assistantMessage);
      
      let fullContent = '';
      const allMessages = [...messages, userMessage];
      
      // Simulate streaming
      for await (const chunk of mockApi.streamMessage(allMessages, currentModel, parameters)) {
        fullContent += chunk.content;
        setStreamingMessage({
          ...assistantMessage,
          content: fullContent,
          isStreaming: !chunk.done,
        });
        
        if (chunk.done) {
          // Add final message to session
          const finalMessage = {
            ...assistantMessage,
            content: fullContent,
            isStreaming: false,
          };
          
          if (sessionId) {
            const finalMessages = [...allMessages, finalMessage];
            updateSession(sessionId, { messages: finalMessages });
          }
          
          setStreamingMessage(null);
          break;
        }
      }
    } catch (err) {
      setError('Failed to generate response');
      setStreamingMessage(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopyMessage = (content: string) => {
    // Copy functionality is handled by the ChatBubble component internally
  };
  
  
  const handleDownloadChat = () => {
    if (!currentSessionData) return;
    
    const chatData = {
      title: currentSessionData.title,
      model: currentSessionData.model,
      parameters: currentSessionData.parameters,
      messages: currentSessionData.messages,
      createdAt: currentSessionData.createdAt,
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSessionData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSaveAsTemplate = () => {
    if (!prompt.trim()) return;
    setTemplateModalOpen(true);
  };
  
  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !prompt.trim()) return;
    
    addTemplate({
      name: newTemplateName,
      content: prompt,
      description: `Custom template: ${newTemplateName}`,
      category: newTemplateCategory,
    });
    
    setTemplateModalOpen(false);
    setNewTemplateName('');
    setNewTemplateCategory('General');
  };
  
  const handleLoadTemplate = (template: PromptTemplate) => {
    setPrompt(template.content);
    setSidebarOpen(false);
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar content */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:relative lg:z-0 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Chat Sessions
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                />
              </div>
              
              {/* New Chat Button */}
              <div className="p-4">
                <Button
                  variant="primary"
                  fullWidth
                  icon={Plus}
                  onClick={() => {
                    createNewSession();
                    setSidebarOpen(false);
                  }}
                >
                  New Chat
                </Button>
              </div>
              
              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      className={`group relative w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                        session.id === currentSession
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentSession(session.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare size={16} className="flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {session.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {session.messages.length} messages
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 rounded hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center"
                          aria-label="Delete session"
                        >
                          <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Templates Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Prompt Templates
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {templates.slice(0, 5).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleLoadTemplate(template)}
                      className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {template.category}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={Menu}
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            />
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  AI Interface
                </h1>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {models.find(m => m.id === currentModel)?.name || 'Loading...'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={handleDownloadChat}
              disabled={!currentSessionData || messages.length === 0}
              aria-label="Download chat as JSON"
            />
            
            <Button
              variant="ghost"
              size="sm"
              icon={Settings}
              onClick={() => setParametersPanelOpen(!parametersPanelOpen)}
              aria-label="Toggle parameters panel"
            />
            
            <ThemeToggle />
          </div>
        </header>
        
        {/* Chat Area */}
        <div className="flex-1 flex min-h-0">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onCopy={handleCopyMessage}
                  />
                ))}
                
                {streamingMessage && (
                  <ChatBubble
                    message={streamingMessage}
                    isStreaming={streamingMessage.isStreaming}
                    onCopy={handleCopyMessage}
                  />
                )}
                
                {messages.length === 0 && !streamingMessage && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Start a conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Type a message below to begin chatting with the AI.
                    </p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        ref={promptTextareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                        className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:outline-none transition-colors"
                        rows={1}
                        disabled={isLoading}
                      />
                      
                      {prompt.trim() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Save}
                          onClick={handleSaveAsTemplate}
                          className="absolute right-12 top-3"
                          aria-label="Save as template"
                        />
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    icon={Send}
                    onClick={handleSendMessage}
                    disabled={!prompt.trim() || isLoading}
                    loading={isLoading}
                    aria-label="Send message"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Parameters Panel */}
          <AnimatePresence>
            {parametersPanelOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
              >
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Parameters
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={ChevronLeft}
                      onClick={() => setParametersPanelOpen(false)}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    {/* Model Selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Model
                      </label>
                      <ModelSelector
                        models={models}
                        selectedModel={currentModel}
                        onModelChange={setCurrentModel}
                        loading={isLoading}
                      />
                    </div>
                    
                    {/* Parameters */}
                    <Slider
                      label="Temperature"
                      value={parameters.temperature}
                      min={0}
                      max={2}
                      step={0.01}
                      onChange={(value) => updateParameters({ temperature: value })}
                      description="Controls randomness. Lower values make output more deterministic."
                    />
                    
                    <Slider
                      label="Max Tokens"
                      value={parameters.maxTokens}
                      min={1}
                      max={8192}
                      step={1}
                      onChange={(value) => updateParameters({ maxTokens: value })}
                      description="Maximum number of tokens to generate."
                    />
                    
                    <Slider
                      label="Top P"
                      value={parameters.topP}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(value) => updateParameters({ topP: value })}
                      description="Controls diversity via nucleus sampling."
                    />
                    
                    <Slider
                      label="Frequency Penalty"
                      value={parameters.frequencyPenalty}
                      min={0}
                      max={2}
                      step={0.01}
                      onChange={(value) => updateParameters({ frequencyPenalty: value })}
                      description="Reduces repetition of tokens."
                    />
                    
                    <Slider
                      label="Presence Penalty"
                      value={parameters.presencePenalty}
                      min={0}
                      max={2}
                      step={0.01}
                      onChange={(value) => updateParameters({ presencePenalty: value })}
                      description="Encourages talking about new topics."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Template Creation Modal */}
      <Modal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="Save as Template"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter template name..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={newTemplateCategory}
              onChange={(e) => setNewTemplateCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="General">General</option>
              <option value="Creative">Creative</option>
              <option value="Development">Development</option>
              <option value="Business">Business</option>
              <option value="Research">Research</option>
              <option value="Analysis">Analysis</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setTemplateModalOpen(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateTemplate}
              disabled={!newTemplateName.trim()}
              fullWidth
            >
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => setError(null)}
                className="text-white hover:bg-red-600"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
