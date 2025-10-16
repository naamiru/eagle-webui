"use client";

import { Container, Select, Text } from "@mantine/core";
import AppHeader from "@/components/AppHeader";

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
];

export default function SettingsPage() {
  return (
    <>
      <AppHeader>
        <Text>Settings</Text>
      </AppHeader>

      <Container size="xs" mt="lg">
        <Select
          label="Display language"
          data={LANGUAGE_OPTIONS}
          defaultValue="en"
          allowDeselect={false}
        />
      </Container>
    </>
  );
}
