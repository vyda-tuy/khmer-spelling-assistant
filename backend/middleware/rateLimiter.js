/**
 * Rate Limiter Middleware
 * Protects free-tier AI usage and prevents abuse.
 */

import rateLimit from 'express-rate-limit';

// General API rate limit
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,    // 1 minute
    max: 60,                  // 60 requests per minute
    message: {
        error: 'Too many requests. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limit for AI-powered endpoints
export const aiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 50,                         // 50 AI calls per day
    message: {
        error: 'Daily AI limit reached. Dictionary-only corrections still available.',
        retryAfter: 86400
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    }
});

// OCR rate limit (heavier processing)
export const ocrLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 10,               // 10 OCR requests per minute
    message: {
        error: 'Too many image processing requests. Please wait.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});
