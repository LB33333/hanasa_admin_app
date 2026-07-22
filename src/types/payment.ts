export const PAYMENT_METHODS = ['현금', '송금', '카드'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  memo: string | null;
  createdAt: string;
  outstandingBefore: number;
  outstandingAfter: number;
};

export type CreatePaymentPayload = {
  salonId: string;
  amount: number;
  method: PaymentMethod;
  paidAt?: string;
  memo?: string;
};

export type UpdatePaymentPayload = {
  amount?: number;
  method?: PaymentMethod;
  paidAt?: string;
  memo?: string;
};
