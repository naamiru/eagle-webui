import { foldersQueryOptions } from "~/api/folders";
import { folderItemsQueryOptions } from "~/api/items";
import { FolderPage } from "~/components/FolderPage/FolderPage";
import { getQueryClient } from "~/integrations/tanstack-query";
import type { Route } from "./+types/folders.$folderId";

export async function clientLoader({ params: { folderId } }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(folderItemsQueryOptions(folderId));
  return await queryClient.ensureQueryData(foldersQueryOptions);
}

export default function FolderRoute({
  loaderData: folders,
  params: { folderId },
}: Route.ComponentProps) {
  return <FolderPage folders={folders} folderId={folderId} />;
}
