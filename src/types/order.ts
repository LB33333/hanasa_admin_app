export const ORDER_STATUSES = ['주문접수', '배송예정', '배송완료', '취소'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItemSummary = {
  id: string;
  product: { id: string };
  productName: string;
  optionName: string | null;
  optionValue: string | null;
  unitPrice: number;
  quantity: number;
};

export type AdminOrder = {
  id: string;
  status: OrderStatus;
  // 쿠폰 할인과 적립금 사용을 모두 반영한 최종 금액
  totalAmount: number;
  // 원장님이 이 주문에 사용한 적립금(원). 취소하면 자동으로 돌려준다.
  pointsUsed: number;
  arrivalDate: string | null;
  createdAt: string;
  salon: {
    id: string;
    name: string | null;
    phoneNumber: string;
  };
  items: OrderItemSummary[];
};

export type AdminUpdateOrderPayload = {
  status?: OrderStatus;
  arrivalDate?: string;
};

export type AddOrderItemPayload = {
  productId: string;
  productOptionValueId?: string;
  quantity: number;
  unitPrice?: number;
};

export type PurchasedProduct = {
  id: string;
  name: string;
  manufacturer: string;
  imageUrl: string;
};
