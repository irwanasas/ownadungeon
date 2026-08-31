// Real sprite-sheet metadata for every monster in src/data/monsters.ts,
// sourced from the uploaded packs under public/assets/monsters/. All five
// current monster ids have a matching pack, so every monster now renders
// with real animated art (see src/animation/monsterToken.ts) instead of
// the emoji-icon fallback — that fallback path still exists for any
// future monster id added without art yet.
//
// `sizeTier` drives on-screen scale globally via the `.monster-token--*`
// classes in app/styles/isometric.css, each sized as a multiple of the
// isometric tile's own width (not a fixed px guess) — see that file's
// comment for the exact fractions. Tiers roughly track the
// Slime -> Goblin Troop/Shaman -> Goblin Elite -> Orc progression so
// bigger, later-game monsters visibly read as bigger threats.
import type { SpriteSheetDef } from '../animation/spriteAnimator';

export type MonsterSizeTier = 'sm' | 'md' | 'lg' | 'xl';

export interface MonsterSpriteSet {
  idle: SpriteSheetDef;
  walk: SpriteSheetDef;
  sizeTier: MonsterSizeTier;
}

export const MONSTER_SPRITES: Partial<Record<string, MonsterSpriteSet>> = {
  slime: {
    idle: { src: 'slimes/ghost/ghost_idle.png', frameW: 64, frameH: 64, frameCount: 6, rows: 4, row: 0, fps: 6 },
    walk: { src: 'slimes/ghost/ghost_walk.png', frameW: 64, frameH: 64, frameCount: 8, rows: 4, row: 0, fps: 9 },
    sizeTier: 'sm'
  },
  goblin_troop: {
    idle: { src: 'goblin_troop/D_Idle.png', frameW: 32, frameH: 32, frameCount: 4, fps: 6 },
    walk: { src: 'goblin_troop/D_Walk.png', frameW: 32, frameH: 32, frameCount: 6, fps: 9 },
    sizeTier: 'md'
  },
  goblin_shaman: {
    idle: { src: 'goblin_shaman/D_Idle.png', frameW: 32, frameH: 32, frameCount: 4, fps: 6 },
    walk: { src: 'goblin_shaman/D_Walk.png', frameW: 32, frameH: 32, frameCount: 6, fps: 9 },
    sizeTier: 'md'
  },
  goblin_elite: {
    idle: { src: 'goblin_elite/D_Idle.png', frameW: 32, frameH: 32, frameCount: 4, fps: 6 },
    walk: { src: 'goblin_elite/D_Walk.png', frameW: 32, frameH: 32, frameCount: 6, fps: 9 },
    sizeTier: 'lg'
  },
  orc: {
    idle: { src: 'orc/orc_idle.png', frameW: 64, frameH: 64, frameCount: 4, rows: 4, row: 0, fps: 6 },
    walk: { src: 'orc/orc_walk.png', frameW: 64, frameH: 64, frameCount: 6, rows: 4, row: 0, fps: 9 },
    sizeTier: 'xl'
  }
};
