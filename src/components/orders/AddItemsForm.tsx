import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productsApi } from '@/api/products';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/formControls';
import { AdminProduct } from '@/types/product';
import { AddOrderItemPayload } from '@/types/order';
import { DiscountPriceInput } from './DiscountPriceInput';
import { ProductPicker } from './ProductPicker';

type Row = {
  key: number;
  productId: string;
  productOptionValueId: string;
  quantity: string;
  unitPrice: string;
};

let rowKeySeq = 0;
const emptyRow = (): Row => ({
  key: ++rowKeySeq,
  productId: '',
  productOptionValueId: '',
  quantity: '1',
  unitPrice: '',
});

export function AddItemsForm({
  salonId,
  loading,
  onSubmit,
  submitLabel = '주문에 추가',
}: {
  salonId?: string;
  loading: boolean;
  // true를 반환하면(성공) 폼을 비운다. false/실패면 입력값을 그대로 유지해서 다시 시도할 수 있게 한다.
  onSubmit: (items: AddOrderItemPayload[]) => Promise<boolean>;
  submitLabel?: string;
}) {
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  // 옵션이 있는 상품인데 옵션을 아직 안 고른 행의 key 목록. 알려지기 전(로딩 중)에는 막지 않는다.
  const [missingOptionKeys, setMissingOptionKeys] = useState<Set<number>>(new Set());

  const productsQuery = useQuery({
    queryKey: ['products', 'picker'],
    queryFn: () => productsApi.list({ limit: 100 }),
  });
  const products = productsQuery.data?.items ?? [];

  const updateRow = (key: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const reportMissingOption = (key: number, missing: boolean) => {
    setMissingOptionKeys((prev) => {
      const next = new Set(prev);
      if (missing) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const canSubmit =
    rows.every((r) => r.productId && Number(r.quantity) > 0) &&
    rows.every((r) => !missingOptionKeys.has(r.key));

  const handleSubmit = async () => {
    const items: AddOrderItemPayload[] = rows.map((r) => ({
      productId: r.productId,
      productOptionValueId: r.productOptionValueId || undefined,
      quantity: Number(r.quantity),
      unitPrice: r.unitPrice !== '' ? Number(r.unitPrice) : undefined,
    }));
    const success = await onSubmit(items);
    if (success) {
      setRows([emptyRow()]);
      setMissingOptionKeys(new Set());
    }
  };

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <AddItemRowView
          key={row.key}
          row={row}
          products={products}
          salonId={salonId}
          onChange={(patch) => updateRow(row.key, patch)}
          onMissingOptionChange={(missing) => reportMissingOption(row.key, missing)}
          onRemove={
            rows.length > 1
              ? () => {
                  setRows((prev) => prev.filter((r) => r.key !== row.key));
                  reportMissingOption(row.key, false);
                }
              : undefined
          }
        />
      ))}
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
        onClick={() => setRows((prev) => [...prev, emptyRow()])}
      >
        <Plus size={14} /> 상품 추가
      </button>
      <Button
        className="w-full"
        size="sm"
        disabled={!canSubmit}
        loading={loading}
        onClick={() => void handleSubmit()}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

function AddItemRowView({
  row,
  products,
  salonId,
  onChange,
  onMissingOptionChange,
  onRemove,
}: {
  row: Row;
  products: AdminProduct[];
  salonId?: string;
  onChange: (patch: Partial<Row>) => void;
  onMissingOptionChange: (missing: boolean) => void;
  onRemove?: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: ['product', row.productId],
    queryFn: () => productsApi.get(row.productId),
    enabled: !!row.productId,
  });
  const options = detailQuery.data?.options ?? [];
  const hasOptions = options.length > 0;
  const missingOption = hasOptions && !row.productOptionValueId;
  const selectedProduct = products.find((p) => p.id === row.productId) ?? null;

  // 옵션이 필요한데 아직 안 고른 상태를 부모에게 알려서 제출 버튼을 막는다.
  useEffect(() => {
    onMissingOptionChange(missingOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingOption]);

  return (
    <div className="flex items-start gap-2 rounded-lg border border-gray-200 p-2.5">
      <div className="flex-1 space-y-2">
        <ProductPicker
          products={products}
          value={row.productId}
          salonId={salonId}
          onChange={(productId) => onChange({ productId, productOptionValueId: '', unitPrice: '' })}
        />
        {hasOptions && (
          <div>
            <Select
              value={row.productOptionValueId}
              onChange={(e) => onChange({ productOptionValueId: e.target.value })}
            >
              <option value="">옵션 선택</option>
              {options.map((opt) => (
                <optgroup key={opt.id} label={opt.name}>
                  {opt.values.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.value}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
            {missingOption && (
              <p className="mt-1 text-xs text-red-500">이 상품은 옵션을 선택해야 해요.</p>
            )}
            {options.length > 1 && (
              <p className="mt-1 text-xs text-amber-600">
                옵션 그룹이 여러 개인 상품이에요. 한 번에 하나만 선택할 수 있어요.
              </p>
            )}
          </div>
        )}
        <Input
          type="number"
          min={1}
          value={row.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
          placeholder="수량"
        />
        <DiscountPriceInput
          basePrice={selectedProduct?.salonPrice ?? null}
          value={row.unitPrice}
          onChange={(unitPrice) => onChange({ unitPrice })}
        />
      </div>
      {onRemove && (
        <button
          type="button"
          className="mt-1 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
          onClick={onRemove}
          aria-label="삭제"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
