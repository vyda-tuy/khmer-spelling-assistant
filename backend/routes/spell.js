import { Router } from 'express';
import { spellCheck, lookupWord, getStats } from '../controllers/spellController.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', aiLimiter, spellCheck);
router.get('/lookup', lookupWord);
router.get('/stats', getStats);

export default router;
