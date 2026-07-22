import { ImageUploader } from '@/components/ui/ImageUploader';
import { Field, Input, Select, Textarea } from '@/components/ui/formControls';
import { PRODUCT_MANUFACTURERS } from '@/constants/manufacturers';
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
            {PRODUCT_MANUFACTURERS.map((m) => (
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

      <Field label="특징" required>
        <Textarea
          rows={3}
          value={value.features}
          onChange={(e) => onChange({ features: e.target.value })}
        />
      </Field>

      <Field label="사용법" required>
        <Textarea
          rows={3}
          value={value.usageGuideline}
          onChange={(e) => onChange({ usageGuideline: e.target.value })}
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
