// Email Masking Helper: kushanthag@gmail.com -> k••••••••g@gmail.com
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email || '••••';
  const parts = email.split('@');
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0]}••••@${domain}`;
  }
  const maskedName = `${name[0]}${'•'.repeat(Math.min(8, name.length - 2))}${name[name.length - 1]}`;
  return `${maskedName}@${domain}`;
}

// API Key Masking Helper: nx_live_9a8f23c10b48e71d -> nx_live_9a8f••••••••
export function maskApiKey(key: string): string {
  if (!key || typeof key !== 'string') return '••••••••';
  if (key.length <= 12) {
    return `${key.slice(0, 4)}••••${key.slice(-2)}`;
  }
  const prefix = key.includes('_') ? key.substring(0, key.indexOf('_') + 5) : key.substring(0, 8);
  const suffix = key.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

// Obfuscate / Secure LocalStorage Helper
export function secureSetStorage(key: string, data: any): void {
  try {
    const rawStr = JSON.stringify(data);
    const obfuscated = btoa(encodeURIComponent(rawStr));
    localStorage.setItem(key, `nx_enc_${obfuscated}`);
  } catch (e) {
    // fallback
  }
}

export function secureGetStorage<T = any>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    if (raw.startsWith('nx_enc_')) {
      const clean = raw.substring(7);
      const decoded = decodeURIComponent(atob(clean));
      return JSON.parse(decoded) as T;
    }
    // Backward compatibility for unencoded legacy string or raw JSON
    return JSON.parse(raw) as T;
  } catch (e) {
    return defaultValue;
  }
}
