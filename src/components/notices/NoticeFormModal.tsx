import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { noticesApi } from '@/api/notices';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/formControls';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { NOTICE_TOPICS, NoticeTopic } from '@/types/notice';

type FormState = {
  topic: NoticeTopic;
  title: string;
  content: string;
  isPinned: boolean;
};

const EMPTY: FormState = { topic: '안내사항', title: '', content: '', isPinned: false };

export function NoticeFormModal({
  open,
  noticeId,
  onClose,
}: {
  open: boolean;
  noticeId: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);

  const detailQuery = useQuery({
    queryKey: ['notice', noticeId],
    queryFn: () => noticesApi.get(noticeId as string),
    enabled: open && !!noticeId,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!open) return;
    if (noticeId && detailQuery.data) {
      setForm({
        topic: detailQuery.data.topic,
        title: detailQuery.data.title,
        content: detailQuery.data.content,
        isPinned: detailQuery.data.isPinned,
      });
    } else if (!noticeId) {
      setForm(EMPTY);
    }
  }, [open, noticeId, detailQuery.data]);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['notices'] });

  const createMutation = useMutation({
    mutationFn: noticesApi.create,
    onSuccess: () => {
      invalidate();
      toast.show('공지를 등록했어요. 알림도 발송됐어요.', 'success');
      onClose();
    },
    onError: () => toast.show('등록하지 못했어요.', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) =>
      noticesApi.update(id, {
        topic: form.topic,
        title: form.title.trim(),
        content: form.content.trim(),
        isPinned: form.isPinned,
      }),
    onSuccess: () => {
      invalidate();
      toast.show('공지를 저장했어요.', 'success');
      onClose();
    },
    onError: () => toast.show('저장하지 못했어요.', 'error'),
  });

  const loading = createMutation.isPending || updateMutation.isPending;
  const valid = form.title.trim() && form.content.trim();
  const isLoadingDetail = !!noticeId && detailQuery.isLoading;

  return (
    <Modal open={open} onClose={onClose} title={noticeId ? '공지 수정' : '새 공지'}>
      {isLoadingDetail ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <Field label="주제" required>
            <Select
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value as NoticeTopic }))}
            >
              {NOTICE_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="제목" required>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="내용" required>
            <Textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
            />
            상단 고정
          </label>
          {!noticeId && (
            <p className="text-xs text-gray-400">
              등록하면 공지 알림을 켠 모든 살롱에게 즉시 푸시 알림이 발송돼요.
            </p>
          )}
          <Button
            className="w-full"
            loading={loading}
            disabled={!valid}
            onClick={() => (noticeId ? updateMutation.mutate(noticeId) : createMutation.mutate(form))}
          >
            {noticeId ? '저장' : '등록하고 알림 보내기'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
