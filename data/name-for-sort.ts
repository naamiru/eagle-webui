const DIGIT_SEQUENCE = /\d+/g;
const PAD_LENGTH = 19;
const MAX_INT_64 = BigInt("9223372036854775807");

export function computeNameForSort(name: string): string {
  if (!name) {
    return name;
  }

  return name.replace(DIGIT_SEQUENCE, (segment) => {
    try {
      const value = BigInt(segment);
      if (value < 0 || value > MAX_INT_64) {
        return segment;
      }
      const normalized = value.toString(10);
      if (normalized.length >= PAD_LENGTH) {
        return normalized;
      }
      return normalized.padStart(PAD_LENGTH, "0");
    } catch {
      return segment;
    }
  });
}
