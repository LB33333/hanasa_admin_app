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
  totalAmount: number;
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
