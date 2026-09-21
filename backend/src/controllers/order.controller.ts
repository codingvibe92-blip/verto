import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { parsePagination } from '../utils/pagination';

export const OrderController = {
  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const paymentStatus = req.query.payment_status as string | undefined;
      const customerId = req.query.customer_id ? Number(req.query.customer_id) : undefined;

      const result = await OrderService.listOrders({
        ...pagination,
        search,
        status,
        payment_status: paymentStatus,
        customer_id: customerId,
      });

      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const order = await OrderService.getOrder(id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const orderNumber = req.params.orderNumber;
      const order = await OrderService.getOrderByNumber(orderNumber);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.checkout(req.body, req.user?.id);
      res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status, reason } = req.body;
      const updated = await OrderService.updateStatus(id, status, reason, req.user?.id);
      res.json({ success: true, data: updated, message: `Order status updated to ${status}` });
    } catch (err) {
      next(err);
    }
  },
};
