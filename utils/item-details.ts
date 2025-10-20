const SIZE_UNITS = ["B", "KB", "MB", "GB"] as const;

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  let value = bytes;
  let unitIndex = 0;

  while (unitIndex < SIZE_UNITS.length - 1 && value >= 1024) {
    value /= 1024;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return `${Math.round(value)} B`;
  }

  return `${value.toFixed(2)} ${SIZE_UNITS[unitIndex]}`;
}

export function formatDimensions(width: number, height: number): string {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return "";
  }

  const roundedWidth = Math.round(width);
  const roundedHeight = Math.round(height);

  if (roundedWidth <= 0 || roundedHeight <= 0) {
    return "";
  }

  return `${roundedWidth} x ${roundedHeight}`;
}

export function formatDateTime(timestamp: number, locale: string): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap = new Map(parts.map((part) => [part.type, part.value]));

  const year = partMap.get("year");
  const month = partMap.get("month");
  const day = partMap.get("day");
  const hour = partMap.get("hour");
  const minute = partMap.get("minute");

  if (!year || !month || !day || !hour || !minute) {
    return "";
  }

  return `${year}/${month}/${day} ${hour}:${minute}`;
}

export function formatDuration(duration: number): string {
  if (!Number.isFinite(duration) || duration <= 0) {
    return "";
  }

  const totalSeconds = Math.floor(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
}
