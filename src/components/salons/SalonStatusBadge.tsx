import { Badge } from '@/components/ui/Badge';

export function SalonStatusBadge({ isApproved }: { isApproved: boolean }) {
  return isApproved ? <Badge tone="green">승인됨</Badge> : <Badge tone="amber">승인 대기</Badge>;
}
