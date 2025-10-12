export const runtime = "nodejs";

export function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  import("./data/store")
    .then(({ getStore }) =>
      getStore().catch((error: unknown) => {
        console.error(
          "[instrumentation] Failed to start library import:",
          error instanceof Error ? error : new Error(String(error)),
        );
      }),
    )
    .catch((error) => {
      console.error(
        "[instrumentation] Failed to load store module:",
        error instanceof Error ? error : new Error(String(error)),
      );
    });
}
