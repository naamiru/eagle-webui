import type { NextRequest } from "next/server";
import { handleImageRequest } from "../utils/image-handler";

export async function GET(request: NextRequest) {
  return handleImageRequest(request, true);
}
