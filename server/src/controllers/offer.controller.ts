import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Offer } from '../models/Offer';
import { Application } from '../models/Application';
import { StudentProfile } from '../models/StudentProfile';
import { AppError } from '../middleware/errorHandler';

export const getOffers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query: any = {};
    if (req.userRole === 'student') {
      query.student = req.userId;
    } else if (req.userRole === 'recruiter') {
      query.releasedBy = req.userId;
    }

    const offers = await Offer.find(query)
      .populate('student', 'name email avatar')
      .populate('company', 'name logo industry headquarters')
      .populate('job', 'title salary location type');

    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    next(error);
  }
};

export const getOfferById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query: any = { _id: req.params.id };
    if (req.userRole === 'student') {
      query.student = req.userId;
    }

    const offer = await Offer.findOne(query)
      .populate('student', 'name email avatar phone')
      .populate('company', 'name logo industry website headquarters description')
      .populate('job', 'title description salary requirements type location');

    if (!offer) {
      throw new AppError('Offer not found', 404);
    }

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

export const updateOfferStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      throw new AppError('Invalid offer status update', 400);
    }

    const offer = await Offer.findOne({ _id: req.params.id, student: req.userId });
    if (!offer) {
      throw new AppError('Offer not found or not belonging to user', 404);
    }

    if (offer.status !== 'pending') {
      throw new AppError('Offer is already processed', 400);
    }

    offer.status = status;
    if (status === 'accepted') {
      offer.acceptedAt = new Date();
      // Update student placement status
      await StudentProfile.findOneAndUpdate(
        { user: req.userId },
        {
          placementStatus: 'placed',
          placedAt: offer.company,
          placedRole: offer.role,
          placedSalary: offer.ctc
        }
      );
    } else {
      offer.rejectedAt = new Date();
      offer.rejectionReason = rejectionReason;
    }

    await offer.save();

    // Update application status too
    const appStatus = status === 'accepted' ? 'offer_accepted' : 'rejected';
    await Application.findByIdAndUpdate(offer.application, {
      status: appStatus,
      $push: {
        statusHistory: {
          status: appStatus,
          changedAt: new Date(),
          note: status === 'accepted' ? 'Offer accepted by student' : `Offer rejected: ${rejectionReason}`
        }
      }
    });

    res.status(200).json({ success: true, message: `Offer ${status} successfully`, data: offer });
  } catch (error) {
    next(error);
  }
};
