import type {
  FastifyError,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import { EagleApiError } from "./eagle-api";

const errorHandler: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.setErrorHandler(
    async (
      error: FastifyError,
      _request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      if (error instanceof EagleApiError) {
        fastify.log.error(
          { error: error.message, cause: error.cause?.message },
          "Eagle API error",
        );
        reply.code(error.httpCode);
        return { error: error.message };
      }

      const errorMessage = error.message || String(error);
      const errorStack = error.stack;

      fastify.log.error(
        { error: errorMessage, stack: errorStack },
        "Unexpected error occurred",
      );
      reply.code(error.statusCode || 500);
      return { error: "An unexpected error occurred" };
    },
  );
};

export default fp(errorHandler);
