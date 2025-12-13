import { Router } from 'express';
import {
    getPlantTypes,
    getPlantBatches,
    getPlantBatchById,
    createPlantBatch,
    updatePlantBatch,
    updatePlantBatchStatus,
    deletePlantBatch,
} from '../controllers/plantBatchController';

const router = Router();

router.get('/types', getPlantTypes);
router.get('/', getPlantBatches);
router.get('/:id', getPlantBatchById);
router.post('/', createPlantBatch);
router.put('/:id', updatePlantBatch);
router.put('/:id/status', updatePlantBatchStatus);
router.delete('/:id', deletePlantBatch);

export default router;
