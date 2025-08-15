import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mime from "mime";
import etag from "etag";
import { after } from "next/server";

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

    const stats = await fs.stat(imagePath);
    const etagValue = etag(stats);
    
    // Check If-None-Match header
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etagValue) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "ETag": etagValue,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const fileHandle = await fs.open(imagePath);
    const stream = fileHandle.readableWebStream({ type: "bytes" });
    const contentType = mime.getType(imagePath) || "application/octet-stream";

    after(() => {
      fileHandle.close();
    });

    return new NextResponse(stream as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "ETag": etagValue,
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
