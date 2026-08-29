import { state } from '../state/gameState.js';
import { catalogFor } from '../data/catalog.js';
import { getItemLevel } from '../economy/economy.js';
import { HERO_ARCHETYPES } from '../data/heroes.js';
import {
  heroMonsterMult,
  heroTrapMult,
  matchupLabel
} from '../data/matchups.js';

var previewHeroClassId = null;

export function setPreviewHero(classId) {
  previewHeroClassId = classId || null;
}

export function clearPreviewHero() {
  previewHeroClassId = null;
}

export function getPreviewHeroClassId() {
  return previewHeroClassId;
}

export function renderRoomPreview(forcedHeroClassId) {
  var wrap = document.getElementById('room-preview');
  if (!wrap) return;

  var classId = forcedHeroClassId || previewHeroClassId;
  var arch = null;
  if (classId) {
    for (var i = 0; i < HERO_ARCHETYPES.length; i++) {
      if (HERO_ARCHETYPES[i].id === classId) {
        arch = HERO_ARCHETYPES[i];
        break;
      }
    }
  }

  var slots = state.dungeon.slice(0, state.slotCount);
  var html = '';

  html += '<div class="preview-header">';
  html += '<span class="preview-title">Encounter Preview</span>';
  if (arch) {
    html +=
      '<span class="preview-hero">' +
      arch.icon +
      ' ' +
      arch.className +
      '</span>';
  } else {
    html +=
      '<span class="preview-hero preview-hero--muted">Hero acak saat PLAY</span>';
  }
  html += '</div>';

  if (arch) {
    html +=
      '<div class="preview-hero-blurb">' +
      '<span class="preview-tag preview-tag--good">' +
      (arch.strengths || '') +
      '</span> ' +
      '<span class="preview-tag preview-tag--bad">' +
      (arch.weaknesses || '') +
      '</span></div>';
  }

  html += '<div class="preview-rooms">';
  for (var r = 0; r < slots.length; r++) {
    var slot = slots[r];
    html += '<div class="preview-room">';
    html +=
      '<div class="preview-room-num">Room ' +
      (r + 1) +
      '</div>';
    if (!slot) {
      html += '<div class="preview-empty">Kosong</div>';
    } else {
      var cat = catalogFor(slot.catalogId, slot.kind);
      var lv = getItemLevel(slot.catalogId);
      html +=
        '<div class="preview-threat">' +
        '<span class="preview-icon">' +
        cat.icon +
        '</span>' +
        '<span class="preview-name">' +
        cat.name +
        '</span>' +
        '<span class="preview-lv">Lv.' +
        lv +
        '</span></div>';
      if (arch && slot.kind === 'monster') {
        var mm = heroMonsterMult(arch.id, cat.id);
        var ml = matchupLabel(mm);
        html +=
          '<div class="preview-matchup preview-matchup--' +
          ml +
          '">' +
          (ml === 'strong'
            ? 'Hero advantage'
            : ml === 'weak'
              ? 'Hero disadvantage'
              : 'Neutral') +
          ' \u00d7' +
          mm.toFixed(2) +
          '</div>';
      }
      if (arch && slot.kind === 'trap') {
        var tm = heroTrapMult(arch.id, cat.id);
        var tl = matchupLabel(tm);
        html +=
          '<div class="preview-matchup preview-matchup--' +
          tl +
          '">' +
          (tl === 'strong'
            ? 'Trap berbahaya'
            : tl === 'weak'
              ? 'Trap lemah vs hero'
              : 'Neutral') +
          ' \u00d7' +
          tm.toFixed(2) +
          '</div>';
      }
      if (slot.kind === 'treasure') {
        html += '<div class="preview-matchup">Steal risk</div>';
      }
    }
    html += '</div>';
  }
  html +=
    '<div class="preview-room preview-room--throne">' +
    '<div class="preview-room-num">Throne</div>' +
    '<div class="preview-threat"><span class="preview-icon">\uD83D\uDC51</span>' +
    '<span class="preview-name">King</span></div></div>';
  html += '</div>';

  html +=
    '<p class="preview-hint">Susun trap/monster di Gudang, lalu PLAY. Matchup dihitung saat hero muncul.</p>';

  wrap.innerHTML = html;
}
