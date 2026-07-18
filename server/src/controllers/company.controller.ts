import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Company } from '../models/Company';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export const getCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, industry, isVerified, page = 1, limit = 20 } = req.query;
    const query: any = { isActive: true };
    if (search) query.$text = { $search: search as string };
    if (industry) query.industry = industry;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ createdAt: -1 }).skip((parseInt(page as string) - 1) * parseInt(limit as string)).limit(parseInt(limit as string)),
      Company.countDocuments(query),
    ]);

    res.status(200).json({ success: true, data: { companies, total } });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id).populate('createdBy', 'name email');
    if (!company) throw new AppError('Company not found', 404);
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let logoUrl, logoPublicId;
    if (req.file) {
      const { url, public_id } = await uploadToCloudinary(req.file.buffer, 'logos', 'image');
      logoUrl = url;
      logoPublicId = public_id;
    }

    const company = await Company.create({
      ...req.body,
      logo: logoUrl,
      logoPublicId,
      createdBy: req.userId,
      admins: [req.userId],
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) throw new AppError('Company not found', 404);

    if (req.file) {
      if (company.logoPublicId) await deleteFromCloudinary(company.logoPublicId);
      const { url, public_id } = await uploadToCloudinary(req.file.buffer, 'logos', 'image');
      req.body.logo = url;
      req.body.logoPublicId = public_id;
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const verifyCompany = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedAt: new Date(), verifiedBy: req.userId },
      { new: true }
    );
    if (!company) throw new AppError('Company not found', 404);
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};
