import { catalogFor } from '../data/catalog';
import { getItemLevel } from '../economy/economy';
import { state } from '../state/gameState';
import { getKingStats } from '../data/king';
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
}

function els(): StageEls {
  return {
    runway: document.getElementById('dungeon-runway'),
    stage: document.getElementById('room-stage'),
    door: document.getElementById('room-door'),
    chamber: document.getElementById('room-chamber'),
    content: document.getElementById('room-content'),
    depth: document.getElementById('room-depth'),
    token: document.getElementById('hero-token')
  };
}

export function enterRaidRoomMode(): void {
  var e = els();
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
  const door = document.getElementById('room-door');
  if (!door) return;
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
  if (!e.content) return;
  if (e.chamber) {
    e.chamber.classList.remove('is-throne');
    e.chamber.classList.add('is-empty');
  }
  if (e.depth) e.depth.textContent = 'Entrance';
  e.content.innerHTML =
    '<span class="room-content-icon">🚪</span>' +
    '<span class="room-content-label">Mulut Dungeon</span>';
  setDoorOpen(false);
  if (e.token) e.token.classList.remove('is-entering');
  if (e.chamber) e.chamber.classList.remove('hero-inside');
}

export function presentRoom(index: number, slot: DungeonSlotData | null): void {
  var e = els();
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

  if (!slot) {
    if (e.chamber) e.chamber.classList.add('is-empty');
    e.content.innerHTML =
      '<span class="room-content-icon">·</span>' +
      '<span class="room-content-label">Ruang Kosong</span>';
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
}

export function presentThrone(): void {
  var e = els();
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
  e.content.innerHTML =
    '<span class="room-content-icon">👑</span>' +
    '<span class="room-content-label">Throne</span>' +
    '<span class="room-content-sub">King Lv.' +
    kingLv +
    ' · HP ' +
    k.maxHp +
    '</span>';
}

export function heroEnterRoom(): void {
  var e = els();
  if (e.token) {
    e.token.classList.add('is-entering');
  }
  if (e.chamber) {
    e.chamber.classList.add('hero-inside');
  }
}

export async function playDoorEnterSequence(waitBeat: (key: BeatKey) => Promise<void>): Promise<void> {
  setDoorOpen(false);
  await waitBeat('doorClosed');
  setDoorOpen(true);
  await waitBeat('doorOpen');
  heroEnterRoom();
  await waitBeat('arriveRoom');
}
