"use client";

import { CloseButton, Group, Popover, Slider } from "@mantine/core";
import { IconMinus, IconPlus, IconZoomIn } from "@tabler/icons-react";
import { useCallback, useMemo } from "react";
import classes from "./ScaleControl.module.css";

export const SCALE_MIN = 0;
export const SCALE_MAX = 100;
const BUTTON_STEP = 10;

export function clampScale(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return SCALE_MIN;
  }
  const rounded = Math.round(value);
  return Math.min(Math.max(rounded, SCALE_MIN), SCALE_MAX);
}

type ScaleControlProps = {
  value: number;
  onChange: (value: number) => void;
};

export function ScaleControl({ value, onChange }: ScaleControlProps) {
  const safeValue = useMemo(() => clampScale(value), [value]);
  const canDecrease = safeValue > SCALE_MIN;
  const canIncrease = safeValue < SCALE_MAX;

  const emitChange = useCallback(
    (next: number) => {
      const clamped = clampScale(next);
      onChange(clamped);
    },
    [onChange],
  );

  const handleSliderChange = useCallback(
    (next: number) => {
      emitChange(next);
    },
    [emitChange],
  );

  const handleDecrement = useCallback(() => {
    emitChange(safeValue - BUTTON_STEP);
  }, [emitChange, safeValue]);

  const handleIncrement = useCallback(() => {
    emitChange(safeValue + BUTTON_STEP);
  }, [emitChange, safeValue]);

  return (
    <Group gap="xs" wrap="nowrap" align="center">
      <CloseButton
        icon={<IconMinus stroke={1} />}
        size="xs"
        aria-label="Zoom out"
        onClick={handleDecrement}
        disabled={!canDecrease}
      />
      <Slider
        className={classes.slider}
        aria-label="Scale"
        min={SCALE_MIN}
        max={SCALE_MAX}
        step={1}
        value={safeValue}
        onChange={handleSliderChange}
        w={85}
        label={null}
        color="gray"
        size="xs"
      />
      <CloseButton
        icon={<IconPlus stroke={1} />}
        size="xs"
        aria-label="Zoom in"
        onClick={handleIncrement}
        disabled={!canIncrease}
      />
    </Group>
  );
}

export function MobileScaleControl({ value, onChange }: ScaleControlProps) {
  return (
    <Popover position="bottom" offset={4} withArrow shadow="md">
      <Popover.Target>
        <CloseButton icon={<IconZoomIn stroke={1} />} aria-label="Zoom" />
      </Popover.Target>
      <Popover.Dropdown className={classes.mobileDropdown}>
        <ScaleControl value={value} onChange={onChange} />
      </Popover.Dropdown>
    </Popover>
  );
}
