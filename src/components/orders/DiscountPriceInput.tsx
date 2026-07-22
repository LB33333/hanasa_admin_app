import { Input } from '@/components/ui/formControls';
import { formatCurrency } from '@/lib/format';

const PRESETS = [
  { label: '서비스', compute: () => 0 },
  { label: '10% 할인', compute: (base: number) => Math.round((base * 0.9) / 10) * 10 },
  { label: '20% 할인', compute: (base: number) => Math.round((base * 0.8) / 10) * 10 },
];

export function DiscountPriceInput({
  basePrice,
  value,
  onChange,
}: {
  basePrice: number | null;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-400">개당 단가</span>
      <Input
        type="number"
        min={0}
        placeholder={basePrice != null ? `정가 개당 ${formatCurrency(basePrice)}` : '개당 단가'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={basePrice == null}
            className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => basePrice != null && onChange(String(preset.compute(basePrice)))}
          >
            {preset.label}
          </button>
        ))}
        {value !== '' && basePrice != null && Number(value) !== basePrice && (
          <button
            type="button"
            className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-400 hover:border-gray-400 hover:bg-gray-100"
            onClick={() => onChange(String(basePrice))}
          >
            정가로
          </button>
        )}
      </div>
    </div>
  );
}
