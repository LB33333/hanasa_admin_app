import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { salonsApi } from '@/api/salons';
import { paymentsApi } from '@/api/payments';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Drawer } from '@/components/ui/Drawer';
import { Input, Select, Textarea } from '@/components/ui/formControls';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDateTime, maskPhoneNumber, toDateInputValue } from '@/lib/format';
import { PAYMENT_METHODS, Payment, PaymentMethod } from '@/types/payment';
import { SalonStatusBadge } from './SalonStatusBadge';

export function SalonDetailDrawer({
  salonId,
  onClose,
}: {
  salonId: string | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={salonId !== null} onClose={onClose} title="살롱 상세">
      {salonId && <SalonDetailContent salonId={salonId} />}
    </Drawer>
  );
}

function SalonDetailContent({ salonId }: { salonId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const salonQuery = useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => salonsApi.get(salonId),
  });
  const paymentsQuery = useQuery({
    queryKey: ['payments', salonId],
    queryFn: () => paymentsApi.listForSalon(salonId, { limit: 10 }),
  });

  const [initialDebtInput, setInitialDebtInput] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['salon', salonId] });
    void queryClient.invalidateQueries({ queryKey: ['salons'] });
    void queryClient.invalidateQueries({ queryKey: ['payments', salonId] });
  };

  const approveMutation = useMutation({
    mutationFn: (isApproved: boolean) => salonsApi.update(salonId, { isApproved }),
    onSuccess: (_data, isApproved) => {
      invalidateAll();
      toast.show(isApproved ? '승인했어요.' : '승인을 취소했어요.', 'success');
    },
    onError: () => toast.show('처리하지 못했어요. 다시 시도해 주세요.', 'error'),
  });

  const initialDebtMutation = useMutation({
    mutationFn: (amount: number) => salonsApi.update(salonId, { initialOutstandingAmount: amount }),
    onSuccess: () => {
      invalidateAll();
      setInitialDebtInput(null);
      toast.show('기초 미수금을 저장했어요.', 'success');
    },
    onError: () => toast.show('저장하지 못했어요.', 'error'),
  });

  const createPaymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      invalidateAll();
      toast.show('결제를 기록했어요.', 'success');
    },
    onError: () => toast.show('결제 기록에 실패했어요.', 'error'),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => {
      invalidateAll();
      setDeletePaymentId(null);
      toast.show('결제 기록을 삭제했어요.', 'success');
    },
    onError: () => toast.show('삭제하지 못했어요.', 'error'),
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof paymentsApi.update>[1] }) =>
      paymentsApi.update(id, payload),
    onSuccess: () => {
      invalidateAll();
      setEditPaymentId(null);
      toast.show('결제 기록을 수정했어요.', 'success');
    },
    onError: () => toast.show('수정하지 못했어요.', 'error'),
  });

  if (salonQuery.isLoading || !salonQuery.data) {
    return <Spinner />;
  }
  const salon = salonQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">{salon.name || '이름 미입력'}</h3>
          <SalonStatusBadge isApproved={salon.isApproved} />
        </div>
        <p className="mt-0.5 text-sm text-gray-400">{maskPhoneNumber(salon.phoneNumber)}</p>
        {salon.address && <p className="mt-1 text-sm text-gray-500">{salon.address}</p>}
        {salon.restDay && <p className="text-sm text-gray-500">쉬는 날: {salon.restDay}</p>}
        <p className="mt-2 text-xs text-gray-400">가입일 {formatDateTime(salon.createdAt)}</p>
      </div>

      <div>
        <Button
          variant={salon.isApproved ? 'secondary' : 'primary'}
          className="w-full"
          loading={approveMutation.isPending}
          onClick={() => approveMutation.mutate(!salon.isApproved)}
        >
          {salon.isApproved ? '승인 취소하기' : '가입 승인하기'}
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">미수금</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(salon.outstandingAmount)}
          </span>
        </div>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>기초 미수금 (앱 도입 전)</span>
            {initialDebtInput === null ? (
              <button
                className="text-xs font-medium text-gray-900 underline"
                onClick={() => setInitialDebtInput(String(salon.initialOutstandingAmount))}
              >
                {formatCurrency(salon.initialOutstandingAmount)} · 수정
              </button>
            ) : null}
          </div>
          {initialDebtInput !== null && (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                const value = Number(initialDebtInput);
                if (!Number.isFinite(value) || value < 0) {
                  toast.show('올바른 금액을 입력해 주세요.', 'error');
                  return;
                }
                initialDebtMutation.mutate(value);
              }}
            >
              <Input
                type="number"
                min={0}
                value={initialDebtInput}
                onChange={(e) => setInitialDebtInput(e.target.value)}
                autoFocus
              />
              <Button type="submit" size="sm" loading={initialDebtMutation.isPending}>
                저장
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setInitialDebtInput(null)}
              >
                취소
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">적립금</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(salon.pointsBalance)}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">배송완료 시 주문 금액의 1%가 자동 적립돼요.</p>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">결제 기록 추가</h4>
        <RecordPaymentForm
          salonId={salonId}
          loading={createPaymentMutation.isPending}
          onSubmit={(payload) => createPaymentMutation.mutate(payload)}
        />
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-gray-700">최근 결제 내역</h4>
        {paymentsQuery.isLoading ? (
          <Spinner className="py-6" />
        ) : paymentsQuery.data?.items.length ? (
          <ul className="space-y-2">
            {paymentsQuery.data.items.map((payment) =>
              editPaymentId === payment.id ? (
                <li key={payment.id} className="rounded-lg border border-gray-200 p-3">
                  <EditPaymentForm
                    payment={payment}
                    loading={updatePaymentMutation.isPending}
                    onSubmit={(payload) => updatePaymentMutation.mutate({ id: payment.id, payload })}
                    onCancel={() => setEditPaymentId(null)}
                  />
                </li>
              ) : (
                <li
                  key={payment.id}
                  className="flex items-start justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        -{formatCurrency(payment.amount)}
                      </span>
                      <Badge tone="gray">{payment.method}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(payment.paidAt)}</p>
                    {payment.memo && <p className="mt-1 text-xs text-gray-500">{payment.memo}</p>}
                    <p className="mt-1 text-xs text-gray-400">
                      {formatCurrency(payment.outstandingBefore)} → {formatCurrency(payment.outstandingAfter)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="rounded border border-gray-200 p-1.5 text-gray-500 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => setEditPaymentId(payment.id)}
                      aria-label="수정"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="rounded border border-gray-200 p-1.5 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                      onClick={() => setDeletePaymentId(payment.id)}
                      aria-label="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">결제 기록이 없어요.</p>
        )}
      </div>

      <ConfirmDialog
        open={deletePaymentId !== null}
        title="결제 기록 삭제"
        description="이 결제 기록을 삭제할까요? 미수금이 다시 올라갈 수 있어요."
        confirmLabel="삭제"
        danger
        loading={deletePaymentMutation.isPending}
        onConfirm={() => deletePaymentId && deletePaymentMutation.mutate(deletePaymentId)}
        onCancel={() => setDeletePaymentId(null)}
      />
    </div>
  );
}

function RecordPaymentForm({
  salonId,
  loading,
  onSubmit,
}: {
  salonId: string;
  loading: boolean;
  onSubmit: (payload: {
    salonId: string;
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    memo?: string;
  }) => void;
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('현금');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }
    onSubmit({ salonId, amount: value, method, memo: memo.trim() || undefined });
    setAmount('');
    setMemo('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-gray-200 p-3">
      <Input
        type="number"
        min={1}
        placeholder="결제 금액"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full"
      />
      <Select
        value={method}
        onChange={(e) => setMethod(e.target.value as PaymentMethod)}
        className="w-full"
      >
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
      <Textarea
        placeholder="메모 (선택)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
      />
      <Button type="submit" size="sm" className="w-full" loading={loading} disabled={!amount}>
        결제 기록 추가
      </Button>
    </form>
  );
}

function EditPaymentForm({
  payment,
  loading,
  onSubmit,
  onCancel,
}: {
  payment: Payment;
  loading: boolean;
  onSubmit: (payload: {
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    memo?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(payment.amount));
  const [method, setMethod] = useState<PaymentMethod>(payment.method);
  const [paidAt, setPaidAt] = useState(toDateInputValue(payment.paidAt));
  const [memo, setMemo] = useState(payment.memo ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }
    onSubmit({
      amount: value,
      method,
      paidAt: paidAt ? new Date(paidAt).toISOString() : undefined,
      memo: memo.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        type="number"
        min={1}
        placeholder="결제 금액"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full"
        autoFocus
      />
      <Select
        value={method}
        onChange={(e) => setMethod(e.target.value as PaymentMethod)}
        className="w-full"
      >
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
      <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className="w-full" />
      <Textarea
        placeholder="메모 (선택)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" loading={loading} disabled={!amount}>
          저장
        </Button>
        <Button type="button" variant="secondary" size="sm" className="flex-1" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  );
}
