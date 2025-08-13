import type { Folder, Item } from '@/app/types/models';

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

interface EagleItemResponse {
  id: string;
  name: string;
  width: number;
  height: number;
  size: number;
  btime: number;
  mtime: number;
  ext: string;
  star?: number;
  duration?: number;
  tags?: string[];
  folders?: string[];
  isDeleted?: boolean;
  url?: string;
  annotation?: string;
  modificationTime?: number;
  lastModified?: number;
  order?: Record<string, string>;
  palettes?: unknown[];
}

interface EagleItemApiResponse {
  status: string;
  data: EagleItemResponse[];
}

const EAGLE_API_BASE = 'http://localhost:41595';

export async function fetchFolderItems(
  folderId: string,
  limit = 2000
): Promise<Item[]> {
  const response = await fetch(
    `${EAGLE_API_BASE}/api/item/list?folders=${folderId}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }

  const json: EagleItemApiResponse = await response.json();

  if (json.status !== 'success') {
    throw new Error('Eagle API returned error status');
  }

  return json.data.map((item, index) => {
    let manualOrder = item.modificationTime || item.mtime;
    if (item.order?.[folderId]) {
      const parsed = parseFloat(item.order[folderId]);
      if (!Number.isNaN(parsed)) {
        manualOrder = parsed;
      }
    }

    return {
      id: item.id,
      name: item.name,
      width: item.width,
      height: item.height,
      size: item.size,
      btime: item.btime,
      mtime: item.mtime,
      ext: item.ext,
      star: item.star || 0,
      duration: item.duration || 0,
      globalOrder: index + 1,
      manualOrder,
    };
  });
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
    orderBy: eagleFolder.orderBy || 'GLOBAL',
    sortIncrease: eagleFolder.sortIncrease ?? true,
    coverItem: coverItems[0],
  };
}

export async function fetchFolders(): Promise<Folder[]> {
  const response = await fetch(`${EAGLE_API_BASE}/api/folder/list`);

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

export async function fetchLibraryPath(): Promise<string> {
  try {
    const listResponse = await fetch(`${EAGLE_API_BASE}/api/item/list?limit=1`);
    if (!listResponse.ok) {
      throw new Error(
        `Failed to fetch items: ${listResponse.status} ${listResponse.statusText}`
      );
    }

    const listData = await listResponse.json();
    if (
      listData.status !== 'success' ||
      !listData.data ||
      listData.data.length === 0
    ) {
      throw new Error('No items found in Eagle library');
    }

    const itemId = listData.data[0].id;

    const thumbnailResponse = await fetch(
      `${EAGLE_API_BASE}/api/item/thumbnail?id=${itemId}`
    );
    if (!thumbnailResponse.ok) {
      throw new Error(
        `Failed to fetch thumbnail: ${thumbnailResponse.status} ${thumbnailResponse.statusText}`
      );
    }

    const thumbnailData = await thumbnailResponse.json();
    if (thumbnailData.status !== 'success' || !thumbnailData.data) {
      throw new Error('Failed to get thumbnail path');
    }

    const thumbnailPath = thumbnailData.data;
    const libraryMatch = thumbnailPath.match(/^(.+\.library)[/\\]/);

    if (!libraryMatch) {
      throw new Error(`Invalid thumbnail path format: ${thumbnailPath}`);
    }

    return libraryMatch[1];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching library path');
  }
}