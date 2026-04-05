import express from 'express';
import {
  getSpecies,
  getCities,
  getBranches,
  getRoles,
  getRescueTeams,
} from '../controllers/lookup.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/species', authenticate, getSpecies);
router.get('/cities', authenticate, getCities);
router.get('/branches', authenticate, getBranches);
router.get('/roles', authenticate, authorize('Manager'), getRoles);
router.get(
  '/rescue-teams',
  authenticate,
  authorize('Manager', 'Rescuer', 'Admin'),
  getRescueTeams
);

export default router;
