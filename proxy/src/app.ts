import cors from "@fastify/cors";
import fastify, { type FastifyServerOptions } from "fastify";
import errorHandler from "./error-handler";
import folderRoutes from "./folder";
import imageRoutes from "./image";
import itemRoutes from "./item";
import libraryRoutes from "./library";

export default function build(options: FastifyServerOptions = {}) {
  const app = fastify(options);

  app.register(errorHandler);

  app.register(cors, {
    origin: true,
  });

  app.register(folderRoutes);
  app.register(imageRoutes);
  app.register(itemRoutes);
  app.register(libraryRoutes);

  return app;
}
