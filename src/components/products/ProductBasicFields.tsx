import { useQuery } from '@tanstack/react-query';
import { manufacturersApi } from '@/api/manufacturers';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { Field, Input, Select, Textarea } from '@/components/ui/formControls';
import { PRODUCT_CATEGORY_MAP, PRODUCT_MAIN_CATEGORIES } from '@/constants/productCategories';
import { ProductBasicFormState } from './productForm';

export function ProductBasicFields({
  value,
  onChange,
}: {
  value: ProductBasicFormState;
  onChange: (patch: Partial<ProductBasicFormState>) => void;
}) {
  const subCategories = value.mainCategory ? PRODUCT_CATEGORY_MAP[value.mainCategory] : [];
  const { data: manufacturers } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: manufacturersApi.list,
  });
  // 수정 화면에서 이미 저장된 제조사가 목록에서 사라졌어도 선택값은 유지해 보여준다.
  const manufacturerNames = manufacturers?.map((m) => m.name) ?? [];
  const manufacturerOptions =
    value.manufacturer && !manufacturerNames.includes(value.manufacturer)
      ? [value.manufacturer, ...manufacturerNames]
      : manufacturerNames;

  return (
    <div className="space-y-4">
      <Field label="상품 이미지" required>
        <ImageUploader
          folder="products"
          value={value.imageUrl}
          onChange={(url) => onChange({ imageUrl: url })}
        />
      </Field>

      <Field label="상품명" required>
        <Input value={value.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="제조사" required>
          <Select
            value={value.manufacturer}
            onChange={(e) => onChange({ manufacturer: e.target.value })}
          >
            <option value="">선택</option>
            {manufacturerOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="용량" required hint="예: 500ml">
          <Input value={value.capacity} onChange={(e) => onChange({ capacity: e.target.value })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="대분류" required>
          <Select
            value={value.mainCategory}
            onChange={(e) => onChange({ mainCategory: e.target.value, subCategory: '' })}
          >
            <option value="">선택</option>
            {PRODUCT_MAIN_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="소분류" required>
          <Select
            value={value.subCategory}
            onChange={(e) => onChange({ subCategory: e.target.value })}
            disabled={!value.mainCategory}
          >
            <option value="">선택</option>
            {subCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="설명"
        required
        hint="마크다운 문법을 지원해요. 예: ## 제목, **굵게**, - 목록"
      >
        <Textarea
          rows={8}
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={'## 제품 특징\n\n- 특징을 적어주세요\n\n## 사용 방법\n\n1. 사용법을 적어주세요'}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="원가" required hint="제조사로부터 들이는 가격">
          <Input
            type="number"
            min={0}
            value={value.costPrice}
            onChange={(e) => onChange({ costPrice: e.target.value })}
          />
        </Field>
        <Field label="살롱가" required hint="미용실에 납품하는 가격">
          <Input
            type="number"
            min={0}
            value={value.salonPrice}
            onChange={(e) => onChange({ salonPrice: e.target.value })}
          />
        </Field>
        <Field label="매장가" required hint="오프라인 매장 방문가">
          <Input
            type="number"
            min={0}
            value={value.offlinePrice}
            onChange={(e) => onChange({ offlinePrice: e.target.value })}
          />
        </Field>
        <Field label="소매가" required hint="살롱의 소비자 판매 권장가">
          <Input
            type="number"
            min={0}
            value={value.retailPrice}
            onChange={(e) => onChange({ retailPrice: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}
