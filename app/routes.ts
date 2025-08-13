import {
  index,
  layout,
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/app.tsx", { id: "app" }, [
    index("routes/home.tsx"),
    route("folders/:folderId", "routes/folder.tsx"),
  ]),
] satisfies RouteConfig;
