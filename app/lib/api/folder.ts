import type { Folder } from '@/app/types/models';
import { EAGLE_API_URL } from '@/app/constants';
import { fetchFolderItems } from './item';

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
    fetchFolderItems(eagleFolder.id, { 
      limit: 1, 
      orderBy: eagleFolder.orderBy,
      sortIncrease: eagleFolder.sortIncrease
    }).catch(() => []),
    Promise.all(eagleFolder.children.map(transformFolder)),
  ]);

  return {
    id: eagleFolder.id,
    name: eagleFolder.name,
    children,
    orderBy: eagleFolder.orderBy || 'GLOBAL',
    sortIncrease: eagleFolder.sortIncrease ?? true,
    coverItem: coverItems[0],
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

  if (data.status !== 'success') {
    throw new Error(`Eagle API returned error status: ${data.status}`);
  }

  return Promise.all(data.data.map(transformFolder));
}