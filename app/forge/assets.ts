import type { CSSProperties } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function url(name: string): string {
  return `url(${BASE}/forge/${name})`;
}

export function forgeIcon(name: string): string {
  return `${BASE}/forge/${name}`;
}

export const forgeVars: CSSProperties = {
  '--tile-floor': url('tile-floor.png'),
  '--tile-wall': url('tile-wall.png'),
  '--torch-sheet': url('torch-sheet.png'),
  '--icon-door': url('icon-door.png'),
  '--icon-door-open': url('icon-door-open.png')
} as CSSProperties;

export const HERO_ICON: Record<string, string> = {
  paladin: forgeIcon('hero-paladin.png'),
  trickster: forgeIcon('hero-trickster.png'),
  elementalist: forgeIcon('hero-elementalist.png')
};

export const MONSTER_ICON: Record<string, string> = {
  brute: forgeIcon('monster-brute.png'),
  swarm: forgeIcon('monster-swarm.png'),
  shaman: forgeIcon('monster-shaman.png')
};

export const TRAP_ICON: Record<string, string> = {
  spike: forgeIcon('trap-spike.png'),
  poison: forgeIcon('trap-poison.png'),
  frost: forgeIcon('trap-frost.png')
};

export const UI_ICON = {
  gold: forgeIcon('icon-gold.png'),
  soul: forgeIcon('icon-soul.png'),
  play: forgeIcon('icon-play.png'),
  build: forgeIcon('icon-build.png'),
  upgrade: forgeIcon('icon-upgrade.png'),
  king: forgeIcon('icon-king.png')
};
