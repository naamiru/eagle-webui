import type { QueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { libraryQueryOptions } from "~/api/library";
import LibraryContext from "~/contexts/LibraryContext";
import "~/styles/pico.css";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(libraryQueryOptions),
  component: RootComponent,
  errorComponent: RootErrorComponent,
});

function RootComponent() {
  const { data: library } = useSuspenseQuery(libraryQueryOptions);

  return (
    <LibraryContext.Provider value={library}>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </LibraryContext.Provider>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  // Handle library loading errors globally
  if (error.message.includes("Failed to fetch library")) {
    return (
      <div className="container">
        <h3>Unable to load library information</h3>
        <p>Please ensure the proxy service and Eagle are running.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // Re-throw other errors to be handled by default error boundary
  throw error;
}
