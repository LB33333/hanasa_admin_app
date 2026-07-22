import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Field, Input } from '@/components/ui/formControls';
import { CreateProductOptionPayload } from '@/types/product';

type DraftOption = { key: number; name: string; valuesText: string };

let keySeq = 0;
const emptyDraft = (): DraftOption => ({ key: ++keySeq, name: '', valuesText: '' });

export function draftOptionsToPayload(drafts: DraftOption[]): CreateProductOptionPayload[] {
  return drafts
    .map((d) => ({
      name: d.name.trim(),
      values: d.valuesText
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    }))
    .filter((d) => d.name && d.values.length > 0);
}

export function ProductOptionsBuilder({
  drafts,
  onChange,
}: {
  drafts: DraftOption[];
  onChange: (drafts: DraftOption[]) => void;
}) {
  const [showForm, setShowForm] = useState(drafts.length > 0);

  if (!showForm) {
    return (
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
        onClick={() => {
          setShowForm(true);
          onChange([emptyDraft()]);
        }}
      >
        <Plus size={14} /> 옵션 추가 (색상 등)
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {drafts.map((draft) => (
        <div key={draft.key} className="flex items-start gap-2 rounded-lg border border-gray-200 p-2.5">
          <div className="flex-1 space-y-2">
            <Field label="옵션명" hint="예: 색상">
              <Input
                value={draft.name}
                onChange={(e) =>
                  onChange(drafts.map((d) => (d.key === draft.key ? { ...d, name: e.target.value } : d)))
                }
              />
            </Field>
            <Field label="옵션값" hint="쉼표로 구분. 예: GN60, RV50, BK10">
              <Input
                value={draft.valuesText}
                onChange={(e) =>
                  onChange(
                    drafts.map((d) => (d.key === draft.key ? { ...d, valuesText: e.target.value } : d)),
                  )
                }
              />
            </Field>
          </div>
          <button
            type="button"
            className="mt-1 rounded p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
            onClick={() => {
              const next = drafts.filter((d) => d.key !== draft.key);
              onChange(next);
              if (next.length === 0) {
                setShowForm(false);
              }
            }}
            aria-label="삭제"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
        onClick={() => onChange([...drafts, emptyDraft()])}
      >
        <Plus size={14} /> 옵션 더 추가
      </button>
    </div>
  );
}

export { emptyDraft };
export type { DraftOption };
