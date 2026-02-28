/**
 * API Client for Khmer Spelling Assistant Backend
 */

const API_BASE = import.meta.env?.VITE_API_URL || '/api';

/**
 * Spell check Khmer text
 * @param {string} text - Khmer text to check
 * @param {boolean} useAI - Whether to use AI for ambiguous cases
 * @returns {Promise<object>}
 */
export async function spellCheck(text, useAI = true) {
    let response;
    try {
        response = await fetch(`${API_BASE}/spell-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, useAI })
        });
    } catch (networkErr) {
        throw new Error('Cannot connect to the server. Please check if the backend is running.');
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));

        // Granular error mapping
        switch (response.status) {
            case 400:
                throw new Error(err.error || 'Invalid input. Please check your text.');
            case 429:
                throw new Error('AI quota exceeded. Please wait a moment and try again, or results will use dictionary-only mode.');
            case 503:
                throw new Error('Service temporarily unavailable. The AI service may be restarting.');
            default:
                throw new Error(err.error || `Server error (${response.status}). Please try again.`);
        }
    }

    return response.json();
}

/**
 * Get dictionary stats
 * @returns {Promise<object>}
 */
export async function getStats() {
    const response = await fetch(`${API_BASE}/spell-check/stats`);
    if (!response.ok) throw new Error('Failed to get stats');
    return response.json();
}

/**
 * Quick word lookup
 * @param {string} word
 * @returns {Promise<object>}
 */
export async function lookupWord(word) {
    const response = await fetch(`${API_BASE}/spell-check/lookup?word=${encodeURIComponent(word)}`);
    if (!response.ok) throw new Error('Lookup failed');
    return response.json();
}

/**
 * Health check
 * @returns {Promise<object>}
 */
export async function healthCheck() {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('Backend unavailable');
    return response.json();
}
