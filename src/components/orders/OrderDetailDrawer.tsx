import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { ordersApi } from '@/api/orders';
import { productsApi } from '@/api/products';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { Field, Input, Select } from '@/components/ui/formControls';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/apiClient';
import { formatCurrency, formatDateTime, maskPhoneNumber, toDateInputValue } from '@/lib/format';
import { AdminOrder, ORDER_STATUSES, OrderStatus, OrderItemSummary } from '@/types/order';
import { AddOrderItemPayload } from '@/types/order';
import { AddItemsForm } from './AddItemsForm';
import { DiscountPriceInput } from './DiscountPriceInput';
import { OrderStatusBadge } from './OrderStatusBadge';

const ERROR_MESSAGES: Record<string, string> = {
  ORDER_CANCELLED: '취소된 주문이라 변경할 수 없어요.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없어요. 새로고침해 주세요.',
  ORDER_ITEM_NOT_FOUND: '이미 삭제된 상품이에요. 새로고침해 주세요.',
  LAST_ITEM_IN_ORDER: '상품이 하나만 남은 주문이에요. 삭제하려면 주문 자체를 취소해 주세요.',
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

export function OrderDetailDrawer({
  open,
  order,
  onClose,
}: {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="주문 상세">
      {order ? <OrderDetailContent order={order} /> : <Spinner className="py-10" />}
    </Drawer>
  );
}

function OrderDetailContent({ order }: { order: AdminOrder }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [arrivalDate, setArrivalDate] = useState(toDateInputValue(order.arrivalDate));

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['orders'] });

  const updateMutation = useMutation({
    mutationFn: () =>
      ordersApi.update(order.id, {
        status,
        ...(arrivalDate ? { arrivalDate: new Date(arrivalDate).toISOString() } : {}),
      }),
    onSuccess: () => {
      invalidate();
      toast.show('주문 상태를 변경했어요.', 'success');
    },
    onError: (error) => toast.show(describeError(error, '상태 변경에 실패했어요.'), 'error'),
  });

  const addItemsMutation = useMutation({
    mutationFn: (items: AddOrderItemPayload[]) => ordersApi.addItems(order.id, items),
    onSuccess: () => {
      invalidate();
      toast.show('상품을 추가했어요.', 'success');
    },
    onError: (error) => toast.show(describeError(error, '상품 추가에 실패했어요.'), 'error'),
  });

  const [editItemId, setEditItemId] = useState<string | null>(null);
  const updateItemPriceMutation = useMutation({
    mutationFn: ({ itemId, unitPrice }: { itemId: string; unitPrice: number }) =>
      ordersApi.updateItemPrice(order.id, itemId, unitPrice),
    onSuccess: () => {
      invalidate();
      setEditItemId(null);
      toast.show('단가를 수정했어요.', 'success');
    },
    onError: (error) => toast.show(describeError(error, '단가 수정에 실패했어요.'), 'error'),
  });

  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => ordersApi.removeItem(order.id, itemId),
    onSuccess: () => {
      invalidate();
      setDeleteItemId(null);
      toast.show('상품을 삭제했어요.', 'success');
    },
    onError: (error) => toast.show(describeError(error, '삭제에 실패했어요.'), 'error'),
  });

  const isCancelled = order.status === '취소';

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">
            {order.salon.name || '이름 미입력'}
          </h3>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-0.5 text-sm text-gray-400">{maskPhoneNumber(order.salon.phoneNumber)}</p>
        <p className="mt-2 text-xs text-gray-400">주문일 {formatDateTime(order.createdAt)}</p>
        {order.arrivalDate && (
          <p className="text-xs text-gray-400">도착(예정)일 {formatDateTime(order.arrivalDate)}</p>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">주문 상품</h4>
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
          {order.items.map((item) =>
            editItemId === item.id ? (
              <li key={item.id} className="px-3 py-2.5">
                <EditItemPriceForm
                  item={item}
                  loading={updateItemPriceMutation.isPending}
                  onSubmit={(unitPrice) =>
                    updateItemPriceMutation.mutate({ itemId: item.id, unitPrice })
                  }
                  onCancel={() => setEditItemId(null)}
                />
              </li>
            ) : (
              <li key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <p className="text-gray-900">{item.productName}</p>
                  {item.optionName && (
                    <p className="text-xs text-gray-400">
                      {item.optionName}: {item.optionValue}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                  {!isCancelled && (
                    <>
                      <button
                        type="button"
                        className="rounded border border-gray-200 p-1.5 text-gray-500 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setEditItemId(item.id)}
                        aria-label="단가 수정"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="rounded border border-gray-200 p-1.5 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                        onClick={() => setDeleteItemId(item.id)}
                        aria-label="상품 삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
        <div className="mt-2 flex justify-between px-1 text-sm font-semibold text-gray-900">
          <span>합계</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {isCancelled ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
          취소된 주문이에요. 상태 변경과 상품 추가가 모두 불가능해요.
        </div>
      ) : (
        <>
          <form
            className="space-y-3 rounded-xl border border-gray-200 p-3"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
          >
            <h4 className="text-sm font-semibold text-gray-700">상태 변경</h4>
            <Field label="주문 상태">
              <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            {(status === '배송예정' || status === '배송완료') && (
              <Field label="도착(예정)일" hint="비워두면 오늘 날짜로 기록돼요.">
                <Input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                />
              </Field>
            )}
            <Button type="submit" size="sm" className="w-full" loading={updateMutation.isPending}>
              저장
            </Button>
          </form>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">
              상품 추가 <span className="font-normal text-gray-400">(전화 등 추가 주문)</span>
            </h4>
            <AddItemsForm
              loading={addItemsMutation.isPending}
              onSubmit={async (items) => {
                try {
                  await addItemsMutation.mutateAsync(items);
                  return true;
                } catch {
                  return false;
                }
              }}
            />
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleteItemId !== null}
        title="상품 삭제"
        description="이 상품을 주문에서 삭제할까요?"
        confirmLabel="삭제"
        danger
        loading={removeItemMutation.isPending}
        onConfirm={() => deleteItemId && removeItemMutation.mutate(deleteItemId)}
        onCancel={() => setDeleteItemId(null)}
      />
    </div>
  );
}

function EditItemPriceForm({
  item,
  loading,
  onSubmit,
  onCancel,
}: {
  item: OrderItemSummary;
  loading: boolean;
  onSubmit: (unitPrice: number) => void;
  onCancel: () => void;
}) {
  const [unitPrice, setUnitPrice] = useState(String(item.unitPrice));
  const productQuery = useQuery({
    queryKey: ['product', item.product.id],
    queryFn: () => productsApi.get(item.product.id),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(unitPrice);
    if (!Number.isFinite(value) || value < 0) {
      return;
    }
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-sm text-gray-900">{item.productName}</p>
      <DiscountPriceInput
        basePrice={productQuery.data?.salonPrice ?? null}
        value={unitPrice}
        onChange={setUnitPrice}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" loading={loading}>
          저장
        </Button>
        <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}
