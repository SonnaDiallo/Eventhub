import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    const allowedRoles = new Set(['user', 'organizer']);
    const normalizedRole = typeof role === 'string' ? role : undefined;
    const safeRole = normalizedRole && allowedRoles.has(normalizedRole) ? normalizedRole : 'user';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: safeRole,
    });

    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(201).json({ user: userWithoutPassword });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    console.error('Register error:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
if (!secret) {
  return res.status(500).json({ message: 'JWT secret not configured' });
}

const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
  },
  secret,
  {
    expiresIn: '7d',
  }
);
    const userWithoutPassword = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    if (error?.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    console.error('Login error:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};