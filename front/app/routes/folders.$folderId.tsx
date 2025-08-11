import { foldersQueryOptions } from "~/api/folders";
import { folderItemsQueryOptions } from "~/api/items";
import { FolderPage } from "~/components/FolderPage/FolderPage";
import { getQueryClient } from "~/integrations/tanstack-query";
import type { Route } from "./+types/folders.$folderId";

export async function clientLoader({ params: { folderId } }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  return Promise.all([
    queryClient.ensureQueryData(foldersQueryOptions),
    queryClient.ensureQueryData(folderItemsQueryOptions(folderId)),
  ]);
}

export default function FolderRoute({
  loaderData: [folders, items],
  params: { folderId },
}: Route.ComponentProps) {
  return <FolderPage folders={folders} items={items} folderId={folderId} />;
}
