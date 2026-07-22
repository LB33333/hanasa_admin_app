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

  update: (id: string, payload: AdminUpdateOrderPayload) =>
    apiClient.patch<AdminOrder>(`/admin/orders/${id}`, payload),

  addItems: (id: string, items: AddOrderItemPayload[]) =>
    apiClient.post<AdminOrder>(`/admin/orders/${id}/items`, { items }),
};
