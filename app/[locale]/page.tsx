import { HomePage } from "@/components/HomePage/HomePage";
import { fetchFolders } from "@/lib/api/folder";
import { fetchLibraryPath } from "@/lib/api/library";
import { settingsService } from "@/lib/settings";
import { cacheControlWithHeaders } from "@/utils/fetch";

export default async function Home() {
  const fetchOptions = await cacheControlWithHeaders();

  const [folders, libraryPath, layout, folderOrder] = await Promise.all([
    fetchFolders({ fetchOptions }),
    fetchLibraryPath({ fetchOptions }),
    settingsService.getLayout(),
    settingsService.getFolderOrder(),
  ]);

  return (
    <HomePage
      folders={folders}
      libraryPath={libraryPath}
      initialLayout={layout}
      initialFolderOrder={folderOrder}
    />
  );
}
