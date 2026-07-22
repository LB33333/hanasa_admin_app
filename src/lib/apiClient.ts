import { getAdminKey, notifyUnauthorized } from './adminKey';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(status: number, message: string, errorCode?: string) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
  }
}

type SuccessEnvelope<T> = {
  success: true;
  data: T;
};

type ErrorEnvelope = {
  success: false;
  message:
    | string
    | { message?: string | string[]; error?: string; errorCode?: string };
};

function extractMessage(body: ErrorEnvelope | null): {
  message: string;
  errorCode?: string;
} {
  if (!body) {
    return { message: '알 수 없는 오류가 발생했어요.' };
  }
  const m = body.message;
  if (typeof m === 'string') {
    return { message: m };
  }
  if (m && typeof m === 'object') {
    const raw = m.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? m.error ?? '요청을 처리하지 못했어요.');
    return { message, errorCode: m.errorCode };
  }
  return { message: '요청을 처리하지 못했어요.' };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const adminKey = getAdminKey();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const { message, errorCode } = extractMessage(body as ErrorEnvelope | null);
    if (response.status === 401) {
      notifyUnauthorized();
    }
    throw new ApiError(response.status, message, errorCode);
  }

  return (body as SuccessEnvelope<T>).data;
}

function toQueryString(params?: Record<string, unknown>): string {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, unknown>) =>
    request<T>(`${path}${toQueryString(params)}`),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
