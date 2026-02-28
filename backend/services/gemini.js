/**
 * Gemini AI Service
 * Uses Gemini 1.5 Flash (free tier) as a tie-breaker
 * when fuzzy matching yields ambiguous results.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
let genAI = null;
let model = null;

/**
 * Initialize Gemini client
 */
function initialize() {
    if (!API_KEY) {
        console.warn('⚠️  GEMINI_API_KEY not set. AI tie-breaker disabled.');
        return false;
    }

    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        console.log('🤖 Gemini AI initialized (1.5 Flash)');
        return true;
    } catch (err) {
        console.error('❌ Gemini initialization failed:', err.message);
        return false;
    }
}

/**
 * Correct an entire sentence using Gemini AI
 * @param {string} sentence - The full Khmer sentence to correct
 * @returns {Promise<{correctedText: string, words: Array<{original: string, corrected: string, explanation: string}>}>}
 */
export async function correctSentence(sentence) {
    if (!model) {
        throw new Error('AI correction unavailable (no API key)');
    }

    const prompt = `You are a Khmer language spelling and grammar expert following the Royal Academy of Cambodia (RAC) dictionary standards.
    
    A user typed this Khmer text (which may lack spaces between words and contain spelling errors):
    "${sentence}"
    
    Tasks:
    1. Correct any spelling or grammatical errors.
    2. Segment the text into logical, individual words.
    3. Return a clean version of the corrected sentence with proper word spacing.
    4. Provide a mapping of the identified segments/words.
    
    IMPORTANT: Do not delete any words that the user intended to type. If a word is already correct but joined with another, simply segment it with a space. Ensure every part of the meaningful input is represented in the output mapping.
    
    Respond in JSON format only:
    {
      "correctedText": "<full corrected sentence with spaces>",
      "words": [
        {
          "original": "<part of the original text>",
          "corrected": "<corrected word>",
          "explanation": "<brief reason for correction, e.g., 'corrected spelling', 'segmented from phrase'>"
        }
      ]
    }`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            correctedText: parsed.correctedText || sentence,
            words: parsed.words || []
        };
    } catch (err) {
        console.error('⚠️  Gemini sentence correction error:', err.message);
        throw err;
    }
}

/**
 * Resolve ambiguous spelling using Gemini AI
 * @param {string} inputWord - The user's input word
 * @param {Array<{word: string, score: number}>} candidates - Fuzzy match candidates
 * @returns {Promise<{word: string, confidence: number, explanation: string}>}
 */
export async function resolveAmbiguity(inputWord, candidates) {
    if (!model) {
        return {
            word: candidates[0]?.word || inputWord,
            confidence: 0.5,
            explanation: 'AI tie-breaker unavailable (no API key)',
            source: 'fallback'
        };
    }

    const candidateList = candidates
        .map((c, i) => `${i + 1}. "${c.word}" (similarity: ${c.score})`)
        .join('\n');

    const prompt = `You are a Khmer language spelling expert following the Royal Academy of Cambodia (RAC) dictionary standards.

A user typed: "${inputWord}"

The following RAC dictionary words are close matches:
${candidateList}

Which word is the most likely intended spelling? Consider:
- Common Khmer spelling mistakes
- Character similarity in Khmer script
- Usage frequency in standard Khmer

Respond in JSON format only:
{
  "selectedIndex": <1-based index>,
  "word": "<the selected word>",
  "confidence": <0.0-1.0>,
  "explanation": "<brief explanation in English>"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            word: parsed.word || candidates[0]?.word || inputWord,
            confidence: parsed.confidence || 0.7,
            explanation: parsed.explanation || 'AI-assisted correction',
            source: 'Gemini AI'
        };
    } catch (err) {
        console.error('⚠️  Gemini error:', err.message);
        // Fallback to top fuzzy match
        return {
            word: candidates[0]?.word || inputWord,
            confidence: 0.5,
            explanation: 'AI call failed, using best fuzzy match',
            source: 'fuzzy-fallback'
        };
    }
}

/**
 * Check if Gemini is available
 */
export function isAvailable() {
    return model !== null;
}

// Initialize on import
initialize();

export default { correctSentence, resolveAmbiguity, isAvailable, initialize };
