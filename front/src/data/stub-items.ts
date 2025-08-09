import type { Folder, Item } from "~/types/item";

// New structure - only images
export const stubItems: Item[] = [
  {
    id: "item-1",
    width: 1600,
    height: 1067,
  },
  {
    id: "item-2",
    width: 1600,
    height: 953,
  },
  {
    id: "item-3",
    width: 1600,
    height: 1066,
  },
  {
    id: "item-4",
    width: 1600,
    height: 1063,
  },
  {
    id: "item-5",
    width: 1600,
    height: 1067,
  },
  {
    id: "item-6",
    width: 1600,
    height: 1067,
  },
  {
    id: "item-7",
    width: 1600,
    height: 1067,
  },
  {
    id: "item-8",
    width: 1600,
    height: 1067,
  },
  {
    id: "item-9",
    width: 1600,
    height: 2400,
  },
  {
    id: "item-10",
    width: 1600,
    height: 1067,
  },
  {
    id: "item-11",
    width: 1600,
    height: 2000,
  },
  {
    id: "item-12",
    width: 1600,
    height: 1067,
  },
];

// New structure - folders with separated children and items
export const stubFolders: Folder[] = [
  {
    id: "folder-101",
    name: "Vacation Photos",
    children: [],
    items: [
      {
        id: "item-201",
        width: 1600,
        height: 1067,
      },
      {
        id: "item-202",
        width: 1600,
        height: 1200,
      },
    ],
  },
  {
    id: "folder-102",
    name: "City Life",
    children: [
      {
        id: "folder-103",
        name: "Downtown",
        children: [],
        items: [
          {
            id: "item-301",
            width: 1600,
            height: 1067,
          },
        ],
      },
    ],
    items: [
      {
        id: "item-302",
        width: 1600,
        height: 1067,
      },
    ],
  },
  {
    id: "folder-104",
    name: "Empty Album",
    children: [],
    items: [],
  },
];
