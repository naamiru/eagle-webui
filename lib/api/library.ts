import { EAGLE_API_URL } from "@/env";

export async function fetchLibraryPath(): Promise<string> {
  try {
    const listResponse = await fetch(`${EAGLE_API_URL}/api/item/list?limit=1`);
    if (!listResponse.ok) {
      throw new Error(
        `Failed to fetch items: ${listResponse.status} ${listResponse.statusText}`
      );
    }

    const listData = await listResponse.json();
    if (
      listData.status !== "success" ||
      !listData.data ||
      listData.data.length === 0
    ) {
      throw new Error("No items found in Eagle library");
    }

    const itemId = listData.data[0].id;

    const thumbnailResponse = await fetch(
      `${EAGLE_API_URL}/api/item/thumbnail?id=${itemId}`
    );
    if (!thumbnailResponse.ok) {
      throw new Error(
        `Failed to fetch thumbnail: ${thumbnailResponse.status} ${thumbnailResponse.statusText}`
      );
    }

    const thumbnailData = await thumbnailResponse.json();
    if (thumbnailData.status !== "success" || !thumbnailData.data) {
      throw new Error("Failed to get thumbnail path");
    }

    const thumbnailPath = thumbnailData.data;
    const libraryMatch = thumbnailPath.match(/^(.+\.library)[/\\]/);

    if (!libraryMatch) {
      throw new Error(`Invalid thumbnail path format: ${thumbnailPath}`);
    }

    return libraryMatch[1];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching library path");
  }
}
