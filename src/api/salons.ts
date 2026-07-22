import { apiClient } from '@/lib/apiClient';
import { AdminUpdateSalonPayload, Salon } from '@/types/salon';

export const salonsApi = {
  list: () => apiClient.get<Salon[]>('/admin/salons'),
  get: (id: string) => apiClient.get<Salon>(`/admin/salons/${id}`),
  update: (id: string, payload: AdminUpdateSalonPayload) =>
    apiClient.patch<Salon>(`/admin/salons/${id}`, payload),
};
