import type { CSSProperties } from 'react';

const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function assetUrl(path: string): string {
  return `url(${ASSET_BASE}/assets/ui/cropped/${path})`;
}

function kingUrl(path: string): string {
  return `url(${ASSET_BASE}/assets/king/${path})`;
}

function roomUrl(path: string): string {
  return `url(${ASSET_BASE}/assets/room/${path})`;
}

const ENTITY_ICON_IDS = [
  'spike', 'poison', 'net', 'fire', 'frost',
  'slime', 'goblin_troop', 'goblin_shaman', 'goblin_elite', 'orc',
  'paladin', 'berserker', 'trickster', 'assassin', 'druid', 'elementalist',
  'treasure'
];

const entityVars: Record<string, string> = {};
for (const id of ENTITY_ICON_IDS) {
  entityVars['--img-entity-' + id] = assetUrl('icon-entity-' + id + '.png');
}

export const uiAssetVars = {
  '--img-panel-stone': assetUrl('panel-stone.png'),
  '--img-divider': assetUrl('divider-rune.png'),
  '--img-pill-idle': assetUrl('pill-stone-idle.png'),
  '--img-pill-hover': assetUrl('pill-stone-hover.png'),
  '--img-pill-danger-idle': assetUrl('pill-danger-idle.png'),
  '--img-pill-danger-hover': assetUrl('pill-danger-hover.png'),
  '--img-icon-gold': assetUrl('icon-gold.png'),
  '--img-icon-soul': assetUrl('icon-soul.png'),
  '--img-icon-armory': assetUrl('icon-armory.png'),
  '--img-icon-upgrade': assetUrl('icon-upgrade.png'),
  '--img-icon-settings': assetUrl('icon-settings.png'),
  '--img-icon-play': assetUrl('icon-play.png'),
  '--img-icon-battle': assetUrl('icon-battle.png'),
  '--img-icon-stats': assetUrl('icon-stats.png'),
  '--img-icon-door': assetUrl('icon-door.png'),
  '--img-icon-king': kingUrl('icon-king.png'),
  '--img-room-corridor': roomUrl('room-corridor.png'),
  '--img-room-throne': roomUrl('room-throne.png'),
  '--img-torch': roomUrl('TorchAnimation.png'),
  ...entityVars
} as CSSProperties;
