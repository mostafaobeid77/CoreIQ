const groqProvider = require('./ai/providers/groqProvider');

/**
 * Groq Service Wrapper
 * Provides a simple chat interface compatible with existing code
 */
class GroqService {
    /**
     * Simple chat method that returns the AI response text
     * @param {Array} messages - Array of message objects with role and content
     * @returns {Promise<string>} - AI response text
     */
    async chat(messages) {
        if (!groqProvider.isAvailable()) {
            throw new Error('Groq service not available');
        }

        // Build system and user prompts from messages
        const systemMessage = messages.find(m => m.role === 'system');
        const userMessages = messages.filter(m => m.role === 'user');

        const systemPrompt = systemMessage
            ? systemMessage.content
            : 'You are a helpful AI assistant.';

        const userPrompt = userMessages.map(m => m.content).join('\n');

        try {
            // Use groqProvider's generateJson but handle string responses too
            const result = await groqProvider.generateJson(systemPrompt, userPrompt);

            // If result is an object, stringify it
            if (typeof result === 'object') {
                return JSON.stringify(result);
            }

            return result;
        } catch (error) {
            console.error('[GROQ SERVICE] Chat error:', error);
            throw error;
        }
    }

    /**
     * Check if Groq is available
     */
    isAvailable() {
        return groqProvider.isAvailable();
    }

    /**
     * Generate JSON directly
     */
    async generateJson(systemPrompt, userPrompt) {
        return groqProvider.generateJson(systemPrompt, userPrompt);
    }
}

module.exports = new GroqService();
