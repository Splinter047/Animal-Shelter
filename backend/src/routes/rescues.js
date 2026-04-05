import express from 'express';
import {
  getReports,
  createReport,
  updateReport,
  getMissions,
  createMission,
  updateMission,
} from '../controllers/rescues.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/reports', authenticate, authorize('Manager', 'Rescuer', 'Admin'), getReports);
router.post('/reports', createReport);
router.patch(
  '/reports/:id',
  authenticate,
  authorize('Manager', 'Rescuer', 'Admin'),
  updateReport
);

router.get('/missions', authenticate, authorize('Manager', 'Rescuer'), getMissions);
router.post('/missions', authenticate, authorize('Manager', 'Rescuer'), createMission);
router.patch('/missions/:id', authenticate, authorize('Manager', 'Rescuer'), upload.single('image'), updateMission);

export default router;
