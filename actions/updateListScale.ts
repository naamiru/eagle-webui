"use server";

import { saveListScaleSetting } from "@/data/settings";

export type UpdateListScaleResult = { ok: true } | { ok: false; error: string };

export async function updateListScale(
  scale: unknown,
): Promise<UpdateListScaleResult> {
  if (!isFiniteNumber(scale)) {
    return { ok: false, error: "INVALID_SCALE" };
  }

  try {
    await saveListScaleSetting(scale);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update the list scale setting.";
    return { ok: false, error: message };
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
