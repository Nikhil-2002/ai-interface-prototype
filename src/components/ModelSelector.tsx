import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import { AIModel } from '../types';

export interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'data-testid'?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
  loading = false,
  className = '',
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const selectedModelData = models.find(model => model.id === selectedModel);
  
  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleToggle = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };
  
  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const formatContextWindow = (contextWindow: number): string => {
    if (contextWindow >= 1000) {
      return `${(contextWindow / 1000).toFixed(0)}k`;
    }
    return contextWindow.toString();
  };
  
  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      data-testid={testId}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
          disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedModelData ? (
            <>
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-md flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                  {selectedModelData.provider.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {selectedModelData.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {selectedModelData.provider} • {formatContextWindow(selectedModelData.contextWindow)} tokens
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              Select a model...
            </div>
          )}
        </div>
        
        <ChevronDown 
          size={20} 
          className={`flex-shrink-0 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>
            
            {/* Models List */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => {
                  const isSelected = model.id === selectedModel;
                  
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => handleModelSelect(model.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          {model.provider.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {model.name}
                          </span>
                          {isSelected && (
                            <Check size={16} className="flex-shrink-0 text-primary-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {model.description}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <span>{model.provider}</span>
                          <span>•</span>
                          <span>{formatContextWindow(model.contextWindow)} tokens</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  No models found matching your search.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
