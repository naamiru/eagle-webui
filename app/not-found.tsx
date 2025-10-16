import { Center, Container, Stack, Text, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <Container>
      <Center h="100vh">
        <Stack align="center" gap="lg">
          <Title>{t("notFound.title")}</Title>
          <Text c="dimmed" size="lg" ta="center">
            {t("notFound.description")}
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
