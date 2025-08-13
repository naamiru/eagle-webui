import { FolderList } from "@/app/components/FolderList/FolderList";
import { fetchFolders, fetchLibraryPath } from "@/app/lib/api";
import styles from "./page.module.css";

export default async function Home() {
  const [folders, libraryPath] = await Promise.all([
    fetchFolders(),
    fetchLibraryPath(),
  ]);

  return (
    <div className={styles.container}>
      <h6>フォルダー</h6>
      <FolderList folders={folders} libraryPath={libraryPath} />
    </div>
  );
}
