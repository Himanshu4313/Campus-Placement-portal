import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Offer } from '../models/Offer';
import { StudentProfile } from '../models/StudentProfile';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/errorHandler';
import { emitToUser } from '../config/socket';
import { sendEmail, emailTemplates } from '../config/email';
import { uploadToCloudinary } from '../config/cloudinary';

export const getRecruiterDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await Job.find({ postedBy: req.userId });
    const jobIds = jobs.map((j) => j._id);

    const [applications, offers] = await Promise.all([
      Application.find({ job: { $in: jobIds } }),
      Offer.find({ releasedBy: req.userId }),
    ]);

    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === 'published').length,
      totalApplications: applications.length,
      shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
      interviews: applications.filter((a) => a.status === 'interview_scheduled').length,
      selected: applications.filter((a) => ['selected', 'offer_released', 'offer_accepted'].includes(a.status)).length,
      offersReleased: offers.length,
      offersAccepted: offers.filter((o) => o.status === 'accepted').length,
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateRecruiterProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = { postedBy: req.userId };
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await Job.countDocuments(query);

    res.status(200).json({ success: true, data: { jobs, total } });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await Job.find({ postedBy: req.userId }).select('_id');
    const jobIds = jobs.map((j) => j._id);
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = { job: { $in: jobIds } };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('student', 'name email avatar')
      .populate({ path: 'job', select: 'title type' })
      .populate('resume', 'name url atsScore')
      .sort({ appliedAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await Application.countDocuments(query);

    res.status(200).json({ success: true, data: { applications, total } });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title');

    if (!application) throw new AppError('Application not found', 404);

    application.status = status;
    application.statusHistory.push({ status, changedAt: new Date(), changedBy: req.userId as any, note });
    if (status === 'rejected') application.rejectedAt = new Date();
    if (status === 'selected') application.selectedAt = new Date();
    await application.save();

    // Notify student
    const notification = await Notification.create({
      recipient: application.student,
      type: 'application_status',
      title: 'Application Status Updated',
      message: `Your application status has been updated to: ${status.replace(/_/g, ' ')}`,
      data: { applicationId: application._id, status },
      priority: 'high',
    });

    emitToUser(application.student.toString(), 'notification:new', notification);

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const scheduleInterview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { round, type, scheduledAt, mode, meetingLink, location, interviewers, duration } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('job', 'title');

    if (!application) throw new AppError('Application not found', 404);

    application.interviewRounds.push({ round, type, scheduledAt, mode, meetingLink, location, interviewers, duration, result: 'pending' });
    application.status = 'interview_scheduled';
    application.statusHistory.push({ status: 'interview_scheduled', changedAt: new Date(), changedBy: req.userId as any });
    await application.save();

    // Notify student
    const notification = await Notification.create({
      recipient: application.student,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `Your interview has been scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
      data: { applicationId: application._id, scheduledAt, meetingLink },
      priority: 'urgent',
    });

    emitToUser(application.student.toString(), 'notification:new', notification);

    try {
      await sendEmail({
        to: (application.student as any).email,
        subject: 'Interview Scheduled - Campus Placement Portal',
        html: emailTemplates.interviewScheduled(
          (application.student as any).name,
          'Company',
          new Date(scheduledAt).toLocaleString(),
          meetingLink
        ),
      });
    } catch (e) { }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const releaseOffer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) throw new AppError('Application not found', 404);

    let offerLetterUrl, offerLetterPublicId;
    if (req.file) {
      const { url, public_id } = await uploadToCloudinary(req.file.buffer, 'offer_letters', 'raw');
      offerLetterUrl = url;
      offerLetterPublicId = public_id;
    }

    const offer = await Offer.create({
      student: application.student,
      application: application._id,
      job: application.job,
      company: application.company,
      releasedBy: req.userId,
      offerLetterUrl,
      offerLetterPublicId,
      ...req.body,
    });

    application.status = 'offer_released';
    application.statusHistory.push({ status: 'offer_released', changedAt: new Date(), changedBy: req.userId as any });
    await application.save();

    const notification = await Notification.create({
      recipient: application.student,
      type: 'offer_released',
      title: 'Offer Letter Released! 🎉',
      message: 'Congratulations! An offer letter has been released for you.',
      data: { offerId: offer._id },
      priority: 'urgent',
    });

    emitToUser(application.student.toString(), 'notification:new', notification);

    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, minCGPA, maxBacklogs, branch, page = 1, limit = 20 } = req.query;
    const query: any = { isAvailableForPlacement: true };

    if (department) query.department = department;
    if (minCGPA) query.cgpa = { $gte: parseFloat(minCGPA as string) };
    if (maxBacklogs) query.backlogs = { $lte: parseInt(maxBacklogs as string) };
    if (branch) query.branch = branch;

    const profiles = await StudentProfile.find(query)
      .populate('user', 'name email avatar')
      .sort({ cgpa: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await StudentProfile.countDocuments(query);

    res.status(200).json({ success: true, data: { candidates: profiles, total } });
  } catch (error) {
    next(error);
  }
};

export const searchCandidates = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, skills } = req.query;
    const query: any = {};

    if (skills) {
      const skillsArray = (skills as string).split(',').map((s) => s.trim());
      query['skills.name'] = { $in: skillsArray };
    }

    const profiles = await StudentProfile.find(query)
      .populate('user', 'name email avatar')
      .limit(20);

    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    next(error);
  }
};
