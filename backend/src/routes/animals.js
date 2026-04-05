import express from 'express';
import {
  getAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../controllers/animals.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, getAnimals);
router.get('/:id', authenticate, getAnimalById);
router.post('/', authenticate, authorize('Manager', 'Veterinarian'), upload.single('image'), createAnimal);
router.patch('/:id', authenticate, authorize('Manager', 'Veterinarian'), upload.single('image'), updateAnimal);
router.delete('/:id', authenticate, authorize('Manager'), deleteAnimal);

export default router;
