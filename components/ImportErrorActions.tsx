"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { reloadLibrary } from "@/actions/reloadLibrary";
import {
  getLibraryImportErrorMessageKey,
  type LibraryImportErrorCode,
} from "@/data/errors";
import { useTranslations } from "@/i18n/client";
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
  const t = useTranslations();

  const handleRetry = () => {
    startTransition(async () => {
      try {
        const result = await reloadLibrary();

        if (result.ok) {
          router.refresh();
          return;
        }

        const failureMessage = t(getLibraryImportErrorMessageKey(result.code));

        notifications.show({
          color: "red",
          title: t("common.notifications.librarySyncFailedTitle"),
          message: failureMessage,
        });

        onRetryFailed?.({ code: result.code });
      } catch (error) {
        const failureMessage = resolveErrorMessage(
          error,
          t(getLibraryImportErrorMessageKey("UNKNOWN_ERROR")),
        );

        notifications.show({
          color: "red",
          title: t("common.notifications.librarySyncFailedTitle"),
          message: failureMessage,
        });

        onRetryFailed?.({ code: "UNKNOWN_ERROR" });
      }
    });
  };

  return (
    <Button type="button" size="md" loading={isPending} onClick={handleRetry}>
      {isPending ? t("common.actions.retryPending") : t("common.actions.retry")}
    </Button>
  );
}
