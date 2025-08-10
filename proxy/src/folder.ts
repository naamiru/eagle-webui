import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { callEagleApi } from "./eagle-api";
import { type EagleItem, type Item, transformEagleItem } from "./item";

interface Folder {
  id: string;
  name: string;
  children: Folder[];
  items: Item[];
  coverImage?: Item;
}

interface EagleFolder {
  id: string;
  name: string;
  children?: EagleFolder[];
}

function collectDescendantIds(folder: EagleFolder): string[] {
  const descendantIds: string[] = [];

  if (folder.children) {
    for (const child of folder.children) {
      descendantIds.push(child.id);
      descendantIds.push(...collectDescendantIds(child));
    }
  }

  return descendantIds;
}

async function fetchCoverImage(folder: EagleFolder): Promise<Item | undefined> {
  try {
    // Priority 1: Try to get image from current folder first
    let queryParams = new URLSearchParams({
      limit: "1",
      folders: folder.id,
    });

    const items = await callEagleApi<EagleItem[]>(
      `/api/item/list?${queryParams.toString()}`,
    );

    if (items.length > 0) {
      return transformEagleItem(items[0]);
    }

    // Priority 2: Try descendants if current folder is empty
    const descendantIds = collectDescendantIds(folder);
    if (descendantIds.length > 0) {
      queryParams = new URLSearchParams({
        limit: "1",
        folders: descendantIds.join(","),
      });

      const descendantItems = await callEagleApi<EagleItem[]>(
        `/api/item/list?${queryParams.toString()}`,
      );

      if (descendantItems.length > 0) {
        return transformEagleItem(descendantItems[0]);
      }
    }

    return undefined;
  } catch (_error) {
    // Silently handle errors, just return undefined
    return undefined;
  }
}

function flattenFolders(folder: EagleFolder): EagleFolder[] {
  const result = [folder];
  if (folder.children) {
    for (const child of folder.children) {
      result.push(...flattenFolders(child));
    }
  }
  return result;
}

function transformEagleFolderSync(
  eagleFolder: EagleFolder,
  coverImageMap: Map<string, Item>,
): Folder {
  return {
    id: eagleFolder.id,
    name: eagleFolder.name,
    children: eagleFolder.children
      ? eagleFolder.children.map((child) =>
          transformEagleFolderSync(child, coverImageMap),
        )
      : [],
    items: [],
    coverImage: coverImageMap.get(eagleFolder.id),
  };
}

async function transformEagleFoldersWithCover(
  eagleFolders: EagleFolder[],
): Promise<Folder[]> {
  // Flatten all folders from all trees
  const allFolders = eagleFolders.flatMap(flattenFolders);

  // Fetch all cover images in parallel
  const coverImagePromises = allFolders.map(async (folder) => {
    const coverImage = await fetchCoverImage(folder);
    return { folderId: folder.id, coverImage };
  });

  const coverImageResults = await Promise.all(coverImagePromises);

  // Create a map of folder ID to cover image
  const coverImageMap = new Map<string, Item>();
  for (const result of coverImageResults) {
    if (result.coverImage) {
      coverImageMap.set(result.folderId, result.coverImage);
    }
  }

  // Transform all root folders synchronously using the map
  return eagleFolders.map((folder) =>
    transformEagleFolderSync(folder, coverImageMap),
  );
}

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: {
      200: Folder[];
    };
  }>("/folder/list", async () => {
    fastify.log.info("Fetching folders from Eagle API");

    const eagleFolders = await callEagleApi<EagleFolder[]>("/api/folder/list");
    const folders = await transformEagleFoldersWithCover(eagleFolders);

    fastify.log.info(
      { folderCount: folders.length },
      "Successfully transformed folders with cover images",
    );
    return folders;
  });
};

export default fp(routes);
