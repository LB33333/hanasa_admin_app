import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersApi } from '@/api/orders';
import { OrderDetailDrawer } from '@/components/orders/OrderDetailDrawer';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { ORDER_STATUSES, OrderStatus } from '@/types/order';

const FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: '전체', value: 'all' },
  ...ORDER_STATUSES.map((s) => ({ label: s, value: s })),
];

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') as OrderStatus | null;
  const [status, setStatus] = useState<OrderStatus | 'all'>(initialStatus ?? 'all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { status, page }],
    queryFn: () =>
      ordersApi.list({
        page,
        limit: 20,
        statuses: status === 'all' ? undefined : [status],
      }),
  });

  const selectedOrder = data?.items.find((o) => o.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader title="주문" description="주문 상태 변경, 추가 주문 접수를 관리해요." />

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium transition-colors ${
              status === f.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="주문이 없어요." />
      ) : (
        <>
          <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {data.items.map((order) => (
              <li
                key={order.id}
                className="cursor-pointer border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50"
                onClick={() => setSelectedId(order.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900">
                    {order.salon.name || '이름 미입력'}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {order.items.map((i) => i.productName).join(', ')}
                </p>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-gray-400">{formatDateTime(order.createdAt)}</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <OrderDetailDrawer
        open={selectedId !== null}
        order={selectedOrder}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
