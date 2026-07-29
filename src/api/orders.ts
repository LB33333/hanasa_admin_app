import { apiClient } from '@/lib/apiClient';
import { Paginated } from '@/types/common';
import {
  AddOrderItemPayload,
  AdminOrder,
  AdminUpdateOrderPayload,
  OrderStatus,
} from '@/types/order';

export const ordersApi = {
  list: (params: { page?: number; limit?: number; statuses?: OrderStatus[] }) =>
    apiClient.get<Paginated<AdminOrder>>('/admin/orders', params),

  create: (salonId: string, items: AddOrderItemPayload[]) =>
    apiClient.post<AdminOrder>('/admin/orders', { salonId, items }),

  update: (id: string, payload: AdminUpdateOrderPayload) =>
    apiClient.patch<AdminOrder>(`/admin/orders/${id}`, payload),

  addItems: (id: string, items: AddOrderItemPayload[]) =>
    apiClient.post<AdminOrder>(`/admin/orders/${id}/items`, { items }),

  updateItemPrice: (orderId: string, itemId: string, unitPrice: number) =>
    apiClient.patch<AdminOrder>(`/admin/orders/${orderId}/items/${itemId}`, { unitPrice }),

  removeItem: (orderId: string, itemId: string) =>
    apiClient.delete<AdminOrder>(`/admin/orders/${orderId}/items/${itemId}`),
};
