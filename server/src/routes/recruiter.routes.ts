import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getRecruiterProfile, updateRecruiterProfile,
  getRecruiterJobs, getCandidates, getRecruiterDashboard,
  updateApplicationStatus, scheduleInterview, releaseOffer,
  getRecruiterApplications, searchCandidates,
} from '../controllers/recruiter.controller';

const router = Router();
router.use(authenticate, authorize('recruiter', 'admin'));

router.get('/dashboard', getRecruiterDashboard);
router.get('/profile', getRecruiterProfile);
router.put('/profile', updateRecruiterProfile);
router.get('/jobs', getRecruiterJobs);
router.get('/applications', getRecruiterApplications);
router.put('/applications/:id/status', updateApplicationStatus);
router.post('/applications/:id/interview', scheduleInterview);
router.post('/applications/:id/offer', releaseOffer);
router.get('/candidates', getCandidates);
router.get('/candidates/search', searchCandidates);

export default router;
