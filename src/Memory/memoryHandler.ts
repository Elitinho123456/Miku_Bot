interface ChatMessage {
    role: string;
    content: string;
}

class MemoryHandler {
    private chatHistory: Map<string, ChatMessage[]>;
    private userModels: Map<string, string>;
    private maxHistory: number;

    constructor(maxHistory = 20) {
        this.chatHistory = new Map();
        this.userModels = new Map();
        this.maxHistory = maxHistory;
    }

    addMessage(userId: string, role: string, content: string): void {
        if (!this.chatHistory.has(userId)) {
            this.chatHistory.set(userId, []);
        }

        const userHistory = this.chatHistory.get(userId)!;
        userHistory.push({ role, content });

        if (userHistory.length > this.maxHistory * 2) {
            userHistory.splice(0, 2);
        }
    }

    getHistory(userId: string): ChatMessage[] {
        return this.chatHistory.get(userId) || [];
    }

    clearHistory(userId: string): boolean {
        this.chatHistory.set(userId, []);
        return true;
    }

    setUserModel(userId: string, model: string): string {
        this.userModels.set(userId, model);
        return model;
    }

    getUserModel(userId: string): string {
        return this.userModels.get(userId) || 'gemini-3-flash-preview';
    }
}

export default new MemoryHandler();
