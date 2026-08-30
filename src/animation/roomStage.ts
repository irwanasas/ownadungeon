import { catalogFor } from '../data/catalog';
import { getItemLevel } from '../economy/economy';
import { state } from '../state/gameState';
import { getKingStats } from '../data/king';
import {
  GRID_W,
  GRID_H,
  VIEW_W,
  VIEW_H,
  TILE_WIDTH,
  TILE_HEIGHT,
  ENTRANCE_TILE,
  ENCOUNTER_TILE,
  toScreenCoords,
  depthKey,
  type Tile
} from './isoGrid';
import { placeHeroAtEntrance, walkHeroToEncounter } from './heroToken';
import type { DungeonSlotData } from '../types';
import type { BeatKey } from './beatTiming';

interface StageEls {
  runway: HTMLElement | null;
  stage: HTMLElement | null;
  door: HTMLElement | null;
  chamber: HTMLElement | null;
  content: HTMLElement | null;
  depth: HTMLElement | null;
  token: HTMLElement | null;
  isoFloor: HTMLElement | null;
}

function els(): StageEls {
  return {
    runway: document.getElementById('dungeon-runway'),
    stage: document.getElementById('room-stage'),
    door: document.getElementById('room-door'),
    chamber: document.getElementById('room-chamber'),
    content: document.getElementById('room-content'),
    depth: document.getElementById('room-depth'),
    token: document.getElementById('hero-token'),
    isoFloor: document.getElementById('room-iso-floor')
  };
}

// Converts a logical tile position into a percentage-based { left, top }
// pair. Every entity sits in the same 0..VIEW_W / 0..VIEW_H logical space
// as the SVG floor grid (see isoGrid.ts), so as long as their container
// keeps the same aspect ratio as that viewBox (enforced in CSS), percentage
// positioning lines everything up exactly — no pixel measurement needed.
export function tileToPercent(tile: Tile): { left: string; top: string; z: number } {
  var p = toScreenCoords(tile.x, tile.y, tile.z || 0);
  return {
    left: (p.x / VIEW_W) * 100 + '%',
    top: (p.y / VIEW_H) * 100 + '%',
    z: depthKey(tile.x, tile.y)
  };
}

function placeAtTile(el: HTMLElement | null, tile: Tile, zBase: number): void {
  if (!el) return;
  var pos = tileToPercent(tile);
  el.style.left = pos.left;
  el.style.top = pos.top;
  el.style.zIndex = String(zBase + pos.z);
}

// Diamond-tile floor grid, built once per raid (the grid shape never
// changes between rooms — only what sits on it does) and left in the DOM
// for the whole battle-active session.
function buildIsoFloorSvg(): string {
  var polys = '';
  for (var ty = 0; ty < GRID_H; ty++) {
    for (var tx = 0; tx < GRID_W; tx++) {
      var c = toScreenCoords(tx, ty, 0);
      var hw = TILE_WIDTH / 2;
      var hh = TILE_HEIGHT / 2;
      var points =
        c.x + ',' + (c.y - hh) + ' ' +
        (c.x + hw) + ',' + c.y + ' ' +
        c.x + ',' + (c.y + hh) + ' ' +
        (c.x - hw) + ',' + c.y;
      var checker = (tx + ty) % 2 === 0;
      polys +=
        '<polygon points="' + points + '" class="iso-tile' + (checker ? ' iso-tile--alt' : '') + '"></polygon>';
    }
  }
  return (
    '<svg class="iso-floor-svg" viewBox="0 0 ' + VIEW_W + ' ' + VIEW_H + '" preserveAspectRatio="none" aria-hidden="true">' +
    polys +
    '</svg>'
  );
}

function ensureIsoFloor(e: StageEls): void {
  if (!e.chamber) return;
  if (e.isoFloor) return;
  var floor = document.createElement('div');
  floor.id = 'room-iso-floor';
  floor.className = 'room-iso-floor';
  floor.setAttribute('aria-hidden', 'true');
  floor.innerHTML = buildIsoFloorSvg();
  var roomFloor = e.chamber.querySelector('.room-floor');
  if (roomFloor) roomFloor.insertBefore(floor, roomFloor.firstChild);
}

export function enterRaidRoomMode(): void {
  var e = els();
  ensureIsoFloor(e);
  if (e.runway) e.runway.classList.add('is-raiding', 'is-room-mode');
  if (e.stage) {
    e.stage.classList.remove('is-hidden');
    e.stage.setAttribute('aria-hidden', 'false');
  }
  var app = document.querySelector('.app');
  if (app) app.classList.add('battle-active');
  document.body.classList.add('battle-active');
}

export function exitRaidRoomMode(): void {
  var e = els();
  if (e.runway) e.runway.classList.remove('is-raiding', 'is-room-mode');
  if (e.stage) {
    e.stage.classList.add('is-hidden');
    e.stage.setAttribute('aria-hidden', 'true');
  }
  if (e.door) e.door.classList.remove('is-open', 'is-opening');
  if (e.chamber) e.chamber.classList.remove('is-throne', 'is-empty', 'hero-inside');
  if (e.token) e.token.classList.remove('is-entering');
  var app = document.querySelector('.app');
  if (app) app.classList.remove('battle-active');
  document.body.classList.remove('battle-active');
}

export function setDoorOpen(open: boolean): void {
  const e = els();
  const door = e.door;
  if (!door) return;
  placeAtTile(door, ENTRANCE_TILE, 200);
  if (open) {
    door.classList.add('is-opening');
    requestAnimationFrame(function () {
      door.classList.add('is-open');
    });
  } else {
    door.classList.remove('is-open', 'is-opening');
  }
}

export function presentEntrance(): void {
  var e = els();
  ensureIsoFloor(e);
  if (!e.content) return;
  if (e.chamber) {
    e.chamber.classList.remove('is-throne');
    e.chamber.classList.add('is-empty');
  }
  if (e.depth) e.depth.textContent = 'Entrance';
  e.content.innerHTML =
    '<span class="room-content-icon">🚪</span>' +
    '<span class="room-content-label">Dungeon Mouth</span>';
  placeAtTile(e.content, ENCOUNTER_TILE, 50);
  setDoorOpen(false);
  if (e.token) e.token.classList.remove('is-entering');
  if (e.chamber) e.chamber.classList.remove('hero-inside');
  placeHeroAtEntrance();
}

export function presentRoom(index: number, slot: DungeonSlotData | null): void {
  var e = els();
  ensureIsoFloor(e);
  if (!e.content) return;

  var total = state.slotCount || 1;
  if (e.depth) {
    e.depth.textContent = 'Room ' + (index + 1) + ' / ' + total;
  }
  if (e.chamber) {
    e.chamber.classList.remove('is-throne', 'hero-inside');
  }
  setDoorOpen(false);
  if (e.token) e.token.classList.remove('is-entering');
  placeHeroAtEntrance();

  if (!slot) {
    if (e.chamber) e.chamber.classList.add('is-empty');
    e.content.innerHTML =
      '<span class="room-content-icon">·</span>' +
      '<span class="room-content-label">Empty Room</span>';
    placeAtTile(e.content, ENCOUNTER_TILE, 50);
    return;
  }

  if (e.chamber) e.chamber.classList.remove('is-empty');
  var cat = catalogFor(slot.catalogId, slot.kind);
  var level = getItemLevel(slot.catalogId);
  e.content.innerHTML =
    '<span class="room-content-icon">' +
    (cat && cat.icon ? cat.icon : '·') +
    '</span>' +
    '<span class="room-content-label">' +
    (cat && cat.name ? cat.name : 'Room') +
    '</span>' +
    '<span class="room-content-sub">Lv.' +
    level +
    '</span>';
  placeAtTile(e.content, ENCOUNTER_TILE, 50);
}

export function presentThrone(): void {
  var e = els();
  ensureIsoFloor(e);
  if (!e.content) return;
  var kingLv = (state.king && state.king.level) || 1;
  var k = getKingStats(kingLv);
  if (e.depth) e.depth.textContent = 'Throne Room';
  if (e.chamber) {
    e.chamber.classList.add('is-throne');
    e.chamber.classList.remove('is-empty', 'hero-inside');
  }
  setDoorOpen(false);
  if (e.token) e.token.classList.remove('is-entering');
  placeHeroAtEntrance();
  e.content.innerHTML =
    '<span class="room-content-icon">👑</span>' +
    '<span class="room-content-label">Throne</span>' +
    '<span class="room-content-sub">King Lv.' +
    kingLv +
    ' · HP ' +
    k.maxHp +
    '</span>';
  placeAtTile(e.content, ENCOUNTER_TILE, 50);
}

export function heroEnterRoom(): void {
  var e = els();
  if (e.token) {
    e.token.classList.add('is-entering');
  }
  if (e.chamber) {
    e.chamber.classList.add('hero-inside');
  }
  // Fire-and-forget: this walk's total duration is budgeted off the same
  // 'arriveRoom' beat that playDoorEnterSequence() below already awaits,
  // so the animation and the raid's own pacing stay in sync without
  // raid.ts (or this function) needing to await it directly.
  walkHeroToEncounter();
}

export async function playDoorEnterSequence(waitBeat: (key: BeatKey) => Promise<void>): Promise<void> {
  setDoorOpen(false);
  await waitBeat('doorClosed');
  setDoorOpen(true);
  await waitBeat('doorOpen');
  heroEnterRoom();
  await waitBeat('arriveRoom');
}
