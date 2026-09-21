import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { parsePagination } from '../utils/pagination';

export const CustomerController = {
  async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await CustomerService.listCustomers({
        ...pagination,
        search,
        status,
      });
      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const customer = await CustomerService.getCustomer(id);
      res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = await CustomerService.getMyProfile(userId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },

  async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = Number(req.params.customerId);
      const result = await CustomerService.addAddress(customerId, req.body);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = Number(req.params.customerId);
      const addressId = Number(req.params.addressId);
      const result = await CustomerService.deleteAddress(addressId, customerId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
