/**
 * Fuzzy Matching Service
 * Implements Levenshtein distance-based matching for Khmer words
 * to find close dictionary matches for misspelled input.
 */

import dictionaryService from './dictionary.js';

/**
 * Compute Levenshtein distance between two strings
 * Optimized for Unicode (Khmer) characters.
 */
function levenshteinDistance(a, b) {
    const aChars = [...a]; // Spread to handle multi-byte Unicode correctly
    const bChars = [...b];
    const m = aChars.length;
    const n = bChars.length;

    // Use single-row optimization for memory efficiency
    const prev = Array(n + 1);
    const curr = Array(n + 1);

    for (let j = 0; j <= n; j++) prev[j] = j;

    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = aChars[i - 1] === bChars[j - 1] ? 0 : 1;
            curr[j] = Math.min(
                prev[j] + 1,       // deletion
                curr[j - 1] + 1,   // insertion
                prev[j - 1] + cost  // substitution
            );
        }
        // Copy curr to prev
        for (let j = 0; j <= n; j++) prev[j] = curr[j];
    }

    return prev[n];
}

/**
 * Compute normalized similarity score (0-1, higher = more similar)
 */
function similarityScore(a, b) {
    const dist = levenshteinDistance(a, b);
    const maxLen = Math.max([...a].length, [...b].length);
    if (maxLen === 0) return 1;
    return 1 - dist / maxLen;
}

/**
 * Find closest dictionary matches for a given word
 * @param {string} input - The word to find matches for
 * @param {number} topN - Number of top matches to return
 * @param {number} threshold - Minimum similarity score (0-1)
 * @returns {Array<{word: string, score: number, distance: number, entry: object}>}
 */
export function findClosestMatches(input, topN = 5, threshold = 0.4) {
    const trimmed = input.trim();
    if (!trimmed) return [];

    const allWords = dictionaryService.getAllWords();
    if (allWords.length === 0) return [];

    const inputLen = [...trimmed].length;

    // Pre-filter: only consider words within reasonable length difference
    const maxLenDiff = Math.max(3, Math.floor(inputLen * 0.5));

    const candidates = [];

    for (const word of allWords) {
        const wordLen = [...word].length;

        // Skip if length difference is too large
        if (Math.abs(wordLen - inputLen) > maxLenDiff) continue;

        const score = similarityScore(trimmed, word);

        if (score >= threshold) {
            candidates.push({
                word,
                score: Math.round(score * 100) / 100,
                distance: levenshteinDistance(trimmed, word)
            });
        }
    }

    // Sort by score (descending), then by distance (ascending)
    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.distance - b.distance;
    });

    // Return top N with full dictionary entries
    return candidates.slice(0, topN).map(c => ({
        ...c,
        entry: dictionaryService.exactLookup(c.word)
    }));
}

/**
 * Check if the best fuzzy match is ambiguous (multiple close matches)
 * @param {Array} matches - Fuzzy match results
 * @returns {boolean}
 */
export function isAmbiguous(matches) {
    if (matches.length < 2) return false;

    // Ambiguous if top two matches have similar scores
    const diff = matches[0].score - matches[1].score;
    return diff < 0.1;
}

export { levenshteinDistance, similarityScore };
