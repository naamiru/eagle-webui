import cors from "@fastify/cors";
import fastify, { type FastifyServerOptions } from "fastify";
import errorHandler from "./error-handler";
import folderRoutes from "./folder";

export default function build(options: FastifyServerOptions = {}) {
  const app = fastify(options);

  app.register(errorHandler);

  app.register(cors, {
    origin: true,
  });

  app.register(folderRoutes);

  return app;
}
