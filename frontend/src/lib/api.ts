const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export function getApiUrl(path: string): string {
  return `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(getApiUrl(path), { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
  return data as T;
}
