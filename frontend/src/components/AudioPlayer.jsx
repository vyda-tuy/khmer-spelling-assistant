/**
 * AudioPlayer — minimal pronunciation button
 */
import { useState, useCallback } from 'react';

const CLOUD_TTS_URL = 'https://cloudtts.com/u/index.html';

export default function AudioPlayer({ text }) {
    const [speaking, setSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);

    const speak = useCallback(async () => {
        if (!text || speaking || loading) return;

        setLoading(true);
        try {
            // Step 1: Get audio info from backend
            const response = await fetch(`/api/tts?text=${encodeURIComponent(text)}`);
            const data = await response.json();

            if (data.audioUrl) {
                // Step 2: Play the audio via our proxy URL
                const audio = new Audio(data.audioUrl);
                audio.onplay = () => {
                    setSpeaking(true);
                    setLoading(false);
                };
                audio.onended = () => setSpeaking(false);
                audio.onerror = () => {
                    setSpeaking(false);
                    setLoading(false);
                    console.error('Audio playback failed');
                };
                audio.play();
            } else {
                throw new Error('No audio URL returned');
            }
        } catch (err) {
            console.error('TTS execution failed:', err.message);
            setLoading(false);
            setSpeaking(false);
        }
    }, [text, speaking, loading]);

    const stop = useCallback(() => {
        // Since we play via new Audio(), we'd need to keep a ref to stop it properly.
        // For short Khmer words/phrases in this app, stop is usually not critical.
        setSpeaking(false);
    }, []);

    if (!text) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
                onClick={speaking ? stop : speak}
                className="btn-secondary"
                disabled={loading}
                style={{ padding: '6px 14px', fontSize: '0.75rem', position: 'relative' }}
                title={speaking ? 'Stop' : 'Pronounce'}
            >
                {loading ? '...' : speaking ? '■ Stop' : '▶ Pronounce'}
            </button>
            <a
                href={CLOUD_TTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.625rem', color: '#A1A1AA', textDecoration: 'none', opacity: 0.6 }}
                title="External Khmer TTS"
            >
                External ↗
            </a>
        </div>
    );
}
