"use client";

import { CloseButton, Group, Slider } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { useCallback, useMemo } from "react";

export const LIST_SCALE_MIN = 0;
export const LIST_SCALE_MAX = 100;
const BUTTON_STEP = 10;

export function clampListScale(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return LIST_SCALE_MIN;
  }
  const rounded = Math.round(value);
  return Math.min(Math.max(rounded, LIST_SCALE_MIN), LIST_SCALE_MAX);
}

type ListScaleControlProps = {
  value: number;
  onChange: (value: number) => void;
};

export function ListScaleControl({ value, onChange }: ListScaleControlProps) {
  const safeValue = useMemo(() => clampListScale(value), [value]);
  const canDecrease = safeValue > LIST_SCALE_MIN;
  const canIncrease = safeValue < LIST_SCALE_MAX;

  const emitChange = useCallback(
    (next: number) => {
      const clamped = clampListScale(next);
      onChange(clamped);
    },
    [onChange]
  );

  const handleSliderChange = useCallback(
    (next: number) => {
      emitChange(next);
    },
    [emitChange]
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
        aria-label="Scale"
        min={LIST_SCALE_MIN}
        max={LIST_SCALE_MAX}
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
