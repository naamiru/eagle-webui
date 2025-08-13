import type { Folder } from "~/types/models";
import { FolderList } from "../FolderList/FolderList";
import styles from "./HomePage.module.css";

interface HomePageProps {
  folders: Folder[];
  libraryPath: string;
}

export function HomePage({ folders, libraryPath }: HomePageProps) {
  return (
    <div className={styles.container}>
      <h6>フォルダー</h6>
      <FolderList folders={folders} libraryPath={libraryPath} />
    </div>
  );
}
