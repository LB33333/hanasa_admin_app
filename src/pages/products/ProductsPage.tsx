import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '@/api/products';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input, Select } from '@/components/ui/formControls';
import { Spinner } from '@/components/ui/Spinner';
import { PRODUCT_MANUFACTURERS } from '@/constants/manufacturers';
import { PRODUCT_MAIN_CATEGORIES } from '@/constants/productCategories';
import { formatCurrency } from '@/lib/format';

export default function ProductsPage() {
  const [manufacturer, setManufacturer] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', { manufacturer, mainCategory, includeDeleted }],
    queryFn: () =>
      productsApi.list({
        limit: 100,
        manufacturer: manufacturer || undefined,
        mainCategory: mainCategory || undefined,
        includeDeleted,
      }),
  });

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim();
    return q ? items.filter((p) => p.name.includes(q)) : items;
  }, [data, search]);

  return (
    <div>
      <PageHeader
        title="상품"
        description={`전체 ${data?.total ?? 0}개`}
        action={
          <Link to="/products/new">
            <Button size="sm">
              <Plus size={15} /> 새 상품
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <Input
            placeholder="상품명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
          className="sm:w-40"
        >
          <option value="">전체 제조사</option>
          {PRODUCT_MANUFACTURERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Select
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
          className="sm:w-36"
        >
          <option value="">전체 분류</option>
          {PRODUCT_MAIN_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <label className="flex shrink-0 items-center gap-1.5 text-sm text-gray-500">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
          />
          단종 포함
        </label>
      </div>

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="상품이 없어요." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}/edit`}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-50">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                {product.deletedAt && (
                  <span className="mb-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                    단종
                  </span>
                )}
                <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">{product.manufacturer}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(product.salonPrice)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
