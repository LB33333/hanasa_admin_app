export const COUPON_DISCOUNT_TARGETS = ['특정 상품', '전체 상품', '주문 총액'] as const;
export type CouponDiscountTarget = (typeof COUPON_DISCOUNT_TARGETS)[number];

export const COUPON_DISCOUNT_METHODS = ['정액 할인', '정률 할인'] as const;
export type CouponDiscountMethod = (typeof COUPON_DISCOUNT_METHODS)[number];

export const COUPON_USAGE_LIMITS = ['일회성', '영구적'] as const;
export type CouponUsageLimit = (typeof COUPON_USAGE_LIMITS)[number];

export type CouponProductSummary = {
  id: string;
  name: string;
};

export type Coupon = {
  id: string;
  name: string;
  discountTarget: CouponDiscountTarget;
  discountMethod: CouponDiscountMethod;
  discountValue: number;
  usageLimit: CouponUsageLimit;
  products?: CouponProductSummary[];
  isActive: boolean;
  createdAt: string;
};

export type SalonCoupon = {
  id: string;
  coupon: Coupon;
  usable: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

export type CreateCouponPayload = {
  name: string;
  discountTarget: CouponDiscountTarget;
  discountMethod: CouponDiscountMethod;
  discountValue: number;
  usageLimit: CouponUsageLimit;
  productIds?: string[];
};
