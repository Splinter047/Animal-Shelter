import express from 'express';
import { getPublicBranches, getPublicCities, getPublicAnimals } from '../controllers/public.js';

const router = express.Router();

router.get('/cities', getPublicCities);
router.get('/branches', getPublicBranches);
router.get('/animals', getPublicAnimals);

export default router;
