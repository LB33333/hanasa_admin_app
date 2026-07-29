import { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/formControls';
import { maskPhoneNumber } from '@/lib/format';
import { Salon } from '@/types/salon';

export function SalonPicker({
  salons,
  value,
  onChange,
}: {
  salons: Salon[];
  value: string;
  onChange: (salonId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const approvedSalons = useMemo(() => salons.filter((s) => s.isApproved), [salons]);
  const selected = approvedSalons.find((s) => s.id === value) ?? null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? approvedSalons.filter(
          (s) => s.name?.toLowerCase().includes(q) || s.phoneNumber.includes(q),
        )
      : approvedSalons;
    return list.slice(0, 30);
  }, [approvedSalons, query]);

  return (
    <div className="relative" ref={containerRef}>
      <Input
        placeholder="살롱 이름 또는 전화번호 검색"
        value={open ? query : (selected?.name ?? (selected ? maskPhoneNumber(selected.phoneNumber) : ''))}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">승인된 살롱이 없어요.</p>
          ) : (
            results.map((salon) => (
              <button
                key={salon.id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(salon.id);
                  setOpen(false);
                }}
              >
                <span className="text-gray-900">{salon.name || '이름 미입력'}</span>
                <span className="text-xs text-gray-400">{maskPhoneNumber(salon.phoneNumber)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
