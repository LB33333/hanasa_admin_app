import { useRef, useState } from 'react';
import { uploadsApi } from '@/api/uploads';
import { UploadFolder } from '@/types/upload';
import { useToast } from './Toast';

export function ImageUploader({
  folder,
  value,
  onChange,
}: {
  folder: UploadFolder;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.show('이미지 파일만 업로드할 수 있어요.', 'error');
      return;
    }
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);
    try {
      const { uploadUrl, fileUrl } = await uploadsApi.createUploadUrl(folder, file.type);
      await uploadsApi.uploadFile(uploadUrl, file);
      onChange(fileUrl);
      toast.show('이미지를 업로드했어요.', 'success');
    } catch (error) {
      toast.show(
        error instanceof Error ? error.message : '이미지 업로드에 실패했어요.',
        'error',
      );
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl ?? (value || null);

  return (
    <div>
      <div
        className="group relative flex aspect-square w-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:border-gray-400"
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="미리보기" className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center text-xs text-gray-400">이미지 선택</span>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          </div>
        )}
        {displayUrl && !uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
            변경
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
