import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { couponsApi } from '@/api/coupons';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/formControls';

export function IssueCouponForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (couponId: string) => void;
}) {
  const [couponId, setCouponId] = useState('');
  const couponsQuery = useQuery({ queryKey: ['coupons'], queryFn: couponsApi.list });
  const activeCoupons = (couponsQuery.data ?? []).filter((c) => c.isActive);

  if (activeCoupons.length === 0) {
    return (
      <p className="mb-2 text-xs text-gray-400">
        발급 가능한 쿠폰이 없어요. 쿠폰 페이지에서 먼저 만들어 주세요.
      </p>
    );
  }

  return (
    <div className="mb-2 flex gap-2">
      <Select value={couponId} onChange={(e) => setCouponId(e.target.value)} className="flex-1">
        <option value="">발급할 쿠폰 선택</option>
        {activeCoupons.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        disabled={!couponId}
        loading={loading}
        onClick={() => {
          onSubmit(couponId);
          setCouponId('');
        }}
      >
        발급
      </Button>
    </div>
  );
}
