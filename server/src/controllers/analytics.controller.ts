import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { Offer } from '../models/Offer';
import { StudentProfile } from '../models/StudentProfile';

export const getPublicStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      activeJobs,
      totalStudents,
      placedStudents,
      offers,
      recentOffers
    ] = await Promise.all([
      Job.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'student', isActive: true }),
      StudentProfile.countDocuments({ placementStatus: 'placed' }),
      Offer.find().select('ctc company').populate('company', 'name logo'),
      Offer.find().sort({ releasedAt: -1 }).limit(5).populate('student', 'name avatar').populate('company', 'name logo')
    ]);

    const totalOffers = offers.length;
    const highestPackage = offers.reduce((max, o) => o.ctc > max ? o.ctc : max, 0);
    const totalSalary = offers.reduce((sum, o) => sum + o.ctc, 0);
    const averagePackage = totalOffers > 0 ? (totalSalary / totalOffers).toFixed(1) : 0;
    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        activeJobs,
        totalStudents,
        placedStudents,
        totalOffers,
        highestPackage,
        averagePackage: Number(averagePackage),
        placementRate: Number(placementRate),
        recentOffers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getJobStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Job.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgSalaryMin: { $avg: '$salary.min' },
          avgSalaryMax: { $avg: '$salary.max' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
