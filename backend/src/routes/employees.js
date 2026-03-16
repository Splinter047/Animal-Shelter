import express from 'express';
import { getEmployees, createEmployee, updateEmployee } from '../controllers/employees.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('Manager'), getEmployees);
router.post('/', authenticate, authorize('Manager'), createEmployee);
router.patch('/:id', authenticate, authorize('Manager'), updateEmployee);

export default router;
