import express from 'express';
import { createTask, moveTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTask);
router.patch('/:id/move', protect, moveTask);

export default router;