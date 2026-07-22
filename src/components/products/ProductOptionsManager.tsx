import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { productsApi } from '@/api/products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/formControls';
import { useToast } from '@/components/ui/Toast';
import { ProductOption } from '@/types/product';

export function ProductOptionsManager({
  productId,
  options,
}: {
  productId: string;
  options: ProductOption[];
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['product', productId] });

  const removeOptionMutation = useMutation({
    mutationFn: (optionId: string) => productsApi.removeOption(productId, optionId),
    onSuccess: () => {
      invalidate();
      toast.show('옵션을 삭제했어요.', 'success');
    },
    onError: () => toast.show('삭제하지 못했어요.', 'error'),
  });

  const removeValueMutation = useMutation({
    mutationFn: ({ optionId, valueId }: { optionId: string; valueId: string }) =>
      productsApi.removeOptionValue(productId, optionId, valueId),
    onSuccess: () => {
      invalidate();
      toast.show('옵션값을 삭제했어요.', 'success');
    },
    onError: () => toast.show('삭제하지 못했어요.', 'error'),
  });

  const addValueMutation = useMutation({
    mutationFn: ({ optionId, value }: { optionId: string; value: string }) =>
      productsApi.addOptionValue(productId, optionId, value),
    onSuccess: () => {
      invalidate();
      toast.show('옵션값을 추가했어요.', 'success');
    },
    onError: () => toast.show('추가하지 못했어요.', 'error'),
  });

  const addOptionMutation = useMutation({
    mutationFn: (payload: { name: string; values: string[] }) =>
      productsApi.addOption(productId, payload),
    onSuccess: () => {
      invalidate();
      toast.show('옵션을 추가했어요.', 'success');
    },
    onError: () => toast.show('추가하지 못했어요.', 'error'),
  });

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.id} className="rounded-lg border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{option.name}</span>
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-red-500"
              onClick={() => removeOptionMutation.mutate(option.id)}
            >
              옵션 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {option.values.map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
              >
                {v.value}
                <button
                  type="button"
                  onClick={() => removeValueMutation.mutate({ optionId: option.id, valueId: v.id })}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="삭제"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <AddValueInline
            loading={addValueMutation.isPending}
            onAdd={(value) => addValueMutation.mutate({ optionId: option.id, value })}
          />
        </div>
      ))}
      <AddOptionInline
        loading={addOptionMutation.isPending}
        onAdd={(payload) => addOptionMutation.mutate(payload)}
      />
    </div>
  );
}

function AddValueInline({ loading, onAdd }: { loading: boolean; onAdd: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <form
      className="mt-2 flex gap-1.5"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(value.trim());
        setValue('');
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="값 추가"
        className="h-8 text-xs"
      />
      <Button type="submit" size="sm" loading={loading} disabled={!value.trim()}>
        <Plus size={13} />
      </Button>
    </form>
  );
}

function AddOptionInline({
  loading,
  onAdd,
}: {
  loading: boolean;
  onAdd: (payload: { name: string; values: string[] }) => void;
}) {
  const [name, setName] = useState('');
  const [valuesText, setValuesText] = useState('');

  return (
    <form
      className="space-y-2 rounded-lg border border-dashed border-gray-300 p-3"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        const values = valuesText
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        if (!name.trim() || values.length === 0) return;
        onAdd({ name: name.trim(), values });
        setName('');
        setValuesText('');
      }}
    >
      <p className="text-xs font-medium text-gray-500">새 옵션 추가</p>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="옵션명 (예: 색상)"
      />
      <Input
        value={valuesText}
        onChange={(e) => setValuesText(e.target.value)}
        placeholder="값 (쉼표로 구분, 예: GN60, RV50)"
      />
      <Button type="submit" size="sm" loading={loading} disabled={!name.trim() || !valuesText.trim()}>
        옵션 추가
      </Button>
    </form>
  );
}
