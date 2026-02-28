import dictionaryService from '../services/dictionary.js';
import { findClosestMatches, isAmbiguous } from '../services/fuzzyMatch.js';
import { resolveAmbiguity, correctSentence, isAvailable as isGeminiAvailable } from '../services/gemini.js';
import { AppError } from '../utils/customErrors.js';

/**
 * Handle sentence-level correction via Gemini + Dictionary enrichment
 */
async function resolveSentence(text) {
    try {
        const aiResult = await correctSentence(text);

        // Enrich each word with dictionary data
        const enrichedWords = await Promise.all(aiResult.words.map(async (w) => {
            const exactMatch = dictionaryService.exactLookup(w.corrected);

            return {
                original: w.original,
                corrected: w.corrected,
                isCorrect: !!exactMatch && (w.original === w.corrected),
                source: exactMatch ? 'RAC Dictionary' : 'Gemini AI',
                confidence: exactMatch ? 1.0 : 0.8,
                explanation: w.explanation,
                definition: exactMatch?.definition,
                pos: exactMatch?.pos,
                ipa: exactMatch?.ipa,
                allEntries: exactMatch?.allEntries,
                suggestions: [] // Gemini already picking best match
            };
        }));

        return {
            correctedText: aiResult.correctedText,
            words: enrichedWords
        };
    } catch (err) {
        console.error('Sentence resolution failed:', err.message);
        // Fallback to dictionary-based segmentation if AI fails
        const initialTokens = tokenizeKhmer(text);
        const tokens = [];
        for (const token of initialTokens) {
            // If token is unknown but long, attempt dictionary-based segmentation
            if (!dictionaryService.exists(token) && token.length >= 6) {
                const segments = dictionaryService.segmentText(token);
                if (segments.length > 1) {
                    tokens.push(...segments);
                } else {
                    tokens.push(token);
                }
            } else {
                tokens.push(token);
            }
        }

        const results = await Promise.all(tokens.map(token => processWord(token, false)));
        return {
            correctedText: results.map(r => r.corrected).join(' '),
            words: results
        };
    }
}

/**
 * Simple Khmer word tokenizer
 * Splits on spaces, punctuation, and common delimiters
 */
function tokenizeKhmer(text) {
    return text
        .trim()
        .split(/[\s។,៕៖៘\u200b]+/) // spaces, Khmer punctuation, zero-width space
        .filter(token => token.length > 0);
}

/**
 * Process a single word through the correction pipeline
 */
async function processWord(word, useAI = true) {
    // Step 1: Exact dictionary lookup
    const exactMatch = dictionaryService.exactLookup(word);
    if (exactMatch) {
        return {
            original: word,
            corrected: word,
            isCorrect: true,
            source: 'RAC Dictionary',
            confidence: 1.0,
            suggestions: [],
            definition: exactMatch.definition,
            pos: exactMatch.pos,
            ipa: exactMatch.ipa,
            allEntries: exactMatch.allEntries
        };
    }

    // Step 2: Fuzzy matching
    const fuzzyMatches = findClosestMatches(word, 5, 0.4);

    if (fuzzyMatches.length === 0) {
        return {
            original: word,
            corrected: word,
            isCorrect: false,
            source: 'not-found',
            confidence: 0,
            suggestions: [],
            message: 'Word not found in RAC dictionary'
        };
    }

    // Step 3: Clear winner from fuzzy matching
    if (!isAmbiguous(fuzzyMatches) || !useAI) {
        const best = fuzzyMatches[0];
        return {
            original: word,
            corrected: best.word,
            isCorrect: false,
            source: 'Fuzzy Match',
            confidence: best.score,
            suggestions: fuzzyMatches.map(m => ({
                word: m.word,
                score: m.score,
                definition: m.entry?.definition,
                allEntries: m.entry?.allEntries
            })),
            definition: best.entry?.definition,
            pos: best.entry?.pos,
            ipa: best.entry?.ipa,
            allEntries: best.entry?.allEntries
        };
    }

    // Step 4: Gemini AI tie-breaker (only for ambiguous cases)
    if (isGeminiAvailable()) {
        try {
            const aiResult = await resolveAmbiguity(word, fuzzyMatches);
            const matchedEntry = dictionaryService.exactLookup(aiResult.word);

            return {
                original: word,
                corrected: aiResult.word,
                isCorrect: false,
                source: 'Gemini AI',
                confidence: aiResult.confidence,
                explanation: aiResult.explanation,
                suggestions: fuzzyMatches.map(m => ({
                    word: m.word,
                    score: m.score,
                    definition: m.entry?.definition,
                    allEntries: m.entry?.allEntries
                })),
                definition: matchedEntry?.definition,
                pos: matchedEntry?.pos,
                ipa: matchedEntry?.ipa,
                allEntries: matchedEntry?.allEntries
            };
        } catch (err) {
            console.error('AI resolution failed:', err.message);
        }
    }

    // Fallback: use top fuzzy match
    const best = fuzzyMatches[0];
    return {
        original: word,
        corrected: best.word,
        isCorrect: false,
        source: 'Fuzzy Match',
        confidence: best.score,
        suggestions: fuzzyMatches.map(m => ({
            word: m.word,
            score: m.score,
            definition: m.entry?.definition,
            allEntries: m.entry?.allEntries
        })),
        definition: best.entry?.definition,
        pos: best.entry?.pos,
        ipa: best.entry?.ipa,
        allEntries: best.entry?.allEntries
    };
}

export const spellCheck = async (req, res, next) => {
    try {
        const { text, useAI = true } = req.body;

        if (!text || typeof text !== 'string') {
            return next(new AppError('Missing required field: text', 400));
        }

        if (text.length > 5000) {
            return next(new AppError('Text too long. Maximum 5000 characters.', 400));
        }

        const hasKhmer = /[\u1780-\u17FF]/.test(text);
        if (!hasKhmer) {
            return next(new AppError('No Khmer characters detected. Please enter Khmer text.', 400));
        }

        let results = [];
        let correctedText = '';
        let isSentence = text.length >= 8 || text.includes(' ') || text.includes('\u200b');

        if (isSentence && useAI && isGeminiAvailable()) {
            const aiResult = await resolveSentence(text);
            results = aiResult.words;
            correctedText = aiResult.correctedText;
        } else {
            const initialTokens = tokenizeKhmer(text);
            if (initialTokens.length === 0) {
                return next(new AppError('No valid Khmer text found', 400));
            }

            const tokens = [];
            for (const token of initialTokens) {
                if (!dictionaryService.exists(token) && token.length >= 6) {
                    const segments = dictionaryService.segmentText(token);
                    if (segments.length > 1) {
                        tokens.push(...segments);
                    } else {
                        tokens.push(token);
                    }
                } else {
                    tokens.push(token);
                }
            }

            results = await Promise.all(tokens.map(token => processWord(token, useAI)));
            correctedText = results.map(r => r.corrected).join(' ');
        }

        const allCorrect = results.every(r => r.isCorrect);

        res.json({
            originalText: text,
            correctedText,
            isAllCorrect: allCorrect,
            words: results,
            isSentence,
            dictionarySize: dictionaryService.size,
            aiAvailable: isGeminiAvailable(),
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        next(err);
    }
};

export const lookupWord = (req, res, next) => {
    try {
        const { word } = req.query;

        if (!word) {
            return next(new AppError('Missing query parameter: word', 400));
        }

        const entry = dictionaryService.exactLookup(word);

        if (entry) {
            res.json({ found: true, ...entry });
        } else {
            const suggestions = findClosestMatches(word, 5);
            res.json({
                found: false,
                word,
                suggestions: suggestions.map(s => ({
                    word: s.word,
                    score: s.score,
                    definition: s.entry?.definition
                }))
            });
        }
    } catch (err) {
        next(err);
    }
};

export const getStats = (req, res, next) => {
    try {
        res.json({
            dictionarySize: dictionaryService.size,
            aiAvailable: isGeminiAvailable(),
            status: dictionaryService.size > 0 ? 'ready' : 'dictionary-not-loaded'
        });
    } catch (err) {
        next(err);
    }
};
