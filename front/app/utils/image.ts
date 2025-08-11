/**
 * Utility functions for constructing image URLs
 */

import { getProxyToken, getProxyUrl } from "~/services/settings";

/**
 * Builds an image URL with the given endpoint and parameters
 * @param endpoint - The API endpoint path
 * @param itemId - The ID of the image item
 * @param libraryPath - The path to the Eagle library
 * @returns The complete image URL
 */
function buildImageUrl(
  endpoint: string,
  itemId: string,
  libraryPath: string,
): string {
  const baseUrl = getProxyUrl();
  const token = getProxyToken();
  const params = new URLSearchParams({
    id: itemId,
    libraryPath: libraryPath,
  });
  
  // Add token to query parameters for image URLs
  if (token) {
    params.append("token", token);
  }
  
  return `${baseUrl}${endpoint}?${params.toString()}`;
}

/**
 * Constructs a thumbnail URL for an Eagle image item
 * @param itemId - The ID of the image item
 * @param libraryPath - The path to the Eagle library
 * @returns The complete thumbnail URL
 */
export function getThumbnailUrl(itemId: string, libraryPath: string): string {
  return buildImageUrl("/item/thumbnail", itemId, libraryPath);
}

/**
 * Constructs an original image URL for an Eagle image item
 * @param itemId - The ID of the image item
 * @param libraryPath - The path to the Eagle library
 * @returns The complete original image URL
 */
export function getOriginalUrl(itemId: string, libraryPath: string): string {
  return buildImageUrl("/item/image", itemId, libraryPath);
}
