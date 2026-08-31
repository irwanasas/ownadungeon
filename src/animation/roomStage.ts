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
import { hasMonsterSprite, showMonsterToken, hideMonsterToken, playMonsterWalkFlourish } from './monsterToken';
import { beatMs, type BeatKey } from './beatTiming';
import type { DungeonSlotData } from '../types';

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

function buildIsoFloorSvg(): string {
  return (
    '<svg class="iso-floor-svg" viewBox="0 0 ' + VIEW_W + ' ' + VIEW_H + '" preserveAspectRatio="none" aria-hidden="true"></svg>'
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
  e.content.classList.remove('has-sprite');
  placeAtTile(e.content, ENCOUNTER_TILE, 50);
  hideMonsterToken();
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
    e.content.classList.remove('has-sprite');
    placeAtTile(e.content, ENCOUNTER_TILE, 50);
    hideMonsterToken();
    return;
  }

  if (e.chamber) e.chamber.classList.remove('is-empty');
  var cat = catalogFor(slot.catalogId, slot.kind);
  var level = getItemLevel(slot.catalogId);
  var hasSprite = slot.kind === 'monster' && hasMonsterSprite(slot.catalogId);
  e.content.innerHTML =
    (hasSprite ? '' : '<span class="room-content-icon">' + (cat && cat.icon ? cat.icon : '·') + '</span>') +
    '<span class="room-content-label">' +
    (cat && cat.name ? cat.name : 'Room') +
    '</span>' +
    '<span class="room-content-sub">Lv.' +
    level +
    '</span>';
  e.content.classList.toggle('has-sprite', hasSprite);
  placeAtTile(e.content, ENCOUNTER_TILE, 50);
  if (hasSprite) {
    showMonsterToken(slot.catalogId);
  } else {
    hideMonsterToken();
  }
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
  e.content.classList.remove('has-sprite');
  placeAtTile(e.content, ENCOUNTER_TILE, 50);
  hideMonsterToken();
}

export function heroEnterRoom(): void {
  var e = els();
  if (e.token) {
    e.token.classList.add('is-entering');
  }
  if (e.chamber) {
    e.chamber.classList.add('hero-inside');
  }
  walkHeroToEncounter();
  playMonsterWalkFlourish(beatMs('arriveRoom'));
}

export async function playDoorEnterSequence(waitBeat: (key: BeatKey) => Promise<void>): Promise<void> {
  setDoorOpen(false);
  await waitBeat('doorClosed');
  setDoorOpen(true);
  await waitBeat('doorOpen');
  heroEnterRoom();
  await waitBeat('arriveRoom');
}
