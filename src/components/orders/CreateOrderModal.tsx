import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ordersApi } from '@/api/orders';
import { salonsApi } from '@/api/salons';
import { Field } from '@/components/ui/formControls';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/apiClient';
import { AddOrderItemPayload } from '@/types/order';
import { AddItemsForm } from './AddItemsForm';
import { SalonPicker } from './SalonPicker';

const ERROR_MESSAGES: Record<string, string> = {
  SALON_NOT_FOUND: '살롱을 찾을 수 없어요.',
  SALON_NOT_APPROVED: '승인되지 않은 살롱이에요.',
  OPTION_REQUIRED: '옵션을 선택해야 하는 상품이 있어요.',
  OPTION_VALUE_MISMATCH: '선택한 옵션이 해당 상품의 옵션이 아니에요.',
  OPTION_VALUE_NOT_FOUND: '선택한 옵션값을 찾을 수 없어요.',
  OPTION_NOT_APPLICABLE: '옵션이 없는 상품이에요.',
  PRODUCT_NOT_FOUND: '상품을 찾을 수 없어요.',
};

function describeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.errorCode) {
    return ERROR_MESSAGES[error.errorCode] ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function CreateOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [salonId, setSalonId] = useState('');

  const salonsQuery = useQuery({
    queryKey: ['salons'],
    queryFn: salonsApi.list,
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (items: AddOrderItemPayload[]) => ordersApi.create(salonId, items),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.show('주문을 생성했어요.', 'success');
      setSalonId('');
      onClose();
    },
    onError: (error) => toast.show(describeError(error, '주문 생성에 실패했어요.'), 'error'),
  });

  return (
    <Modal
      open={open}
      onClose={() => {
        setSalonId('');
        onClose();
      }}
      title="새 주문 생성"
    >
      <div className="space-y-4">
        <Field label="살롱" hint="승인된 살롱만 선택할 수 있어요.">
          {salonsQuery.isLoading ? (
            <Spinner className="py-2" />
          ) : (
            <SalonPicker salons={salonsQuery.data ?? []} value={salonId} onChange={setSalonId} />
          )}
        </Field>

        {salonId && (
          <AddItemsForm
            salonId={salonId}
            loading={createMutation.isPending}
            submitLabel="주문 생성"
            onSubmit={async (items) => {
              try {
                await createMutation.mutateAsync(items);
                return true;
              } catch {
                return false;
              }
            }}
          />
        )}
      </div>
    </Modal>
  );
}
