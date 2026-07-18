import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { sendEmail, emailTemplates } from '../config/email';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Generate tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' } as any
  );
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' } as any
  );
  return { accessToken, refreshToken };
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || '10') * 60 * 1000);

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: otpExpiry,
      isApproved: role === 'student', // Students auto-approved, others need manual approval
    });

    // Create student profile if role is student
    if (role === 'student') {
      await StudentProfile.create({
        user: user._id,
        rollNumber: `TEMP-${user._id.toString().slice(-8).toUpperCase()}`,
        department: 'Pending',
        branch: 'Pending',
        graduationYear: new Date().getFullYear() + 4,
        college: 'Pending',
        university: 'Pending',
      });
    }

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - Campus Placement Portal',
        html: emailTemplates.verification(name, otp),
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens +loginAttempts +lockUntil');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new AppError('Account is temporarily locked. Please try again later.', 423);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', 403);
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0) {
      await user.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    // Store refresh token
    const refreshTokens = user.refreshTokens || [];
    // Keep max 5 refresh tokens
    if (refreshTokens.length >= 5) {
      refreshTokens.shift();
    }
    refreshTokens.push(refreshToken);

    await User.findByIdAndUpdate(user._id, {
      refreshTokens,
      lastLogin: new Date(),
    });

    // Set cookie
    const cookieMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isApproved: user.isApproved,
          preferences: user.preferences,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.headers['x-refresh-token'];

    if (refreshToken && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken || req.headers['x-refresh-token'];

    if (!token) {
      throw new AppError('Refresh token required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string; role: string };
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(token)) {
      throw new AppError('Invalid refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);

    // Rotate refresh token
    const updatedTokens = user.refreshTokens.filter((t) => t !== token);
    updatedTokens.push(newRefreshToken);

    await User.findByIdAndUpdate(user._id, { refreshTokens: updatedTokens });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+emailVerificationOTP +emailVerificationOTPExpiry');

    if (!user) throw new AppError('User not found', 404);
    if (user.isEmailVerified) throw new AppError('Email already verified', 400);
    if (!user.emailVerificationOTP) throw new AppError('No OTP found. Please request a new one.', 400);
    if (new Date() > user.emailVerificationOTPExpiry!) throw new AppError('OTP expired. Please request a new one.', 400);
    if (user.emailVerificationOTP !== otp) throw new AppError('Invalid OTP', 400);

    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      $unset: { emailVerificationOTP: 1, emailVerificationOTPExpiry: 1 },
    });

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Campus Placement Portal!',
        html: emailTemplates.welcomeEmail(user.name, user.role),
      });
    } catch (e) {
      console.error('Welcome email failed:', e);
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// RESEND OTP
export const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw new AppError('User not found', 404);
    if (user.isEmailVerified) throw new AppError('Email already verified', 400);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_MINUTES || '10') * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: otpExpiry,
    });

    await sendEmail({
      to: email,
      subject: 'New OTP - Campus Placement Portal',
      html: emailTemplates.verification(user.name, otp),
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
      return;
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset - Campus Placement Portal',
        html: emailTemplates.passwordReset(user.name, resetLink),
      });
    } catch (e) {
      await User.findByIdAndUpdate(user._id, {
        $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
      });
      throw new AppError('Failed to send reset email. Please try again.', 500);
    }

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token as string).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpiry');

    if (!user) throw new AppError('Invalid or expired reset token', 400);

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (error) {
    next(error);
  }
};

// GET ME
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new AppError('User not found', 404);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PROFILE
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// CHANGE PASSWORD
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');

    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// UPDATE AVATAR
export const updateAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) throw new AppError('Please upload an image', 400);

    const user = await User.findById(req.userId);
    if (!user) throw new AppError('User not found', 404);

    // Delete old avatar
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // Upload new avatar
    const { url, public_id } = await uploadToCloudinary(req.file.buffer, 'avatars', 'image');

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { avatar: url, avatarPublicId: public_id },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// UPDATE PREFERENCES
export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { preferences: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
