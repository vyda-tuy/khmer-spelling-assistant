import { generateAudio, generateAudioServer, getProxyStream } from '../services/tts.js';
import { AppError } from '../utils/customErrors.js';

export const getTTS = async (req, res, next) => {
    try {
        const { text, server } = req.query;

        if (!text || typeof text !== 'string') {
            return next(new AppError('Missing query parameter: text', 400));
        }

        if (text.length > 500) {
            return next(new AppError('Text too long for TTS. Maximum 500 characters.', 400));
        }

        // If server-side TTS is requested
        if (server === 'true') {
            const result = await generateAudioServer(text);
            return res.json(result);
        }

        // Default: return metadata for client-side TTS
        const result = await generateAudio(text);
        res.json(result);

    } catch (err) {
        next(err);
    }
};

export const proxyTTS = async (req, res, next) => {
    try {
        const { text } = req.query;
        if (!text) {
            return next(new AppError('Text required', 400));
        }

        if (text.length > 500) {
            return next(new AppError('Text too long for TTS. Maximum 500 characters.', 400));
        }

        const { stream, contentType } = await getProxyStream(text);

        res.setHeader('Content-Type', contentType);
        // Pipe the web stream to express response
        const reader = stream.getReader();

        async function push() {
            const { done, value } = await reader.read();
            if (done) {
                res.end();
                return;
            }
            res.write(value);
            push();
        }

        push();
    } catch (err) {
        // Here we just pass to next since headers haven't been completely sent yet if it fails before pushing
        // Or if it fails during pushed, express might not send error nicely, but it hits the error handler.
        console.error('TTS Proxy error:', err);
        next(new AppError('Failed to proxy audio', 500));
    }
};
