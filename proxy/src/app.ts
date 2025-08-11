import cors from "@fastify/cors";
import fastify, { type FastifyServerOptions } from "fastify";
import authPlugin from "./auth";
import errorHandler from "./error-handler";
import folderRoutes from "./folder";
import imageRoutes from "./image";
import itemRoutes from "./item";
import libraryRoutes from "./library";

export interface BuildOptions extends FastifyServerOptions {
  skipAuth?: boolean;
}

export default function build(options: BuildOptions = {}) {
  const app = fastify(options);

  app.register(errorHandler);

  app.register(cors, {
    origin: true,
  });

  if (!options.skipAuth) {
    app.register(authPlugin);
  }

  app.register(folderRoutes);
  app.register(imageRoutes);
  app.register(itemRoutes);
  app.register(libraryRoutes);

  return app;
}
