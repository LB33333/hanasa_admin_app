import { apiClient } from '@/lib/apiClient';
import { Paginated } from '@/types/common';
import {
  AdminProduct,
  CreateProductOptionPayload,
  CreateProductPayload,
  ProductOption,
  UpdateProductPayload,
} from '@/types/product';

export const productsApi = {
  list: (params: {
    page?: number;
    limit?: number;
    manufacturer?: string;
    mainCategory?: string;
    subCategory?: string;
    includeDeleted?: boolean;
  }) => apiClient.get<Paginated<AdminProduct>>('/admin/products', params),

  get: (id: string) => apiClient.get<AdminProduct>(`/admin/products/${id}`),

  create: (payload: CreateProductPayload) =>
    apiClient.post<AdminProduct>('/admin/products', payload),

  update: (id: string, payload: UpdateProductPayload) =>
    apiClient.patch<AdminProduct>(`/admin/products/${id}`, payload),

  remove: (id: string) => apiClient.delete<void>(`/admin/products/${id}`),

  addOption: (productId: string, payload: CreateProductOptionPayload) =>
    apiClient.post<ProductOption>(`/admin/products/${productId}/options`, payload),

  removeOption: (productId: string, optionId: string) =>
    apiClient.delete<void>(`/admin/products/${productId}/options/${optionId}`),

  addOptionValue: (productId: string, optionId: string, value: string) =>
    apiClient.post<{ id: string; value: string }>(
      `/admin/products/${productId}/options/${optionId}/values`,
      { value },
    ),

  removeOptionValue: (productId: string, optionId: string, valueId: string) =>
    apiClient.delete<void>(
      `/admin/products/${productId}/options/${optionId}/values/${valueId}`,
    ),
};
