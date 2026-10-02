// Client-only entry for the static (Capacitor) build. Not used by the live preview.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { MarketApp } from "@/components/MarketApp";
import "@/styles.css";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  ),
});
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: MarketApp });

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
  history: createHashHistory(),
  defaultNotFoundComponent: MarketApp,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
