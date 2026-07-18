import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../config/cloudinary';
import { AppError } from '../middleware/errorHandler';

export const uploadFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const folder = req.body.folder || 'documents';
    const resourceType = req.body.resourceType || 'auto';

    const { url, public_id } = await uploadToCloudinary(
      req.file.buffer,
      folder,
      resourceType
    );

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url,
        publicId: public_id,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
};
