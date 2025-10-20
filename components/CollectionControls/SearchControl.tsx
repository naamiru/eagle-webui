"use client";

import { CloseButton, Popover, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconCircleXFilled,
  IconFilter,
  IconFilterFilled,
  IconSearch,
} from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "@/i18n/client";
import classes from "./SearchControl.module.css";

type SearchControlProps = {
  search: string;
  mobile?: boolean;
};

export function SearchControl({ search, mobile = false }: SearchControlProps) {
  const [value, setValue] = useState(search);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("collection.controls");
  const lastAppliedValueRef = useRef(search);

  const applySearch = useCallback(
    (raw: string) => {
      const normalized = raw.trim();
      const params = new URLSearchParams(searchParams?.toString());

      if (normalized.length > 0) {
        params.set("search", normalized);
      } else {
        params.delete("search");
      }

      const query = params.toString();
      const nextUrl = query.length > 0 ? `${pathname}?${query}` : pathname;
      router.replace(nextUrl, { scroll: false });
      lastAppliedValueRef.current = normalized;
    },
    [pathname, router, searchParams],
  );

  const debouncedUpdate = useDebouncedCallback(applySearch, 300);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on route change
  useEffect(() => {
    if (search === lastAppliedValueRef.current) {
      return;
    }

    lastAppliedValueRef.current = search;
    debouncedUpdate.cancel();
    setValue(search);
  }, [search]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.currentTarget.value;
      setValue(nextValue);
      debouncedUpdate(nextValue);
    },
    [debouncedUpdate],
  );

  const handleClear = useCallback(() => {
    setValue("");
    debouncedUpdate.cancel();
    applySearch("");
  }, [applySearch, debouncedUpdate]);

  const placeholder = t("searchPlaceholder");
  const clearLabel = t("clearSearch");

  return (
    <TextInput
      className={classes.input}
      value={value}
      onChange={handleChange}
      size={mobile ? "md" : "sm"}
      aria-label={placeholder}
      placeholder={placeholder}
      leftSectionPointerEvents="none"
      leftSection={<IconSearch size={16} />}
      rightSection={
        value.length > 0 ? (
          <CloseButton
            size={mobile ? "md" : "sm"}
            variant="subtle"
            aria-label={clearLabel}
            onClick={handleClear}
            icon={<IconCircleXFilled size={mobile ? 20 : 14} />}
          />
        ) : undefined
      }
      w={220}
      style={{ flexShrink: 1 }}
    />
  );
}

export function MobileSearchControl({ search }: SearchControlProps) {
  return (
    <Popover position="bottom" offset={4} withArrow shadow="md">
      <Popover.Target>
        <CloseButton
          icon={
            search ? (
              <IconFilterFilled
                stroke={1}
                color="var(--mantine-color-anchor)"
              />
            ) : (
              <IconFilter stroke={1} />
            )
          }
          aria-label="Zoom"
        />
      </Popover.Target>
      <Popover.Dropdown className={classes.mobileDropdown}>
        <SearchControl search={search} mobile />
      </Popover.Dropdown>
    </Popover>
  );
}
