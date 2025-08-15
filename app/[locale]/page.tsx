import { HomePage } from "@/components/HomePage/HomePage";
import { fetchFolders } from "@/lib/api/folder";
import { fetchLibraryPath } from "@/lib/api/library";
import { settingsService } from "@/lib/settings";

export default async function Home() {
  const [folders, libraryPath, layout] = await Promise.all([
    fetchFolders(),
    fetchLibraryPath(),
    settingsService.getLayout(),
  ]);

  return <HomePage folders={folders} libraryPath={libraryPath} initialLayout={layout} />;
}
