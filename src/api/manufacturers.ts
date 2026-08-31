import { apiClient } from '@/lib/apiClient';
import {
  CreateManufacturerPayload,
  Manufacturer,
  UpdateManufacturerPayload,
} from '@/types/manufacturer';

export const manufacturersApi = {
  list: () => apiClient.get<Manufacturer[]>('/admin/manufacturers'),
  create: (payload: CreateManufacturerPayload) =>
    apiClient.post<Manufacturer>('/admin/manufacturers', payload),
  update: (id: string, payload: UpdateManufacturerPayload) =>
    apiClient.patch<Manufacturer>(`/admin/manufacturers/${id}`, payload),
  remove: (id: string) => apiClient.delete<void>(`/admin/manufacturers/${id}`),
};
