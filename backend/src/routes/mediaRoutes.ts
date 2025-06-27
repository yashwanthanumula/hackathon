import { Router } from 'express';
import { uploadImage } from '../controllers/mediaController';
import { upload } from '../config/cloudinary';

const router = Router();

router.post('/upload', upload.single('image'), uploadImage);

export default router;