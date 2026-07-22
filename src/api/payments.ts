import { apiClient } from '@/lib/apiClient';
import { Paginated } from '@/types/common';
import { CreatePaymentPayload, Payment, UpdatePaymentPayload } from '@/types/payment';

export const paymentsApi = {
  listForSalon: (salonId: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<Payment>>('/admin/payments', { salonId, ...params }),

  create: (payload: CreatePaymentPayload) =>
    apiClient.post<Payment>('/admin/payments', payload),

  update: (id: string, payload: UpdatePaymentPayload) =>
    apiClient.patch<Payment>(`/admin/payments/${id}`, payload),

  remove: (id: string) => apiClient.delete<void>(`/admin/payments/${id}`),
};
