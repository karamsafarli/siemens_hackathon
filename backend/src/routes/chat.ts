import { Router } from 'express';
import { chatWithAI, getChatSuggestions, analyzeImage } from '../controllers/chatController';

const router = Router();

// Main chat endpoint
router.post('/', chatWithAI);

// Get chat suggestions
router.get('/suggestions', getChatSuggestions);

// Image analysis for plant disease detection
router.post('/analyze-image', analyzeImage);

export default router;
