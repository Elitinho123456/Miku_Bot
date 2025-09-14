// input_file_0.js
import { GoogleGenAI } from "@google/genai";
import safetySettings from "../Configs/safetySettings.js"; // Assumindo que este caminho está correto em relação ao ambiente de execução
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const MODELS = {
  'lite': 'gemini-2.5-flash-lite',
  'flash': 'gemini-2.5-flash',
  'pro': 'gemini-2.5-pro'
};

const DEFAULT_MODEL = 'lite';

class TextGenerator {
  constructor() {
    this.safetySettings = safetySettings;
    this.systemInstruction = 'Você é uma assistente de IA chamada Miku Nakano. Você é amigável, atenciosa, criativa e fala em português de forma natural e descontraída. Responda de maneira útil e envolvente.';
  }

  getModel(alias) {
    return MODELS[alias] || MODELS[DEFAULT_MODEL];
  }

  getAvailableModels() {
    return Object.keys(MODELS);
  }
  async generateResponse(prompt, history = [], modelAlias = DEFAULT_MODEL) {
    try {
      const model = this.getModel(modelAlias);

      const contents = [
        { role: 'user', parts: [{ text: this.systemInstruction }] },

        ...history.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        })),

        { role: 'user', parts: [{ text: prompt }] }
      ];

      const result = await ai.models.generateContent({
        model: model,
        safetySettings: this.safetySettings,
        contents: contents,
      });

      // Descomente a linha abaixo para depuração
      // console.log('Full Result Object (from ai.models.generateContent):', JSON.stringify(result, null, 2));

      if (!result || !result.candidates) {
        console.error('API Error: "candidates" property is missing directly on the result object.');
        if (result && result.error) {
          console.error('API Error Details:', result.error);
          throw new Error(result.error.message || 'API returned an error.');
        }
        throw new Error('Estrutura de resposta da API inesperada (verifique result.candidates).');
      }

      const candidates = result.candidates;

      if (candidates.length === 0) {
        console.error('API Error: Nenhum candidato encontrado na resposta.');
        throw new Error('Nenhuma resposta válida foi gerada pela IA.');
      }

      const candidate = candidates[0]; // Pega o primeiro candidato

      const finishReason = candidate.finishReason;
      if (finishReason === 'SAFETY') {
        console.error('API Error: Resposta bloqueada devido a configurações de segurança.');
        throw new Error('A resposta foi bloqueada por motivos de segurança.');
      } else if (finishReason !== 'STOP') {
        console.warn(`API Warning: finishReason inesperado: ${finishReason}`);
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.error('API Error: Candidato não possui conteúdo ou partes.');
        throw new Error('A resposta da IA não contém conteúdo válido.');
      }

      const part = candidate.content.parts[0];
      if (!part || typeof part.text === 'undefined' || part.text === null) {
        console.error('API Error: Primeira parte do conteúdo está sem texto ou é vazia.');
        throw new Error('A resposta da IA está vazia.');
      }

      const responseText = part.text;

      return {
        success: true,
        response: responseText,
        model: model, // O nome real do modelo usado (ex: 'gemini-2.5-flash')
        modelAlias: modelAlias, // O alias solicitado pelo usuário (ex: 'flash')
        finishReason: finishReason // Útil para depuração
      };

    } catch (error) {
      console.error('Error in TextGenerator.generateResponse:', error);
      return {
        success: false,
        error: error.message || 'Ocorreu um erro inesperado ao processar sua solicitação.'
      };
    }
  }
}

export default new TextGenerator();