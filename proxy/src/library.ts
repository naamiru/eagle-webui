import path from "node:path";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { callEagleApi, EagleApiError } from "./eagle-api";

interface Library {
  path: string;
}

interface EagleItem {
  id: string;
  name: string;
  size: number;
  ext: string;
  tags: string[];
  folders: string[];
  url: string;
  height: number;
  width: number;
}

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: {
      200: Library;
    };
  }>("/library/info", async () => {
    fastify.log.info("Discovering Eagle library path");

    // Step 1: Fetch single item to get item ID
    const items = await callEagleApi<EagleItem[]>("/api/item/list?limit=1");

    if (items.length === 0) {
      fastify.log.warn("No items found in Eagle library");
      throw new EagleApiError(404, "No items found in Eagle library");
    }

    const firstItem = items[0];
    fastify.log.info(
      { itemId: firstItem.id },
      "Fetching thumbnail path for item",
    );

    // Step 2: Get thumbnail path using item ID
    const thumbnailPath = await callEagleApi<string>(
      `/api/item/thumbnail?id=${firstItem.id}`,
    );

    fastify.log.info(
      { itemId: firstItem.id, thumbnailPath },
      "Extracting library path from thumbnail",
    );

    try {
      const libraryPath = extractLibraryPath(thumbnailPath);
      fastify.log.info({ libraryPath }, "Successfully discovered library path");

      return { path: libraryPath };
    } catch (error) {
      fastify.log.error(
        { error, thumbnailPath },
        "Failed to extract library path",
      );
      throw new EagleApiError(
        500,
        "Unable to determine library path from thumbnail URL",
        error instanceof Error ? error : undefined,
      );
    }
  });
};

function extractLibraryPath(thumbnailPath: string): string {
  // Search for .library followed by path separator to ensure exact directory match
  const searchPattern = `.library${path.sep}`;
  const libraryIndex = thumbnailPath.indexOf(searchPattern);

  if (libraryIndex === -1) {
    throw new Error(
      "Invalid Eagle thumbnail path: .library directory not found",
    );
  }

  // Extract path up to and including .library (without the trailing separator)
  return thumbnailPath.substring(0, libraryIndex + ".library".length);
}

export default fp(routes);
