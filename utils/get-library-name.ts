const LIBRARY_SUFFIX = ".library";

export function getLibraryName(libraryPath: string): string {
  if (libraryPath.length === 0) {
    return libraryPath;
  }

  const normalized = libraryPath.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  const basename = segments.at(-1) ?? libraryPath;

  return removeLibrarySuffix(basename);
}

function removeLibrarySuffix(name: string): string {
  return name.toLowerCase().endsWith(LIBRARY_SUFFIX)
    ? name.slice(0, -LIBRARY_SUFFIX.length)
    : name;
}
