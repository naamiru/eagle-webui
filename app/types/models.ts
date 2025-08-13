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
}

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
  orderBy: string;
  sortIncrease: boolean;
  coverItem?: Item;
}

export interface Library {
  path: string;
}
