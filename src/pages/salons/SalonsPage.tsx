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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-400">
                <th className="px-4 py-2.5">이름</th>
                <th className="hidden px-4 py-2.5 sm:table-cell">전화번호</th>
                <th className="px-4 py-2.5">상태</th>
                <th className="px-4 py-2.5 text-right">미수금</th>
                <th className="hidden px-4 py-2.5 text-right sm:table-cell">가입일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((salon) => (
                <tr
                  key={salon.id}
                  className="cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  onClick={() => setSelectedId(salon.id)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {salon.name || <span className="text-gray-300">이름 미입력</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {maskPhoneNumber(salon.phoneNumber)}
                  </td>
                  <td className="px-4 py-3">
                    <SalonStatusBadge isApproved={salon.isApproved} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(salon.outstandingAmount)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-gray-400 sm:table-cell">
                    {formatDate(salon.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SalonDetailDrawer salonId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
