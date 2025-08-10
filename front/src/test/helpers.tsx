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
  return (
    <LibraryContext.Provider value={library}>
      {children}
    </LibraryContext.Provider>
  );
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
