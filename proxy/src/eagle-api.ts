interface FetchError extends Error {
  code?: string;
}

export class EagleApiError extends Error {
  constructor(
    public httpCode: number,
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "EagleApiError";
  }
}

const EAGLE_BASE_URL = "http://localhost:41595";
const TIMEOUT_MS = 30000;

function isFetchError(error: unknown): error is FetchError {
  return error instanceof Error && "code" in error;
}

export async function callEagleApi<T = unknown>(apiPath: string): Promise<T> {
  const url = `${EAGLE_BASE_URL}${apiPath}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new EagleApiError(
        502,
        `Eagle API returned status ${response.status}: ${response.statusText}`,
      );
    }

    const responseData = (await response.json()) as { status: string; data: T };

    if (responseData.status !== "success") {
      throw new EagleApiError(502, `Eagle API error: ${responseData.status}`);
    }

    return responseData.data;
  } catch (error) {
    if (error instanceof EagleApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new EagleApiError(
        504,
        "Request to Eagle API timed out after 30 seconds",
        error,
      );
    }

    if (isFetchError(error) && error.code === "ECONNREFUSED") {
      throw new EagleApiError(
        503,
        "Eagle service is not running. Please ensure Eagle is running on port 41595",
        error,
      );
    }

    if (
      isFetchError(error) &&
      (error.code === "ENETUNREACH" || error.code === "EHOSTUNREACH")
    ) {
      throw new EagleApiError(
        503,
        "Network error: Unable to reach Eagle service",
        error,
      );
    }

    if (error instanceof SyntaxError) {
      throw new EagleApiError(
        502,
        "Invalid response format from Eagle API",
        error,
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new EagleApiError(
      500,
      "An unexpected error occurred while fetching from Eagle API",
      error instanceof Error ? error : new Error(errorMessage),
    );
  }
}
