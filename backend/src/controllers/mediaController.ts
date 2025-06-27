import { Request, Response, NextFunction } from 'express';

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
      return;
    }

    const imageUrl = (req.file as any).path;

    res.json({
      success: true,
      data: {
        url: imageUrl,
        publicId: (req.file as any).filename,
      },
    });
  } catch (error) {
    next(error);
  }
};