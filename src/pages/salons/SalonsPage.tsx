import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { salonsApi } from '@/api/salons';
import { SalonDetailDrawer } from '@/components/salons/SalonDetailDrawer';
import { SalonStatusBadge } from '@/components/salons/SalonStatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/formControls';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency, formatDate, maskPhoneNumber } from '@/lib/format';

type Filter = 'all' | 'pending' | 'approved';

export default function SalonsPage() {
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>(
    searchParams.get('filter') === 'pending' ? 'pending' : 'all',
  );
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['salons'], queryFn: salonsApi.list });

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (filter === 'pending') {
      list = list.filter((s) => !s.isApproved);
    } else if (filter === 'approved') {
      list = list.filter((s) => s.isApproved);
    }
    const query = search.trim();
    if (query) {
      list = list.filter(
        (s) => s.name?.includes(query) || s.phoneNumber.replace('+82', '0').includes(query),
      );
    }
    return list;
  }, [data, filter, search]);

  return (
    <div>
      <PageHeader title="살롱" description="가입 승인, 미수금, 결제 기록을 관리해요." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
              } border border-gray-200`}
            >
              {f === 'all' ? '전체' : f === 'pending' ? '승인 대기' : '승인됨'}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <Input
            placeholder="이름 또는 전화번호 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="조건에 맞는 살롱이 없어요." />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {filtered.map((salon) => (
            <li
              key={salon.id}
              className="cursor-pointer border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50"
              onClick={() => setSelectedId(salon.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-900">
                  {salon.name || <span className="text-gray-300">이름 미입력</span>}
                </span>
                <SalonStatusBadge isApproved={salon.isApproved} />
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-500">{maskPhoneNumber(salon.phoneNumber)}</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(salon.outstandingAmount)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-400">가입일 {formatDate(salon.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}

      <SalonDetailDrawer salonId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
