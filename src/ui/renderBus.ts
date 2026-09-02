let handler: (() => void) | null = null;

export function registerRenderAll(fn: () => void): void {
  handler = fn;
}

export function renderAll(): void {
  if (handler) handler();
}
