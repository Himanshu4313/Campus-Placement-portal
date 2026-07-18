import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StudentProfile } from '../models/StudentProfile';
import { Application } from '../models/Application';
import { PlacementDrive } from '../models/PlacementDrive';
import { Resume } from '../models/Resume';
import { Offer } from '../models/Offer';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

// DASHBOARD STATS
export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [applications, offers, drives, profile] = await Promise.all([
      Application.find({ student: req.userId }),
      Offer.find({ student: req.userId }),
      PlacementDrive.find({ registeredStudents: req.userId }),
      StudentProfile.findOne({ user: req.userId }),
    ]);

    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter((a) => ['applied', 'under_review'].includes(a.status)).length,
      shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
      interviews: applications.filter((a) => a.status === 'interview_scheduled').length,
      selected: applications.filter((a) => ['selected', 'offer_released', 'offer_accepted'].includes(a.status)).length,
      offers: offers.length,
      pendingOffers: offers.filter((o) => o.status === 'pending').length,
      registeredDrives: drives.length,
      profileCompletion: profile?.profileCompletion || 0,
      recentApplications: applications.slice(-5),
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// GET STUDENT PROFILE
export const getStudentProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await StudentProfile.findOne({ user: req.userId }).populate('user', 'name email avatar phone');
    if (!profile) throw new AppError('Profile not found', 404);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// UPDATE STUDENT PROFILE
export const updateStudentProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updateData = req.body;

    // Calculate profile completion
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.userId },
      { ...updateData, profileCompletion: calculateCompletion({ ...updateData }) },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const calculateCompletion = (profile: any): number => {
  let score = 0;
  const fields = [
    { key: 'bio', weight: 5 },
    { key: 'headline', weight: 5 },
    { key: 'phone', weight: 5 },
    { key: 'cgpa', weight: 10 },
    { key: 'skills', weight: 15, isArray: true },
    { key: 'experience', weight: 15, isArray: true },
    { key: 'projects', weight: 15, isArray: true },
    { key: 'certifications', weight: 10, isArray: true },
    { key: 'socialLinks.linkedin', weight: 5 },
    { key: 'socialLinks.github', weight: 5 },
    { key: 'achievements', weight: 5, isArray: true },
    { key: 'languages', weight: 5, isArray: true },
  ];

  for (const field of fields) {
    const keys = field.key.split('.');
    let val = profile;
    for (const k of keys) val = val?.[k];
    if (field.isArray ? (Array.isArray(val) && val.length > 0) : val) {
      score += field.weight;
    }
  }
  return Math.min(score, 100);
};

// UPLOAD RESUME
export const uploadResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) throw new AppError('Please upload a file', 400);

    const { name } = req.body;
    const { url, public_id } = await uploadToCloudinary(req.file.buffer, 'resumes', 'raw');

    const resumeCount = await Resume.countDocuments({ student: req.userId });
    const resume = await Resume.create({
      student: req.userId,
      name: name || `Resume ${resumeCount + 1}`,
      url,
      publicId: public_id,
      fileType: req.file.mimetype.includes('pdf') ? 'pdf' : req.file.mimetype.includes('doc') ? 'doc' : 'docx',
      fileSize: req.file.size,
      isDefault: resumeCount === 0,
      version: resumeCount + 1,
    });

    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

// GET RESUMES
export const getResumes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resumes = await Resume.find({ student: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

// DELETE RESUME
export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, student: req.userId });
    if (!resume) throw new AppError('Resume not found', 404);

    await deleteFromCloudinary(resume.publicId);
    await resume.deleteOne();

    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    next(error);
  }
};

// SET DEFAULT RESUME
export const setDefaultResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Resume.updateMany({ student: req.userId }, { isDefault: false });
    await Resume.findByIdAndUpdate(req.params.resumeId, { isDefault: true });
    res.status(200).json({ success: true, message: 'Default resume updated' });
  } catch (error) {
    next(error);
  }
};

// GET STUDENT APPLICATIONS
export const getStudentApplications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = { student: req.userId };
    if (status) query.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({ path: 'job', populate: { path: 'company', select: 'name logo' } })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Application.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET STUDENT DRIVES
export const getStudentDrives = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drives = await PlacementDrive.find({
      $or: [
        { registeredStudents: req.userId },
        { status: { $in: ['registration_open', 'upcoming'] }, isPublished: true },
      ],
    })
      .populate('company', 'name logo')
      .sort({ 'schedule.driveDate': 1 });

    res.status(200).json({ success: true, data: drives });
  } catch (error) {
    next(error);
  }
};

// REGISTER FOR DRIVE
export const registerForDrive = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.findById(req.params.driveId);
    if (!drive) throw new AppError('Drive not found', 404);
    if (drive.status !== 'registration_open') throw new AppError('Registration is not open', 400);

    if (drive.registeredStudents.includes(req.userId as any)) {
      throw new AppError('Already registered for this drive', 400);
    }

    if (drive.maxRegistrations && drive.registeredStudents.length >= drive.maxRegistrations) {
      throw new AppError('Drive is full', 400);
    }

    drive.registeredStudents.push(req.userId as any);
    await drive.save();

    res.status(200).json({ success: true, message: 'Registered for drive successfully' });
  } catch (error) {
    next(error);
  }
};
