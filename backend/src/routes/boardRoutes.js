import express from 'express';
import {
  getBoardAnalytics,
  getBoardActivityLogs,
} from '../controllers/boardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id/analytics', protect, getBoardAnalytics);
router.get('/:id/activity', protect, getBoardActivityLogs);

export default router;