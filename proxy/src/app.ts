import fastify, { type FastifyServerOptions } from "fastify";
import folderRoutes from "./folder";

export default function build(options: FastifyServerOptions = {}) {
  const app = fastify(options);

  app.register(folderRoutes);

  return app;
}
