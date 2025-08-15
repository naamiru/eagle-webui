"use server";

import { settingsService } from "@/lib/settings";
import type { Layout, Order, FolderOrderBy } from "@/types/models";

export async function updateLayout(layout: Layout) {
  await settingsService.setLayout(layout);
}

export async function updateFolderOrder(folderOrder: Order<FolderOrderBy>) {
  await settingsService.setFolderOrder(folderOrder);
}
