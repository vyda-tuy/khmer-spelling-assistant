/**
 * TTS Service
 * Provides text-to-speech for Khmer pronunciation.
 * Uses a free TTS API (TTSMaker) with client-side Web Speech API as primary.
 */

const TTS_API = 'https://api.ttsmaker.com/v1/create-tts-order';
const TTS_TOKEN = process.env.TTS_API_TOKEN || '';  // Optional, for higher limits

// Google Translate TTS (unofficial but widely used free alternative)
const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=km&client=tw-ob&q=';

/**
 * Generate audio metadata or proxy URL for Khmer text.
 */
export async function generateAudio(text) {
    const trimmed = text.trim();
    if (!trimmed) return { audioUrl: null, method: 'none' };

    // Point to our own proxy endpoint to avoid CORS/Referer issues
    const encoded = encodeURIComponent(trimmed);

    return {
        text: trimmed,
        method: 'server-proxy',
        audioUrl: `/api/tts/proxy?text=${encoded}`
    };
}

/**
 * Fetch audio stream from external provider to proxy it
 */
export async function getProxyStream(text) {
    const encoded = encodeURIComponent(text);
    const url = `${GOOGLE_TTS_URL}${encoded}`;

    // We use native fetch (supported in Node 18+)
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://translate.google.com/'
        }
    });

    if (!response.ok) throw new Error(`External TTS failed: ${response.status}`);

    return {
        stream: response.body,
        contentType: response.headers.get('content-type') || 'audio/mpeg'
    };
}

/**
 * Try to generate audio via TTSMaker API (if token available)
 * @param {string} text
 * @returns {Promise<{audioUrl: string|null, method: string}>}
 */
export async function generateAudioServer(text) {
    if (!TTS_TOKEN) {
        return {
            text: text.trim(),
            method: 'client',
            audioUrl: null,
            message: 'No TTS API token configured. Using client-side speech.'
        };
    }

    try {
        const response = await fetch(TTS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: TTS_TOKEN,
                text: text.trim(),
                voice_id: 2050,     // Khmer voice
                audio_format: 'mp3',
                audio_speed: 1.0,
                text_paragraph_pause_time: 0
            })
        });

        if (!response.ok) throw new Error(`TTS API error: ${response.status}`);

        const data = await response.json();

        if (data.status === 'success' && data.audio_file_url) {
            return {
                text: text.trim(),
                method: 'server',
                audioUrl: data.audio_file_url
            };
        }

        throw new Error(data.error_msg || 'TTS generation failed');
    } catch (err) {
        console.warn('⚠️  Server TTS failed:', err.message);
        return {
            text: text.trim(),
            method: 'client',
            audioUrl: null,
            message: 'Server TTS unavailable. Using client-side speech.'
        };
    }
}

export default { generateAudio, generateAudioServer };
