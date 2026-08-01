export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
  textRaw: string;
}

export async function safeFetch<T = any>(url: string, options?: RequestInit): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(url, options);
    const textRaw = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(textRaw);
    } catch {
      data = {
        status: res.ok ? 'success' : 'error',
        message: textRaw || `HTTP ${res.status} response`
      };
    }
    return {
      ok: res.ok,
      status: res.status,
      data: data as T,
      textRaw
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      data: {
        status: 'error',
        message: err?.message || 'Network connectivity issue'
      } as any,
      textRaw: err?.message || ''
    };
  }
}
