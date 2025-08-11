import { useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, redirect } from "react-router";

import { libraryQueryOptions } from "~/api/library";
import LibraryContext from "~/contexts/LibraryContext";
import { getQueryClient } from "~/integrations/tanstack-query";
import {
  getProxyConfig,
  hasStoredProxyConfig,
  validateProxyConnection,
} from "~/services/settings";

export async function clientLoader() {
  const config = getProxyConfig();

  // Check if this is first-time setup (never validated)
  if (!hasStoredProxyConfig()) {
    // First-time setup: redirect to settings
    throw redirect("/settings?initial=true");
  }

  // Validate current proxy URL with token
  const validationResult = await validateProxyConnection(
    config.url,
    config.token,
  );

  if (validationResult === "unauthorized") {
    // Token is invalid or missing: redirect to settings
    throw redirect("/settings?initial=true");
  }

  if (validationResult === "unreachable") {
    // Previously validated URL is now unreachable: show error
    throw new Response("Proxy server connection failed", {
      status: 503,
      statusText: `Cannot connect to proxy server at ${config.url}. Please check if the Eagle proxy is running.`,
    });
  }

  // Only fetch library after validation
  return getQueryClient().ensureQueryData(libraryQueryOptions);
}

export default function AppLayout() {
  const { data: library } = useSuspenseQuery(libraryQueryOptions);

  return (
    <LibraryContext.Provider value={library}>
      <Outlet />
    </LibraryContext.Provider>
  );
}
