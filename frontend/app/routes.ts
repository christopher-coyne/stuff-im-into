import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("explore", "routes/explore.tsx"),
  route("profile", "routes/profile.tsx"),
  route("reviews/add", "routes/reviews.add.tsx"),
  route("review/:id", "routes/review.$id.tsx"),
  route(":username/:tab?", "routes/$username.$tab.tsx"),
] satisfies RouteConfig;
