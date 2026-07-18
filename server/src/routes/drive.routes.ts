import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getDrives, getDriveById, createDrive, updateDrive, getDriveStats } from '../controllers/drive.controller';

const router = Router();

router.get('/', authenticate, getDrives);
router.get('/:id', authenticate, getDriveById);
router.get('/:id/stats', authenticate, authorize('placement_officer', 'admin'), getDriveStats);
router.post('/', authenticate, authorize('placement_officer', 'admin'), createDrive);
router.put('/:id', authenticate, authorize('placement_officer', 'admin'), updateDrive);

export default router;
