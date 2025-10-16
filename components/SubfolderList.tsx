import { Text } from "@mantine/core";
import Link from "next/link";
import { useMemo } from "react";
import { getThumbnailUrl } from "@/utils/item";
import { computeGridStyle } from "./listGrid";
import classes from "./SubfolderList.module.css";

export type Subfolder = {
  id: string;
  name: string;
  coverId?: string;
};

type SubfolderListProps = {
  libraryPath: string;
  subfolders: Subfolder[];
  listScale: number;
};

export function SubfolderList({
  libraryPath,
  subfolders,
  listScale,
}: SubfolderListProps) {
  const listStyle = useMemo(() => computeGridStyle(listScale), [listScale]);

  if (subfolders.length === 0) {
    return null;
  }

  return (
    <div className={classes.list} style={listStyle}>
      {subfolders.map((folder) => {
        const { id, name, coverId } = folder;
        return (
          <Link key={id} href={`/folders/${id}`} className={classes.item}>
            <div className={classes.thumbnail}>
              {coverId ? (
                // biome-ignore lint/performance/noImgElement: simple thumbnail grid
                <img
                  className={classes.image}
                  src={getThumbnailUrl(coverId, libraryPath)}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className={classes.placeholder} aria-hidden="true" />
              )}
            </div>
            <Text className={classes.name} size="sm">
              {name}
            </Text>
          </Link>
        );
      })}
    </div>
  );
}
