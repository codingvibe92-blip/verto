import { PaymentRepository } from '../repositories/payment.repository';
import { PaginationParams } from '../utils/pagination';

export const PaymentService = {
  async listPayments(opts: PaginationParams & { search?: string; status?: string }) {
    return PaymentRepository.listPayments(opts);
  },

  async listRefunds(opts: PaginationParams) {
    return PaymentRepository.listRefunds(opts);
  },

  async refund(paymentId: number, amount: number, reason: string, processedBy?: number) {
    const refundId = await PaymentRepository.processRefund(paymentId, amount, reason, processedBy);
    return { refundId, message: `Refund of $${amount.toFixed(2)} processed successfully.` };
  },
};
