import { Request, Response, NextFunction } from 'express';
import { ShippingService } from '../services/shipping.service';
import { parsePagination } from '../utils/pagination';

export const ShippingController = {
  async listShipments(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, string>);
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await ShippingService.listShipments({
        ...pagination,
        search,
        status,
      });
      res.json({ success: true, data: result.rows, meta: result.meta });
    } catch (err) {
      next(err);
    }
  },

  async getShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const shipment = await ShippingService.getShipment(id);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  },

  async trackByAWB(req: Request, res: Response, next: NextFunction) {
    try {
      const awb = req.params.awb;
      const shipment = await ShippingService.getShipmentByAWB(awb);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  },

  async getByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Number(req.params.orderId);
      const shipment = await ShippingService.getShipmentByOrder(orderId);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  },

  async createShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { order_id, courier, total_weight, awb } = req.body;
      const shipment = await ShippingService.createShipment({
        orderId: Number(order_id),
        courier,
        totalWeight: total_weight ? Number(total_weight) : undefined,
        awb,
      });
      res.status(201).json({ success: true, data: shipment, message: 'Shipment created and order dispatched' });
    } catch (err) {
      next(err);
    }
  },

  async addCheckpoint(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status, location, description } = req.body;
      const shipment = await ShippingService.addCheckpoint(id, status, location, description);
      res.json({ success: true, data: shipment, message: 'Tracking checkpoint recorded' });
    } catch (err) {
      next(err);
    }
  },
};
