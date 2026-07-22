import { apiClient } from '@/lib/apiClient';
import { UploadFolder, UploadUrlResponse } from '@/types/upload';

export const uploadsApi = {
  createUploadUrl: (folder: UploadFolder, contentType: string) =>
    apiClient.post<UploadUrlResponse>('/admin/uploads', { folder, contentType }),

  // presigned URL로 실제 파일을 업로드한다. 서버를 거치지 않고 S3에 직접 PUT한다.
  uploadFile: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했어요.');
    }
  },
};
