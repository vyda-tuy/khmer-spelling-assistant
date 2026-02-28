/**
 * Khmer Spelling & Pronunciation Assistant — Backend Server
 * 
 * Express API server providing:
 * - Spell checking with RAC dictionary lookup + fuzzy matching
 * - Gemini AI tie-breaker for ambiguous corrections
 * - TTS pronunciation support
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import dictionaryService from './services/dictionary.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/customErrors.js';
import spellRoutes from './routes/spell.js';
import ttsRoutes from './routes/tts.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.set('trust proxy', 1); // Trust first proxy for correct IP in rate limiters
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    // AWS App Runner — all subdomains
    /^https:\/\/.*\.awsapprunner\.com$/,
    // Allow same-origin requests (backend serves frontend)
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(o =>
            o instanceof RegExp ? o.test(origin) : o === origin
        );
        callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '5mb' }));
app.use(generalLimiter);

// ── Load Dictionary ────────────────────────────────────────
console.log('\n🇰🇭 Khmer Spelling & Pronunciation Assistant');
console.log('━'.repeat(50));
dictionaryService.load();

// ── Routes ─────────────────────────────────────────────────
app.use('/api/spell-check', spellRoutes);
app.use('/api/tts', ttsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Khmer Spelling Assistant API',
        dictionarySize: dictionaryService.size,
        uptime: process.uptime()
    });
});

// ── Serve Frontend ─────────────────────────────────────────
const FRONTEND_DIST = join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(FRONTEND_DIST));

// Catch unhandled API routes
app.all('/api/*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(join(FRONTEND_DIST, 'index.html'));
});

// Global error handler
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api/health`);
    console.log('━'.repeat(50) + '\n');
});
