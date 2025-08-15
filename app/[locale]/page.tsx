import { HomePage } from "@/components/HomePage/HomePage";
import { fetchFolders } from "@/lib/api/folder";
import { fetchLibraryPath } from "@/lib/api/library";
import { settingsService } from "@/lib/settings";

export default async function Home() {
  const [folders, libraryPath, layout, folderOrder] = await Promise.all([
    fetchFolders(),
    fetchLibraryPath(),
    settingsService.getLayout(),
    settingsService.getFolderOrder(),
  ]);

  return <HomePage folders={folders} libraryPath={libraryPath} initialLayout={layout} initialFolderOrder={folderOrder} />;
}
