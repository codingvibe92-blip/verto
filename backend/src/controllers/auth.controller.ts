import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/validate';
import { ApiError } from '../utils/errors';

export const AuthController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.json({ success: true, message: 'Login successful', data: result });
  }),

  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.refresh(req.body.refreshToken);
    res.json({ success: true, message: 'Token refreshed', data: result });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    res.json({ success: true, message: 'Current user', data: req.user });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, message: 'Logged out' });
  }),
};