import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { couponsApi } from '@/api/coupons';
import { CouponFormModal } from '@/components/coupons/CouponFormModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Coupon } from '@/types/coupon';

function describeValue(coupon: Coupon): string {
  const suffix = coupon.discountMethod === '정률 할인' ? '%' : '원';
  const scope =
    coupon.discountTarget === '주문 총액'
      ? '총액에서'
      : coupon.discountTarget === '특정 상품'
        ? '지정 상품 개당'
        : '상품 개당';
  return `${scope} ${coupon.discountValue}${suffix} 할인`;
}

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: couponsApi.list });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      couponsApi.setActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.show('변경했어요.', 'success');
    },
    onError: () => toast.show('변경에 실패했어요.', 'error'),
  });

  return (
    <div>
      <PageHeader
        title="쿠폰"
        description="쿠폰 종류를 만들고, 살롱 상세 화면에서 개별 발급할 수 있어요."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={15} /> 새 쿠폰
          </Button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <EmptyState title="만들어진 쿠폰이 없어요." />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {data.map((coupon) => (
            <li
              key={coupon.id}
              className="flex items-center justify-between gap-3 border-b border-gray-50 px-4 py-3 last:border-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{coupon.name}</span>
                  {!coupon.isActive && <Badge tone="gray">비활성</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {coupon.discountTarget} · {describeValue(coupon)} · {coupon.usageLimit}
                </p>
                {coupon.discountTarget === '특정 상품' && coupon.products && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    대상: {coupon.products.map((p) => p.name).join(', ')}
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                loading={toggleActiveMutation.isPending}
                onClick={() =>
                  toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })
                }
              >
                {coupon.isActive ? '비활성화' : '활성화'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <CouponFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
