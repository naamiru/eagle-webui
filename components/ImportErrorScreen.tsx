"use client";

import {
  Box,
  Center,
  Container,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  ImportErrorActions,
  type ImportErrorRetryFailure,
} from "@/components/ImportErrorActions";
import {
  getLibraryImportErrorMessageKey,
  type LibraryImportErrorCode,
} from "@/data/errors";
import { useTranslations } from "@/i18n/client";

type ImportErrorScreenProps = {
  code: LibraryImportErrorCode;
};

const LIBRARY_PATH_NOT_FOUND: LibraryImportErrorCode = "LIBRARY_PATH_NOT_FOUND";

export function ImportErrorScreen({ code }: ImportErrorScreenProps) {
  const [errorCode, setErrorCode] = useState<LibraryImportErrorCode>(code);
  const t = useTranslations();

  useEffect(() => {
    setErrorCode(code);
  }, [code]);

  const handleRetryFailed = ({ code: nextCode }: ImportErrorRetryFailure) => {
    setErrorCode(nextCode);
  };

  const message = t(getLibraryImportErrorMessageKey(errorCode));
  const showSetupInstructions = errorCode === LIBRARY_PATH_NOT_FOUND;

  return (
    <Container>
      <Center h="100vh">
        <Stack align="center" gap="lg">
          <Title>{t("import.error.title")}</Title>
          <Text c="dimmed" size="lg" ta="center">
            {message}
          </Text>
          {showSetupInstructions && (
            <Paper
              radius="md"
              p="md"
              withBorder
              bg="var(--mantine-color-gray-0)"
            >
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  {t.rich("import.error.instructions", {
                    br: () => <br />,
                  })}
                </Text>
                <Text
                  component="code"
                  size="sm"
                  style={{
                    display: "block",
                    whiteSpace: "normal",
                    wordBreak: "break-all",
                    fontFamily: "var(--mantine-font-family-monospace)",
                  }}
                >
                  {t("import.error.commandExample")}
                </Text>
              </Stack>
            </Paper>
          )}
          <Box mt="md">
            <ImportErrorActions onRetryFailed={handleRetryFailed} />
          </Box>
        </Stack>
      </Center>
    </Container>
  );
}
