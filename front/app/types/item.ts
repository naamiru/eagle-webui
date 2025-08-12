export interface Item {
  id: string;
  name: string;
  width: number;
  height: number;
  size: number;
  btime: number;
  mtime: number;
  ext: string;
  star: number;
  duration: number;
  manualOrder: number;
  globalOrder: number;
}

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
  items: Item[];
  coverImage?: Item;
  orderBy: string;
  sortIncrease: boolean;
}

export interface Library {
  path: string;
}
