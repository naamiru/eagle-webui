import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mime from "mime";

async function findImageFile(
  itemDir: string,
  preferThumbnail: boolean
): Promise<string | null> {
  const files = await fs.readdir(itemDir);

  if (preferThumbnail) {
    const thumbnailFile = files.find((file) => file.includes("_thumbnail."));
    if (thumbnailFile) {
      return path.join(itemDir, thumbnailFile);
    }
  }

  const originalFile = files.find(
    (file) => !file.includes("_thumbnail.") && file !== "metadata.json"
  );

  return originalFile ? path.join(itemDir, originalFile) : null;
}


export async function handleImageRequest(
  request: NextRequest,
  preferThumbnail: boolean
): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const libraryPath = searchParams.get("libraryPath");

  if (!id || !libraryPath) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const itemDir = path.join(libraryPath, "images", `${id}.info`);

  try {
    const imagePath = await findImageFile(itemDir, preferThumbnail);

    if (!imagePath) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const imageBuffer = await fs.readFile(imagePath);
    const contentType = mime.getType(imagePath) || "application/octet-stream";

    return new NextResponse(imageBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    const errorMessage = preferThumbnail
      ? "Error serving thumbnail:"
      : "Error serving image:";
    console.error(errorMessage, error);
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
}
