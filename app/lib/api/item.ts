import type { Item } from '@/app/types/models';
import { EAGLE_API_URL } from '@/app/constants';

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

export async function fetchFolderItems(
  folderId: string,
  options: { limit?: number; orderBy?: string; sortIncrease?: boolean } = {}
): Promise<Item[]> {
  const { limit = 2000, orderBy, sortIncrease } = options;
  const params = new URLSearchParams({
    folders: folderId,
    limit: limit.toString(),
  });
  
  if (orderBy || sortIncrease !== undefined) {
    let orderByParam = orderBy || 'GLOBAL';
    if (sortIncrease === false && !orderByParam.startsWith('-')) {
      orderByParam = `-${orderByParam}`;
    } else if (sortIncrease === true && orderByParam.startsWith('-')) {
      orderByParam = orderByParam.slice(1);
    }
    params.append('orderBy', orderByParam);
  }
  
  const response = await fetch(
    `${EAGLE_API_URL}/api/item/list?${params.toString()}`
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