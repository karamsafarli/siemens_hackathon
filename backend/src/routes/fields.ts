import { Router } from 'express';
import {
    getFields,
    getFieldById,
    createField,
    updateField,
    deleteField,
} from '../controllers/fieldController';

const router = Router();

router.get('/', getFields);
router.get('/:id', getFieldById);
router.post('/', createField);
router.put('/:id', updateField);
router.delete('/:id', deleteField);

export default router;
