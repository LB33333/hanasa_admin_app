import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { noticesApi } from '@/api/notices';
import { PageHeader } from '@/components/layout/PageHeader';
import { NoticeFormModal } from '@/components/notices/NoticeFormModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format';
import { NoticeListItem } from '@/types/notice';

export default function NoticesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['notices', page],
    queryFn: () => noticesApi.list({ page, limit: 20 }),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NoticeListItem | null>(null);

  const removeMutation = useMutation({
    mutationFn: (id: string) => noticesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast.show('공지를 삭제했어요.', 'success');
      setDeleteTarget(null);
    },
    onError: () => toast.show('삭제하지 못했어요.', 'error'),
  });

  return (
    <div>
      <PageHeader
        title="공지사항"
        description="등록하면 앱에 바로 노출되고 알림이 발송돼요."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={15} /> 새 공지
          </Button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="등록된 공지가 없어요." />
      ) : (
        <>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {data.items.map((notice) => (
              <li
                key={notice.id}
                className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50"
                onClick={() => setEditingId(notice.id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {notice.isPinned && <Pin size={12} className="text-gray-400" />}
                    <Badge tone="gray">{notice.topic}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-gray-900">{notice.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatDateTime(notice.createdAt)}</p>
                </div>
                <button
                  className="shrink-0 rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(notice);
                  }}
                  aria-label="삭제"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <NoticeFormModal open={creating} noticeId={null} onClose={() => setCreating(false)} />
      <NoticeFormModal
        open={editingId !== null}
        noticeId={editingId}
        onClose={() => setEditingId(null)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="공지 삭제"
        description={`"${deleteTarget?.title}" 공지를 삭제할까요?`}
        confirmLabel="삭제"
        danger
        loading={removeMutation.isPending}
        onConfirm={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
