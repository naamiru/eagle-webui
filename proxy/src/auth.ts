import { randomBytes, timingSafeEqual } from "node:crypto";
import { networkInterfaces } from "node:os";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export interface AuthOptions {
  token?: string;
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function getLocalIpAddress(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const addr of iface) {
      if (addr.family === "IPv4" && !addr.internal) {
        return addr.address;
      }
    }
  }
  return "localhost";
}

function validateTokenFormat(token: string): boolean {
  return token.length >= 16;
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return timingSafeEqual(bufA, bufB);
}

async function authPlugin(fastify: FastifyInstance, opts: AuthOptions) {
  const token =
    opts.token || process.env.EAGLE_WEBUI_PROXY_TOKEN || generateToken();

  if (
    process.env.EAGLE_WEBUI_PROXY_TOKEN &&
    !validateTokenFormat(process.env.EAGLE_WEBUI_PROXY_TOKEN)
  ) {
    throw new Error(
      "EAGLE_WEBUI_PROXY_TOKEN must be at least 16 characters long",
    );
  }

  fastify.decorate("authToken", token);

  const localIp = getLocalIpAddress();
  const params = new URLSearchParams({
    url: `http://${localIp}:57821`,
    token: token,
  });

  const isProduction = process.env.NODE_ENV === "production";
  const frontendUrl = isProduction
    ? "https://naamiru.github.io/eagle-webui/settings"
    : `http://${localIp}:5173/settings`;
  const setupUrl = `${frontendUrl}?${params.toString()}`;

  fastify.log.info("=".repeat(70));
  fastify.log.info("Eagle WebUI Ready! Visit this URL to start:");
  fastify.log.info(setupUrl);
  fastify.log.info("=".repeat(70));

  fastify.addHook(
    "onRequest",
    async (
      request: FastifyRequest<{ Querystring: { token?: string } }>,
      reply: FastifyReply,
    ) => {
      // Skip authentication for OPTIONS requests (CORS preflight)
      if (request.method === "OPTIONS") {
        return;
      }

      // Skip authentication for health endpoint
      if (request.url === "/health") {
        return;
      }

      // Check if this is an image endpoint
      const isImageEndpoint =
        request.url.startsWith("/item/thumbnail") ||
        request.url.startsWith("/item/image");

      let providedToken: string | undefined;

      // For image endpoints, accept token from query parameter
      if (isImageEndpoint && request.query.token) {
        providedToken = request.query.token;
      }

      // For all endpoints, also check Authorization header
      if (!providedToken) {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
          reply.code(401).send({ error: "Missing authorization" });
          return;
        }

        const bearerMatch = authHeader.match(/^Bearer (.+)$/);
        if (!bearerMatch) {
          reply.code(401).send({ error: "Invalid authorization format" });
          return;
        }

        providedToken = bearerMatch[1];
      }

      if (!providedToken || !constantTimeCompare(providedToken, token)) {
        fastify.log.warn(`Authentication failed from ${request.ip}`);
        reply.code(401).send({ error: "Invalid token" });
        return;
      }
    },
  );

  // Add health endpoint
  fastify.get("/health", async () => {
    return { status: "ok" };
  });
}

export default fp(authPlugin, {
  name: "auth",
});

declare module "fastify" {
  interface FastifyInstance {
    authToken: string;
  }
}
