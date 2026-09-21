import { Request, Response, NextFunction } from 'express';
import { ProductionService } from '../services/production.service';
import { parsePagination } from '../utils/pagination';

export const ProductionController = {
  // BOM
  async listBOMs(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const productId = req.query.product_id ? Number(req.query.product_id) : undefined;

      const result = await ProductionService.listBOMs({
        ...pagination,
        search,
        status,
        product_id: productId,
      });
      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async getBOM(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const bom = await ProductionService.getBOM(id);
      res.json({ success: true, data: bom });
    } catch (err) {
      next(err);
    }
  },

  async createBOM(req: Request, res: Response, next: NextFunction) {
    try {
      const bom = await ProductionService.createBOM(req.body, req.user?.id);
      res.status(201).json({ success: true, data: bom });
    } catch (err) {
      next(err);
    }
  },

  async updateBOM(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const bom = await ProductionService.updateBOM(id, req.body);
      res.json({ success: true, data: bom });
    } catch (err) {
      next(err);
    }
  },

  async deleteBOM(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await ProductionService.deleteBOM(id);
      res.json({ success: true, message: 'BOM deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Production Orders
  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const productId = req.query.product_id ? Number(req.query.product_id) : undefined;

      const result = await ProductionService.listOrders({
        ...pagination,
        search,
        status,
        product_id: productId,
      });
      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const order = await ProductionService.getOrder(id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ProductionService.createOrder(req.body, req.user?.id);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  async startOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const order = await ProductionService.startOrder(id, req.user!.id);
      res.json({ success: true, data: order, message: 'Production order started, raw materials consumed' });
    } catch (err) {
      next(err);
    }
  },

  async completeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const order = await ProductionService.completeOrder(id);
      res.json({ success: true, data: order, message: 'Production order completed' });
    } catch (err) {
      next(err);
    }
  },

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const reason = req.body.reason || 'Cancelled by user';
      const order = await ProductionService.cancelOrder(id, reason);
      res.json({ success: true, data: order, message: 'Production order cancelled' });
    } catch (err) {
      next(err);
    }
  },

  // Quality Checks
  async listQualityChecks(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const search = req.query.search as string | undefined;
      const productId = req.query.product_id ? Number(req.query.product_id) : undefined;

      const result = await ProductionService.listQualityChecks({
        ...pagination,
        search,
        product_id: productId,
      });
      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async createQualityCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductionService.createQualityCheck(req.body, req.user?.id);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },
};
