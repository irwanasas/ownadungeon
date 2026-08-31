// Basepath-aware URL helpers for the tile/monster art under public/assets/.
// Plain CSS url() isn't rewritten by Next's GitHub Pages basePath (see
// GameApp.tsx's --img-* custom properties for the UI-pack sprites), and
// these sheets are referenced from TS (inline styles), not CSS, so the
// same NEXT_PUBLIC_BASE_PATH env var is read directly here instead.
const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function tileAssetUrl(relPath: string): string {
  return ASSET_BASE + '/assets/tiles/' + relPath;
}

export function monsterAssetUrl(relPath: string): string {
  return ASSET_BASE + '/assets/monsters/' + relPath;
}
