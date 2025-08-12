import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, User, Bot } from 'lucide-react';
import { ChatMessage } from '../types';
import Button from './Button';

export interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  className?: string;
  'data-testid'?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isStreaming = false,
  onCopy,
  className = '',
  'data-testid': testId,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const handleCopy = async () => {
    if (!onCopy) return;
    
    try {
      await navigator.clipboard.writeText(message.content);
      onCopy(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };
  
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderContent = () => {
    // Simple markdown-like formatting
    const content = message.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>') // Inline code
      .replace(/\n/g, '<br>'); // Line breaks
    
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };
  
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex justify-center my-4 ${className}`}
        data-testid={testId}
      >
        <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full text-sm">
          {message.content}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 ${className}`}
      data-testid={testId}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 max-w-[80%]`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>
        
        {/* Message Bubble */}
        <div className="flex-1 min-w-0">
          <div className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary-500 text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}>
            <div className="text-sm leading-relaxed">
              {renderContent()}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-1 inline-block w-2 h-4 bg-current"
                />
              )}
            </div>
          </div>
          
          {/* Message Footer */}
          <div className={`flex items-center gap-2 mt-2 px-2 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
            
            {!isUser && onCopy && (
              <Button
                variant="ghost"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={handleCopy}
                aria-label={copied ? 'Copied!' : 'Copy message'}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
