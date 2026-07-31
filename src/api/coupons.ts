import { apiClient } from '@/lib/apiClient';
import { Coupon, CreateCouponPayload, SalonCoupon } from '@/types/coupon';

export const couponsApi = {
  list: () => apiClient.get<Coupon[]>('/admin/coupons'),

  create: (payload: CreateCouponPayload) =>
    apiClient.post<Coupon>('/admin/coupons', payload),

  setActive: (id: string, isActive: boolean) =>
    apiClient.patch<Coupon>(`/admin/coupons/${id}`, { isActive }),

  issue: (couponId: string, salonId: string) =>
    apiClient.post<SalonCoupon>('/admin/coupons/issue', { couponId, salonId }),

  findIssuedForSalon: (salonId: string) =>
    apiClient.get<SalonCoupon[]>('/admin/coupons/issued', { salonId }),
};
