import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("folders/:folderId", "routes/folders.$folderId.tsx"),
] satisfies RouteConfig;
