import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_app.tsx", [
    index("routes/_index.tsx"),
    route("folders/:folderId", "routes/folders.$folderId.tsx"),
  ]),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
