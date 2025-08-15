"use client";

import { FolderList } from "@/components/FolderList/FolderList";
import { Folder, Layout } from "@/types/models";
import styles from "./HomePage.module.css";
import { useState, useTransition } from "react";
import { updateLayout } from "@/actions/settings";
import PageHeader from "../PageHeader/PageHeader";

interface HomePageProps {
  folders: Folder[];
  libraryPath: string;
  initialLayout: Layout;
}

export function HomePage({
  folders,
  libraryPath,
  initialLayout,
}: HomePageProps) {
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [, startTransition] = useTransition();

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    startTransition(() => {
      updateLayout(newLayout);
    });
  };

  return (
    <div className={styles.container}>
      <PageHeader
        order={{ orderBy: "MANUAL", sortIncrease: true }}
        onChangeOrder={() => {}}
        availableOrderBys={["MANUAL"]}
        layout={layout}
        onChangeLayout={handleLayoutChange}
      />
      <FolderList folders={folders} libraryPath={libraryPath} layout={layout} />
    </div>
  );
}
