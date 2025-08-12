import { AIModel, PromptTemplate, APIResponse, ChatMessage } from '../types';

// Mock AI Models
export const mockModels: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model, excels at complex reasoning and creative tasks',
    provider: 'OpenAI',
    maxTokens: 8192,
    supportsStreaming: true,
    contextWindow: 8192,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most conversational and analytical tasks',
    provider: 'OpenAI',
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 4096,
  },
  {
    id: 'claude-2',
    name: 'Claude 2',
    description: 'Constitutional AI with strong safety and reasoning capabilities',
    provider: 'Anthropic',
    maxTokens: 100000,
    supportsStreaming: true,
    contextWindow: 100000,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s multimodal AI with strong reasoning and code capabilities',
    provider: 'Google',
    maxTokens: 30720,
    supportsStreaming: true,
    contextWindow: 30720,
  },
  {
    id: 'llama-2-70b',
    name: 'LLaMA 2 70B',
    description: 'Meta\'s open-source model with strong performance across domains',
    provider: 'Meta',
    maxTokens: 4096,
    supportsStreaming: true,
    contextWindow: 4096,
  },
];

// Mock Prompt Templates
export const mockTemplates: PromptTemplate[] = [
  {
    id: 'template-1',
    name: 'Creative Writing',
    content: 'Write a creative story about {topic} in the style of {author}. Focus on {theme} and make it approximately {length} words long.',
    description: 'Template for creative writing with customizable parameters',
    category: 'Creative',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'template-2',
    name: 'Code Review',
    content: 'Please review the following {language} code:\n\n{code}\n\nProvide feedback on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance optimizations\n4. Readability and maintainability',
    description: 'Comprehensive code review template',
    category: 'Development',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  },
];

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  // Fetch available models
  async getModels(): Promise<AIModel[]> {
    await delay(500);
    return mockModels;
  },

  // Fetch prompt templates
  async getTemplates(): Promise<PromptTemplate[]> {
    await delay(300);
    return mockTemplates;
  },

  // Send a message and get response
  async sendMessage(
    messages: ChatMessage[],
    model: string,
    parameters: any
  ): Promise<APIResponse> {
    await delay(1000 + Math.random() * 2000); // Simulate variable response time

    const userMessage = messages[messages.length - 1];
    const responses = [
      "I understand your question. Let me provide a comprehensive answer based on the context you've provided.",
      "That's an interesting perspective. Here's how I would approach this problem:",
      "Based on my analysis, I can offer several insights that might be helpful.",
      "Thank you for the detailed question. Let me break this down step by step.",
      "This is a complex topic that deserves a thorough explanation. Here's my take:",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const fullResponse = `${randomResponse}\n\nRegarding "${userMessage.content.substring(0, 50)}${userMessage.content.length > 50 ? '...' : ''}":\n\nThis appears to be a ${userMessage.content.length < 50 ? 'concise' : 'detailed'} inquiry that requires careful consideration. I'll provide a structured response that addresses your main points while offering practical insights.\n\n1. **Context Analysis**: ${userMessage.content.toLowerCase().includes('how') ? 'You\'re asking about methodology' : userMessage.content.toLowerCase().includes('what') ? 'You\'re seeking clarification' : 'You\'re exploring a concept'}\n\n2. **Key Considerations**: The approach depends on several factors including scope, timeline, and available resources.\n\n3. **Recommended Steps**: I suggest starting with a thorough assessment before proceeding with implementation.\n\nWould you like me to elaborate on any of these points or explore specific aspects in more detail?`;

    return {
      id: `response-${Date.now()}`,
      content: fullResponse,
      model,
      usage: {
        promptTokens: Math.floor(userMessage.content.length / 4),
        completionTokens: Math.floor(fullResponse.length / 4),
        totalTokens: Math.floor((userMessage.content.length + fullResponse.length) / 4),
      },
      finishReason: 'stop',
    };
  },

  // Stream a response (simulated)
  async *streamMessage(
    messages: ChatMessage[],
    model: string,
    parameters: any
  ): AsyncGenerator<{ content: string; done: boolean }> {
    const response = await this.sendMessage(messages, model, parameters);
    const words = response.content.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      await delay(50 + Math.random() * 100);
      const chunk = i === 0 ? words[i] : ' ' + words[i];
      yield { 
        content: chunk, 
        done: i === words.length - 1 
      };
    }
  },
};
