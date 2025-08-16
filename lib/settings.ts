import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import envPaths from "env-paths";
import path from "path";
import { mkdir } from "node:fs/promises";
import {
  LAYOUTS,
  type Layout,
  type Order,
  type FolderOrderBy,
  FOLDER_ORDER_BY,
} from "@/types/models";
import { revalidateTag, unstable_cache } from "next/cache";

const SETTINGS_CACHE_TAG = "settings";

interface SettingsData {
  layout: Layout;
  folderOrder: Order<FolderOrderBy>;
}

class SettingsService {
  private db: Low<SettingsData> | null = null;

  private async getDB(): Promise<Low<SettingsData>> {
    if (this.db) return this.db;

    const paths = envPaths("eagle-webui");

    // Ensure the config directory exists
    await mkdir(paths.config, { recursive: true });

    const dbPath = path.join(paths.config, "settings.json");
    const adapter = new JSONFile<SettingsData>(dbPath);
    this.db = new Low<SettingsData>(adapter, {
      layout: "grid-3",
      folderOrder: { orderBy: "DEFAULT", sortIncrease: true },
    });

    return this.db;
  }

  private isValidLayout(layout: unknown): layout is Layout {
    return LAYOUTS.includes(layout as Layout);
  }

  private isValidFolderOrderBy(orderBy: unknown): orderBy is FolderOrderBy {
    return FOLDER_ORDER_BY.includes(orderBy as FolderOrderBy);
  }

  private isValidFolderOrder(order: unknown): order is Order<FolderOrderBy> {
    if (!order || typeof order !== "object") return false;
    const obj = order as Record<string, unknown>;
    return (
      typeof obj.orderBy === "string" &&
      this.isValidFolderOrderBy(obj.orderBy) &&
      typeof obj.sortIncrease === "boolean"
    );
  }

  async getLayout(): Promise<Layout> {
    return unstable_cache(
      async () => {
        const db = await this.getDB();
        await db.read();
        const layout = db.data.layout;

        // Validate and return default if invalid
        if (!layout || !this.isValidLayout(layout)) {
          return "grid-3";
        }

        return layout;
      },
      undefined,
      { tags: [SETTINGS_CACHE_TAG] }
    )();
  }

  async setLayout(layout: Layout): Promise<void> {
    const db = await this.getDB();
    await db.update((data) => {
      data.layout = layout;
    });

    revalidateTag(SETTINGS_CACHE_TAG);
  }

  async getFolderOrder(): Promise<Order<FolderOrderBy>> {
    return unstable_cache(
      async () => {
        const db = await this.getDB();
        await db.read();
        const folderOrder = db.data.folderOrder;

        // Validate and return default if invalid
        if (!this.isValidFolderOrder(folderOrder)) {
          return { orderBy: "DEFAULT" as const, sortIncrease: true };
        }

        return folderOrder;
      },
      undefined,
      { tags: [SETTINGS_CACHE_TAG] }
    )();
  }

  async setFolderOrder(folderOrder: Order<FolderOrderBy>): Promise<void> {
    const db = await this.getDB();
    db.update((data) => {
      data.folderOrder = folderOrder;
    });

    revalidateTag(SETTINGS_CACHE_TAG);
  }
}

export const settingsService = new SettingsService();
