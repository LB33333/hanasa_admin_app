export type Manufacturer = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateManufacturerPayload = {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateManufacturerPayload = Partial<CreateManufacturerPayload>;
