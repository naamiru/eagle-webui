import { createFileRoute } from "@tanstack/react-router";
import { FolderList } from "~/components/FolderList/FolderList";
import { ItemList } from "~/components/ItemList/ItemList";
import { stubFolders, stubItems } from "~/data/stub-items";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={styles.container}>
      <FolderList folders={stubFolders} />
      <ItemList items={stubItems} />
    </div>
  );
}
