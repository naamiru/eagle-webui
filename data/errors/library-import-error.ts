export type LibraryImportErrorCode =
  | "LIBRARY_PATH_NOT_FOUND"
  | "INVALID_APPLICATION_VERSION"
  | "METADATA_READ_FAILURE"
  | "MTIME_READ_FAILURE"
  | "UNKNOWN_ERROR";

const ERROR_MESSAGES: Record<LibraryImportErrorCode, string> = {
  LIBRARY_PATH_NOT_FOUND: "Unable to locate the Eagle library",
  INVALID_APPLICATION_VERSION: "Eagle app 4.x is required",
  METADATA_READ_FAILURE: "Unable to read the library metadata",
  MTIME_READ_FAILURE: "Unable to read modification data",
  UNKNOWN_ERROR: "An unexpected error occurred",
};

export function getLibraryImportErrorMessage(
  code: LibraryImportErrorCode,
): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN_ERROR;
}

export class LibraryImportError extends Error {
  readonly code: LibraryImportErrorCode;

  constructor(code: LibraryImportErrorCode, options?: ErrorOptions) {
    super(getLibraryImportErrorMessage(code), options);
    this.name = "LibraryImportError";
    this.code = code;
  }
}

export function toLibraryImportErrorCode(
  error: unknown,
): LibraryImportErrorCode {
  if (error instanceof LibraryImportError) {
    return error.code;
  }

  return "UNKNOWN_ERROR";
}
