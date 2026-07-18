import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PlacementDrive } from '../models/PlacementDrive';
import { AppError } from '../middleware/errorHandler';

export const getDrives = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = { isPublished: true };
    if (status) query.status = status;
    if (req.userRole === 'placement_officer' || req.userRole === 'admin') delete query.isPublished;

    const drives = await PlacementDrive.find(query)
      .populate('company', 'name logo industry')
      .populate('organizedBy', 'name')
      .sort({ 'schedule.driveDate': 1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    const total = await PlacementDrive.countDocuments(query);
    res.status(200).json({ success: true, data: { drives, total } });
  } catch (error) {
    next(error);
  }
};

export const getDriveById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.findById(req.params.id)
      .populate('company', 'name logo industry description')
      .populate('jobs')
      .populate('organizedBy', 'name email');
    if (!drive) throw new AppError('Drive not found', 404);
    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    next(error);
  }
};

export const createDrive = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.create({ ...req.body, organizedBy: req.userId });
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    next(error);
  }
};

export const updateDrive = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drive) throw new AppError('Drive not found', 404);
    res.status(200).json({ success: true, data: drive });
  } catch (error) {
    next(error);
  }
};

export const getDriveStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) throw new AppError('Drive not found', 404);
    res.status(200).json({
      success: true,
      data: {
        registered: drive.registeredStudents.length,
        attended: drive.attendedStudents.length,
        selected: drive.selectedStudents.length,
        maxRegistrations: drive.maxRegistrations,
        attendanceRate: drive.registeredStudents.length > 0
          ? ((drive.attendedStudents.length / drive.registeredStudents.length) * 100).toFixed(1)
          : 0,
        selectionRate: drive.attendedStudents.length > 0
          ? ((drive.selectedStudents.length / drive.attendedStudents.length) * 100).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
