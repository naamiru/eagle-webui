import { getProxyToken, getProxyUrl } from "~/services/settings";

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const proxyUrl = getProxyUrl();
  const token = getProxyToken();

  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${proxyUrl}${endpoint}`, {
    ...options,
    headers,
  });

  // Return the response as-is, including 401 errors
  // The calling code or router can handle redirects
  return response;
}
