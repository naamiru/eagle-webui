import type { CSSProperties } from "react";
import { clampScale, SCALE_MAX } from "./CollectionControls/ScaleControl";

export type GridStyle = CSSProperties & {
  "--item-min-width": string;
  "--item-min-width-mobile": string;
};

export function computeGridStyle(scale: number): GridStyle {
  const normalized = clampScale(scale);
  if (normalized >= SCALE_MAX) {
    return {
      "--item-min-width": "100%",
      "--item-min-width-mobile": "100%",
    } as GridStyle;
  }

  const progress = normalized / SCALE_MAX;
  const eased = progress ** 1.6;

  const desktopWidth = Math.round(
    DESKTOP_MIN_WIDTH + (DESKTOP_MAX_WIDTH - DESKTOP_MIN_WIDTH) * eased,
  );
  const mobileWidth = Math.round(
    MOBILE_MIN_WIDTH + (MOBILE_MAX_WIDTH - MOBILE_MIN_WIDTH) * eased,
  );

  return {
    "--item-min-width": `${desktopWidth}px`,
    "--item-min-width-mobile": `${mobileWidth}px`,
  } as GridStyle;
}

const DESKTOP_MIN_WIDTH = 64;
const DESKTOP_MAX_WIDTH = 600;
const MOBILE_MIN_WIDTH = 48;
const MOBILE_MAX_WIDTH = 200;
