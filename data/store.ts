import { discoverLibraryPath } from "./library/discover-library-path";

export type Store = {
  libraryPath: string;
};

let storePromise: Promise<Store> | null = null;

export async function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = initializeStore();
  }

  return storePromise;
}

async function initializeStore(): Promise<Store> {
  const libraryPath = await discoverLibraryPath();

  return {
    libraryPath,
  };
}

export function __resetStoreForTests() {
  storePromise = null;
}
