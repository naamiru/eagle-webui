import { Center, Container, Stack, Text, Title } from "@mantine/core";

export default function NotFound() {
  return (
    <Container>
      <Center h="100vh">
        <Stack align="center" gap="lg">
          <Title>404 Not Found</Title>
          <Text c="dimmed" size="lg" ta="center">
            Page you are trying to open does not exist.
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
