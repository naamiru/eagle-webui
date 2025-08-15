import { FolderList } from "@/components/FolderList/FolderList";
import { Folder } from "@/types/models";
import styles from "./HomePage.module.css";
import { settingsService } from "@/lib/settings";
import HomePageHeader from "./HomePageHeader";

interface HomePageProps {
  folders: Folder[];
  libraryPath: string;
}

export async function HomePage({ folders, libraryPath }: HomePageProps) {
  const layout = await settingsService.getLayout();

  return (
    <div className={styles.container}>
      <HomePageHeader initialLayout={layout} />
      <FolderList folders={folders} libraryPath={libraryPath} layout={layout} />
    </div>
  );
}
