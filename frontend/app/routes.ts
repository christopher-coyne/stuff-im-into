import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("explore", "routes/explore.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("review/:id", "routes/review.$id.tsx"),
  route(":username/:tab?", "routes/$username.$tab.tsx"),
] satisfies RouteConfig;
