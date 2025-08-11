export interface Item {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
  items: Item[];
  coverImage?: Item;
}

export interface Library {
  path: string;
}
