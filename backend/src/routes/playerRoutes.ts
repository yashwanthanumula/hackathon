import { Router } from 'express';
import { body } from 'express-validator';
import { createSession, getPlayer } from '../controllers/playerController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post(
  '/session',
  [
    body('displayName').optional().trim().isLength({ max: 50 }),
  ],
  validateRequest,
  createSession
);

router.get('/:sessionId', getPlayer);

export default router;