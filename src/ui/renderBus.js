// Small decoupling point so leaf UI modules (palette, dungeon slots,
// upgrades, stats) can trigger a full re-render after a state change
// without importing hud.js directly — hud.js already needs to import
// those leaf modules to build renderAll(), so a direct two-way import
// would be a circular dependency. hud.js registers its implementation
// here once, at module load.
let handler = null;

export function registerRenderAll(fn) {
  handler = fn;
}

export function renderAll() {
  if (handler) handler();
}
