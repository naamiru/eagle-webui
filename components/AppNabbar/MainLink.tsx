"use client";

import type { UnstyledButtonProps } from "@mantine/core";
import { Text, UnstyledButton } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import classes from "./MainLink.module.css";

type MainLinkProps = Omit<
  UnstyledButtonProps,
  "aria-current" | "children" | "className" | "onClick"
> &
  Omit<
    ComponentPropsWithoutRef<"button">,
    "aria-current" | "children" | "className" | "onClick"
  > & {
    to: string;
    icon: ComponentType<{
      className?: string;
      size?: number;
      stroke?: number;
    }>;
    label: ReactNode;
    count?: number;
    withLeftMargin?: boolean;
    className?: string;
    onClick: () => void;
  };

export function MainLink({
  to,
  icon: IconComponent,
  label,
  count,
  withLeftMargin = true,
  className,
  onClick,
  ...props
}: MainLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = useMemo(() => {
    if (pathname === to) {
      return true;
    }

    return to !== "/" && pathname.startsWith(`${to}/`);
  }, [pathname, to]);

  const handleClick = () => {
    if (pathname !== to) {
      router.push(to);
    }

    onClick();
  };

  const buttonClassName = [
    classes.button,
    !withLeftMargin ? classes.noLeftMargin : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <UnstyledButton
      className={buttonClassName}
      aria-current={isActive ? "page" : undefined}
      onClick={handleClick}
      {...props}
    >
      <IconComponent className={classes.icon} size={20} stroke={1} />
      <Text size="sm" className={classes.label}>
        {label}
      </Text>
      {!!count && (
        <div className={classes.trailing}>
          <Text size="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
            {count}
          </Text>
        </div>
      )}
    </UnstyledButton>
  );
}
