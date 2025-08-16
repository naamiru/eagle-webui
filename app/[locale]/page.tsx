import { HomePage } from "@/components/HomePage/HomePage";
import { fetchFolders } from "@/lib/api/folder";
import { fetchLibraryPath } from "@/lib/api/library";
import { settingsService } from "@/lib/settings";
import { sortFolders } from "@/utils/folder";

interface HomePageProps {
  searchParams: Promise<{ limit?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const { limit: limitParam } = await searchParams;

  const [allFolders, libraryPath, layout, folderOrder] = await Promise.all([
    fetchFolders(),
    fetchLibraryPath(),
    settingsService.getLayout(),
    settingsService.getFolderOrder(),
  ]);

  // Sort folders according to the folder order
  const sortedFolders = sortFolders(
    allFolders,
    folderOrder.orderBy,
    folderOrder.sortIncrease
  );

  // Get limit from URL parameter or use default (minimum 100)
  const limitNumber = limitParam ? parseInt(limitParam, 10) : 100;
  const initialFoldersPerPage = Math.max(100, limitNumber);

  const folders = sortedFolders.slice(0, initialFoldersPerPage);
  const hasMore = sortedFolders.length > initialFoldersPerPage;

  return (
    <HomePage
      folders={folders}
      hasMore={hasMore}
      libraryPath={libraryPath}
      initialLayout={layout}
      initialFolderOrder={folderOrder}
    />
  );
}
