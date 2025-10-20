"use client";

import { Anchor, Center, Loader, Table, Text } from "@mantine/core";
import { IconExternalLink, IconStarFilled } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ItemDetails } from "@/data/types";
import { useLocale, useTranslations } from "@/i18n/client";
import {
  formatDateTime,
  formatDimensions,
  formatDuration,
  formatFileSize,
} from "@/utils/item-details";
import classes from "./ItemInspector.module.css";

type InspectorState =
  | { status: "loading"; item: null }
  | { status: "error"; item: null }
  | { status: "ready"; item: ItemDetails };

type ItemInspectorProps = {
  itemId: string;
};

type PropertyRow = {
  key: string;
  label: string;
  value: string;
};

export function ItemInspector({ itemId }: ItemInspectorProps) {
  const t = useTranslations("inspector");
  const locale = useLocale();
  const pathname = usePathname();
  const [state, setState] = useState<InspectorState>({
    status: "loading",
    item: null,
  });
  const controllerRef = useRef<AbortController | null>(null);

  const fetchItem = useCallback(
    async (signal: AbortSignal) => {
      try {
        const response = await fetch(`/api/items/${itemId}`, { signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as ItemDetails;
        if (signal.aborted) {
          return;
        }
        setState({ status: "ready", item: data });
      } catch (error) {
        if (signal.aborted) {
          return;
        }
        console.error(`[ItemInspector] Failed to load item ${itemId}:`, error);
        setState({ status: "error", item: null });
      }
    },
    [itemId],
  );

  const startFetch = useCallback(() => {
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setState({ status: "loading", item: null });
    void fetchItem(controller.signal);
  }, [fetchItem]);

  const getHrefWithKey = useCallback(
    (targetPathname: string, params: Record<string, string> = {}) => {
      const query = { ...params };

      if (targetPathname === pathname) {
        query.key = Date.now().toString();
      }

      return Object.keys(query).length > 0
        ? { pathname: targetPathname, query }
        : { pathname: targetPathname };
    },
    [pathname],
  );

  useEffect(() => {
    startFetch();
    return () => {
      controllerRef.current?.abort();
    };
  }, [startFetch]);

  if (state.status === "loading") {
    return (
      <Center
        style={{
          flex: 1,
          height: "calc(100vh - 2 * var(--mantine-spacing-md)",
        }}
      >
        <Loader size="sm" color="gray" />
      </Center>
    );
  }

  if (state.status === "error") {
    return null;
  }

  const item = state.item;

  const extension = (item.ext ?? "").trim().toUpperCase();

  const propertyRows: PropertyRow[] = [];

  const durationValue = formatDuration(item.duration);
  if (durationValue) {
    propertyRows.push({
      key: "duration",
      label: t("properties.duration"),
      value: durationValue,
    });
  }

  if (item.bpm > 0) {
    propertyRows.push({
      key: "bpm",
      label: t("properties.bpm"),
      value: String(item.bpm),
    });
  }

  const dimensionsValue = formatDimensions(item.width, item.height);
  if (dimensionsValue) {
    propertyRows.push({
      key: "dimensions",
      label: t("properties.dimensions"),
      value: dimensionsValue,
    });
  }

  const sizeValue = formatFileSize(item.size);
  if (sizeValue) {
    propertyRows.push({
      key: "size",
      label: t("properties.size"),
      value: sizeValue,
    });
  }

  if (extension) {
    propertyRows.push({
      key: "type",
      label: t("properties.type"),
      value: extension,
    });
  }

  const importedValue = formatDateTime(item.modificationTime, locale);
  if (importedValue) {
    propertyRows.push({
      key: "dateImported",
      label: t("properties.dateImported"),
      value: importedValue,
    });
  }

  const createdValue = formatDateTime(item.btime, locale);
  if (createdValue) {
    propertyRows.push({
      key: "dateCreated",
      label: t("properties.dateCreated"),
      value: createdValue,
    });
  }

  const modifiedValue = formatDateTime(item.mtime, locale);
  if (modifiedValue) {
    propertyRows.push({
      key: "dateModified",
      label: t("properties.dateModified"),
      value: modifiedValue,
    });
  }

  return (
    <div className={classes.root}>
      <div className={classes.section}>
        <div className={classes.subsection}>
          <Text style={{ wordBreak: "break-all" }}>{item.name}</Text>
        </div>

        {item.annotation && (
          <div className={classes.subsection}>
            <Text className={classes.sectionTitle}>
              {t("properties.annotation")}
            </Text>
            <div className={classes.annotation}>{item.annotation}</div>
          </div>
        )}

        {item.url && (
          <div className={classes.subsection}>
            <Anchor
              href={item.url}
              target="_blank"
              rel="noopener"
              className={classes.url}
            >
              {item.url}
              <IconExternalLink size={14} stroke={1.2} />
            </Anchor>
          </div>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>{t("properties.tags")}</Text>
          <div className={classes.tags}>
            {item.tags.map((tag) => (
              <Anchor
                key={tag}
                component={Link}
                href={getHrefWithKey("/", { tag })}
                underline="never"
                className={classes.tag}
              >
                {tag}
              </Anchor>
            ))}
          </div>
        </div>
      )}

      {item.folders.length > 0 && (
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>
            {t("properties.folders")}
          </Text>
          <div className={classes.tags}>
            {item.folderSummaries.map((folder) => (
              <Anchor
                key={folder.id}
                component={Link}
                href={getHrefWithKey(`/folders/${folder.id}`)}
                underline="never"
                className={classes.tag}
              >
                {folder.name}
              </Anchor>
            ))}
          </div>
        </div>
      )}

      {(item.comments?.length ?? 0) > 0 && (
        <div className={classes.section}>
          <Text className={classes.sectionTitle}>
            {t("properties.comments")}
          </Text>
          {(item.comments ?? []).map((comment) => (
            <div key={comment.id} className={classes.subsection}>
              <div className={classes.annotation}>{comment.annotation}</div>
            </div>
          ))}
        </div>
      )}

      <div className={classes.section}>
        <Text className={classes.sectionTitle}>{t("sections.properties")}</Text>
        <Table
          verticalSpacing="sm"
          horizontalSpacing="xs"
          className={classes.properties}
        >
          <tbody>
            <tr>
              <td className={classes.propertyLabel}>
                {t("properties.rating")}
              </td>
              <td className={classes.propertyValue}>
                <div className={classes.stars}>
                  {Array.from({ length: item.star }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: rating
                    <IconStarFilled key={i} size={12} color="#FFA94C" />
                  ))}
                  {Array.from({ length: 5 - item.star }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: rating
                    <IconStarFilled key={i} size={12} color="#DEE2E6" />
                  ))}
                </div>
              </td>
            </tr>
            {propertyRows.map((row) => (
              <tr key={row.key}>
                <td className={classes.propertyLabel}>{row.label}</td>
                <td className={classes.propertyValue}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
