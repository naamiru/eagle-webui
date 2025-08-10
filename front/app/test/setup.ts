// Test setup file for Vitest
// This file is loaded before all test files

// Filter out MSW redundant worker.start() warnings
const originalWarn = console.warn;
// biome-ignore lint/suspicious/noExplicitAny: console.warn
console.warn = (...args: any[]) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    message.startsWith('[MSW] Found a redundant "worker.start()" call.')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
