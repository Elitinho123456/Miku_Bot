import { GoogleGenAI } from "@google/genai";
import safetySettings from "../Configs/safetySettings.js";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Available models
const MODELS = {
    'flash': 'gemini-1.5-flash',
    'pro': 'gemini-1.5-pro'
};

// Default model if none specified
const DEFAULT_MODEL = 'flash';

class TextGenerator {
    constructor() {
        this.safetySettings = safetySettings;
    }

    // Get model name from alias
    getModel(alias) {
        return MODELS[alias] || MODELS[DEFAULT_MODEL];
    }

    // Get list of available model aliases
    getAvailableModels() {
        return Object.keys(MODELS);
    }

    // Generate response with the specified model
    async generateResponse(prompt, history = [], modelAlias = DEFAULT_MODEL) {
        try {
            const model = this.getModel(modelAlias);
            
            const response = await ai.models.generateContent({
                model: model,
                safetySettings: this.safetySettings,
                config: {
                    systemInstruction: "Você é uma assistente de IA chamada Miku Nakano. Você é amigável, atenciosa e fala em português de forma natural e descontraída.",
                },
                contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
            });

            return {
                success: true,
                response: response.text(),
                model: model,
                modelAlias: modelAlias
            };
        } catch (error) {

            console.error('Error generating response:', error);
            return {
                success: false,
                error: error.message || 'Ocorreu um erro ao processar sua solicitação.'
            };
            
        }
    }
}

export default new TextGenerator();