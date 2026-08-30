// Moves the hero token across the isometric room grid and keeps its
// visual state (idle/panic/rage/flee/dead) in sync during a raid.
import { getHeroIcon } from '../ui/heroIcon';
import {
  ENTRANCE_TILE,
  ENCOUNTER_TILE,
  EXIT_TILE,
  VIEW_W,
  VIEW_H,
  toScreenCoords,
  depthKey,
  tilePath,
  type Tile
} from './isoGrid';
import { beatMs } from './beatTiming';
import type { Hero } from '../types';

const WALK_STEPS = 3;
const TOKEN_Z_BASE = 100;

let currentTile: Tile = ENTRANCE_TILE;
let walkToken = 0;

function getToken(): HTMLElement | null {
  return document.getElementById('hero-token');
}

function setTokenTile(tile: Tile): void {
  var token = getToken();
  currentTile = tile;
  if (!token) return;
  var p = toScreenCoords(tile.x, tile.y, tile.z || 0);
  token.style.left = (p.x / VIEW_W) * 100 + '%';
  token.style.top = (p.y / VIEW_H) * 100 + '%';
  token.style.zIndex = String(TOKEN_Z_BASE + depthKey(tile.x, tile.y));
}

export function showHeroToken(hero: Hero): void {
  var token = getToken();
  var runway = document.getElementById('dungeon-runway');
  if (!token || !runway) return;

  var inner = token.querySelector('.hero-token-face');
  if (inner) {
    inner.textContent = getHeroIcon(hero);
  }

  token.classList.add('is-visible');
  token.classList.remove('is-flee', 'is-dead', 'is-entering');
  runway.classList.add('is-raiding');
}

export function hideHeroToken(): void {
  var token = getToken();
  var runway = document.getElementById('dungeon-runway');
  if (!token || !runway) return;
  token.classList.remove(
    'is-visible',
    'is-panic',
    'is-rage',
    'is-flee',
    'is-dead',
    'is-entering'
  );
  token.style.left = '';
  token.style.top = '';
  runway.classList.remove('is-raiding', 'is-room-mode');
  var app = document.querySelector('.app');
  if (app) app.classList.remove('battle-active');
  document.body.classList.remove('battle-active');
}

export function syncHeroTokenVisual(hero: Hero | null): void {
  var token = getToken();
  if (!token || !hero) return;

  token.classList.remove('is-panic', 'is-rage', 'is-flee', 'is-dead');
  if (hero.visualState === 'panic') token.classList.add('is-panic');
  if (hero.visualState === 'rage') token.classList.add('is-rage');
  if (hero.visualState === 'flee') token.classList.add('is-flee');
  if (hero.visualState === 'dead') token.classList.add('is-dead');

  var face = token.querySelector('.hero-token-face');
  if (face) {
    face.textContent = getHeroIcon(hero);
  }
}

// Instant reset to the room's Entrance tile — called at the start of every
// room (and the initial "Mulut Dungeon" entrance) before the door-enter
// sequence runs, so each room's walk always starts from the same place.
export function placeHeroAtEntrance(): void {
  const token = getToken();
  walkToken++; // cancel any in-flight walk
  if (!token) {
    setTokenTile(ENTRANCE_TILE);
    return;
  }
  token.classList.add('no-motion');
  setTokenTile(ENTRANCE_TILE);
  requestAnimationFrame(function () {
    token.classList.remove('no-motion');
  });
}

async function walk(path: Tile[], totalMs: number): Promise<void> {
  var myToken = ++walkToken;
  var legMs = Math.max(60, Math.round(totalMs / Math.max(1, path.length - 1)));
  for (var i = 1; i < path.length; i++) {
    if (myToken !== walkToken) return; // superseded by a newer walk/reset
    setTokenTile(path[i]);
    await new Promise<void>(function (r) {
      setTimeout(r, legMs);
    });
  }
}

// Tile-by-tile walk from the Entrance to the room's encounter tile. Fired
// (not awaited) from roomStage.ts's heroEnterRoom(), budgeted off the same
// 'arriveRoom' beat duration that playDoorEnterSequence() awaits — so the
// visual walk and the raid's own pacing finish at roughly the same time
// without adding any new awaits to the raid flow itself.
export function walkHeroToEncounter(): void {
  var path = tilePath(ENTRANCE_TILE, ENCOUNTER_TILE, WALK_STEPS);
  void walk(path, beatMs('arriveRoom'));
}

// Tile-by-tile walk from the encounter tile out to the Exit (far/top)
// corner, toward the next room. Fired the same fire-and-forget way,
// budgeted off 'betweenRooms' (Stage/Arcade room loop) — raid.ts calls
// this immediately before its existing `await waitBeat('betweenRooms')`.
export function walkHeroToExit(): void {
  var path = tilePath(ENCOUNTER_TILE, EXIT_TILE, WALK_STEPS);
  void walk(path, beatMs('betweenRooms'));
}

export function resetStageView(): void {
  hideHeroToken();
  placeHeroAtEntrance();
  document.querySelectorAll('.dungeon-slot').forEach(function (s) {
    s.classList.remove('raid-active', 'raid-cleared', 'slot-triggered', 'slot-kill');
  });
}
