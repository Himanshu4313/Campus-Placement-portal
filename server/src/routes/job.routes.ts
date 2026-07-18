import { Router } from 'express';
import { authenticate, authorize, requireEmailVerification } from '../middleware/auth';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  bookmarkJob,
  unbookmarkJob,
  getBookmarkedJobs,
  getRecommendedJobs,
  trackJobView,
} from '../controllers/job.controller';
import { upload } from '../config/cloudinary';

const router = Router();

// Public
router.get('/', getJobs);
router.get('/recommended', authenticate, getRecommendedJobs);
router.get('/:id', getJobById);
router.post('/:id/view', optionalAuth, trackJobView);

// Student
router.post('/:id/apply', authenticate, authorize('student'), applyToJob);
router.post('/:id/bookmark', authenticate, authorize('student'), bookmarkJob);
router.delete('/:id/bookmark', authenticate, authorize('student'), unbookmarkJob);
router.get('/bookmarks/all', authenticate, authorize('student'), getBookmarkedJobs);

// Recruiter / PO
router.post('/', authenticate, authorize('recruiter', 'placement_officer', 'admin'), createJob);
router.put('/:id', authenticate, authorize('recruiter', 'placement_officer', 'admin'), updateJob);
router.delete('/:id', authenticate, authorize('recruiter', 'placement_officer', 'admin'), deleteJob);
router.get('/:id/applications', authenticate, authorize('recruiter', 'placement_officer', 'admin'), getJobApplications);

function optionalAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (auth) authenticate(req, res, next);
  else next();
}

export default router;
