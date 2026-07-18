import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Application } from '../models/Application';
import { AppError } from '../middleware/errorHandler';

export const getApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query: any = {};
    if (req.userRole === 'student') query.student = req.userId;

    const applications = await Application.find(query)
      .populate('student', 'name email avatar')
      .populate({ path: 'job', populate: { path: 'company', select: 'name logo' } })
      .populate('resume', 'name url')
      .sort({ appliedAt: -1 });

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email avatar phone')
      .populate({ path: 'job', populate: { path: 'company' } })
      .populate('resume');

    if (!application) throw new AppError('Application not found', 404);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, changedAt: new Date(), changedBy: req.userId, note } },
      },
      { new: true }
    );

    if (!application) throw new AppError('Application not found', 404);
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await Application.findOne({ _id: req.params.id, student: req.userId });
    if (!application) throw new AppError('Application not found', 404);
    if (['selected', 'offer_released', 'offer_accepted'].includes(application.status)) {
      throw new AppError('Cannot withdraw from this stage', 400);
    }

    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
    application.statusHistory.push({ status: 'withdrawn', changedAt: new Date() });
    await application.save();

    res.status(200).json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    next(error);
  }
};
