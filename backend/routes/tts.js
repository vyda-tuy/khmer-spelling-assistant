import { Router } from 'express';
import { getTTS, proxyTTS } from '../controllers/ttsController.js';

const router = Router();

router.get('/', getTTS);
router.get('/proxy', proxyTTS);

export default router;
