import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadResume,
  getResumes,
  deleteResume,
  setDefaultResume,
  getStudentApplications,
  getStudentDrives,
  registerForDrive,
  getDashboardStats,
} from '../controllers/student.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/dashboard', getDashboardStats);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/applications', getStudentApplications);
router.get('/drives', getStudentDrives);
router.post('/drives/:driveId/register', registerForDrive);

// Resume
router.get('/resumes', getResumes);
router.post('/resumes', upload.single('resume'), uploadResume);
router.delete('/resumes/:resumeId', deleteResume);
router.put('/resumes/:resumeId/default', setDefaultResume);

export default router;
