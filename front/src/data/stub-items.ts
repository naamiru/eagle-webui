import type { FolderData, ItemData } from "~/types/item";

// New structure - only images
export const stubItems: ItemData[] = [
  {
    id: 1,
    original:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
    width: 1600,
    height: 1067,
  },
  {
    id: 2,
    original:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300",
    width: 1600,
    height: 953,
  },
  {
    id: 3,
    original:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300",
    width: 1600,
    height: 1066,
  },
  {
    id: 4,
    original:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300",
    width: 1600,
    height: 1063,
  },
  {
    id: 5,
    original:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300",
    width: 1600,
    height: 1067,
  },
  {
    id: 6,
    original:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300",
    width: 1600,
    height: 1067,
  },
  {
    id: 7,
    original:
      "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=300",
    width: 1600,
    height: 1067,
  },
  {
    id: 8,
    original:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300",
    width: 1600,
    height: 1067,
  },
  {
    id: 9,
    original:
      "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300",
    width: 1600,
    height: 2400,
  },
  {
    id: 10,
    original:
      "https://images.unsplash.com/photo-1475189778702-5ec9941484ae?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1475189778702-5ec9941484ae?w=300",
    width: 1600,
    height: 1067,
  },
  {
    id: 11,
    original:
      "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=300",
    width: 1600,
    height: 2000,
  },
  {
    id: 12,
    original:
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1600",
    thumbnail:
      "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=300",
    width: 1600,
    height: 1067,
  },
];

// New structure - folders with separated children and items
export const stubFolders: FolderData[] = [
  {
    id: 101,
    name: "Vacation Photos",
    children: [],
    items: [
      {
        id: 201,
        original:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600",
        thumbnail:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
        width: 1600,
        height: 1067,
      },
      {
        id: 202,
        original:
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600",
        thumbnail:
          "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300",
        width: 1600,
        height: 1200,
      },
    ],
  },
  {
    id: 102,
    name: "City Life",
    children: [
      {
        id: 103,
        name: "Downtown",
        children: [],
        items: [
          {
            id: 301,
            original:
              "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600",
            thumbnail:
              "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300",
            width: 1600,
            height: 1067,
          },
        ],
      },
    ],
    items: [
      {
        id: 302,
        original:
          "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600",
        thumbnail:
          "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300",
        width: 1600,
        height: 1067,
      },
    ],
  },
  {
    id: 104,
    name: "Empty Album",
    children: [],
    items: [],
  },
];
