import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { AppState, Theme, PromptTemplate, ChatSession, ModelParameters } from '../types';

interface AppContextType extends AppState {
  setCurrentModel: (modelId: string) => void;
  updateParameters: (parameters: Partial<ModelParameters>) => void;
  setTheme: (theme: Theme) => void;
  createNewSession: () => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string | null) => void;
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteTemplate: (templateId: string) => void;
  setLoading: (isLoading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AppAction =
  | { type: 'SET_CURRENT_MODEL'; payload: string }
  | { type: 'UPDATE_PARAMETERS'; payload: Partial<ModelParameters> }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'CREATE_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: { sessionId: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_CURRENT_SESSION'; payload: string | null }
  | { type: 'ADD_TEMPLATE'; payload: PromptTemplate }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_INITIAL_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  currentModel: 'gpt-3.5-turbo',
  parameters: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  },
  currentSession: null,
  sessions: [],
  templates: [],
  theme: 'system',
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_MODEL':
      return { ...state, currentModel: action.payload };
    
    case 'UPDATE_PARAMETERS':
      return { ...state, parameters: { ...state.parameters, ...action.payload } };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'CREATE_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        currentSession: action.payload.id,
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? { ...session, ...action.payload.updates, updatedAt: new Date() }
            : session
        ),
      };
    
    case 'DELETE_SESSION':
      const updatedSessions = state.sessions.filter(s => s.id !== action.payload);
      return {
        ...state,
        sessions: updatedSessions,
        currentSession: state.currentSession === action.payload
          ? (updatedSessions[0]?.id || null)
          : state.currentSession,
      };
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [action.payload, ...state.templates],
      };
    
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload),
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload.isLoading, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'LOAD_INITIAL_STATE':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-interface-theme') as Theme;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-interface-theme', state.theme);
    
    const root = document.documentElement;
    if (state.theme === 'dark' || (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // Save state to localStorage
  useEffect(() => {
    const stateToSave = {
      currentModel: state.currentModel,
      parameters: state.parameters,
      sessions: state.sessions,
      templates: state.templates,
    };
    localStorage.setItem('ai-interface-state', JSON.stringify(stateToSave));
  }, [state.currentModel, state.parameters, state.sessions, state.templates]);

  // Memoized action creators
  const setCurrentModel = useCallback((modelId: string) => {
    dispatch({ type: 'SET_CURRENT_MODEL', payload: modelId });
  }, []);
  
  const updateParameters = useCallback((parameters: Partial<ModelParameters>) => {
    dispatch({ type: 'UPDATE_PARAMETERS', payload: parameters });
  }, []);
  
  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);
  
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Chat',
      messages: [],
      model: state.currentModel,
      parameters: { ...state.parameters },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'CREATE_SESSION', payload: newSession });
  }, [state.currentModel, state.parameters]);
  
  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    dispatch({ type: 'UPDATE_SESSION', payload: { sessionId, updates } });
  }, []);
  
  const deleteSession = useCallback((sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', payload: sessionId });
  }, []);
  
  const setCurrentSession = useCallback((sessionId: string | null) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });
  }, []);
  
  const addTemplate = useCallback((template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: PromptTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_TEMPLATE', payload: newTemplate });
  }, []);
  
  const deleteTemplate = useCallback((templateId: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
  }, []);
  
  const setLoading = useCallback((isLoading: boolean, message?: string) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading, message } });
  }, []);
  
  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);
  
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const contextValue: AppContextType = useMemo(() => ({
    ...state,
    setCurrentModel,
    updateParameters,
    setTheme,
    createNewSession,
    updateSession,
    deleteSession,
    setCurrentSession,
    addTemplate,
    deleteTemplate,
    setLoading,
    setError,
    clearError,
  }), [
    state,
    setCurrentModel,
    updateParameters,
    setTheme,
    createNewSession,
    updateSession,
    deleteSession,
    setCurrentSession,
    addTemplate,
    deleteTemplate,
    setLoading,
    setError,
    clearError,
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
