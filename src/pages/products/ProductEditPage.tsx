import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '@/api/products';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductBasicFields } from '@/components/products/ProductBasicFields';
import { ProductOptionsManager } from '@/components/products/ProductOptionsManager';
import { EMPTY_PRODUCT_FORM, ProductBasicFormState, isProductFormValid } from '@/components/products/productForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { UpdateProductPayload } from '@/types/product';

export default function ProductEditPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
    enabled: !!id,
    // 편집 폼 프리필용 쿼리라 창 포커스 시 조용히 리페치되면 입력 중인 값이 덮어써질 수 있다.
    refetchOnWindowFocus: false,
  });

  const [form, setForm] = useState<ProductBasicFormState>(EMPTY_PRODUCT_FORM);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 최초 로드(또는 다른 상품으로 이동) 시에만 폼을 채운다.
  // 저장 후 백그라운드 리페치나 창 포커스 리페치로 입력 중인 값이 덮어써지지 않도록
  // product 객체 전체가 아닌 id에만 반응한다.
  useEffect(() => {
    const product = productQuery.data;
    if (!product) return;
    setForm({
      name: product.name,
      manufacturer: product.manufacturer,
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      imageUrl: product.imageUrl,
      capacity: product.capacity,
      features: product.features,
      usageGuideline: product.usageGuideline,
      costPrice: String(product.costPrice),
      salonPrice: String(product.salonPrice),
      offlinePrice: String(product.offlinePrice),
      retailPrice: String(product.retailPrice),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productQuery.data?.id]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProductPayload) => productsApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['product', id] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.show('저장했어요.', 'success');
    },
    onError: () => toast.show('저장하지 못했어요.', 'error'),
  });

  const removeMutation = useMutation({
    mutationFn: () => productsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.show('단종 처리했어요.', 'success');
      navigate('/products');
    },
    onError: () => toast.show('처리하지 못했어요.', 'error'),
  });

  if (productQuery.isLoading || !productQuery.data) {
    return <Spinner />;
  }
  const product = productQuery.data;

  return (
    <div className="max-w-xl">
      <PageHeader
        title="상품 수정"
        action={
          product.deletedAt ? (
            <Badge tone="gray">단종됨</Badge>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              단종 처리
            </Button>
          )
        }
      />
      <ProductBasicFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />

      <div className="mt-6 flex justify-end">
        <Button
          onClick={() =>
            updateMutation.mutate({
              name: form.name.trim(),
              manufacturer: form.manufacturer,
              mainCategory: form.mainCategory,
              subCategory: form.subCategory,
              imageUrl: form.imageUrl,
              capacity: form.capacity.trim(),
              features: form.features.trim(),
              usageGuideline: form.usageGuideline.trim(),
              costPrice: Number(form.costPrice),
              salonPrice: Number(form.salonPrice),
              offlinePrice: Number(form.offlinePrice),
              retailPrice: Number(form.retailPrice),
            })
          }
          loading={updateMutation.isPending}
          disabled={!isProductFormValid(form)}
        >
          저장
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-gray-700">옵션 관리</h2>
        <ProductOptionsManager productId={id} options={product.options ?? []} />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="상품 단종 처리"
        description="이 상품을 목록에서 숨길까요? 과거 주문 기록에는 영향이 없어요."
        confirmLabel="단종 처리"
        danger
        loading={removeMutation.isPending}
        onConfirm={() => removeMutation.mutate()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
