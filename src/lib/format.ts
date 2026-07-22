export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '-';
  }
  const date = new Date(iso);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return '-';
  }
  const date = new Date(iso);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  return iso.slice(0, 10);
}

export function maskPhoneNumber(phoneNumber: string): string {
  // +8210xxxxyyyy -> 010-xxxx-yyyy 형태로 보기 좋게 변환
  const digits = phoneNumber.replace('+82', '0');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phoneNumber;
}
