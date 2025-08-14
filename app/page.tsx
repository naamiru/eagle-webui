import { FolderList } from "@/app/components/FolderList/FolderList";
import { fetchFolders } from "@/app/lib/api/folder";
import { fetchLibraryPath } from "@/app/lib/api/library";
import { getTranslations } from "next-intl/server";
import styles from "./page.module.css";

export default async function Home() {
  const [folders, libraryPath] = await Promise.all([
    fetchFolders(),
    fetchLibraryPath(),
  ]);

  const t = await getTranslations();

  return (
    <div className={styles.container}>
      <h6>{t("navigation.folders")}</h6>
      <FolderList folders={folders} libraryPath={libraryPath} />
    </div>
  );
}
