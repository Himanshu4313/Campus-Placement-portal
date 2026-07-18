import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOTP,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  updateAvatar,
  updatePreferences,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../config/cloudinary';

const router = Router();

// Public routes
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and number'),
    body('role').isIn(['student', 'recruiter', 'placement_officer']).withMessage('Invalid role'),
    body('phone').optional().isMobilePhone('any'),
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  login
);

router.post('/logout', authenticate, logout);

router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  forgotPassword
);

router.post('/reset-password/:token',
  [
    param('token').notEmpty(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  resetPassword
);

router.post('/verify-email',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  ],
  validate,
  verifyEmail
);

router.post('/resend-otp',
  [body('email').isEmail().normalizeEmail()],
  validate,
  resendOTP
);

router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  changePassword
);
router.put('/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.put('/preferences', authenticate, updatePreferences);

export default router;
