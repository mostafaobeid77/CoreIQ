const Groq = require('groq-sdk');

let groqClient = null;

if (process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('✅ Groq AI initialized (Service)');
} else {
    console.warn('⚠️ GROQ_API_KEY not set');
}

/**
 * Call Groq API with Retry Logic
 * @param {Function} apiCallFn 
 * @param {number} retries 
 */
async function callAIWithRetry(apiCallFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCallFn();
        } catch (error) {
            if (error.status === 429 || error.message.includes('429')) {
                const waitTime = Math.pow(2, i) * 1000;
                console.warn(`⚠️ API Rate Limit (429). Retrying in ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}

/**
 * Generate JSON from Groq
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 */
async function generateJson(systemPrompt, userPrompt) {
    if (!groqClient) throw new Error('Groq Client not initialized');

    try {
        console.log('🤖 Generating with Groq Service...');

        // Add timeout wrapper to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 30000) // 30s timeout
        );

        const apiCall = callAIWithRetry(() => groqClient.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        }));

        const completion = await Promise.race([apiCall, timeoutPromise]);

        const result = JSON.parse(completion.choices[0].message.content);
        return result;
    } catch (err) {
        // Better error messages
        let errorMessage = 'AI service unavailable';

        if (err.message.includes('timeout')) {
            errorMessage = 'Request timeout. Please try again.';
        } else if (err.message.includes('fetch') || err.message.includes('network')) {
            errorMessage = 'Connection error. Check your internet.';
        } else if (err.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment.';
        } else if (err.message.includes('API key')) {
            errorMessage = 'AI service configuration error.';
        }

        console.error('❌ Groq Service Failed:', err.message);
        throw new Error(errorMessage);
    }
}

module.exports = {
    generateJson,
    isAvailable: () => !!groqClient
};
