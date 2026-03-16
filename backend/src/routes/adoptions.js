import express from 'express';
import {
  getAdoptions,
  getAdoptionById,
  createAdoption,
  updateAdoptionStatus,
} from '../controllers/adoptions.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('Manager', 'Admin'), getAdoptions);
router.get('/:id', authenticate, authorize('Manager', 'Admin'), getAdoptionById);
router.post('/', authenticate, authorize('Manager', 'Admin'), createAdoption);
router.patch('/:id/status', authenticate, authorize('Manager', 'Admin'), updateAdoptionStatus);

export default router;
