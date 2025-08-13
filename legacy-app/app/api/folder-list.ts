import { fetchFolderItems } from "~/api/item-list";
import type { Folder } from "~/types/models";

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

async function transformFolder(eagleFolder: EagleFolder): Promise<Folder> {
  const [coverItems, children] = await Promise.all([
    fetchFolderItems(eagleFolder.id, 1).catch(() => []),
    Promise.all(eagleFolder.children.map(transformFolder)),
  ]);

  return {
    id: eagleFolder.id,
    name: eagleFolder.name,
    children,
    orderBy: eagleFolder.orderBy || "GLOBAL",
    sortIncrease: eagleFolder.sortIncrease ?? true,
    coverItem: coverItems[0],
  };
}

export async function fetchFolders(): Promise<Folder[]> {
  const response = await fetch("http://localhost:41595/api/folder/list");

  if (!response.ok) {
    throw new Response(`Failed to fetch folders from Eagle API`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  const data: EagleApiResponse = await response.json();

  if (data.status !== "success") {
    throw new Response(`Eagle API returned error status: ${data.status}`, {
      status: 500,
    });
  }

  return Promise.all(data.data.map(transformFolder));
}
