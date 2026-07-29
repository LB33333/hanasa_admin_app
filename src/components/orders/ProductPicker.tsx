import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { ordersApi } from '@/api/orders';
import { AdminProduct } from '@/types/product';
import { Input, Select } from '@/components/ui/formControls';
import { PRODUCT_MANUFACTURERS } from '@/constants/manufacturers';

export function ProductPicker({
  products,
  value,
  salonId,
  onChange,
}: {
  products: AdminProduct[];
  value: string;
  salonId?: string;
  onChange: (productId: string) => void;
}) {
  const [manufacturer, setManufacturer] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p.id === value) ?? null;

  const purchasedQuery = useQuery({
    queryKey: ['orders', 'purchased-products', salonId],
    queryFn: () => ordersApi.purchasedProducts(salonId as string, 20),
    enabled: !!salonId,
  });
  const purchasedProducts = (purchasedQuery.data?.items ?? [])
    .map((p) => products.find((full) => full.id === p.id))
    .filter((p): p is AdminProduct => !!p);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byManufacturer = manufacturer
      ? products.filter((p) => p.manufacturer === manufacturer)
      : products;
    const list = q ? byManufacturer.filter((p) => p.name.toLowerCase().includes(q)) : byManufacturer;
    return list.slice(0, 30);
  }, [products, manufacturer, query]);

  return (
    <div className="space-y-2">
      {salonId && purchasedProducts.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-gray-400">이 살롱이 구매했던 상품</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {purchasedProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onChange(product.id)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-lg border p-1.5 ${
                  value === product.id
                    ? 'border-gray-900'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                style={{ width: 64 }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="line-clamp-2 text-center text-[10px] leading-tight text-gray-600">
                  {product.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="relative" ref={containerRef}>
        <div className="space-y-2">
          <Select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            onFocus={() => setOpen(true)}
            className="w-full"
          >
            <option value="">전체 회사</option>
            {PRODUCT_MANUFACTURERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Input
            placeholder="상품 검색"
            value={open ? query : (selected?.name ?? '')}
            onFocus={() => {
              setOpen(true);
              setQuery('');
            }}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
        </div>
        {open && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {results.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">검색 결과가 없어요.</p>
            ) : (
              results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(product.id);
                    setOpen(false);
                  }}
                >
                  <span className="text-gray-900">{product.name}</span>
                  <span className="text-xs text-gray-400">{product.salonPrice.toLocaleString()}원</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
