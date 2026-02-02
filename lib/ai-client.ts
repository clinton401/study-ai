/**
 * Centralized AI client configuration using Vercel AI SDK v4
 * 
 * IMPORTANT: OpenRouter returns v3 models, but we cast them to 'any' 
 * to bypass TypeScript's strict type checking. This is safe because
 * AI SDK v4 runtime supports both v2 and v3 specs.
 */

import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  throw new Error(
    'CRITICAL: Missing OPENROUTER_API_KEY environment variable. ' +
    'Get your free API key at https://openrouter.ai/keys'
  );
}

/**
 * OpenRouter client configured for Vercel AI SDK
 */
const openrouterClient = createOpenAI({
  name: 'openrouter',
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Study AI App',
  },
});

/**
 * Wrapper function to bypass TypeScript v2/v3 type incompatibility
 * OpenRouter returns v3 models, but AI SDK v4 runtime handles them fine
 * 
 * @param modelId - Model identifier from OpenRouter
 * @returns Model instance (type-casted to avoid TS errors)
 */
export function openrouter(modelId: string): LanguageModel {
  // Type assertion to bypass v2/v3 incompatibility
  // Runtime handles this correctly in AI SDK v4
  return openrouterClient(modelId) as any as LanguageModel;
}

/**
 * Free model configurations
 */
export const AI_MODELS = {
    FAST: 'openrouter/free',
    BALANCED: 'openrouter/free',
    QUALITY: 'openrouter/free',
} as const;

/**
 * Alternative free models
 */
export const ALTERNATIVE_FREE_MODELS = {
  LLAMA_1B: 'meta-llama/llama-3.2-1b-instruct:free',
  QWEN_7B: 'qwen/qwen-2.5-7b-instruct:free',
  GEMMA_2B: 'google/gemma-2-9b-it:free',
  MYTHOMAX: 'gryphe/mythomax-l2-13b:free',
} as const;

/**
 * Default generation settings
 */
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.8,
  topP: 0.9,
  maxTokens: 8192,
} as const;

/**
 * Type-safe model selection
 */
export type AIModelType = keyof typeof AI_MODELS;

/**
 * Get model string by type
 */
export function getModel(type: AIModelType = 'BALANCED'): string {
  return AI_MODELS[type];
}

/**
 * Intelligent model selector based on feature
 */
export function getModelForFeature(
  feature: 'GRAMMAR' | 'REPHRASE' | 'SUMMARY' | 'CONTENT' | 'EDIT' | 'FLASHCARDS' | 'QUESTIONS',
  isPremium: boolean = false
): string {
  switch (feature) {
    case 'GRAMMAR':
    case 'REPHRASE':
      return AI_MODELS.FAST;

    case 'SUMMARY':
    case 'EDIT':
    case 'FLASHCARDS':
    case 'QUESTIONS':
      return AI_MODELS.BALANCED;

    case 'CONTENT':
      return AI_MODELS.QUALITY;

    default:
      return AI_MODELS.BALANCED;
  }
}