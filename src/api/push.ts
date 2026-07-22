import { apiClient } from '@/lib/apiClient';
import { SendCustomPushPayload, SendCustomPushResult } from '@/types/push';

export const pushApi = {
  send: (payload: SendCustomPushPayload) =>
    apiClient.post<SendCustomPushResult>('/admin/push', payload),
};
