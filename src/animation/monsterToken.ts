// Positions and reveals the monster's icon token on the sidescrolling raid
// stage — the entity-side counterpart to heroToken.ts. No sprite art is
// used for now (per the move away from isometric assets), so monsters
// render as an icon token, same family as the hero token: it appears at
// the right/exit edge and walks in to meet the hero at center.
// Replaces the isometric sprite version — see
// /backup/isometric/src/animation/monsterToken.ts for the previous version.
//
// Public API kept intentionally small and stable: showMonsterToken /
// hideMonsterToken / playMonsterWalkFlourish, same as before.

import { ENCOUNTER_X, EXIT_X, FLOOR_Y } from './laneLayout';

function getToken(): HTMLElement | null {
  return document.getElementById('monster-token');
}

function getFace(): HTMLElement | null {
  var token = getToken();
  return token ? (token.querySelector('.monster-token-face') as HTMLElement | null) : null;
}

function setTokenX(xPct: number, ms?: number): void {
  var token = getToken();
  if (!token) return;
  if (typeof ms === 'number') {
    token.style.transitionDuration = ms + 'ms, ' + ms + 'ms, 0.25s';
  }
  token.style.left = xPct + '%';
  token.style.top = FLOOR_Y + '%';
}

/** Reveals the monster token at the right/exit edge, ready to walk in. */
export function showMonsterToken(icon: string): void {
  var token = getToken();
  var face = getFace();
  if (!token || !face) return;
  var el = token;
  face.textContent = icon;
  el.classList.add('no-motion');
  setTokenX(EXIT_X, 0);
  el.classList.add('is-visible');
  requestAnimationFrame(function () {
    el.classList.remove('no-motion');
  });
}

export function hideMonsterToken(): void {
  var token = getToken();
  if (!token) return;
  token.classList.remove('is-visible');
  token.style.left = '';
  token.style.top = '';
}

/**
 * Walks the monster from the right edge in to meet the hero at center.
 * No-op if no monster token is currently shown (trap/empty/treasure rooms).
 */
export function playMonsterWalkFlourish(ms: number): void {
  var token = getToken();
  if (!token || !token.classList.contains('is-visible')) return;
  setTokenX(ENCOUNTER_X, ms);
}
