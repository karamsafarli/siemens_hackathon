import { Router } from 'express';
import {
    getIrrigationEvents,
    createIrrigationEvent,
    completeIrrigation,
    getOverdueIrrigation,
} from '../controllers/irrigationController';

const router = Router();

router.get('/', getIrrigationEvents);
router.get('/overdue', getOverdueIrrigation);
router.post('/', createIrrigationEvent);
router.put('/:id/complete', completeIrrigation);

export default router;
