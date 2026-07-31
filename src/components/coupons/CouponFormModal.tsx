import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { couponsApi } from '@/api/coupons';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/formControls';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  COUPON_DISCOUNT_METHODS,
  COUPON_DISCOUNT_TARGETS,
  COUPON_USAGE_LIMITS,
  CouponDiscountMethod,
  CouponDiscountTarget,
  CouponUsageLimit,
} from '@/types/coupon';
import { MultiProductPicker } from './MultiProductPicker';

export function CouponFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState('');
  const [discountTarget, setDiscountTarget] = useState<CouponDiscountTarget>('전체 상품');
  const [discountMethod, setDiscountMethod] = useState<CouponDiscountMethod>('정률 할인');
  const [discountValue, setDiscountValue] = useState('');
  const [usageLimit, setUsageLimit] = useState<CouponUsageLimit>('일회성');
  const [productIds, setProductIds] = useState<string[]>([]);

  const reset = () => {
    setName('');
    setDiscountTarget('전체 상품');
    setDiscountMethod('정률 할인');
    setDiscountValue('');
    setUsageLimit('일회성');
    setProductIds([]);
  };

  const createMutation = useMutation({
    mutationFn: couponsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.show('쿠폰을 만들었어요.', 'success');
      reset();
      onClose();
    },
    onError: () => toast.show('쿠폰 생성에 실패했어요.', 'error'),
  });

  const canSubmit =
    name.trim().length > 0 &&
    Number(discountValue) > 0 &&
    (discountMethod !== '정률 할인' || Number(discountValue) <= 100) &&
    (discountTarget !== '특정 상품' || productIds.length > 0);

  const handleSubmit = () => {
    createMutation.mutate({
      name: name.trim(),
      discountTarget,
      discountMethod,
      discountValue: Number(discountValue),
      usageLimit,
      productIds: discountTarget === '특정 상품' ? productIds : undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="새 쿠폰 만들기"
    >
      <div className="space-y-4">
        <Field label="쿠폰 이름">
          <Input
            placeholder="예: 여름맞이 10% 할인"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="할인 대상">
          <Select
            value={discountTarget}
            onChange={(e) => setDiscountTarget(e.target.value as CouponDiscountTarget)}
          >
            {COUPON_DISCOUNT_TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>

        {discountTarget === '특정 상품' && (
          <Field label="할인 적용 상품">
            <MultiProductPicker value={productIds} onChange={setProductIds} />
          </Field>
        )}

        <Field label="할인 방식">
          <Select
            value={discountMethod}
            onChange={(e) => setDiscountMethod(e.target.value as CouponDiscountMethod)}
          >
            {COUPON_DISCOUNT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="할인 값"
          hint={
            discountMethod === '정률 할인'
              ? '1~100 사이 퍼센트'
              : discountTarget === '주문 총액'
                ? '주문 총액에서 뺄 금액(원)'
                : '상품 개당 뺄 금액(원)'
          }
        >
          <Input
            type="number"
            min={1}
            max={discountMethod === '정률 할인' ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />
        </Field>

        <Field label="사용 횟수">
          <Select value={usageLimit} onChange={(e) => setUsageLimit(e.target.value as CouponUsageLimit)}>
            {COUPON_USAGE_LIMITS.map((u) => (
              <option key={u} value={u}>
                {u === '일회성' ? '일회성 (한 번 쓰면 소멸)' : '영구적 (계속 재사용 가능)'}
              </option>
            ))}
          </Select>
        </Field>

        <Button
          className="w-full"
          disabled={!canSubmit}
          loading={createMutation.isPending}
          onClick={handleSubmit}
        >
          쿠폰 만들기
        </Button>
      </div>
    </Modal>
  );
}
