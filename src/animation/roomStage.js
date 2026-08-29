import { catalogFor } from '../data/catalog.js';
import { getItemLevel } from '../economy/economy.js';
import { state } from '../state/gameState.js';
import { getKingStats } from '../data/king.js';

function els() {
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

export function enterRaidRoomMode() {
  var e = els();
  if (e.runway) e.runway.classList.add('is-raiding', 'is-room-mode');
  if (e.stage) {
    e.stage.classList.remove('is-hidden');
    e.stage.setAttribute('aria-hidden', 'false');
  }
}

export function exitRaidRoomMode() {
  var e = els();
  if (e.runway) e.runway.classList.remove('is-raiding', 'is-room-mode');
  if (e.stage) {
    e.stage.classList.add('is-hidden');
    e.stage.setAttribute('aria-hidden', 'true');
  }
  if (e.door) e.door.classList.remove('is-open', 'is-opening');
  if (e.chamber) e.chamber.classList.remove('is-throne', 'is-empty', 'hero-inside');
  if (e.token) e.token.classList.remove('is-entering');
}

export function setDoorOpen(open) {
  var door = document.getElementById('room-door');
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

export function presentEntrance() {
  var e = els();
  if (!e.content) return;
  if (e.chamber) {
    e.chamber.classList.remove('is-throne');
    e.chamber.classList.add('is-empty');
  }
  if (e.depth) e.depth.textContent = 'Entrance';
  e.content.innerHTML =
    '<span class="room-content-icon">\uD83D\uDEAA</span>' +
    '<span class="room-content-label">Mulut Dungeon</span>';
  setDoorOpen(false);
  if (e.token) e.token.classList.remove('is-entering');
  if (e.chamber) e.chamber.classList.remove('hero-inside');
}

export function presentRoom(index, slot) {
  var e = els();
  if (!e.content) return Promise.resolve();

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
      '<span class="room-content-icon">\u00B7</span>' +
      '<span class="room-content-label">Ruang Kosong</span>';
    return Promise.resolve();
  }

  if (e.chamber) e.chamber.classList.remove('is-empty');
  var cat = catalogFor(slot.catalogId, slot.kind);
  var level = typeof getItemLevel === 'function' ? getItemLevel(slot.catalogId) : 1;
  e.content.innerHTML =
    '<span class="room-content-icon">' +
    (cat.icon || '\u00B7') +
    '</span>' +
    '<span class="room-content-label">' +
    (cat.name || 'Room') +
    '</span>' +
    '<span class="room-content-sub">Lv.' +
    level +
    '</span>';
  return Promise.resolve();
}

export function presentThrone() {
  var e = els();
  if (!e.content) return;
  var kingLv = (state.king && state.king.level) || 1;
  var k = typeof getKingStats === 'function' ? getKingStats(kingLv) : { maxHp: 48, atk: 9 };
  if (e.depth) e.depth.textContent = 'Throne Room';
  if (e.chamber) {
    e.chamber.classList.add('is-throne');
    e.chamber.classList.remove('is-empty', 'hero-inside');
  }
  setDoorOpen(false);
  if (e.token) e.token.classList.remove('is-entering');
  e.content.innerHTML =
    '<span class="room-content-icon">\uD83D\uDC51</span>' +
    '<span class="room-content-label">Throne</span>' +
    '<span class="room-content-sub">King Lv.' +
    kingLv +
    ' \u00B7 HP ' +
    k.maxHp +
    '</span>';
}

export function heroEnterRoom() {
  var e = els();
  if (e.token) {
    e.token.classList.add('is-entering');
  }
  if (e.chamber) {
    e.chamber.classList.add('hero-inside');
  }
}

export async function playDoorEnterSequence(waitBeat) {
  setDoorOpen(false);
  await waitBeat('doorClosed');
  setDoorOpen(true);
  await waitBeat('doorOpen');
  heroEnterRoom();
  await waitBeat('arriveRoom');
}
