import { List, ListItem, Stack, Text, Title } from "@mantine/core";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getStore();

  const rootFolders = Array.from(store.folders.values())
    .filter((folder) => folder.parentId === undefined)
    .sort((a, b) => a.manualOrder - b.manualOrder);

  return (
    <Stack gap="lg">
      <Title order={2}>Library folders (debug)</Title>
      {rootFolders.length === 0 ? (
        <Text c="dimmed">No folders found in the library.</Text>
      ) : (
        <List spacing="xs">
          {rootFolders.map((folder) => (
            <ListItem key={folder.id}>{folder.name || folder.id}</ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
}
