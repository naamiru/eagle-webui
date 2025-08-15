"use client";

import { Layout } from "@/types/models";
import { useState, useTransition } from "react";
import { LayoutDropdown } from "@/components/FolderPage/LayoutDropdown/LayoutDropdown";
import { updateLayout } from "@/actions/settings";
import { useRouter } from "next/navigation";
import styles from "./HomePageHeader.module.css";

interface HomePageHeaderProps {
  initialLayout: Layout;
}

export default function HomePageHeader({ initialLayout }: HomePageHeaderProps) {
  const [layout, setLayout] = useState(initialLayout);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    startTransition(() => {
      updateLayout(newLayout).then(() => {
        router.refresh();
      });
    });
  };

  return (
    <header className={styles.header}>
      <nav>
        <ul></ul>
        <ul></ul>
        <ul>
          <li>
            <LayoutDropdown value={layout} onChange={handleLayoutChange} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
