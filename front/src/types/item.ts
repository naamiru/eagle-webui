export interface ItemData {
  id: number;
  original: string;
  thumbnail: string;
  width: number;
  height: number;
}

export interface FolderData {
  id: number;
  name: string;
  children: FolderData[];
  items: ItemData[];
}
