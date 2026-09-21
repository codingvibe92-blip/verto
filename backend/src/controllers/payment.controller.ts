import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { parsePagination } from '../utils/pagination';

export const PaymentController = {
  async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await PaymentService.listPayments({
        ...pagination,
        search,
        status,
      });
      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async listRefunds(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const result = await PaymentService.listRefunds(pagination);
      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async processRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const { payment_id, amount, reason } = req.body;
      const result = await PaymentService.refund(
        Number(payment_id),
        Number(amount),
        reason || 'Customer refund request',
        req.user?.id
      );
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },
};
