import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/validate';
import { SettingsRepository } from '../repositories/settings.repository';

export const SettingsController = {
  getSettings: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await SettingsRepository.getAll();
    res.json({ success: true, message: 'Settings retrieved', data: settings });
  }),

  updateSettings: asyncHandler(async (req: Request, res: Response) => {
    const { settings, group } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object is required' });
    }
    await SettingsRepository.saveMany(settings, group || 'general');
    const updated = await SettingsRepository.getAll();
    res.json({ success: true, message: 'Settings updated successfully', data: updated });
  }),
};
