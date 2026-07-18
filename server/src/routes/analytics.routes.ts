import { Router } from 'express';
import { getPublicStats, getJobStats } from '../controllers/analytics.controller';

const router = Router();

router.get('/public', getPublicStats);
router.get('/jobs', getJobStats);

export default router;
