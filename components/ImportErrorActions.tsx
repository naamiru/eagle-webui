"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { reloadLibrary } from "@/actions/reloadLibrary";
import {
  getLibraryImportErrorMessage,
  type LibraryImportErrorCode,
} from "@/data/errors";
import { resolveErrorMessage } from "@/utils/resolve-error-message";

export type ImportErrorRetryFailure = {
  code: LibraryImportErrorCode;
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
        const result = await reloadLibrary();

        if (result.ok) {
          router.refresh();
          return;
        }

        const failureMessage = getLibraryImportErrorMessage(result.code);

        notifications.show({
          color: "red",
          title: "Library sync failed",
          message: failureMessage,
        });

        onRetryFailed?.({ code: result.code });
      } catch (error) {
        const failureMessage = resolveErrorMessage(
          error,
          getLibraryImportErrorMessage("UNKNOWN_ERROR"),
        );

        notifications.show({
          color: "red",
          title: "Library sync failed",
          message: failureMessage,
        });

        onRetryFailed?.({ code: "UNKNOWN_ERROR" });
      }
    });
  };

  return (
    <Button type="button" size="md" loading={isPending} onClick={handleRetry}>
      {isPending ? "Retrying..." : "Retry sync"}
    </Button>
  );
}
