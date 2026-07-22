import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { bannersApi } from '@/api/banners';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/formControls';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Banner } from '@/types/banner';

type FormState = {
  title: string;
  imageUrl: string;
  deepLink: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY: FormState = { title: '', imageUrl: '', deepLink: '', sortOrder: '0', isActive: true };

export function BannerFormModal({
  open,
  banner,
  onClose,
}: {
  open: boolean;
  banner: Banner | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (banner) {
      setForm({
        title: banner.title,
        imageUrl: banner.imageUrl,
        deepLink: banner.deepLink ?? '',
        sortOrder: String(banner.sortOrder),
        isActive: banner.isActive,
      });
    } else {
      setForm(EMPTY);
    }
  }, [banner, open]);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['banners'] });

  const createMutation = useMutation({
    mutationFn: bannersApi.create,
    onSuccess: () => {
      invalidate();
      toast.show('배너를 등록했어요.', 'success');
      onClose();
    },
    onError: () => toast.show('등록하지 못했어요.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) =>
      bannersApi.update(id, {
        title: form.title.trim(),
        imageUrl: form.imageUrl,
        deepLink: form.deepLink.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      }),
    onSuccess: () => {
      invalidate();
      toast.show('배너를 저장했어요.', 'success');
      onClose();
    },
    onError: () => toast.show('저장하지 못했어요.', 'error'),
  });

  const loading = createMutation.isPending || updateMutation.isPending;
  const valid = form.title.trim() && form.imageUrl;

  const handleSubmit = () => {
    if (banner) {
      updateMutation.mutate(banner.id);
    } else {
      createMutation.mutate({
        title: form.title.trim(),
        imageUrl: form.imageUrl,
        deepLink: form.deepLink.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={banner ? '배너 수정' : '새 배너'}>
      <div className="space-y-4">
        <Field label="배너 이미지" required>
          <ImageUploader
            folder="banners"
            value={form.imageUrl}
            onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          />
        </Field>
        <Field label="관리용 이름" required hint="앱 화면에는 노출되지 않아요.">
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="딥링크" hint="예: products, notices/공지ID">
          <Input
            value={form.deepLink}
            onChange={(e) => setForm((f) => ({ ...f, deepLink: e.target.value }))}
          />
        </Field>
        <Field label="노출 순서" hint="숫자가 작을수록 먼저 노출돼요.">
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          노출 중
        </label>
        <Button className="w-full" onClick={handleSubmit} loading={loading} disabled={!valid}>
          {banner ? '저장' : '등록'}
        </Button>
      </div>
    </Modal>
  );
}
