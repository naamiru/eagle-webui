import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

async function findImageFile(
  itemDir: string,
  preferThumbnail: boolean
): Promise<string | null> {
  const files = await fs.readdir(itemDir);

  if (preferThumbnail) {
    const thumbnailFile = files.find((file) => file.includes('_thumbnail.'));
    if (thumbnailFile) {
      return path.join(itemDir, thumbnailFile);
    }
  }

  const originalFile = files.find(
    (file) => !file.includes('_thumbnail.') && file !== 'metadata.json'
  );

  return originalFile ? path.join(itemDir, originalFile) : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const libraryPath = searchParams.get('libraryPath');

  if (!id || !libraryPath) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const itemDir = path.join(libraryPath, 'images', `${id}.info`);

  try {
    const imagePath = await findImageFile(itemDir, false);

    if (!imagePath) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const imageBuffer = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    }[ext] || 'application/octet-stream';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
}