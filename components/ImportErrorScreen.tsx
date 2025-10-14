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

type ImportErrorScreenProps = {
  message: string;
  reason?: string;
};

type ErrorDetails = ImportErrorRetryFailure;

const LIBRARY_PATH_NOT_FOUND = "LibraryPathNotFoundError";

export function ImportErrorScreen({ message, reason }: ImportErrorScreenProps) {
  const [errorDetails, setErrorDetails] = useState<ErrorDetails>({
    message,
    reason,
  });

  useEffect(() => {
    setErrorDetails({ message, reason });
  }, [message, reason]);

  const handleRetryFailed = ({
    message: nextMessage,
    reason: nextReason,
  }: ImportErrorRetryFailure) => {
    setErrorDetails((prev) => {
      if (nextMessage.trim().length === 0) {
        return prev;
      }

      return {
        message: nextMessage,
        reason: nextReason ?? prev.reason,
      };
    });
  };

  const showSetupInstructions = errorDetails.reason === LIBRARY_PATH_NOT_FOUND;

  return (
    <Container>
      <Center h="100vh">
        <Stack align="center" gap="lg">
          <Title>Library sync failed.</Title>
          <Text c="dimmed" size="lg" ta="center">
            {errorDetails.message}
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
                  {
                    'npx @naamiru/eagle-webui --eagle-library-path "/path/to/MyPhotos.library"'
                  }
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
