import { GoogleGenAI } from "@google/genai";
import safetySettings from "../Configs/safetySettings.js";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const MODELS: Record<string, string> = {
  'lite': 'gemini-3.1-flash-lite-preview',
  'flash': 'gemini-3-flash-preview',
  'pro': 'gemini-3.1-pro-preview'
};

const DEFAULT_MODEL = 'lite';

export interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  model?: string;
  modelAlias?: string;
  finishReason?: string;
}

class TextGenerator {
  safetySettings: any;
  systemInstruction: string;

  constructor() {
    this.safetySettings = safetySettings;
    this.systemInstruction = 'Você é uma assistente de IA chamada Miku Nakano. Você é amigável, atenciosa, criativa e fala em português de forma natural e descontraída. Responda de maneira útil e envolvente, curta e direta.';
  }

  getModel(alias: string): string {
    return MODELS[alias] || MODELS[DEFAULT_MODEL];
  }

  getAvailableModels(): string[] {
    return Object.keys(MODELS);
  }

  async generateResponse(prompt: string, history: any[] = [], modelAlias = DEFAULT_MODEL): Promise<AIResponse> {
    try {
      const model = this.getModel(modelAlias);

      const contents: any[] = [
        { role: 'user', parts: [{ text: this.systemInstruction }] },

        ...history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        })),

        { role: 'user', parts: [{ text: prompt }] }
      ];

      const result = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          // @ts-ignore
          safetySettings: this.safetySettings,
        }
      });

      if (!result || !result.candidates) {
        throw new Error('Estrutura de resposta da API inesperada (verifique result.candidates).');
      }

      const candidates = result.candidates;

      if (candidates.length === 0) {
        throw new Error('Nenhuma resposta válida foi gerada pela IA.');
      }

      const candidate = candidates[0];

      const finishReason = candidate.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error('A resposta foi bloqueada por motivos de segurança.');
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('A resposta da IA não contém conteúdo válido.');
      }

      const part = candidate.content.parts[0];
      if (!part || typeof part.text === 'undefined' || part.text === null) {
        throw new Error('A resposta da IA está vazia.');
      }

      const responseText = part.text;

      return {
        success: true,
        response: responseText,
        model: model,
        modelAlias: modelAlias,
        finishReason: finishReason as string
      };

    } catch (error: any) {
      console.error('Error in TextGenerator.generateResponse:', error);
      return {
        success: false,
        error: error.message || 'Ocorreu um erro inesperado ao processar sua solicitação.'
      };
    }
  }
}

export default new TextGenerator();
