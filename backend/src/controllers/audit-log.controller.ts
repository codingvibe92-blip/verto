import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/validate';
import { AuditLogRepository } from '../repositories/audit-log.repository';

export const AuditLogController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 25;
    const action = req.query.action ? String(req.query.action) : undefined;
    const entity = req.query.entity ? String(req.query.entity) : undefined;
    const userId = req.query.user_id ? parseInt(String(req.query.user_id), 10) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const result = await AuditLogRepository.list({ page, limit, action, entity, userId, search });
    res.json({
      success: true,
      message: 'Audit logs retrieved',
      data: result.logs,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  }),
};
