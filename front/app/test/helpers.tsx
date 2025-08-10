import type { ReactNode } from "react";
import { createRoutesStub } from "react-router";
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
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <LibraryContext.Provider value={library}>
          {children}
        </LibraryContext.Provider>
      ),
    },
  ]);

  return <Stub initialEntries={["/"]} />;
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
