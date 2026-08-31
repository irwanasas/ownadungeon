// Positions and animates the real sprite for the monster occupying the
// current room's encounter tile — the entity-side counterpart to
// heroToken.ts. Only monster ids with an entry in MONSTER_SPRITES get a
// real animated token; roomStage.ts falls back to the existing emoji icon
// for everything else, so partial asset coverage never breaks a room.
import { MONSTER_SPRITES, type MonsterSizeTier } from '../data/monsterSprites';
import { startSpriteLoop } from './spriteAnimator';
import { ENCOUNTER_TILE, VIEW_W, VIEW_H, toScreenCoords, depthKey } from './isoGrid';

const TOKEN_Z_BASE = 50; // matches #room-content's zBase — same tile, same layer
const SIZE_TIER_CLASSES: MonsterSizeTier[] = ['sm', 'md', 'lg', 'xl'];

function setSizeTierClass(token: HTMLElement, tier: MonsterSizeTier): void {
  SIZE_TIER_CLASSES.forEach(function (t) {
    token.classList.remove('monster-token--' + t);
  });
  token.classList.add('monster-token--' + tier);
}

let stopLoop: (() => void) | null = null;
let currentMonsterId: string | null = null;

function getToken(): HTMLElement | null {
  return document.getElementById('monster-token');
}

function getSprite(): HTMLElement | null {
  var token = getToken();
  return token ? (token.querySelector('.monster-token-sprite') as HTMLElement | null) : null;
}

export function hasMonsterSprite(monsterId: string): boolean {
  return Boolean(MONSTER_SPRITES[monsterId]);
}

/** Shows the token at the encounter tile, idling on the given monster's sprite. No-op if the monster has no sprite entry. */
export function showMonsterToken(monsterId: string): void {
  var set = MONSTER_SPRITES[monsterId];
  var token = getToken();
  var sprite = getSprite();
  if (!set || !token || !sprite) {
    hideMonsterToken();
    return;
  }

  var p = toScreenCoords(ENCOUNTER_TILE.x, ENCOUNTER_TILE.y, ENCOUNTER_TILE.z || 0);
  token.style.left = (p.x / VIEW_W) * 100 + '%';
  token.style.top = (p.y / VIEW_H) * 100 + '%';
  token.style.zIndex = String(TOKEN_Z_BASE + depthKey(ENCOUNTER_TILE.x, ENCOUNTER_TILE.y));
  setSizeTierClass(token, set.sizeTier);
  token.classList.add('is-visible');
  currentMonsterId = monsterId;

  if (stopLoop) stopLoop();
  stopLoop = startSpriteLoop(sprite, set.idle);
}

export function hideMonsterToken(): void {
  var token = getToken();
  currentMonsterId = null;
  if (stopLoop) {
    stopLoop();
    stopLoop = null;
  }
  if (!token) return;
  token.classList.remove('is-visible');
}

/**
 * Brief walk-cycle flourish for "basic movement behavior": swap the
 * currently-shown monster to its walk sheet for `ms`, then settle back
 * onto idle. Fire-and-forget, purely presentational — mirrors
 * heroToken.ts's walk calls, doesn't touch raid resolution. No-op if no
 * monster token is currently shown.
 */
export function playMonsterWalkFlourish(ms: number): void {
  var monsterId = currentMonsterId;
  var set = monsterId ? MONSTER_SPRITES[monsterId] : null;
  var sprite = getSprite();
  var token = getToken();
  if (!set || !sprite || !token || !token.classList.contains('is-visible')) return;
  var activeSet = set;
  var activeSprite = sprite;
  var activeToken = token;

  if (stopLoop) stopLoop();
  stopLoop = startSpriteLoop(activeSprite, activeSet.walk);
  setTimeout(function () {
    // Only settle back to idle if the token is still showing this same
    // monster — a room change may have already replaced it.
    if (currentMonsterId !== monsterId || !activeToken.classList.contains('is-visible')) return;
    if (stopLoop) stopLoop();
    stopLoop = startSpriteLoop(activeSprite, activeSet.idle);
  }, ms);
}
