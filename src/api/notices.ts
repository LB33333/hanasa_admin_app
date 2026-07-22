import { apiClient } from '@/lib/apiClient';
import { Paginated } from '@/types/common';
import {
  CreateNoticePayload,
  NoticeDetail,
  NoticeListItem,
  UpdateNoticePayload,
} from '@/types/notice';

export const noticesApi = {
  list: (params: { page?: number; limit?: number }) =>
    apiClient.get<Paginated<NoticeListItem>>('/admin/notices', params),

  get: (id: string) => apiClient.get<NoticeDetail>(`/admin/notices/${id}`),

  create: (payload: CreateNoticePayload) =>
    apiClient.post<NoticeDetail>('/admin/notices', payload),

  update: (id: string, payload: UpdateNoticePayload) =>
    apiClient.patch<NoticeDetail>(`/admin/notices/${id}`, payload),

  remove: (id: string) => apiClient.delete<void>(`/admin/notices/${id}`),
};
