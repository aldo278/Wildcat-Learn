import { Router } from 'express';
import { TestController } from '../controllers/testController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const testController = new TestController();

// Protected routes
router.post('/generate', authMiddleware, testController.generateTest);
router.post('/', authMiddleware, testController.saveTestResult);
router.get('/user/:userId', authMiddleware, testController.getUserTestHistory);

export default router;
