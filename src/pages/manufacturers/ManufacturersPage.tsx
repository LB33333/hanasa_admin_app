import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { manufacturersApi } from '@/api/manufacturers';
import { PageHeader } from '@/components/layout/PageHeader';
import { ManufacturerFormModal } from '@/components/manufacturers/ManufacturerFormModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Manufacturer } from '@/types/manufacturer';

export default function ManufacturersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: manufacturersApi.list,
  });

  const [editing, setEditing] = useState<Manufacturer | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Manufacturer | null>(null);

  const removeMutation = useMutation({
    mutationFn: (id: string) => manufacturersApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.show('제조사를 삭제했어요.', 'success');
      setDeleteTarget(null);
    },
    onError: () =>
      toast.show('삭제하지 못했어요. 상품이 있는 제조사는 비활성화만 할 수 있어요.', 'error'),
  });

  return (
    <div>
      <PageHeader
        title="제조사"
        description="상품 등록과 앱 필터에 쓰이는 제조사 목록이에요."
        action={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={15} /> 새 제조사
          </Button>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <EmptyState title="등록된 제조사가 없어요." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {data.map((manufacturer, index) => (
            <div
              key={manufacturer.id}
              className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-gray-900">{manufacturer.name}</p>
                  <Badge tone={manufacturer.isActive ? 'green' : 'gray'}>
                    {manufacturer.isActive ? '활성' : '비활성'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  순서 {manufacturer.sortOrder} · 상품 {manufacturer.productCount}개
                </p>
              </div>
              <button
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
                onClick={() => setEditing(manufacturer)}
              >
                수정
              </button>
              {manufacturer.productCount === 0 && (
                <button
                  className="flex items-center gap-0.5 text-xs font-medium text-gray-400 hover:text-red-500"
                  onClick={() => setDeleteTarget(manufacturer)}
                >
                  <Trash2 size={12} /> 삭제
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ManufacturerFormModal open={creating} manufacturer={null} onClose={() => setCreating(false)} />
      <ManufacturerFormModal
        open={editing !== null}
        manufacturer={editing}
        onClose={() => setEditing(null)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title="제조사 삭제"
        description={`"${deleteTarget?.name}" 제조사를 삭제할까요?`}
        confirmLabel="삭제"
        danger
        loading={removeMutation.isPending}
        onConfirm={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
