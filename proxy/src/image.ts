import { readdir } from "node:fs/promises";
import { join, parse } from "node:path";
import type { Readable } from "node:stream";
import send from "@fastify/send";
import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";

interface ImageReqRep {
  Querystring: {
    id: string;
    libraryPath: string;
  };
  Reply: {
    200: Readable;
    400: { error: string };
    404: { error: string };
  };
}

async function listItemFiles(
  libraryPath: string,
  itemId: string,
): Promise<string[]> {
  try {
    const itemDir = join(libraryPath, "images", `${itemId}.info`);
    const files = await readdir(itemDir);

    // Filter out metadata.json and dot files
    return files
      .filter((file) => file !== "metadata.json" && !file.startsWith("."))
      .map((file) => join(itemDir, file));
  } catch (_error) {
    return [];
  }
}

async function resolveThumbnailPath(
  libraryPath: string,
  itemId: string,
): Promise<string | null> {
  try {
    const files = await listItemFiles(libraryPath, itemId);

    // First, look for thumbnail files (files with _thumbnail before extension)
    for (const file of files) {
      const filename = parse(file).name;
      if (filename.endsWith("_thumbnail")) {
        return file;
      }
    }

    // If no thumbnail, return the first original file
    for (const file of files) {
      const filename = parse(file).name;
      if (!filename.endsWith("_thumbnail")) {
        return file;
      }
    }

    return null;
  } catch (_error) {
    return null;
  }
}

async function resolveOriginalPath(
  libraryPath: string,
  itemId: string,
): Promise<string | null> {
  try {
    const files = await listItemFiles(libraryPath, itemId);

    // Find the first file that doesn't end with _thumbnail
    for (const file of files) {
      const filename = parse(file).name;
      if (!filename.endsWith("_thumbnail")) {
        return file;
      }
    }

    return null;
  } catch (_error) {
    return null;
  }
}

async function sendFile(
  request: FastifyRequest,
  reply: FastifyReply,
  filePath: string,
) {
  const { statusCode, headers, stream } = await send(request.raw, filePath);
  reply.code(statusCode);
  reply.headers(headers);
  return reply.send(stream);
}

async function imageHandler(
  request: FastifyRequest<ImageReqRep>,
  reply: FastifyReply<ImageReqRep>,
  pathResolver: (libraryPath: string, itemId: string) => Promise<string | null>,
) {
  const { id, libraryPath } = request.query;

  if (!id || !libraryPath) {
    return reply.code(400).send({
      error: "Missing required parameters: id and libraryPath",
    });
  }

  const imagePath = await pathResolver(libraryPath, id);

  if (!imagePath) {
    return reply.code(404).send({
      error: "Image not found",
    });
  }

  return sendFile(request, reply, imagePath);
}

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<ImageReqRep>("/item/thumbnail", async (request, reply) =>
    imageHandler(request, reply, resolveThumbnailPath),
  );

  fastify.get<ImageReqRep>("/item/image", async (request, reply) =>
    imageHandler(request, reply, resolveOriginalPath),
  );
};

export default fp(routes);
