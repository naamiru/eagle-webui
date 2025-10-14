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
  getLibraryImportErrorMessage,
  type LibraryImportErrorCode,
} from "@/data/errors";

type ImportErrorScreenProps = {
  code: LibraryImportErrorCode;
};

const LIBRARY_PATH_NOT_FOUND: LibraryImportErrorCode = "LIBRARY_PATH_NOT_FOUND";

export function ImportErrorScreen({ code }: ImportErrorScreenProps) {
  const [errorCode, setErrorCode] = useState<LibraryImportErrorCode>(code);

  useEffect(() => {
    setErrorCode(code);
  }, [code]);

  const handleRetryFailed = ({ code: nextCode }: ImportErrorRetryFailure) => {
    setErrorCode(nextCode);
  };

  const message = getLibraryImportErrorMessage(errorCode);
  const showSetupInstructions = errorCode === LIBRARY_PATH_NOT_FOUND;

  return (
    <Container>
      <Center h="100vh">
        <Stack align="center" gap="lg">
          <Title>Library sync failed.</Title>
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
                  Make sure that Eagle and the Eagle WebUI server are both
                  running on the same machine. <br />
                  Alternatively, start the server with an explicit library path,
                  such as:
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
                  npx @naamiru/eagle-webui --eagle-library-path
                  "/path/to/MyPhotos.library"
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
