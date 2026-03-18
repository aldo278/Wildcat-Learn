import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const progressController = new ProgressController();

// Protected routes
router.get('/user/:userId', authMiddleware, progressController.getUserProgress);
router.get('/user/:userId/:setId', authMiddleware, progressController.getSetProgress);
router.post('/', authMiddleware, progressController.updateProgress);

export default router;
