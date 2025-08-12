import type { Folder } from "~/types/models";
import { FolderList } from "../FolderList/FolderList";
import styles from "./HomePage.module.css";

interface HomePageProps {
  folders: Folder[];
}

export function HomePage({ folders }: HomePageProps) {
  return (
    <div className={styles.container}>
      <h6>フォルダー</h6>
      <FolderList folders={folders} />
    </div>
  );
}
