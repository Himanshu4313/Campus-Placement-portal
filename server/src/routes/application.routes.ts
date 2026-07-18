import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getApplications, getApplicationById, updateApplicationStatus, withdrawApplication } from '../controllers/application.controller';

const router = Router();
router.use(authenticate);

router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', authorize('recruiter', 'admin', 'placement_officer'), updateApplicationStatus);
router.put('/:id/withdraw', authorize('student'), withdrawApplication);

export default router;
