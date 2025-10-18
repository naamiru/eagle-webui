"use client";

import { Loader, Text, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { reloadLibrary } from "@/actions/reloadLibrary";
import { getLibraryImportErrorMessageKey } from "@/data/errors";
import { useTranslations } from "@/i18n/client";
import { resolveErrorMessage } from "@/utils/resolve-error-message";
import classes from "./ReloadButton.module.css";

type ReloadButtonProps = {
  libraryName: string;
};

export function ReloadButton({ libraryName }: ReloadButtonProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isReloading, startReload] = useTransition();

  const reloadLabel = isReloading
    ? t("common.library.reloading")
    : t("common.library.reload");

  const handleReload = () => {
    startReload(async () => {
      try {
        const result = await reloadLibrary();

        if (result.ok) {
          router.refresh();
          return;
        }

        notifications.show({
          color: "red",
          title: t("common.notifications.librarySyncFailedTitle"),
          message: t(getLibraryImportErrorMessageKey(result.code)),
        });
      } catch (error) {
        notifications.show({
          color: "red",
          title: t("common.notifications.librarySyncFailedTitle"),
          message: resolveErrorMessage(
            error,
            t("common.notifications.librarySyncFailedMessage"),
          ),
        });
      }
    });
  };

  return (
    <UnstyledButton
      className={classes.button}
      aria-label={reloadLabel}
      onClick={handleReload}
      disabled={isReloading}
    >
      <Text size="sm" fw={600}>
        {libraryName}
      </Text>
      {isReloading ? (
        <Loader size={16} color="gray" />
      ) : (
        <IconRefresh size={16} stroke={1.2} />
      )}
    </UnstyledButton>
  );
}
