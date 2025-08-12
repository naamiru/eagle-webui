import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("folders/:folderId", "routes/folder.tsx"),
] satisfies RouteConfig;
