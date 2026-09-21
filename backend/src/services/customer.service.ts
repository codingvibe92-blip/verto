import { CustomerRepository } from '../repositories/customer.repository';
import { PaginationParams } from '../utils/pagination';

export const CustomerService = {
  async listCustomers(opts: PaginationParams & { search?: string; status?: string }) {
    return CustomerRepository.listCustomers(opts);
  },

  async getCustomer(id: number) {
    const c = await CustomerRepository.findById(id);
    if (!c) throw new Error('Customer not found');
    return c;
  },

  async getMyProfile(userId: number) {
    return CustomerRepository.findByUserId(userId);
  },

  async addAddress(customerId: number, data: any) {
    const id = await CustomerRepository.addAddress(customerId, data);
    return { id, message: 'Address added successfully' };
  },

  async deleteAddress(addressId: number, customerId: number) {
    await CustomerRepository.deleteAddress(addressId, customerId);
    return { success: true, message: 'Address removed' };
  },
};
