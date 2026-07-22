import { apiClient } from '@/lib/apiClient';
import { Banner, CreateBannerPayload, UpdateBannerPayload } from '@/types/banner';

export const bannersApi = {
  list: () => apiClient.get<Banner[]>('/admin/banners'),
  create: (payload: CreateBannerPayload) =>
    apiClient.post<Banner>('/admin/banners', payload),
  update: (id: string, payload: UpdateBannerPayload) =>
    apiClient.patch<Banner>(`/admin/banners/${id}`, payload),
  remove: (id: string) => apiClient.delete<void>(`/admin/banners/${id}`),
};
