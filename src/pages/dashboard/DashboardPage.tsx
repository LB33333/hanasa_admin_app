import { useQuery } from '@tanstack/react-query';
import { Bell, ChevronRight, ShoppingBag, Store, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { salonsApi } from '@/api/salons';
import { ordersApi } from '@/api/orders';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/format';

export default function DashboardPage() {
  const salonsQuery = useQuery({ queryKey: ['salons'], queryFn: salonsApi.list });
  const pendingOrdersQuery = useQuery({
    queryKey: ['orders', 'dashboard-pending'],
    queryFn: () => ordersApi.list({ statuses: ['주문접수'], limit: 100 }),
  });

  if (salonsQuery.isLoading || pendingOrdersQuery.isLoading) {
    return <Spinner />;
  }

  const salons = salonsQuery.data ?? [];
  const pendingApprovalCount = salons.filter((s) => !s.isApproved).length;
  const totalOutstanding = salons.reduce((sum, s) => sum + s.outstandingAmount, 0);
  const pendingOrderCount = pendingOrdersQuery.data?.total ?? 0;

  const cards = [
    {
      to: '/salons?filter=pending',
      icon: Store,
      label: '승인 대기 살롱',
      value: `${pendingApprovalCount}곳`,
      tone: pendingApprovalCount > 0 ? 'text-amber-600' : 'text-gray-900',
    },
    {
      to: '/orders?status=주문접수',
      icon: ShoppingBag,
      label: '접수 대기 주문',
      value: `${pendingOrderCount}건`,
      tone: pendingOrderCount > 0 ? 'text-amber-600' : 'text-gray-900',
    },
    {
      to: '/salons',
      icon: Wallet,
      label: '전체 미수금',
      value: formatCurrency(totalOutstanding),
      tone: 'text-gray-900',
    },
  ] as const;

  return (
    <div>
      <PageHeader title="대시보드" description="오늘 확인할 것들을 한눈에 볼 수 있어요." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <card.icon size={14} />
                {card.label}
              </div>
              <p className={`text-xl font-bold ${card.tone}`}>{card.value}</p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">빠른 작업</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/push"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm"
          >
            <div className="rounded-lg bg-gray-900 p-2 text-white">
              <Bell size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">푸시 알림 보내기</p>
              <p className="text-xs text-gray-400">전체 또는 특정 살롱에게</p>
            </div>
          </Link>
          <Link
            to="/products/new"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm"
          >
            <div className="rounded-lg bg-gray-900 p-2 text-white">
              <ShoppingBag size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">새 상품 등록</p>
              <p className="text-xs text-gray-400">이미지·옵션 포함</p>
            </div>
          </Link>
          <Link
            to="/notices"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm"
          >
            <div className="rounded-lg bg-gray-900 p-2 text-white">
              <Store size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">공지 작성</p>
              <p className="text-xs text-gray-400">앱에 바로 노출돼요</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
