import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { productsApi } from '@/api/products';
import { FloatingDropdown } from '@/components/ui/FloatingDropdown';
import { Input } from '@/components/ui/formControls';

export function MultiProductPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (productIds: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useQuery({
    queryKey: ['products', 'picker'],
    queryFn: () => productsApi.list({ limit: 100 }),
  });
  const products = productsQuery.data?.items ?? [];
  const selected = products.filter((p) => value.includes(p.id));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
    return list.slice(0, 30);
  }, [products, query]);

  const toggle = (productId: string) => {
    if (value.includes(productId)) {
      onChange(value.filter((id) => id !== productId));
    } else {
      onChange([...value, productId]);
    }
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1 rounded-full bg-gray-100 py-1 pl-2.5 pr-1.5 text-xs text-gray-700"
            >
              {p.name}
              <button type="button" onClick={() => toggle(p.id)} className="text-gray-400 hover:text-gray-700">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div>
        <Input
          ref={inputRef}
          placeholder="상품 검색해서 추가"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <FloatingDropdown anchorRef={inputRef} open={open}>
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">검색 결과가 없어요.</p>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(product.id)}
              >
                <span className="text-gray-900">{product.name}</span>
                {value.includes(product.id) && (
                  <span className="text-xs font-medium text-gray-900">선택됨</span>
                )}
              </button>
            ))
          )}
        </FloatingDropdown>
      </div>
    </div>
  );
}
