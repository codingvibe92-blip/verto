import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/validate';
import { ReportRepository } from '../repositories/report.repository';

export const ReportController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const data = await ReportRepository.getOverview();
    res.json({ success: true, message: 'Overview metrics', data });
  }),

  sales: asyncHandler(async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(String(req.query.days), 10) : 30;
    const data = await ReportRepository.getSalesReport(days);
    res.json({ success: true, message: 'Sales report', data });
  }),

  inventory: asyncHandler(async (_req: Request, res: Response) => {
    const data = await ReportRepository.getInventoryReport();
    res.json({ success: true, message: 'Inventory report', data });
  }),

  production: asyncHandler(async (_req: Request, res: Response) => {
    const data = await ReportRepository.getProductionReport();
    res.json({ success: true, message: 'Production report', data });
  }),

  customers: asyncHandler(async (_req: Request, res: Response) => {
    const data = await ReportRepository.getCustomerReport();
    res.json({ success: true, message: 'Customer report', data });
  }),
};
