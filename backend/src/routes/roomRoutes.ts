import { Router } from 'express';
import { body, param } from 'express-validator';
import { createRoom, getRoom, joinRoom } from '../controllers/roomController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post(
  '/',
  [
    body('name').notEmpty().trim().isLength({ max: 100 }),
    body('description').notEmpty().trim().isLength({ max: 500 }),
    body('difficulty').isIn(['easy', 'medium', 'hard', 'expert']),
    body('maxPlayers').optional().isInt({ min: 2, max: 8 }),
    body('hostId').notEmpty(),
  ],
  validateRequest,
  createRoom
);

router.get(
  '/:code',
  [param('code').isLength({ min: 6, max: 6 }).isAlphanumeric()],
  validateRequest,
  getRoom
);

router.post(
  '/:code/join',
  [
    param('code').isLength({ min: 6, max: 6 }).isAlphanumeric(),
    body('playerId').notEmpty(),
  ],
  validateRequest,
  joinRoom
);

export default router;