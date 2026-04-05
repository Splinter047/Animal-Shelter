import express from 'express';
import {
  getCareLogs,
  createCareLog,
  updateCareLog,
  deleteCareLog,
} from '../controllers/careLogs.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:animal_id/care-logs', authenticate, getCareLogs);
router.post(
  '/:animal_id/care-logs',
  authenticate,
  authorize('Veterinarian', 'Caretaker', 'Manager'),
  createCareLog
);
router.patch(
  '/:animal_id/care-logs/:log_id',
  authenticate,
  authorize('Veterinarian', 'Manager'),
  updateCareLog
);
router.delete(
  '/:animal_id/care-logs/:log_id',
  authenticate,
  authorize('Veterinarian', 'Manager'),
  deleteCareLog
);

export default router;
