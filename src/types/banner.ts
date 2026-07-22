export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  deepLink: string | null;
  sortOrder: number;
  isActive: boolean;
  clickCount: number;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBannerPayload = {
  title: string;
  imageUrl: string;
  deepLink?: string;
  sortOrder?: number;
  isActive?: boolean;
  startAt?: string;
  endAt?: string;
};

export type UpdateBannerPayload = Partial<CreateBannerPayload>;
