import { access, glob } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
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

async function resolveThumbnailPath(
  libraryPath: string,
  itemId: string,
): Promise<string | null> {
  try {
    const pattern = join(
      libraryPath,
      "images",
      `${itemId}.info`,
      "*_thumbnail.*",
    );
    for await (const match of glob(pattern)) {
      return match;
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
    const thumbnailPath = await resolveThumbnailPath(libraryPath, itemId);
    if (!thumbnailPath) {
      return null;
    }

    const thumbnailFilename = basename(thumbnailPath);
    const originalFilename = thumbnailFilename.replace("_thumbnail", "");
    const originalPath = join(dirname(thumbnailPath), originalFilename);

    // Check if original file exists
    await access(originalPath);
    return originalPath;
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
