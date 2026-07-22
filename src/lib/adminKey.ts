const STORAGE_KEY = 'hanasa_admin_key';

let unauthorizedHandler: (() => void) | null = null;

export function getAdminKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setAdminKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearAdminKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// AuthProvider가 마운트 시 등록해서, apiClient가 401을 받으면 로그인 화면으로 되돌린다.
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  clearAdminKey();
  unauthorizedHandler?.();
}
