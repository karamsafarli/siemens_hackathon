import { Router } from 'express';
import {
    getDashboardStats,
    getRecentAlerts,
} from '../controllers/dashboardController';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/alerts', getRecentAlerts);

export default router;
