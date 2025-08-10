import { createContext, useContext } from "react";
import type { Library } from "~/types/item";

const LibraryContext = createContext<Library | null>(null);

export const useLibrary = () => {
  const library = useContext(LibraryContext);
  if (!library) {
    throw new Error("useLibrary must be used within LibraryContext.Provider");
  }
  return library;
};

export default LibraryContext;
