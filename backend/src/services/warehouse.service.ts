import { WarehouseRepository, WarehouseInput } from '../repositories/warehouse.repository';
import { RawMaterialRepository, RawMaterialInput } from '../repositories/raw-material.repository';
import { ApiError } from '../utils/errors';
import { PaginationParams } from '../utils/pagination';

export const WarehouseService = {
  list(opts: PaginationParams & { search?: string }) {
    return WarehouseRepository.list(opts);
  },
  allActive() {
    return WarehouseRepository.allActive();
  },
  async get(id: number) {
    const wh = await WarehouseRepository.findById(id);
    if (!wh) throw ApiError.notFound('Warehouse not found');
    const locations = await WarehouseRepository.locations(id);
    return { warehouse: wh, locations };
  },
  async create(input: WarehouseInput) {
    if (await WarehouseRepository.findByCode(input.code)) {
      throw ApiError.conflict('Warehouse code already exists');
    }
    const id = await WarehouseRepository.create(input);
    return WarehouseRepository.findById(id);
  },
  async update(id: number, input: Partial<WarehouseInput>) {
    const wh = await WarehouseRepository.findById(id);
    if (!wh) throw ApiError.notFound('Warehouse not found');
    if (input.code && (await WarehouseRepository.findByCode(input.code, id))) {
      throw ApiError.conflict('Warehouse code already exists');
    }
    await WarehouseRepository.update(id, input);
    return WarehouseRepository.findById(id);
  },
  async remove(id: number) {
    const wh = await WarehouseRepository.findById(id);
    if (!wh) throw ApiError.notFound('Warehouse not found');
    await WarehouseRepository.remove(id);
  },
  async addLocation(warehouseId: number, name: string, code: string) {
    const wh = await WarehouseRepository.findById(warehouseId);
    if (!wh) throw ApiError.notFound('Warehouse not found');
    const id = await WarehouseRepository.createLocation(warehouseId, name, code);
    return WarehouseRepository.locations(warehouseId);
  },
};

export const RawMaterialService = {
  list(opts: PaginationParams & { search?: string; status?: string; category_id?: number }) {
    return RawMaterialRepository.list(opts);
  },
  async get(id: number) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound('Raw material not found');
    return rm;
  },
  async create(input: RawMaterialInput) {
    if (await RawMaterialRepository.skuExists(input.sku)) {
      throw ApiError.conflict('SKU already exists');
    }
    const id = await RawMaterialRepository.create(input);
    return RawMaterialRepository.findById(id);
  },
  async update(id: number, input: Partial<RawMaterialInput>) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound('Raw material not found');
    if (input.sku && (await RawMaterialRepository.skuExists(input.sku, id))) {
      throw ApiError.conflict('SKU already exists');
    }
    await RawMaterialRepository.update(id, input);
    return RawMaterialRepository.findById(id);
  },
  async remove(id: number) {
    const rm = await RawMaterialRepository.findById(id);
    if (!rm) throw ApiError.notFound('Raw material not found');
    await RawMaterialRepository.softDelete(id);
  },
};