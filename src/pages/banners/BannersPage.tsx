import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { bannersApi } from '@/api/banners';
import { PageHeader } from '@/components/layout/PageHeader';
import { BannerFormModal } from '@/components/banners/BannerFormModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Banner } from '@/types/banner';

export default function BannersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['banners'], queryFn: bannersApi.list });

  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const removeMutation = useMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.show('배너를 삭제했어요.', 'success');
      setDeleteTarget(null);
    },
    onError: () => toast.show('삭제하지 못했어요.', 'error'),
  });

  return (
    <div>
      <PageHeader
        title="배너"
        description="앱 상단 캐러셀에 노출돼요."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={15} /> 새 배너
          </Button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <EmptyState title="등록된 배너가 없어요." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.map((banner) => (
            <div
              key={banner.id}
              className="flex gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-3"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-20 w-32 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-gray-900">{banner.title}</p>
                  <Badge tone={banner.isActive ? 'green' : 'gray'}>
                    {banner.isActive ? '노출 중' : '비활성'}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {banner.deepLink || '연결 없음'} · 순서 {banner.sortOrder} · 클릭 {banner.clickCount}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    className="text-xs font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => setEditing(banner)}
                  >
                    수정
                  </button>
                  <button
                    className="flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-red-500"
                    onClick={() => setDeleteTarget(banner)}
                  >
                    <Trash2 size={12} /> 삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BannerFormModal open={creating} banner={null} onClose={() => setCreating(false)} />
      <BannerFormModal open={editing !== null} banner={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="배너 삭제"
        description={`"${deleteTarget?.title}" 배너를 삭제할까요?`}
        confirmLabel="삭제"
        danger
        loading={removeMutation.isPending}
        onConfirm={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
