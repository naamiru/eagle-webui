"use server";

import { revalidatePath } from "next/cache";

export async function revalidateCurrentPath(pathname: string) {
  try {
    revalidatePath(pathname);
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate path:", error);
    return { success: false, error: String(error) };
  }
}
