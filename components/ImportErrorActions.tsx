"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { reloadLibrary } from "@/actions/reloadLibrary";
import { resolveErrorMessage } from "@/utils/resolve-error-message";

export type ImportErrorRetryFailure = {
  message: string;
  reason?: string;
};

type ImportErrorActionsProps = {
  onRetryFailed?: (details: ImportErrorRetryFailure) => void;
};

export function ImportErrorActions({ onRetryFailed }: ImportErrorActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(async () => {
      try {
        await reloadLibrary();
        router.refresh();
      } catch (error) {
        const failureMessage = resolveErrorMessage(
          error,
          "Could not retry sync. Please try again.",
        );

        const reason =
          error instanceof Error && typeof error.name === "string"
            ? error.name
            : undefined;

        notifications.show({
          color: "red",
          title: "Library sync failed",
          message: failureMessage,
        });

        onRetryFailed?.({ message: failureMessage, reason });
      }
    });
  };

  return (
    <Button type="button" size="md" loading={isPending} onClick={handleRetry}>
      {isPending ? "Retrying..." : "Retry sync"}
    </Button>
  );
}
