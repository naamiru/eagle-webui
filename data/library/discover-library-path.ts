import path from "node:path";

import { LibraryImportError } from "../errors";

type EagleItemListResponse = {
  status: string;
  data: Array<{ id: string }>;
};

type EagleThumbnailResponse = {
  status: string;
  data: string;
};

const DEFAULT_EAGLE_API_URL = "http://localhost:41595";
const LIBRARY_SUFFIX = ".library";

export async function discoverLibraryPath(): Promise<string> {
  const envPath = process.env.EAGLE_LIBRARY_PATH?.trim();
  if (envPath) {
    return envPath;
  }

  try {
    const apiUrl = process.env.EAGLE_API_URL ?? DEFAULT_EAGLE_API_URL;
    const itemId = await fetchSampleItemId(apiUrl);
    const thumbnailPath = await fetchThumbnailPath(apiUrl, itemId);
    return extractLibraryPath(thumbnailPath);
  } catch (error) {
    if (error instanceof LibraryImportError) {
      throw error;
    }

    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND", {
      cause: error instanceof Error ? error : undefined,
    });
  }
}

async function fetchSampleItemId(apiUrl: string): Promise<string> {
  const url = new URL("/api/item/list", ensureBaseUrl(apiUrl));
  url.searchParams.set("limit", "1");

  const response = await safeFetch(url);
  const payload = (await parseJson<EagleItemListResponse>(response)) ?? {
    status: undefined,
    data: undefined,
  };

  if (payload.status !== "success" || !Array.isArray(payload.data)) {
    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
  }

  const firstItem = payload.data[0];
  if (!firstItem?.id) {
    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
  }

  return firstItem.id;
}

async function fetchThumbnailPath(
  apiUrl: string,
  itemId: string,
): Promise<string> {
  const url = new URL("/api/item/thumbnail", ensureBaseUrl(apiUrl));
  url.searchParams.set("id", itemId);

  const response = await safeFetch(url);
  const payload = await parseJson<EagleThumbnailResponse>(response);

  if (payload?.status !== "success" || typeof payload.data !== "string") {
    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
  }

  return payload.data;
}

function extractLibraryPath(
  pathWithAsset: string,
  separator: string = path.sep,
): string {
  const lowerPath = pathWithAsset.toLowerCase();
  if (lowerPath.endsWith(LIBRARY_SUFFIX)) {
    return pathWithAsset;
  }

  const normalizedSeparator = separator.length > 0 ? separator : path.sep;
  const searchTarget = `${LIBRARY_SUFFIX}${normalizedSeparator}`.toLowerCase();
  const markerIndex = lowerPath.lastIndexOf(searchTarget);
  if (markerIndex === -1) {
    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
  }

  return pathWithAsset.slice(0, markerIndex + LIBRARY_SUFFIX.length);
}

async function safeFetch(input: URL): Promise<Response> {
  const response = await fetch(input);
  if (!response.ok) {
    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
  }
  return response;
}

async function parseJson<T>(response: Response): Promise<T | undefined> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new LibraryImportError("LIBRARY_PATH_NOT_FOUND");
  }
}

function ensureBaseUrl(apiUrl: string): string {
  return apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
}

// Exported for targeted testing.
export const __testUtils = {
  extractLibraryPath,
  ensureBaseUrl,
};
