import { Outlet } from "react-router";
import { fetchFolders } from "~/api/folder-list";
import { fetchLibraryPath } from "~/api/library";

export async function loader() {
  const [folders, libraryPath] = await Promise.all([
    fetchFolders(),
    fetchLibraryPath(),
  ]);

  return {
    folders,
    libraryPath,
  };
}

export default function AppLayout() {
  return <Outlet />;
}
