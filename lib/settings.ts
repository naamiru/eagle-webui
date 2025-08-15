import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import envPaths from "env-paths";
import path from "path";
import fs from "fs";
import { LAYOUTS, type Layout } from "@/types/models";

interface SettingsData {
  layout: Layout;
}

class SettingsService {
  private db: Low<SettingsData> | null = null;
  private dbPath: string;

  constructor() {
    const paths = envPaths("eagle-webui");

    // Ensure the config directory exists
    if (!fs.existsSync(paths.config)) {
      fs.mkdirSync(paths.config, { recursive: true });
    }

    this.dbPath = path.join(paths.config, "settings.json");
  }

  private async initDb(): Promise<Low<SettingsData>> {
    if (this.db) return this.db;

    const adapter = new JSONFile<SettingsData>(this.dbPath);
    this.db = new Low<SettingsData>(adapter, { layout: "grid-3" });

    await this.db.read();

    return this.db;
  }

  private isValidLayout(layout: any): layout is Layout {
    return LAYOUTS.includes(layout);
  }

  async getLayout(): Promise<Layout> {
    const db = await this.initDb();
    const layout = db.data.layout;
    
    // Validate and return default if invalid
    if (!layout || !this.isValidLayout(layout)) {
      return "grid-3";
    }
    
    return layout;
  }

  async setLayout(layout: Layout): Promise<void> {
    const db = await this.initDb();
    db.data.layout = layout;
    await db.write();
  }
}

export const settingsService = new SettingsService();
