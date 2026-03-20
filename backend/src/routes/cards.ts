import { Router } from 'express';
import { CardController } from '../controllers/cardController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const cardController = new CardController();

// Protected routes
router.get('/set/:setId', authMiddleware, cardController.getCardsBySet);
router.post('/set/:setId', authMiddleware, cardController.createCard);
router.put('/:id', authMiddleware, cardController.updateCard);
router.delete('/:id', authMiddleware, cardController.deleteCard);
router.delete('/set/:setId', authMiddleware, cardController.deleteCardsBySet);
router.post('/batch', authMiddleware, cardController.createCards);

export default router;
