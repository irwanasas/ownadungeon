// #room-preview is a single panel with three modes, switched by a modifier
// class on the wrapper so CSS can size each one differently:
//   (default)              — idle dungeon-composition preview, shown while
//                             the player is designing the layout.
//   .room-preview--intro   — once a raid starts and the invading hero is
//                             known: name, stats, strengths/weaknesses,
//                             traits/abilities. This is the ONLY place the
//                             puzzle solution (what this hero is weak to)
//                             is spelled out.
//   .room-preview--battle  — once the hero steps into Room 1: a compact
//                             live card (icon/name/HP/reaction) — no
//                             strengths/weaknesses, just contextual
//                             reactions (panic/rage/fear/pain/…) so combat
//                             stays readable without re-revealing the
//                             answer mid-fight.
// This also absorbs what used to be the separate #hero-card element.
import { state } from '../state/gameState';
import { catalogFor } from '../data/catalog';
import { getItemLevel } from '../economy/economy';
import { HERO_ARCHETYPES } from '../data/heroes';
import { getHeroIcon } from './heroIcon';
import { syncHeroTokenVisual } from '../animation/heroToken';
import {
  heroMonsterMult,
  heroTrapMult,
  matchupLabel
} from '../data/matchups';
import type { Hero, ReactionKind } from '../types';

var previewHeroClassId: string | null = null;

export function setPreviewHero(classId: string | null): void {
  previewHeroClassId = classId || null;
}

export function clearPreviewHero(): void {
  previewHeroClassId = null;
}

export function getPreviewHeroClassId(): string | null {
  return previewHeroClassId;
}

function resetWrapModifiers(wrap: HTMLElement): void {
  wrap.classList.remove(
    'room-preview--intro',
    'room-preview--battle',
    'is-panic',
    'is-rage',
    'is-flee',
    'is-dead'
  );
}

export function renderRoomPreview(forcedHeroClassId?: string | null): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap) return;
  resetWrapModifiers(wrap);

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
        (cat ? cat.icon : '') +
        '</span>' +
        '<span class="preview-name">' +
        (cat ? cat.name : '') +
        '</span>' +
        '<span class="preview-lv">Lv.' +
        lv +
        '</span></div>';
      if (arch && cat && slot.kind === 'monster') {
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
          ' ×' +
          mm.toFixed(2) +
          '</div>';
      }
      if (arch && cat && slot.kind === 'trap') {
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
          ' ×' +
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
    '<div class="preview-threat"><span class="preview-icon">👑</span>' +
    '<span class="preview-name">King</span></div></div>';
  html += '</div>';

  html +=
    '<p class="preview-hint">Susun trap/monster di Gudang, lalu PLAY. Matchup dihitung saat hero muncul.</p>';

  wrap.innerHTML = html;
}

function traitChips(hero: Hero): string {
  var chips: string[] = [];
  if (hero.fearImmune) chips.push('Fear-immune');
  if (hero.canRage) chips.push('Bisa RAGE');
  if (hero.trapEvasion > 0) chips.push('Evasion trap ' + Math.round(hero.trapEvasion * 100) + '%');
  if (hero.magicAtk) chips.push('Magic ATK');
  if (hero.holy) chips.push('Holy');
  if (!chips.length) return '';
  return (
    '<div class="hero-intro-traits">' +
    chips.map(function (c) { return '<span class="hero-trait-chip">' + c + '</span>'; }).join('') +
    '</div>'
  );
}

// Shown once per raid, right as the hero is revealed but before it steps
// into Room 1 — the one place strengths/weaknesses/traits are spelled out.
export function showHeroIntro(hero: Hero): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap) return;
  resetWrapModifiers(wrap);
  wrap.classList.add('room-preview--intro');

  wrap.innerHTML =
    '<div class="preview-header"><span class="preview-title">Musuh Terdeteksi</span></div>' +
    '<div class="hero-intro">' +
    '<span class="hero-intro-icon">' + hero.icon + '</span>' +
    '<div class="hero-intro-main">' +
    '<div class="hero-intro-name">' + hero.name + ' <span class="hero-intro-class">' + hero.className + '</span></div>' +
    '<div class="hero-intro-stats">Lv.' + hero.level + ' · HP ' + hero.maxHp + ' · ATK ' + hero.atk + ' · DEF ' + hero.def + '</div>' +
    '</div></div>' +
    (hero.strengths || hero.weaknesses
      ? '<div class="preview-hero-blurb">' +
        (hero.strengths ? '<span class="preview-tag preview-tag--good">' + hero.strengths + '</span>' : '') +
        (hero.weaknesses ? '<span class="preview-tag preview-tag--bad">' + hero.weaknesses + '</span>' : '') +
        '</div>'
      : '') +
    traitChips(hero) +
    '<p class="preview-hint">Raid dimulai — perhatikan reaksinya begitu pertarungan dimulai.</p>';
}

// Shown from Room 1 onward. Compact, live, and deliberately silent on
// strengths/weaknesses — only name/HP/reaction, same as the old hero-card.
export function showBattleCard(hero: Hero): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap) return;
  resetWrapModifiers(wrap);
  wrap.classList.add('room-preview--battle');

  wrap.innerHTML =
    '<div class="battle-card-top">' +
    '<span id="battle-card-icon" class="battle-card-icon">' + getHeroIcon(hero) + '</span>' +
    '<span id="battle-card-name" class="battle-card-name">' + hero.name + '</span>' +
    '<span id="battle-card-class" class="battle-card-class">' + hero.className + '</span>' +
    '</div>' +
    '<div class="battle-card-hp-bar"><div id="battle-card-hp-fill" class="battle-card-hp-fill"></div></div>' +
    '<div class="battle-card-stats">' +
    '<span id="battle-card-level">Lv. ' + hero.level + '</span>' +
    '<span id="battle-card-hp-text">HP ' + hero.maxHp + '/' + hero.maxHp + '</span>' +
    '</div>' +
    '<div id="battle-card-reaction" class="battle-card-reaction"></div>';

  updateBattleCard(hero);
}

export function updateBattleCard(hero: Hero): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap || !wrap.classList.contains('room-preview--battle')) return;

  var nameEl = document.getElementById('battle-card-name');
  var levelEl = document.getElementById('battle-card-level');
  var hpText = document.getElementById('battle-card-hp-text');
  if (nameEl) nameEl.textContent = hero.name;
  if (levelEl) levelEl.textContent = 'Lv. ' + hero.level;
  if (hpText) {
    hpText.textContent = 'HP ' + Math.max(0, Math.floor(hero.hp)) + '/' + hero.maxHp;
  }

  var fill = document.getElementById('battle-card-hp-fill');
  if (fill) {
    var pct = Math.max(0, (hero.hp / hero.maxHp) * 100);
    (fill as HTMLElement).style.width = pct + '%';
    fill.classList.toggle('low', pct <= 30);
  }

  syncBattleCardVisual(hero);
}

export function syncBattleCardVisual(hero: Hero | null): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap || !hero || !wrap.classList.contains('room-preview--battle')) return;

  wrap.classList.remove('is-panic', 'is-rage', 'is-flee', 'is-dead');
  if (hero.visualState === 'panic') wrap.classList.add('is-panic');
  if (hero.visualState === 'rage') wrap.classList.add('is-rage');
  if (hero.visualState === 'flee') wrap.classList.add('is-flee');
  if (hero.visualState === 'dead') wrap.classList.add('is-dead');

  var iconEl = document.getElementById('battle-card-icon');
  if (iconEl) iconEl.textContent = getHeroIcon(hero);

  syncHeroTokenVisual(hero);
}

export function setHeroReaction(text: string, kind: ReactionKind): void {
  var el = document.getElementById('battle-card-reaction');
  if (!el) return;
  el.textContent = text;
  el.className = 'battle-card-reaction' + (kind && kind !== 'none' ? ' is-' + kind : '');
}
