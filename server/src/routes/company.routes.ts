import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getCompanies, getCompanyById, createCompany, updateCompany, verifyCompany } from '../controllers/company.controller';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/', authenticate, authorize('recruiter', 'admin'), upload.single('logo'), createCompany);
router.put('/:id', authenticate, authorize('recruiter', 'admin'), upload.single('logo'), updateCompany);
router.put('/:id/verify', authenticate, authorize('admin', 'placement_officer'), verifyCompany);

export default router;
