"use client";

import {
  DEFAULT_THEME,
  MantineProvider,
  mergeMantineTheme,
  rem,
} from "@mantine/core";
import type { PropsWithChildren } from "react";

const theme = mergeMantineTheme(DEFAULT_THEME, {
  spacing: {
    xxxs: rem(3),
    xxs: rem(5),
  },
});

const cssVariablesResolver = () => ({
  variables: {},
  light: { "--mantine-color-text": "#111111" },
  dark: {},
});

export function AppMantineProvider({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
      {children}
    </MantineProvider>
  );
}
