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

function transformFolder(eagleFolder: EagleFolder): Folder {
  return {
    id: eagleFolder.id,
    name: eagleFolder.name,
    children: eagleFolder.children.map(transformFolder),
    orderBy: eagleFolder.orderBy || "GLOBAL",
    sortIncrease: eagleFolder.sortIncrease ?? true,
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

  return data.data.map(transformFolder);
}
