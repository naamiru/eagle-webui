import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

interface Item {
  id: number;
  original: string;
  thumbnail: string;
  width: number;
  height: number;
}

interface Folder {
  id: number;
  name: string;
  children: Folder[];
  items: Item[];
}

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: {
      200: Folder[];
    };
  }>("/folder/list", async () => {
    return [
      { id: 1, name: "Family", children: [], items: [] },
      { id: 2, name: "Friends", children: [], items: [] },
    ];
  });
};

export default fp(routes);
