import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { test as testBase } from "vitest";
import LibraryContext from "~/contexts/LibraryContext";
import type { Library } from "~/types/item";
import { worker } from "./browser";

interface TestWrapperProps {
  children: ReactNode;
  library?: Library;
}

export const defaultTestLibrary: Library = {
  path: "/test/library/path",
};

export function TestWrapper({
  children,
  library = defaultTestLibrary,
}: TestWrapperProps) {
  // Create a minimal test router
  const rootRoute = createRootRoute({
    component: () => (
      <LibraryContext.Provider value={library}>
        <Outlet />
        {children}
      </LibraryContext.Provider>
    ),
  });
  
  const testRouter = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
    defaultPreload: "intent",
  });

  return <RouterProvider router={testRouter} />;
}

export const test = testBase.extend({
  worker: [
    // biome-ignore lint/correctness/noEmptyPattern: MSW https://mswjs.io/docs/recipes/vitest-browser-mode/
    async ({}, use) => {
      await worker.start({ quiet: true });
      await use(worker);
      worker.resetHandlers();
    },
    { auto: true },
  ],
});
