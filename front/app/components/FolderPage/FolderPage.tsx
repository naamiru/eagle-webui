import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { folderItemsQueryOptions } from "~/api/items";
import { FolderList } from "~/components/FolderList/FolderList";
import Icon from "~/components/Icon/Icon";
import { ItemList } from "~/components/ItemList/ItemList";
import styles from "~/styles/_index.module.css";
import type { Folder } from "~/types/item";
import pageStyles from "./FolderPage.module.css";

interface FolderPageProps {
  folders: Folder[];
  folderId: string;
}

interface FolderHeaderProps {
  folderName: string;
  parentFolderId?: string;
}

export function FolderPage({ folders, folderId }: FolderPageProps) {
  const currentFolder = findFolderById(folders, folderId);
  const parentFolder = findParentFolder(folders, folderId);

  if (!currentFolder) {
    throw new Error(`Folder with ID ${folderId} not found`);
  }

  const { data: items, error } = useQuery(folderItemsQueryOptions(folderId));

  if (error) throw error;

  return (
    <>
      <FolderHeader
        folderName={currentFolder.name}
        parentFolderId={parentFolder?.id}
      />
      <div className={styles.container}>
        {currentFolder.children.length > 0 && (
          <>
            <h6 className={styles.folderListTitle}>サブフォルダー</h6>
            <FolderList folders={currentFolder.children} />
            <h6 className={styles.itemListTitle}>内容</h6>
          </>
        )}
        {items && <ItemList items={items} />}
      </div>
    </>
  );
}

function FolderHeader({ folderName, parentFolderId }: FolderHeaderProps) {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`${pageStyles.header} ${isStuck ? pageStyles.stuck : ""}`}
    >
      <nav>
        <ul>
          <li>
            <Link
              to={parentFolderId ? `/folders/${parentFolderId}` : "/"}
              aria-label="戻る"
            >
              <Icon name="arrowLeft" size={20} aria-label="Back" />
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

function findFolderById(
  folders: Folder[],
  targetId: string,
): Folder | undefined {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return folder;
    }
    if (folder.children && folder.children.length > 0) {
      const found = findFolderById(folder.children, targetId);
      if (found) {
        return found;
      }
    }
  }
}

function findParentFolder(
  folders: Folder[],
  targetId: string,
  parent: Folder | null = null,
): Folder | null {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return parent;
    }
    if (folder.children && folder.children.length > 0) {
      const found = findParentFolder(folder.children, targetId, folder);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
