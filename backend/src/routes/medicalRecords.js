import express from 'express';
import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getUpcomingVisits,
} from '../controllers/medicalRecords.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/upcoming/visits', authenticate, getUpcomingVisits);
router.get('/:animal_id', authenticate, getMedicalRecords);
router.post('/:animal_id', authenticate, authorize('Manager', 'Veterinarian'), createMedicalRecord);
router.patch('/:id', authenticate, authorize('Manager', 'Veterinarian'), updateMedicalRecord);
router.delete('/:id', authenticate, authorize('Manager'), deleteMedicalRecord);

export default router;
