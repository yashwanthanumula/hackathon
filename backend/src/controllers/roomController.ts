import { Request, Response, NextFunction } from 'express';
import { Room } from '../models/Room';
import { generateRoomCode } from '../utils/roomUtils';

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, difficulty, maxPlayers, hostId, imageUrl } = req.body;

    // Generate unique room code
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      code = generateRoomCode();
      const existingRoom = await Room.findOne({ code });
      if (!existingRoom) {
        isUnique = true;
      }
    }

    const room = await Room.create({
      code: code!,
      hostId,
      name,
      imageUrl,
      description,
      difficulty,
      maxPlayers,
      players: [hostId],
    });

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;

    const room = await Room.findOne({ code: code.toUpperCase() });
    
    if (!room) {
      res.status(404).json({
        success: false,
        error: 'Room not found',
      });
      return;
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;
    const { playerId } = req.body;

    const room = await Room.findOne({ code: code.toUpperCase() });
    
    if (!room) {
      res.status(404).json({
        success: false,
        error: 'Room not found',
      });
      return;
    }

    if (room.status !== 'waiting') {
      res.status(400).json({
        success: false,
        error: 'Game already in progress',
      });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      res.status(400).json({
        success: false,
        error: 'Room is full',
      });
      return;
    }

    if (!room.players.includes(playerId)) {
      room.players.push(playerId);
      await room.save();
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};