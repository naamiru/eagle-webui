import { useRouteLoaderData } from "react-router";
import { HomePage } from "~/components/HomePage/HomePage";
import type { loader as appLoader } from "./app";

export default function Home() {
  const data = useRouteLoaderData<typeof appLoader>("app");

  if (!data) {
    throw new Error("App layout data not available");
  }

  return <HomePage folders={data.folders} libraryPath={data.libraryPath} />;
}
