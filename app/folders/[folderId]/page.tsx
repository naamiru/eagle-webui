import { Stack, Text, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { getStore } from "@/data/store";

type FolderPageProps = {
  params: {
    folderId: string;
  };
};

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  const store = await getStore();
  const folder = store.folders.get(folderId);

  if (!folder) {
    notFound();
  }

  return (
    <>
      <AppHeader>
        <Text fw={600}>{folder.name || folder.id}</Text>
      </AppHeader>

      <Stack gap="md">
        <Title order={2}>{folder.name || folder.id}</Title>
      </Stack>
    </>
  );
}
