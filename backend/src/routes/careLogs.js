import express from 'express';
import { getCareLogs, createCareLog } from '../controllers/careLogs.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:animal_id/care-logs', authenticate, getCareLogs);
router.post('/:animal_id/care-logs', authenticate, authorize('Veterinarian', 'Caretaker', 'Manager'), createCareLog);

export default router;
