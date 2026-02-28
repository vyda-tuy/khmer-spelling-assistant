/**
 * RAC Dictionary Service
 * Loads the 44k Khmer dictionary into memory and provides
 * fast exact lookup and prefix search capabilities.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DICT_PATH = join(__dirname, '..', 'data', 'rac-dictionary.json');

class DictionaryService {
    constructor() {
        this.entries = [];        // Full entries array
        this.wordSet = new Set();  // O(1) existence check
        this.wordMap = new Map();  // word → array of entries
        this.loaded = false;
    }

    /**
     * Load dictionary from JSON file
     */
    load() {
        if (this.loaded) return;

        if (!existsSync(DICT_PATH)) {
            console.warn('⚠️  Dictionary file not found. Run: npm run download-dict');
            console.warn('   Using empty dictionary — spell check will rely on AI only.');
            this.loaded = true;
            return;
        }

        try {
            const raw = readFileSync(DICT_PATH, 'utf-8');
            this.entries = JSON.parse(raw);

            for (const entry of this.entries) {
                const word = entry.w.trim();
                if (word) {
                    this.wordSet.add(word);

                    if (!this.wordMap.has(word)) {
                        this.wordMap.set(word, []);
                    }
                    this.wordMap.get(word).push(entry);
                }
            }

            this.loaded = true;
            console.log(`📖 Dictionary loaded: ${this.entries.length} entries (${this.wordSet.size} unique words)`);
        } catch (err) {
            console.error('❌ Failed to load dictionary:', err.message);
            this.loaded = true;
        }
    }

    /**
     * Exact lookup — O(1)
     * @param {string} word - Khmer word to look up
     * @returns {object|null} Dictionary entry or null
     */
    exactLookup(word) {
        const trimmed = word.trim();
        const entries = this.wordMap.get(trimmed);
        if (!entries || entries.length === 0) return null;

        // Return a combined structure
        // Keep top-level keys for backward compatibility with existing routes
        return {
            word: entries[0].w,
            definition: entries[0].d,
            pos: entries[0].p,
            ipa: entries[0].i,
            example: entries[0].e,
            allEntries: entries.map(e => ({
                definition: e.d,
                pos: e.p,
                ipa: e.i,
                example: e.e
            })),
            source: 'RAC Dictionary'
        };
    }

    /**
     * Check if a word exists in the dictionary
     * @param {string} word 
     * @returns {boolean}
     */
    exists(word) {
        return this.wordSet.has(word.trim());
    }

    /**
     * Get all dictionary words (for fuzzy matching)
     * @returns {string[]}
     */
    getAllWords() {
        return Array.from(this.wordSet);
    }

    /**
     * Get total entry count (matching the "44k" dataset expectations)
     */
    get size() {
        return this.entries.length;
    }

    /**
     * Get unique word count
     */
    get uniqueWords() {
        return this.wordSet.size;
    }

    /**
     * Prefix search
     * @param {string} prefix
     * @param {number} limit
     * @returns {object[]}
     */
    prefixSearch(prefix, limit = 10) {
        const results = [];
        const trimmed = prefix.trim();

        for (const entry of this.entries) {
            if (entry.w.startsWith(trimmed)) {
                results.push({
                    word: entry.w,
                    definition: entry.d,
                    pos: entry.p
                });
                if (results.length >= limit) break;
            }
        }

        return results;
    }

    /**
     * segmentText — Maximum Matching Algorithm for Khmer segmentation
     * Splits a string without spaces into individual dictionary words.
     * @param {string} text 
     * @returns {string[]}
     */
    segmentText(text) {
        if (!text) return [];
        const result = [];
        let i = 0;
        const maxWordLength = 20;
        let unknownBuffer = '';

        while (i < text.length) {
            let found = false;
            // Try matching longest possible substring from dictionary
            for (let len = Math.min(maxWordLength, text.length - i); len >= 2; len--) {
                const sub = text.substring(i, i + len);
                if (this.exists(sub)) {
                    // Flush unknown buffer if necessary
                    if (unknownBuffer) {
                        result.push(unknownBuffer);
                        unknownBuffer = '';
                    }

                    result.push(sub);
                    i += len;
                    found = true;
                    break;
                }
            }

            if (!found) {
                // If no multi-char word found accumulate characters
                unknownBuffer += text[i];
                i++;
            }
        }

        // Flush remaining unknown buffer
        if (unknownBuffer) {
            result.push(unknownBuffer);
        }

        return result;
    }
}

// Singleton instance
const dictionaryService = new DictionaryService();
export default dictionaryService;
