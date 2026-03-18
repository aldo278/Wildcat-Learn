import { Router } from 'express';
import { SetController } from '../controllers/setController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const setController = new SetController();

// Public routes
router.get('/public', setController.getPublicSets);
router.get('/:id', setController.getSetById);

// Protected routes
router.get('/', authMiddleware, setController.getUserSets);
router.post('/', authMiddleware, setController.createSet);
router.put('/:id', authMiddleware, setController.updateSet);
router.delete('/:id', authMiddleware, setController.deleteSet);

export default router;
