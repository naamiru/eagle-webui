import type { ReactNode } from "react";
import LibraryContext from "~/contexts/LibraryContext";
import type { Library } from "~/types/item";

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
