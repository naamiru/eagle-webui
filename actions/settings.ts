"use server";

import { settingsService } from "@/lib/settings";
import type { Layout } from "@/types/models";

export async function updateLayout(layout: Layout) {
  await settingsService.setLayout(layout);
}
