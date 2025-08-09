import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { callEagleApi, EagleApiError } from "./eagle-api";

interface Item {
  id: string;
  original: string;
  thumbnail: string;
  width: number;
  height: number;
}

interface Folder {
  id: string;
  name: string;
  children: Folder[];
  items: Item[];
}

interface EagleFolder {
  id: string;
  name: string;
  children?: EagleFolder[];
}

function transformEagleFolder(eagleFolder: EagleFolder): Folder {
  return {
    id: eagleFolder.id,
    name: eagleFolder.name,
    children: eagleFolder.children
      ? eagleFolder.children.map(transformEagleFolder)
      : [],
    items: [],
  };
}

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: {
      200: Folder[];
      502: { error: string };
      503: { error: string };
      504: { error: string };
      500: { error: string };
    };
  }>("/folder/list", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      fastify.log.info("Fetching folders from Eagle API");

      const eagleFolders =
        await callEagleApi<EagleFolder[]>("/api/folder/list");
      const folders = eagleFolders.map(transformEagleFolder);

      fastify.log.info(
        { folderCount: folders.length },
        "Successfully transformed folders",
      );
      return folders;
    } catch (error) {
      if (error instanceof EagleApiError) {
        fastify.log.error(
          { error: error.message, cause: error.cause?.message },
          "Eagle API error",
        );
        reply.code(error.httpCode);
        return { error: error.message };
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      fastify.log.error(
        { error: errorMessage, stack: errorStack },
        "Unexpected error fetching folders",
      );
      reply.code(500);
      return { error: "An unexpected error occurred while fetching folders" };
    }
  });
};

export default fp(routes);
