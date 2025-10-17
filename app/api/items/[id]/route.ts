import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getStore } from "@/data/store";

type RouteParams = Promise<{ id?: string }>;

export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParams },
) {
  const { id: itemId } = await params;

  if (!itemId) {
    return NextResponse.json(
      { error: "Missing required parameter: id" },
      { status: 400 },
    );
  }

  try {
    const store = await getStore();
    const item = store.items.get(itemId);

    if (!item || item.isDeleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[api/items/[id]] Failed to load item:", error);
    return NextResponse.json({ error: "Failed to load item" }, { status: 500 });
  }
}
