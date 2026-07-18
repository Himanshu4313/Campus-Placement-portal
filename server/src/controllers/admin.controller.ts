import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Company } from '../models/Company';
import { PlacementDrive } from '../models/PlacementDrive';
import { Offer } from '../models/Offer';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { AppError } from '../middleware/errorHandler';
import { emitToAll } from '../config/socket';
import mongoose from 'mongoose';

export const getAdminDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers, totalStudents, totalRecruiters, totalCompanies,
      totalJobs, totalApplications, totalDrives, totalOffers,
      placedStudents, verifiedCompanies,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'recruiter', isActive: true }),
      Company.countDocuments({ isActive: true }),
      Job.countDocuments({ status: 'published' }),
      Application.countDocuments(),
      PlacementDrive.countDocuments(),
      Offer.countDocuments(),
      StudentProfile.countDocuments({ placementStatus: 'placed' }),
      Company.countDocuments({ isVerified: true }),
    ]);

    // Monthly stats for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await Application.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : '0';

    // Top skills demand
    const topSkills = await Job.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Average package
    const avgPackage = await Offer.aggregate([
      { $group: { _id: null, avg: { $avg: '$ctc' }, max: { $max: '$ctc' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers, totalStudents, totalRecruiters, totalCompanies,
          totalJobs, totalApplications, totalDrives, totalOffers,
          placedStudents, verifiedCompanies,
          placementRate: parseFloat(placementRate),
          avgPackage: avgPackage[0]?.avg || 0,
          highestPackage: avgPackage[0]?.max || 0,
        },
        monthlyApplications,
        topSkills,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, isActive, isEmailVerified, search, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isEmailVerified !== undefined) query.isEmailVerified = isEmailVerified === 'true';
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page as string) - 1) * parseInt(limit as string))
        .limit(parseInt(limit as string)),
      User.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: { users, total, pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) throw new AppError('User not found', 404);

    await AuditLog.create({
      actor: req.userId,
      actorRole: req.userRole,
      action: 'UPDATE_USER',
      resource: 'User',
      resourceId: req.params.id as any,
      details: req.body,
      ipAddress: req.ip,
      status: 'success',
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) throw new AppError('User not found', 404);

    await AuditLog.create({
      actor: req.userId,
      actorRole: req.userRole,
      action: 'DELETE_USER',
      resource: 'User',
      resourceId: req.params.id as any,
      ipAddress: req.ip,
      status: 'success',
    });

    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true, isEmailVerified: true }, { new: true });
    if (!user) throw new AppError('User not found', 404);

    await Notification.create({
      recipient: user._id,
      type: 'profile_update',
      title: 'Account Verified',
      message: 'Your account has been verified and approved!',
      priority: 'high',
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 50, action, resource } = req.query;
    const query: any = {};
    if (action) query.action = action;
    if (resource) query.resource = resource;

    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({ success: true, data: { logs, total } });
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        database: { status: dbStates[dbState as keyof typeof dbStates], state: dbState },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDrives = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drives = await PlacementDrive.find()
      .populate('company', 'name logo')
      .populate('organizedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: drives });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, message, targetRole, priority } = req.body;

    const query = targetRole ? { role: targetRole, isActive: true } : { isActive: true };
    const users = await User.find(query).select('_id');

    const notifications = users.map((user) => ({
      recipient: user._id,
      type: 'announcement' as const,
      title,
      message,
      priority: priority || 'normal',
    }));

    await Notification.insertMany(notifications);
    emitToAll('notification:announcement', { title, message, priority });

    res.status(201).json({ success: true, message: `Announcement sent to ${users.length} users` });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));

    const [
      applicationsByStatus, jobsByCategory, offersByCompany,
      studentsByDept, topRecruiters,
    ] = await Promise.all([
      Application.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Job.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Offer.aggregate([
        { $group: { _id: '$company', count: { $sum: 1 }, avgCtc: { $avg: '$ctc' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
      ]),
      StudentProfile.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),
      Job.aggregate([
        { $group: { _id: '$postedBy', jobCount: { $sum: 1 } } },
        { $sort: { jobCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'recruiter' } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: { applicationsByStatus, jobsByCategory, offersByCompany, studentsByDept, topRecruiters },
    });
  } catch (error) {
    next(error);
  }
};
