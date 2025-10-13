"use client";

import { Item as GalleryItem } from "react-photoswipe-gallery";
import type { Item } from "@/data/types";
import { getImageUrl, getThumbnailUrl } from "@/utils/item";
import classes from "./ItemItem.module.css";

interface ImageItemProps {
  image: Item;
  libraryPath: string;
}

export function ItemItem({ image, libraryPath }: ImageItemProps) {
  const thumbnailUrl = getThumbnailUrl(image.id, libraryPath);
  const originalUrl = getImageUrl(image.id, libraryPath);

  return (
    <GalleryItem
      original={originalUrl}
      thumbnail={thumbnailUrl}
      width={image.width}
      height={image.height}
      caption={image.name}
      cropped
    >
      {({ ref, open }) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: use photoswipe
        // biome-ignore lint/performance/noImgElement: use photoswipe
        <img
          ref={ref}
          onClick={open}
          src={thumbnailUrl}
          alt={image.name}
          className={classes.thumbnail}
          width={image.width}
        />
      )}
    </GalleryItem>
  );
}
