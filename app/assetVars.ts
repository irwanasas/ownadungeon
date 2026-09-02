import type { CSSProperties } from 'react';

const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function assetUrl(path: string): string {
  return `url(${ASSET_BASE}/assets/ui/cropped/${path})`;
}

function uiBgUrl(path: string): string {
  return `url(${ASSET_BASE}/assets/ui/bg/${path})`;
}

export const uiAssetVars = {
  '--img-panel-parchment': assetUrl('panel-parchment.png'),
  '--img-pill-idle': assetUrl('pill-button.png'),
  '--img-pill-hover': assetUrl('pill-button-hover.png'),
  '--img-icon-gold': assetUrl('icon-gold.png'),
  '--img-icon-soul': assetUrl('icon-soul.png'),
  '--img-icon-armory': assetUrl('icon-armory.png'),
  '--img-icon-upgrade': assetUrl('icon-upgrade.png'),
  '--img-icon-settings': assetUrl('icon-settings.png'),
  '--img-icon-play': assetUrl('icon-play.png'),
  '--img-room-bg': uiBgUrl('IMG_4394.jpeg')
} as CSSProperties;
