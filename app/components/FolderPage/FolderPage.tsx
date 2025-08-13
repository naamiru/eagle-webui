import { useEffect, useState } from "react";
import { ChevronLeft } from "react-bootstrap-icons";
import { Link } from "react-router";
import type { Folder, Item } from "~/types/models";
import { sortItems } from "~/utils/folder";
import { FolderList } from "../FolderList/FolderList";
import { ItemList } from "../ItemList/ItemList";
import styles from "./FolderPage.module.css";

interface FolderPageProps {
  folder: Folder;
  parentFolder?: Folder;
  items: Item[];
  libraryPath: string;
}

export function FolderPage({
  folder,
  parentFolder,
  items,
  libraryPath,
}: FolderPageProps) {
  const sortedItems = sortItems(items, folder.orderBy, folder.sortIncrease);

  return (
    <div className={styles.container}>
      <FolderPageHeader
        folderName={folder.name}
        parentFolderId={parentFolder?.id}
      />
      {folder.children.length > 0 && (
        <>
          <h6>サブフォルダー</h6>
          <FolderList folders={folder.children} libraryPath={libraryPath} />
          <h6>内容</h6>
        </>
      )}
      <ItemList items={sortedItems} libraryPath={libraryPath} />
    </div>
  );
}

interface FolderPageHeaderProps {
  folderName: string;
  parentFolderId?: string;
}

function FolderPageHeader({
  folderName,
  parentFolderId,
}: FolderPageHeaderProps) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isStuck ? styles.stuck : ""}`}>
      <nav>
        <ul>
          <li>
            <Link
              to={parentFolderId ? `/folders/${parentFolderId}` : "/"}
              aria-label="戻る"
            >
              <ChevronLeft size={20} />
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <strong>{folderName}</strong>
          </li>
        </ul>
        <ul>
          <li></li>
        </ul>
      </nav>
    </header>
  );
}
