import { ENCOUNTER_X, EXIT_X, FLOOR_Y } from './laneLayout';
import { MONSTER_SPRITE_MANIFEST } from '../data/monsterSprites';
import { entityIconHtml } from '../ui/entityIcon';

const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

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

export function showMonsterToken(icon: string, monsterId?: string): void {
  var token = getToken();
  var face = getFace();
  if (!token || !face) return;
  var el = token;
  var sprite = monsterId ? MONSTER_SPRITE_MANIFEST[monsterId]?.idle : undefined;
  if (sprite) {
    face.textContent = '';
    face.style.backgroundImage = 'url(' + ASSET_BASE + sprite.path + ')';
    face.style.backgroundSize = (sprite.frameCount * 100) + '% 100%';
    face.classList.add('has-sprite');
  } else {
    face.innerHTML = entityIconHtml(icon);
    face.style.backgroundImage = '';
    face.classList.remove('has-sprite');
  }
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

export function playMonsterWalkFlourish(ms: number): void {
  var token = getToken();
  if (!token || !token.classList.contains('is-visible')) return;
  setTokenX(ENCOUNTER_X, ms);
}
