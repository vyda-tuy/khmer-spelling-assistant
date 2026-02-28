import { useState, useCallback } from 'react';
import { spellCheck } from '../services/api.js';

/**
 * Custom hook for spell check state management
 */
export function useSpellCheck() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastText, setLastText] = useState('');

    const checkSpelling = useCallback(async (text, useAI = true) => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);
        setLastText(text.trim());

        try {
            const data = await spellCheck(text, useAI);
            setResults(data);
        } catch (err) {
            setError(err.message);
            setResults(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults(null);
        setError(null);
        setLastText('');
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        results,
        loading,
        error,
        lastText,
        checkSpelling,
        clearResults,
        clearError
    };
}
