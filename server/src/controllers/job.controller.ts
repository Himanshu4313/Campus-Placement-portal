import { Request, Response, NextFunction } from 'express';
import { Job, IJob } from '../models/Job';
import { Application } from '../models/Application';
import { Bookmark } from '../models/Bookmark';
import { StudentProfile } from '../models/StudentProfile';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// GET ALL JOBS with filters
export const getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search, type, workMode, location, category, minSalary, maxSalary,
      page = 1, limit = 20, sortBy = 'createdAt', order = 'desc',
      isCampusHiring, skills, status = 'published',
    } = req.query;

    const query: any = { status };

    if (search) {
      query.$text = { $search: search as string };
    }
    if (type) query.type = type;
    if (workMode) query.workMode = workMode;
    if (location) query.location = { $regex: location as string, $options: 'i' };
    if (category) query.category = category;
    if (isCampusHiring === 'true') query.isCampusHiring = true;
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = parseInt(minSalary as string);
      if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary as string) };
    }
    if (skills) {
      const skillsArray = (skills as string).split(',').map((s) => s.trim());
      query.skills = { $in: skillsArray };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('company', 'name logo industry isVerified')
        .populate('postedBy', 'name avatar')
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET JOB BY ID
export const getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo industry isVerified website description locations')
      .populate('postedBy', 'name avatar');

    if (!job) throw new AppError('Job not found', 404);

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// CREATE JOB
export const createJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.userId,
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// UPDATE JOB
export const updateJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError('Job not found', 404);

    if (job.postedBy.toString() !== req.userId && req.userRole !== 'admin') {
      throw new AppError('Not authorized to update this job', 403);
    }

    // Set publishedAt if status changes to published
    if (req.body.status === 'published' && job.status !== 'published') {
      req.body.publishedAt = new Date();
    }

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE JOB
export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError('Job not found', 404);

    if (job.postedBy.toString() !== req.userId && req.userRole !== 'admin') {
      throw new AppError('Not authorized to delete this job', 403);
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// APPLY TO JOB
export const applyToJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) throw new AppError('Job not found', 404);
    if (job.status !== 'published') throw new AppError('This job is not accepting applications', 400);
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      throw new AppError('Application deadline has passed', 400);
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      student: req.userId,
      job: req.params.id,
    });
    if (existingApp) throw new AppError('Already applied to this job', 400);

    // Check eligibility
    const profile = await StudentProfile.findOne({ user: req.userId });
    if (profile) {
      const e = job.eligibility;
      if (e.minCGPA && profile.cgpa < e.minCGPA) {
        throw new AppError(`Minimum CGPA of ${e.minCGPA} required`, 400);
      }
      if (e.maxBacklogs !== undefined && profile.backlogs > e.maxBacklogs) {
        throw new AppError(`Maximum ${e.maxBacklogs} backlogs allowed`, 400);
      }
    }

    const application = await Application.create({
      student: req.userId,
      job: req.params.id as any,
      company: job.company,
      resume: req.body.resumeId,
      coverLetter: req.body.coverLetter,
      statusHistory: [{ status: 'applied', changedAt: new Date() }],
    });

    // Increment application count
    await Job.findByIdAndUpdate(req.params.id, { $inc: { applicationCount: 1 } });

    res.status(201).json({ success: true, data: application, message: 'Application submitted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET JOB APPLICATIONS (Recruiter)
export const getJobApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = { job: req.params.id };
    if (status) query.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('student', 'name email avatar')
        .populate('resume', 'name url atsScore')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: { total, page: parseInt(page as string), limit: parseInt(limit as string), pages: Math.ceil(total / parseInt(limit as string)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// BOOKMARK JOB
export const bookmarkJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Bookmark.findOneAndUpdate(
      { student: req.userId, job: req.params.id },
      { student: req.userId, job: req.params.id, note: req.body.note, folder: req.body.folder },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, message: 'Job bookmarked' });
  } catch (error) {
    next(error);
  }
};

// UNBOOKMARK JOB
export const unbookmarkJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Bookmark.findOneAndDelete({ student: req.userId, job: req.params.id });
    res.status(200).json({ success: true, message: 'Bookmark removed' });
  } catch (error) {
    next(error);
  }
};

// GET BOOKMARKED JOBS
export const getBookmarkedJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({ student: req.userId })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo industry' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookmarks });
  } catch (error) {
    next(error);
  }
};

// GET RECOMMENDED JOBS
export const getRecommendedJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await StudentProfile.findOne({ user: req.userId });
    if (!profile) {
      const jobs = await Job.find({ status: 'published' }).populate('company', 'name logo').limit(10).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: jobs });
      return;
    }

    const skills = profile.skills.map((s) => s.name);
    const jobs = await Job.find({
      status: 'published',
      $or: [
        { skills: { $in: skills } },
        { 'eligibility.branches': profile.branch },
        { 'eligibility.departments': profile.department },
      ],
      'eligibility.minCGPA': { $lte: profile.cgpa },
    })
      .populate('company', 'name logo industry')
      .limit(10)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

// TRACK VIEW
export const trackJobView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
