import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { manufacturersApi } from '@/api/manufacturers';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/formControls';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Manufacturer } from '@/types/manufacturer';

type FormState = {
  name: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY: FormState = { name: '', sortOrder: '0', isActive: true };

export function ManufacturerFormModal({
  open,
  manufacturer,
  onClose,
}: {
  open: boolean;
  manufacturer: Manufacturer | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (manufacturer) {
      setForm({
        name: manufacturer.name,
        sortOrder: String(manufacturer.sortOrder),
        isActive: manufacturer.isActive,
      });
    } else {
      setForm(EMPTY);
    }
  }, [manufacturer, open]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
    // 이름 변경은 상품에도 반영되므로 상품 캐시도 갱신한다.
    void queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const payload = () => ({
    name: form.name.trim(),
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive,
  });

  const createMutation = useMutation({
    mutationFn: () => manufacturersApi.create(payload()),
    onSuccess: () => {
      invalidate();
      toast.show('제조사를 등록했어요.', 'success');
      onClose();
    },
    onError: () => toast.show('등록하지 못했어요. 이미 있는 이름인지 확인해 주세요.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => manufacturersApi.update(id, payload()),
    onSuccess: () => {
      invalidate();
      toast.show('제조사를 저장했어요.', 'success');
      onClose();
    },
    onError: () => toast.show('저장하지 못했어요. 이미 있는 이름인지 확인해 주세요.', 'error'),
  });

  const loading = createMutation.isPending || updateMutation.isPending;
  const valid = form.name.trim().length > 0;

  const handleSubmit = () => {
    if (manufacturer) {
      updateMutation.mutate(manufacturer.id);
    } else {
      createMutation.mutate();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={manufacturer ? '제조사 수정' : '새 제조사'}>
      <div className="space-y-4">
        <Field
          label="이름"
          required
          hint={manufacturer ? '이름을 바꾸면 이 제조사의 모든 상품에도 반영돼요.' : undefined}
        >
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="노출 순서" hint="숫자가 작을수록 앱 필터에서 먼저 노출돼요.">
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
          활성 (앱 필터에 노출)
        </label>
        <Button className="w-full" onClick={handleSubmit} loading={loading} disabled={!valid}>
          {manufacturer ? '저장' : '등록'}
        </Button>
      </div>
    </Modal>
  );
}
