export class LibraryPathNotFoundError extends Error {
  constructor(
    message = "Unable to resolve Eagle library path",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "LibraryPathNotFoundError";
  }
}
