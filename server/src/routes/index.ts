import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import recruiterRoutes from './recruiter.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import driveRoutes from './drive.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import uploadRoutes from './upload.routes';
import companyRoutes from './company.routes';
import offerRoutes from './offer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/recruiters', recruiterRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/drives', driveRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);
router.use('/companies', companyRoutes);
router.use('/offers', offerRoutes);

export default router;
