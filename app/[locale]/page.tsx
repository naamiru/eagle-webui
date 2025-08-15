import { HomePage } from "@/components/HomePage/HomePage";
import { fetchFolders } from "@/lib/api/folder";
import { fetchLibraryPath } from "@/lib/api/library";

export default async function Home() {
  const [folders, libraryPath] = await Promise.all([
    fetchFolders(),
    fetchLibraryPath(),
  ]);

  return <HomePage folders={folders} libraryPath={libraryPath} />;
}
