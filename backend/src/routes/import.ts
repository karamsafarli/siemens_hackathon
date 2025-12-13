import { Router } from 'express';
import { importData, getImportJobs, getImportJobById } from '../controllers/importController';

const router = Router();

// Import data from JSON
router.post('/', importData);

// Get all import jobs
router.get('/jobs', getImportJobs);

// Get specific import job
router.get('/jobs/:id', getImportJobById);

export default router;
