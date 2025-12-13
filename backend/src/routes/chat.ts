import { Router } from 'express';
import { chatWithAI, getChatSuggestions } from '../controllers/chatController';

const router = Router();

// Main chat endpoint
router.post('/', chatWithAI);

// Get chat suggestions
router.get('/suggestions', getChatSuggestions);

export default router;
