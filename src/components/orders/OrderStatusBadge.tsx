import { Badge } from '@/components/ui/Badge';
import { OrderStatus } from '@/types/order';

const TONE: Record<OrderStatus, 'gray' | 'blue' | 'green' | 'red'> = {
  주문접수: 'gray',
  배송예정: 'blue',
  배송완료: 'green',
  취소: 'red',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONE[status]}>{status}</Badge>;
}
