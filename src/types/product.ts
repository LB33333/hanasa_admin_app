export type ProductOptionValue = {
  id: string;
  value: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: ProductOptionValue[];
};

export type AdminProduct = {
  id: string;
  name: string;
  manufacturer: string;
  mainCategory: string;
  subCategory: string;
  imageUrl: string;
  capacity: string;
  features: string;
  usageGuideline: string;
  costPrice: number;
  salonPrice: number;
  offlinePrice: number;
  retailPrice: number;
  options?: ProductOption[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CreateProductOptionPayload = {
  name: string;
  values: string[];
};

export type CreateProductPayload = {
  name: string;
  manufacturer: string;
  mainCategory: string;
  subCategory: string;
  imageUrl: string;
  capacity: string;
  features: string;
  usageGuideline: string;
  costPrice: number;
  salonPrice: number;
  offlinePrice: number;
  retailPrice: number;
  options?: CreateProductOptionPayload[];
};

export type UpdateProductPayload = Partial<Omit<CreateProductPayload, 'options'>>;
