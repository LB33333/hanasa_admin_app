export type ProductBasicFormState = {
  name: string;
  manufacturer: string;
  mainCategory: string;
  subCategory: string;
  imageUrl: string;
  capacity: string;
  features: string;
  usageGuideline: string;
  costPrice: string;
  salonPrice: string;
  offlinePrice: string;
  retailPrice: string;
};

export const EMPTY_PRODUCT_FORM: ProductBasicFormState = {
  name: '',
  manufacturer: '',
  mainCategory: '',
  subCategory: '',
  imageUrl: '',
  capacity: '',
  features: '',
  usageGuideline: '',
  costPrice: '',
  salonPrice: '',
  offlinePrice: '',
  retailPrice: '',
};

export function isProductFormValid(form: ProductBasicFormState): boolean {
  return Boolean(
    form.name.trim() &&
      form.manufacturer &&
      form.mainCategory &&
      form.subCategory &&
      form.imageUrl &&
      form.capacity.trim() &&
      form.features.trim() &&
      form.usageGuideline.trim() &&
      form.costPrice !== '' &&
      form.salonPrice !== '' &&
      form.offlinePrice !== '' &&
      form.retailPrice !== '',
  );
}
