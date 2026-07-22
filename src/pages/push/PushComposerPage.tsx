import { useMutation, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { salonsApi } from '@/api/salons';
import { pushApi } from '@/api/push';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/formControls';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { maskPhoneNumber } from '@/lib/format';
import { SendCustomPushResult } from '@/types/push';

type Target = 'all' | 'selected';

export default function PushComposerPage() {
  const toast = useToast();
  const { data: salons, isLoading } = useQuery({ queryKey: ['salons'], queryFn: salonsApi.list });

  const [target, setTarget] = useState<Target>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [saveToNotifications, setSaveToNotifications] = useState(true);
  const [result, setResult] = useState<SendCustomPushResult | null>(null);

  const approvedSalons = useMemo(() => (salons ?? []).filter((s) => s.isApproved), [salons]);
  const filteredSalons = useMemo(() => {
    const q = search.trim();
    if (!q) return approvedSalons;
    return approvedSalons.filter(
      (s) => s.name?.includes(q) || s.phoneNumber.replace('+82', '0').includes(q),
    );
  }, [approvedSalons, search]);

  const sendMutation = useMutation({
    mutationFn: pushApi.send,
    onSuccess: (res) => {
      setResult(res);
      toast.show(`${res.recipientSalonCount}개 살롱에 발송했어요.`, 'success');
      setTitle('');
      setBody('');
      setUrl('');
    },
    onError: (error) =>
      toast.show(error instanceof Error ? error.message : '발송에 실패했어요.', 'error'),
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const canSend =
    title.trim() &&
    body.trim() &&
    (target === 'all' || selectedIds.size > 0) &&
    !sendMutation.isPending;

  const handleSend = () => {
    setResult(null);
    sendMutation.mutate({
      salonIds: target === 'selected' ? Array.from(selectedIds) : undefined,
      title: title.trim(),
      body: body.trim(),
      url: url.trim() || undefined,
      saveToNotifications,
    });
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="푸시 발송" description="전체 또는 원하는 살롱에게 직접 알림을 보내요." />

      <div className="space-y-4">
        <Field label="발송 대상" required>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget('all')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                target === 'all'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-600'
              }`}
            >
              승인된 전체 살롱 ({approvedSalons.length}곳)
            </button>
            <button
              type="button"
              onClick={() => setTarget('selected')}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                target === 'selected'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-600'
              }`}
            >
              특정 살롱 선택 {selectedIds.size > 0 && `(${selectedIds.size})`}
            </button>
          </div>
        </Field>

        {target === 'selected' && (
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <Input
                placeholder="이름 또는 전화번호 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-7 text-xs"
              />
            </div>
            {isLoading ? (
              <Spinner className="py-6" />
            ) : (
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {filteredSalons.map((salon) => (
                  <label
                    key={salon.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(salon.id)}
                      onChange={() => toggleSelect(salon.id)}
                    />
                    <span className="flex-1 text-gray-900">{salon.name || '이름 미입력'}</span>
                    <span className="text-xs text-gray-400">{maskPhoneNumber(salon.phoneNumber)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <Field label="제목" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="하나사 안내" />
        </Field>
        <Field label="내용" required>
          <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
        <Field label="딥링크" hint="예: orders, notices/공지ID (선택)">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={saveToNotifications}
            onChange={(e) => setSaveToNotifications(e.target.checked)}
          />
          앱 알림함에도 기록하기
        </label>

        <Button className="w-full" loading={sendMutation.isPending} disabled={!canSend} onClick={handleSend}>
          발송하기
        </Button>

        {result && (
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p>대상 살롱 {result.recipientSalonCount}개</p>
            <p>푸시 전송된 기기 {result.tokenCount}개</p>
            <p>알림함 기록: {result.savedToNotifications ? '했어요' : '안 했어요'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
