import { fetchFolders } from "~/api/folder-list";
import { HomePage } from "~/components/HomePage/HomePage";
import type { Route } from "./+types/home";

export async function loader() {
  const folders = await fetchFolders();
  return { folders };
}

export default function Home({
  loaderData: { folders },
}: Route.ComponentProps) {
  return <HomePage folders={folders} />;
}
