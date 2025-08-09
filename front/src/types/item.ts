export interface Item {
  id: number;
  original: string;
  thumbnail: string;
  width: number;
  height: number;
}

export interface Folder {
  id: number;
  name: string;
  children: Folder[];
  items: Item[];
}
