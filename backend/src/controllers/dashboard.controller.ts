import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/validate';
import { DashboardService } from '../services/dashboard.service';

export const DashboardController = {
  stats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await DashboardService.getStats();
    res.json({ success: true, message: 'Dashboard stats', data: stats });
  }),
};