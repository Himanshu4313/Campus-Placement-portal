import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadFile } from '../controllers/upload.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), uploadFile);

export default router;
