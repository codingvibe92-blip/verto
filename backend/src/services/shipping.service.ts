import { ShippingRepository } from '../repositories/shipping.repository';
import { PaginationParams } from '../utils/pagination';

export const ShippingService = {
  async listShipments(opts: PaginationParams & { search?: string; status?: string }) {
    return ShippingRepository.listShipments(opts);
  },

  async getShipment(id: number) {
    const s = await ShippingRepository.findShipmentById(id);
    if (!s) throw new Error('Shipment not found');
    return s;
  },

  async getShipmentByAWB(awb: string) {
    const s = await ShippingRepository.findShipmentByAWB(awb);
    if (!s) throw new Error('Shipment not found for tracking number');
    return s;
  },

  async getShipmentByOrder(orderId: number) {
    return ShippingRepository.findShipmentByOrderId(orderId);
  },

  async createShipment(data: { orderId: number; courier: string; totalWeight?: number; awb?: string }) {
    const id = await ShippingRepository.createShipment(data);
    return ShippingRepository.findShipmentById(id);
  },

  async addCheckpoint(shipmentId: number, status: string, location: string, description: string) {
    await ShippingRepository.addTrackingCheckpoint(shipmentId, status, location, description);
    return ShippingRepository.findShipmentById(shipmentId);
  },
};
