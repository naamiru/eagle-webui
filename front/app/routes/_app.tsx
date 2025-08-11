import { useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, redirect } from "react-router";

import { libraryQueryOptions } from "~/api/library";
import LibraryContext from "~/contexts/LibraryContext";
import { getQueryClient } from "~/integrations/tanstack-query";
import {
  getProxyUrl,
  hasStoredProxyUrl,
  validateProxyUrl,
} from "~/services/settings";

export async function clientLoader() {
  const proxyUrl = getProxyUrl();

  // Check if this is first-time setup (never validated)
  if (!hasStoredProxyUrl()) {
    // First-time setup: redirect to settings
    throw redirect("/settings?initial=true");
  }

  // Validate current proxy URL
  const isValid = await validateProxyUrl(proxyUrl);

  if (!isValid) {
    // Previously validated URL is now invalid: show error
    throw new Response("Proxy server connection failed", {
      status: 503,
      statusText: `Cannot connect to proxy server at ${proxyUrl}. Please check if the Eagle proxy is running.`,
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
