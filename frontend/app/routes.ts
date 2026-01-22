import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("explore", "routes/explore.tsx"),
  route(":username/:tab?", "routes/$username.$tab.tsx"),
] satisfies RouteConfig;
