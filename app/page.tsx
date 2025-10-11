import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";

const features = [
  {
    badge: "Library",
    title: "Browse faster",
    description:
      "Navigate your Eagle collections with Mantine-powered search, filters, and quick previews tailored for large libraries.",
  },
  {
    badge: "Review",
    title: "Curate boards anywhere",
    description:
      "Save inspiration and organize assets without leaving the browser. Drag, reorder, and review with desktop parity in mind.",
  },
  {
    badge: "Sync",
    title: "Stay in lockstep",
    description:
      "Keep changes aligned with the Eagle desktop app so teams always see the latest annotations, tags, and statuses.",
  },
];

export default function Home() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Stack gap="sm">
          <Badge size="lg" variant="light" color="yellow" w="fit-content">
            Early preview
          </Badge>
          <Title order={1}>Bring Eagle's workspace to the web</Title>
          <Text size="lg" c="dimmed">
            A focused interface for browsing, curating, and sharing your Eagle
            library from any device. Built with Mantine for rapid iteration and
            a consistent design system.
          </Text>
        </Stack>

        <Group gap="md">
          <Button size="md">Launch library</Button>
          <Button
            size="md"
            variant="light"
            component="a"
            href="https://en.eagle.cool/"
            target="_blank"
            rel="noreferrer"
          >
            Learn about Eagle
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {features.map((feature) => (
            <Card key={feature.title} radius="md" withBorder padding="lg">
              <Stack gap="sm">
                <Badge color="blue" variant="light" w="fit-content">
                  {feature.badge}
                </Badge>
                <Title order={3}>{feature.title}</Title>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Card radius="md" withBorder padding="lg">
          <Stack gap="sm">
            <Title order={3}>Help shape the roadmap</Title>
            <Text size="sm" c="dimmed">
              We are prioritizing remote sync, shared board reviews, and bulk
              metadata editing. Share use cases or pain points with the team at{" "}
              <Anchor
                component="a"
                href="mailto:feedback@eagle-webui.local"
                fw={500}
              >
                feedback@eagle-webui.local
              </Anchor>
              .
            </Text>
            <Group gap="xs">
              <Button
                variant="subtle"
                size="sm"
                component={Link}
                href="/roadmap"
              >
                View roadmap
              </Button>
              <Button
                variant="subtle"
                size="sm"
                component={Link}
                href="/changelog"
              >
                Changelog
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
