import express from 'express';
import { getPublicBranches, getPublicCities } from '../controllers/public.js';

const router = express.Router();

router.get('/cities', getPublicCities);
router.get('/branches', getPublicBranches);

export default router;
