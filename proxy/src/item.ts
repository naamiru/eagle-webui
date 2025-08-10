import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { callEagleApi } from "./eagle-api";

export interface Item {
  id: string;
  width: number;
  height: number;
}

export interface EagleItem {
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

interface ItemListQuery {
  limit?: number;
  folder?: string;
}

export function transformEagleItem(eagleItem: EagleItem): Item {
  return {
    id: eagleItem.id,
    width: eagleItem.width,
    height: eagleItem.height,
  };
}

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{
    Querystring: ItemListQuery;
    Reply: {
      200: Item[];
    };
  }>("/item/list", async (request) => {
    // Note: Eagle API has unreliable offset behavior - it may return empty results
    // at certain offset values even when more items exist. Therefore, we only use
    // the limit parameter and fetch items from the beginning.
    // For large collections, increase the limit rather than using pagination.
    const limit = request.query.limit ?? 1000;
    const folder = request.query.folder?.trim();

    fastify.log.info({ limit, folder }, "Fetching items from Eagle API");

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
    });

    // Add folders parameter if folder ID is provided
    if (folder && folder.length > 0) {
      queryParams.set("folders", folder);
    }

    const response = await callEagleApi<EagleItem[]>(
      `/api/item/list?${queryParams.toString()}`,
    );

    const items = response.map(transformEagleItem);

    fastify.log.info(
      { itemCount: items.length },
      "Successfully transformed items",
    );

    return items;
  });
};

export default fp(routes);
