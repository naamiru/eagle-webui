import { promises as fs } from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";

async function findImageFile(
  itemDir: string,
  preferThumbnail: boolean,
): Promise<string | null> {
  const files = await fs.readdir(itemDir);
  
  if (preferThumbnail) {
    const thumbnailFile = files.find((file) => file.includes("_thumbnail."));
    if (thumbnailFile) {
      return path.join(itemDir, thumbnailFile);
    }
  }
  
  const originalFile = files.find(
    (file) => !file.includes("_thumbnail.") && file !== "metadata.json",
  );
  
  return originalFile ? path.join(itemDir, originalFile) : null;
}

async function handleImageRequest(
  req: Request,
  res: Response,
  preferThumbnail: boolean,
) {
  const { id, libraryPath } = req.query;

  if (!id || !libraryPath) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const itemDir = path.join(String(libraryPath), "images", `${id}.info`);

  try {
    const imagePath = await findImageFile(itemDir, preferThumbnail);
    
    if (!imagePath) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    res.sendFile(imagePath);
  } catch (_error) {
    res.status(404).json({ error: "Item not found" });
  }
}

export async function handleGetImage(req: Request, res: Response) {
  return handleImageRequest(req, res, false);
}

export async function handleGetThumbnail(req: Request, res: Response) {
  return handleImageRequest(req, res, true);
}
