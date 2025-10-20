"use client";

import {
  Center,
  CloseButton,
  Popover,
  SegmentedControl,
  Stack,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowsUpDown,
  IconCheck,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  FOLDER_SORT_METHODS,
  type FolderSortOptions,
  GLOBAL_SORT_METHODS,
  type GlobalSortOptions,
  type SortOptions,
} from "@/data/sort-options";
import classes from "./SortControl.module.css";

type SortControlProps<SortMethod extends string> = {
  sortMethods: readonly SortMethod[];
  value: SortOptions<SortMethod>;
  onChange: (value: SortOptions<SortMethod>) => void;
};

function SortControl<SortMethod extends string>({
  sortMethods,
  value,
  onChange,
}: SortControlProps<SortMethod>) {
  const t = useTranslations("collection.sortLabels");

  return (
    <Popover width={200} position="bottom" offset={4} withArrow shadow="md">
      <Popover.Target>
        <CloseButton icon={<IconArrowsUpDown stroke={1} />} aria-label="Sort" />
      </Popover.Target>
      <Popover.Dropdown className={classes.dropdown}>
        <SegmentedControl
          className={classes.sortAscending}
          fullWidth
          size="xs"
          value={String(value.sortIncrease)}
          onChange={(nextValue) => {
            onChange({
              ...value,
              sortIncrease: nextValue === "true",
            });
          }}
          data={[
            {
              value: "true",
              label: (
                <Center>
                  <IconSortAscending
                    stroke={1.2}
                    size="20"
                    style={{ display: "block" }}
                  />
                </Center>
              ),
            },
            {
              value: "false",
              label: (
                <Center>
                  <IconSortDescending
                    stroke={1.2}
                    size="20"
                    style={{ display: "block" }}
                  />
                </Center>
              ),
            },
          ]}
        />
        <Stack gap={0}>
          {sortMethods.map((sortMethod) => (
            <UnstyledButton
              key={sortMethod}
              className={classes.item}
              data-active={value.orderBy === sortMethod}
              onClick={() => {
                if (value.orderBy === sortMethod) {
                  return;
                }

                onChange({
                  ...value,
                  orderBy: sortMethod,
                });
              }}
            >
              <div className={classes.itemLabel}>
                {t(sortMethod as Parameters<typeof t>[0])}
              </div>
              {value.orderBy === sortMethod && (
                <IconCheck stroke={1.5} size="16" />
              )}
            </UnstyledButton>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

type FolderSortControlProps = {
  value: FolderSortOptions;
  onChange: (value: FolderSortOptions) => void;
};

export function FolderSortControl({ value, onChange }: FolderSortControlProps) {
  return (
    <SortControl
      sortMethods={FOLDER_SORT_METHODS}
      value={value}
      onChange={onChange}
    />
  );
}

type GlobalSortControlProps = {
  value: GlobalSortOptions;
  onChange: (value: GlobalSortOptions) => void;
};

export function GlobalSortControl({ value, onChange }: GlobalSortControlProps) {
  return (
    <SortControl
      sortMethods={GLOBAL_SORT_METHODS}
      value={value}
      onChange={onChange}
    />
  );
}
