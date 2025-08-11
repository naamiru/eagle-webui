import build from "./app";

const server = build({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

server.listen({ port: 57821, host: "::" }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
