import { useMemo, useRef, useState } from 'react';
import { AdminProduct } from '@/types/product';
import { Input, Select } from '@/components/ui/formControls';
import { PRODUCT_MANUFACTURERS } from '@/constants/manufacturers';

export function ProductPicker({
  products,
  value,
  onChange,
}: {
  products: AdminProduct[];
  value: string;
  onChange: (productId: string) => void;
}) {
  const [manufacturer, setManufacturer] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p.id === value) ?? null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byManufacturer = manufacturer
      ? products.filter((p) => p.manufacturer === manufacturer)
      : products;
    const list = q ? byManufacturer.filter((p) => p.name.toLowerCase().includes(q)) : byManufacturer;
    return list.slice(0, 30);
  }, [products, manufacturer, query]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-2">
        <Select
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-28 shrink-0"
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
  );
}
