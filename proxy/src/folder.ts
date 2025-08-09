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
    };
  }>("/folder/list", async () => {
    fastify.log.info("Fetching folders from Eagle API");

    const eagleFolders = await callEagleApi<EagleFolder[]>("/api/folder/list");
    const folders = eagleFolders.map(transformEagleFolder);

    fastify.log.info(
      { folderCount: folders.length },
      "Successfully transformed folders",
    );
    return folders;
  });
};

export default fp(routes);
