import type { Folder, ItemOrderBy } from "@/types/models";
import { ITEM_ORDER_BY } from "@/types/models";
import { EAGLE_API_URL } from "@/env";
import { fetchFolderItems } from "./item";

interface EagleFolder {
  id: string;
  name: string;
  description: string;
  children: EagleFolder[];
  modificationTime: number;
  tags: string[];
  extendTags: string[];
  pinyin: string;
  password: string;
  passwordTips: string;
  orderBy?: string;
  sortIncrease?: boolean;
}

interface EagleApiResponse {
  status: string;
  data: EagleFolder[];
}

function isItemOrderBy(value: unknown): value is ItemOrderBy {
  return typeof value === "string" && ITEM_ORDER_BY.includes(value as ItemOrderBy);
}

async function transformFolder(eagleFolder: EagleFolder, defaultOrder: number): Promise<Folder> {
  const [coverItems, children] = await Promise.all([
    fetchFolderItems(eagleFolder.id, {
      limit: 1,
      orderBy: eagleFolder.orderBy,
      sortIncrease: eagleFolder.sortIncrease,
    }).catch(() => []),
    Promise.all(eagleFolder.children.map((child, index) => 
      transformFolder(child, index + 1)
    )),
  ]);

  let coverItem = coverItems[0];
  
  if (!coverItem) {
    for (const child of children) {
      if (child.coverItem) {
        coverItem = child.coverItem;
        break;
      }
    }
  }

  return {
    id: eagleFolder.id,
    name: eagleFolder.name,
    children,
    orderBy: isItemOrderBy(eagleFolder.orderBy) ? eagleFolder.orderBy : "GLOBAL",
    sortIncrease: eagleFolder.sortIncrease ?? true,
    coverItem,
    defaultOrder,
    modificationTime: eagleFolder.modificationTime,
  };
}

export async function fetchFolders(): Promise<Folder[]> {
  const response = await fetch(`${EAGLE_API_URL}/api/folder/list`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch folders from Eagle API: ${response.status} ${response.statusText}`
    );
  }

  const data: EagleApiResponse = await response.json();

  if (data.status !== "success") {
    throw new Error(`Eagle API returned error status: ${data.status}`);
  }

  return Promise.all(data.data.map((folder, index) => transformFolder(folder, index + 1)));
}
