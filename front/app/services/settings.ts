// Types
export interface ProxyConfig {
  url: string;
  token?: string;
}

// Constants
export const STORAGE_KEY = "eagle-proxy-config";
export const DEFAULT_PROXY_URL = "http://localhost:57821";

// Functions
export function getProxyConfig(): ProxyConfig {
  if (typeof window === "undefined") {
    return { url: DEFAULT_PROXY_URL };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { url: DEFAULT_PROXY_URL };
  } catch {
    // localStorage unavailable or invalid JSON
    return { url: DEFAULT_PROXY_URL };
  }
}

export function getProxyUrl(): string {
  return getProxyConfig().url;
}

export function getProxyToken(): string | undefined {
  return getProxyConfig().token;
}

export function setProxyConfig(config: ProxyConfig): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage unavailable - could show warning to user
    console.warn("Unable to save proxy settings");
  }
}

export function setProxyUrl(url: string): void {
  const config = getProxyConfig();
  config.url = url;
  setProxyConfig(config);
}

export function setProxyToken(token: string | undefined): void {
  const config = getProxyConfig();
  if (token) {
    config.token = token;
  } else {
    delete config.token;
  }
  setProxyConfig(config);
}

export function hasStoredProxyConfig(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null;
  } catch {
    return false;
  }
}

export function hasStoredProxyToken(): boolean {
  const config = getProxyConfig();
  return !!config.token;
}

export type ValidationResult = "connected" | "unauthorized" | "unreachable";

export async function validateProxyConnection(
  url: string,
  token?: string,
): Promise<ValidationResult> {
  try {
    // Basic URL format validation
    new URL(url);

    // First check health endpoint without auth
    try {
      const healthResponse = await fetch(`${url}/health`);
      if (!healthResponse.ok && healthResponse.status !== 401) {
        return "unreachable";
      }
    } catch {
      return "unreachable";
    }

    // Then validate with token using library endpoint
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${url}/library/info`, { headers });

    if (response.status === 401) {
      return "unauthorized";
    }

    if (!response.ok) {
      return "unreachable";
    }

    return "connected";
  } catch (_error) {
    return "unreachable";
  }
}

export async function validateProxyUrl(url: string): Promise<boolean> {
  const config = getProxyConfig();
  const result = await validateProxyConnection(url, config.token);
  return result === "connected";
}

export function resetToDefault(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn("Unable to reset proxy settings");
  }
}
