"use client";

import { useRef, useState, useEffect } from "react";
import { Grid } from "react-bootstrap-icons";
import { useTranslations } from "next-intl";
import type { Layout } from "@/components/ItemList/ItemList";
import styles from "./LayoutDropdown.module.css";

const LAYOUTS: Layout[] = ["grid-3", "grid-4", "grid-6", "grid-8"];

// Grid column counts based on layout and screen width
const GRID_COLUMNS = {
  "grid-3": { default: 6, 1024: 5, 768: 4, 576: 3 },
  "grid-4": { default: 8, 1024: 6, 768: 5, 576: 4 },
  "grid-6": { default: 10, 1024: 8, 768: 7, 576: 6 },
  "grid-8": { default: 12, 1024: 10, 768: 9, 576: 8 },
};

interface LayoutDropdownProps {
  value: Layout;
  onChange: (layout: Layout) => void;
}

export function LayoutDropdown({ value, onChange }: LayoutDropdownProps) {
  const t = useTranslations();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Dynamic column count
  const [columnCounts, setColumnCounts] = useState<Record<Layout, number>>(
    () => {
      // Initial values for SSR
      return {
        "grid-3": 3,
        "grid-4": 4,
        "grid-6": 6,
        "grid-8": 8,
      };
    }
  );

  useEffect(() => {
    const updateColumnCounts = () => {
      const width = window.innerWidth;
      const newCounts: Record<Layout, number> = {} as Record<Layout, number>;

      for (const layout of LAYOUTS) {
        const config = GRID_COLUMNS[layout];
        if (width <= 576) {
          newCounts[layout] = config[576];
        } else if (width <= 768) {
          newCounts[layout] = config[768];
        } else if (width <= 1024) {
          newCounts[layout] = config[1024];
        } else {
          newCounts[layout] = config.default;
        }
      }

      setColumnCounts(newCounts);
    };

    updateColumnCounts();
    window.addEventListener("resize", updateColumnCounts);
    return () => window.removeEventListener("resize", updateColumnCounts);
  }, []);

  const handleClick = (layout: Layout) => {
    onChange(layout);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details ref={detailsRef} className={`dropdown ${styles.layout}`}>
      <summary>
        <Grid size={20} />
      </summary>
      <ul dir="rtl">
        {LAYOUTS.map((layout) => (
          <li
            key={layout}
            className={layout === value ? styles.active : ""}
            dir="ltr"
          >
            <a
              onClick={() => {
                handleClick(layout);
              }}
            >
              {t("layout.grid", { count: columnCounts[layout] })}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
