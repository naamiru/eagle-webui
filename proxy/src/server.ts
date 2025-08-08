import build from "./app";

const server = build({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

server.listen({ port: 57821, host: "::" }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});
