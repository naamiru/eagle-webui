import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import envPaths from "env-paths";
import path from "path";
import { mkdir } from "node:fs/promises";
import { LAYOUTS, type Layout } from "@/types/models";

interface SettingsData {
  layout: Layout;
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
    this.db = new Low<SettingsData>(adapter, { layout: "grid-3" });

    await this.db.read();

    return this.db;
  }

  private isValidLayout(layout: unknown): layout is Layout {
    return LAYOUTS.includes(layout as Layout);
  }

  async getLayout(): Promise<Layout> {
    const db = await this.getDB();
    const layout = db.data.layout;

    // Validate and return default if invalid
    if (!layout || !this.isValidLayout(layout)) {
      return "grid-3";
    }

    return layout;
  }

  async setLayout(layout: Layout): Promise<void> {
    const db = await this.getDB();
    db.data.layout = layout;
    await db.write();
  }
}

export const settingsService = new SettingsService();
