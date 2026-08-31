// Real sprite-sheet metadata for monster ids in src/data/monsters.ts,
// sourced from the uploaded packs under public/assets/monsters/. Only
// monster ids with an actual matching sprite pack are listed here — a
// monster id with no entry keeps its existing emoji-icon rendering
// (see roomStage.ts's presentRoom()), so partial asset coverage degrades
// gracefully instead of guessing/fabricating art for the rest.
//
// Mapping rationale (only two of the five MONSTERS ids have matching art):
//   goblin ("Goblin Brute") -> goblin_troop pack (basic green goblin)
//   shade  ("Shadow Wraith") -> the ghost pack (ethereal blue spirit —
//           the closest thematic match to "ethereal, fear aura" in the
//           uploaded set; skeleton/ogre/slime have no matching pack)
import type { SpriteSheetDef } from '../animation/spriteAnimator';

export interface MonsterSpriteSet {
  idle: SpriteSheetDef;
  walk: SpriteSheetDef;
}

export const MONSTER_SPRITES: Partial<Record<string, MonsterSpriteSet>> = {
  goblin: {
    idle: { src: 'goblin_troop/D_Idle.png', frameW: 32, frameH: 32, frameCount: 4, fps: 6 },
    walk: { src: 'goblin_troop/D_Walk.png', frameW: 32, frameH: 32, frameCount: 6, fps: 9 }
  },
  shade: {
    idle: { src: 'slimes/ghost/ghost_idle.png', frameW: 64, frameH: 64, frameCount: 6, rows: 4, row: 0, fps: 6 },
    walk: { src: 'slimes/ghost/ghost_walk.png', frameW: 64, frameH: 64, frameCount: 8, rows: 4, row: 0, fps: 9 }
  }
};
