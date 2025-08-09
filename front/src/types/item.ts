export interface Item {
  id: string;
  width: number;
  height: number;
}

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
  items: Item[];
}

export interface Library {
  path: string;
}
