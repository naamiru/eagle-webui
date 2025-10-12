export type LibraryImportErrorCode =
  | "INVALID_APPLICATION_VERSION"
  | "METADATA_READ_FAILURE"
  | "MTIME_READ_FAILURE"
  | "ITEM_IMPORT_FAILURE";

export class LibraryImportError extends Error {
  readonly code?: LibraryImportErrorCode;

  constructor(
    message = "Failed to import Eagle library metadata",
    options?: ErrorOptions & { code?: LibraryImportErrorCode },
  ) {
    super(message, options);
    this.name = "LibraryImportError";
    this.code = options?.code;
  }
}
