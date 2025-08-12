export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  maxTokens: number;
  supportsStreaming: boolean;
  contextWindow: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  description?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  parameters: ModelParameters;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stop?: string[];
}

export interface APIResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter';
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppState {
  currentModel: string;
  parameters: ModelParameters;
  currentSession: string | null;
  sessions: ChatSession[];
  templates: PromptTemplate[];
  theme: Theme;
  isLoading: boolean;
  error: string | null;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}
