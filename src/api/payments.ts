import { apiClient } from '@/lib/apiClient';
import { Paginated } from '@/types/common';
import { CreatePaymentPayload, Payment } from '@/types/payment';

export const paymentsApi = {
  listForSalon: (salonId: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<Payment>>('/admin/payments', { salonId, ...params }),

  create: (payload: CreatePaymentPayload) =>
    apiClient.post<Payment>('/admin/payments', payload),

  remove: (id: string) => apiClient.delete<void>(`/admin/payments/${id}`),
};
