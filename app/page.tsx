import { FolderList } from "@/app/components/FolderList/FolderList";
import { stubFolders, stubLibraryPath } from "@/app/data/stubData";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h6>フォルダー</h6>
      <FolderList folders={stubFolders} libraryPath={stubLibraryPath} />
    </div>
  );
}
