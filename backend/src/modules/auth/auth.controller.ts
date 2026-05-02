import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { registerSchema, loginSchema } from '../../shared/validators/auth.validators.js';
import { PasswordService } from './password.service.js';
import { JwtService } from './jwt.service.js';
import { addEmailJob } from '../../shared/jobs/queue.js';
import { templates } from '../../shared/services/email.service.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.users.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bad Request', message: 'User with this email already exists' });
    }

    const passwordHash = await PasswordService.hash(validatedData.password);

    const newUser = await prisma.users.create({
      data: {
        email: validatedData.email,
        password_hash: passwordHash,
        full_name: validatedData.fullName,
        role: validatedData.role,
        phone: validatedData.phone,
      },
    });

    // Automatically create an audit log for registration
    await prisma.audit_logs.create({
      data: {
        entity_type: 'users',
        entity_id: newUser.id,
        changed_by: newUser.id,
        action: 'CREATE',
        timestamp: new Date(),
        new_value: { email: newUser.email, role: newUser.role, full_name: newUser.full_name },
      },
    });

    // Queue welcome email
    await addEmailJob({
      to: newUser.email,
      subject: 'Welcome to TrustVerify NGO!',
      html: templates.welcome(newUser.full_name || 'User')
    });

    const tokenPayload = { userId: newUser.id, role: newUser.role };
    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, email: newUser.email, role: newUser.role, full_name: newUser.full_name },
      accessToken,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', message: error.errors });
    }
    console.error('Registration Error', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.users.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || user.is_active === false) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials or account deactivated' });
    }

    const isMatch = await PasswordService.compare(validatedData.password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

    const tokenPayload = { userId: user.id, role: user.role };
    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      accessToken,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', message: error.errors });
    }
    console.error('Login Error', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Refresh token not found' });
    }

    const payload = JwtService.verifyRefreshToken(refreshToken);
    
    // Issue new tokens (Refresh Token Rotation)
    const newPayload = { userId: payload.userId, role: payload.role };
    const newAccessToken = JwtService.generateAccessToken(newPayload);
    const newRefreshToken = JwtService.generateRefreshToken(newPayload);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refresh_token');
  return res.status(204).send();
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { fullName } = req.body;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { full_name: fullName },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, full_name: updatedUser.full_name },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Not Found' });

    const isMatch = await PasswordService.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Bad Request', message: 'Incorrect current password' });
    }

    const newPasswordHash = await PasswordService.hash(newPassword);
    await prisma.users.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
