import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { callEagleApi } from "./eagle-api";

interface Item {
  id: string;
  original: string;
  thumbnail: string;
  width: number;
  height: number;
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

interface ItemListQuery {
  limit?: number;
  offset?: number;
}

function transformEagleItem(eagleItem: EagleItem): Item {
  return {
    id: eagleItem.id,
    original:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
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
    const limit = request.query.limit ?? 200;
    const offset = request.query.offset ?? 0;

    fastify.log.info({ limit, offset }, "Fetching items from Eagle API");

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

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
