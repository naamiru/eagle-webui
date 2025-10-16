export type LibraryImportErrorCode =
  | "LIBRARY_PATH_NOT_FOUND"
  | "INVALID_APPLICATION_VERSION"
  | "METADATA_READ_FAILURE"
  | "MTIME_READ_FAILURE"
  | "UNKNOWN_ERROR";

export const LIBRARY_IMPORT_ERROR_MESSAGE_KEYS = {
  LIBRARY_PATH_NOT_FOUND: "errors.libraryImport.LIBRARY_PATH_NOT_FOUND",
  INVALID_APPLICATION_VERSION:
    "errors.libraryImport.INVALID_APPLICATION_VERSION",
  METADATA_READ_FAILURE: "errors.libraryImport.METADATA_READ_FAILURE",
  MTIME_READ_FAILURE: "errors.libraryImport.MTIME_READ_FAILURE",
  UNKNOWN_ERROR: "errors.libraryImport.UNKNOWN_ERROR",
} as const satisfies Record<LibraryImportErrorCode, string>;

type LibraryImportErrorMessageKey =
  (typeof LIBRARY_IMPORT_ERROR_MESSAGE_KEYS)[LibraryImportErrorCode];

const FALLBACK_MESSAGES: Record<LibraryImportErrorCode, string> = {
  LIBRARY_PATH_NOT_FOUND: "Unable to locate the Eagle library",
  INVALID_APPLICATION_VERSION: "Eagle app 4.x is required",
  METADATA_READ_FAILURE: "Unable to read the library metadata",
  MTIME_READ_FAILURE: "Unable to read modification data",
  UNKNOWN_ERROR: "An unexpected error occurred",
};

export function getLibraryImportErrorMessageKey(
  code: LibraryImportErrorCode,
): LibraryImportErrorMessageKey {
  return (
    LIBRARY_IMPORT_ERROR_MESSAGE_KEYS[code] ??
    LIBRARY_IMPORT_ERROR_MESSAGE_KEYS.UNKNOWN_ERROR
  );
}

export function getLibraryImportErrorMessage(
  code: LibraryImportErrorCode,
  translate?: (key: LibraryImportErrorMessageKey) => string,
): string {
  if (translate) {
    return translate(getLibraryImportErrorMessageKey(code));
  }

  return FALLBACK_MESSAGES[code] ?? FALLBACK_MESSAGES.UNKNOWN_ERROR;
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
