class MemoryHandler {
    constructor(maxHistory = 20) {
        this.chatHistory = new Map();
        this.userModels = new Map(); // Store user's preferred model
        this.maxHistory = maxHistory;
    }

    // Add a message to the conversation history
    addMessage(userId, role, content) {
        if (!this.chatHistory.has(userId)) {
            this.chatHistory.set(userId, []);
        }
        
        const userHistory = this.chatHistory.get(userId);
        userHistory.push({ role, content });
        
        // Trim history if it exceeds max length
        if (userHistory.length > this.maxHistory * 2) { // *2 because we store both user and assistant messages
            userHistory.splice(0, 2); // Remove the oldest pair of messages
        }
    }

    // Get conversation history
    getHistory(userId) {
        return this.chatHistory.get(userId) || [];
    }

    // Clear conversation history for a user
    clearHistory(userId) {
        this.chatHistory.set(userId, []);
        return true;
    }

    // Set user's preferred model
    setUserModel(userId, model) {
        this.userModels.set(userId, model);
        return model;
    }

    // Get user's preferred model
    getUserModel(userId) {
        return this.userModels.get(userId) || 'gemini-1.5-flash';
    }
}

export default new MemoryHandler();