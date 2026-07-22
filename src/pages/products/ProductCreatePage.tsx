import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '@/api/products';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductBasicFields } from '@/components/products/ProductBasicFields';
import {
  DraftOption,
  ProductOptionsBuilder,
  draftOptionsToPayload,
} from '@/components/products/ProductOptionsBuilder';
import { EMPTY_PRODUCT_FORM, isProductFormValid } from '@/components/products/productForm';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { CreateProductPayload } from '@/types/product';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [optionDrafts, setOptionDrafts] = useState<DraftOption[]>([]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: (product) => {
      toast.show('상품을 등록했어요.', 'success');
      navigate(`/products/${product.id}/edit`);
    },
    onError: () => toast.show('상품 등록에 실패했어요.', 'error'),
  });

  const handleSubmit = () => {
    const options = draftOptionsToPayload(optionDrafts);
    createMutation.mutate({
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
      ...(options.length > 0 ? { options } : {}),
    });
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="새 상품 등록" />
      <ProductBasicFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} />

      <div className="mt-4">
        <ProductOptionsBuilder drafts={optionDrafts} onChange={setOptionDrafts} />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          onClick={handleSubmit}
          loading={createMutation.isPending}
          disabled={!isProductFormValid(form)}
        >
          등록
        </Button>
      </div>
    </div>
  );
}
