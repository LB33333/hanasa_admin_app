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
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-400">
                  <th className="px-4 py-2.5">살롱</th>
                  <th className="px-4 py-2.5">상품</th>
                  <th className="px-4 py-2.5 text-right">금액</th>
                  <th className="px-4 py-2.5">상태</th>
                  <th className="hidden px-4 py-2.5 text-right sm:table-cell">주문일</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    onClick={() => setSelectedId(order.id)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {order.salon.name || '이름 미입력'}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-gray-500">
                      {order.items.map((i) => i.productName).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-right text-gray-400 sm:table-cell">
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedId(null)} />
    </div>
  );
}
