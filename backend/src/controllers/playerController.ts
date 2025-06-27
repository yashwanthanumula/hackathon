import { Request, Response, NextFunction } from 'express';
import { Player } from '../models/Player';
import { generateSessionId, generateGuestName } from '../utils/playerUtils';

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { displayName } = req.body;

    const sessionId = generateSessionId();
    const name = displayName || generateGuestName();

    const player = await Player.create({
      sessionId,
      displayName: name,
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: player.sessionId,
        playerId: player._id,
        displayName: player.displayName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const player = await Player.findOne({ sessionId });
    
    if (!player) {
      res.status(404).json({
        success: false,
        error: 'Player not found',
      });
      return;
    }

    res.json({
      success: true,
      data: player,
    });
  } catch (error) {
    next(error);
  }
};