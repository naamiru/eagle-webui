import "react-router";
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { handleGetImage, handleGetThumbnail } from "./image";

declare module "react-router" {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

app.get("/api/items/image", handleGetImage);
app.get("/api/items/thumbnail", handleGetThumbnail);

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
  }),
);
