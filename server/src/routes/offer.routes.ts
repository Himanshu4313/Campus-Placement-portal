import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getOffers, getOfferById, updateOfferStatus } from '../controllers/offer.controller';

const router = Router();

router.use(authenticate);

router.get('/', getOffers);
router.get('/:id', getOfferById);
router.put('/:id/status', updateOfferStatus);

export default router;
