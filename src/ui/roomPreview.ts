import { state } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { catalogFor } from '../data/catalog';
import { getHeroIcon } from './heroIcon';
import { setBattleReaction, syncBattleCardVisual } from './battleReaction';
import {
  heroMonsterMult,
  heroTrapMult,
  matchupLabel
} from '../data/matchups';
import { ensurePendingHero } from '../combat/hero';
import { entityIconHtml } from './entityIcon';
import type { Hero, ReactionKind } from '../types';

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

function traitChips(hero: Hero): string {
  var chips: string[] = [];
  if (hero.fearImmune) chips.push('Fear Immune');
  if (hero.canRage) chips.push('RAGE');
  if (hero.evasion >= 0.3) chips.push('Evasion');
  if (hero.magicAtk) chips.push('Magic ATK');
  if (hero.damageReduction) chips.push('Damage Reduction');
  if (hero.regenPerRound) chips.push('Regen');
  if (hero.burstMultiplier > 1) chips.push('Burst Opener');
  if (hero.rampPerRound) chips.push('Terrain Ramp');
  if (!chips.length) return '';
  return (
    '<div class="hero-intro-traits">' +
    chips
      .map(function (c) {
        return '<span class="hero-trait-chip">' + c + '</span>';
      })
      .join('') +
    '</div>'
  );
}

function layoutMatchupHints(hero: Hero): string {
  var slots = state.dungeon.slice(0, state.slotCount);
  var bits: string[] = [];
  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    if (!slot) continue;
    var cat = catalogFor(slot.catalogId, slot.kind);
    if (!cat) continue;
    var mult = 1;
    var label = 'neutral';
    if (slot.kind === 'monster') {
      mult = heroMonsterMult(hero.classId, cat.id);
      label = matchupLabel(mult);
    } else if (slot.kind === 'trap') {
      mult = heroTrapMult(hero.classId, cat.id);
      label = matchupLabel(mult);
    } else {
      continue;
    }
    var tip =
      label === 'strong'
        ? slot.kind === 'trap'
          ? 'dangerous'
          : 'hero favored'
        : label === 'weak'
          ? slot.kind === 'trap'
            ? 'weak'
            : 'hero struggles'
          : 'neutral';
    bits.push(
      '<span class="preview-matchup preview-matchup--' +
        label +
        '">' +
        entityIconHtml(cat.icon, 'preview-matchup-icon') +
        ' R' +
        (i + 1) +
        ' ' +
        tip +
        '</span>'
    );
  }
  if (!bits.length) {
    return '<p class="preview-hint">Place traps/monsters in the Armory to see matchups here.</p>';
  }
  return '<div class="preview-layout-hints">' + bits.join(' ') + '</div>';
}

function heroIntroHtml(hero: Hero, hint: string): string {
  return (
    '<div class="preview-header"><span class="preview-title">Enemy Detected</span></div>' +
    '<div class="hero-intro">' +
    '<span class="hero-intro-icon">' +
    entityIconHtml(hero.icon) +
    '</span>' +
    '<div class="hero-intro-main">' +
    '<div class="hero-intro-name">' +
    hero.name +
    ' <span class="hero-intro-class">' +
    hero.className +
    '</span></div>' +
    '<div class="hero-intro-stats">Lv.' +
    hero.level +
    ' · HP ' +
    hero.maxHp +
    ' · ATK ' +
    hero.atk +
    ' · DEF ' +
    hero.def +
    '</div>' +
    '</div></div>' +
    (hero.strengths || hero.weaknesses
      ? '<div class="preview-hero-blurb">' +
        (hero.strengths
          ? '<span class="preview-tag preview-tag--good">' + hero.strengths + '</span>'
          : '') +
        (hero.weaknesses
          ? '<span class="preview-tag preview-tag--bad">' + hero.weaknesses + '</span>'
          : '') +
        '</div>'
      : '') +
    traitChips(hero) +
    layoutMatchupHints(hero) +
    '<p class="preview-hint">' +
    hint +
    '</p>'
  );
}

export function renderRoomPreview(): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap) return;
  if (runtime.raidInProgress) return;

  var hero = ensurePendingHero();
  resetWrapModifiers(wrap);
  wrap.classList.add('room-preview--intro');
  wrap.innerHTML = heroIntroHtml(
    hero,
    'Build traps and monsters against this enemy weaknesses, then start the Raid.'
  );
}

export function showHeroIntro(hero: Hero): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap) return;
  resetWrapModifiers(wrap);
  wrap.classList.add('room-preview--intro');
  wrap.innerHTML = heroIntroHtml(
    hero,
    'Raid started — watch their reactions as the fight begins.'
  );
}

export function showBattleCard(hero: Hero): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap) return;
  resetWrapModifiers(wrap);
  wrap.classList.add('room-preview--battle');

  wrap.innerHTML =
    '<div class="battle-card-top">' +
    '<span id="battle-card-icon" class="battle-card-icon">' +
    getHeroIcon(hero) +
    '</span>' +
    '<span id="battle-card-name" class="battle-card-name">' +
    hero.name +
    '</span>' +
    '<span id="battle-card-class" class="battle-card-class">' +
    hero.className +
    '</span>' +
    '</div>' +
    '<div class="battle-card-hp-bar"><div id="battle-card-hp-fill" class="battle-card-hp-fill"></div></div>' +
    '<div class="battle-card-stats">' +
    '<span id="battle-card-level">Lv. ' +
    hero.level +
    '</span>' +
    '<span id="battle-card-hp-text">HP ' +
    hero.hp +
    '/' +
    hero.maxHp +
    '</span>' +
    '</div>' +
    '<div id="battle-card-reaction" class="battle-card-reaction"></div>';

  updateBattleCard(hero);
  syncBattleCardVisual(hero);
}

export function updateBattleCard(hero: Hero): void {
  var wrap = document.getElementById('room-preview');
  if (!wrap || !wrap.classList.contains('room-preview--battle')) return;

  var fill = document.getElementById('battle-card-hp-fill');
  var hpText = document.getElementById('battle-card-hp-text');
  var pct = hero.maxHp > 0 ? Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100)) : 0;
  if (fill) fill.style.width = pct + '%';
  if (hpText) {
    hpText.textContent =
      'HP ' + Math.max(0, Math.floor(hero.hp)) + '/' + hero.maxHp;
  }
  var icon = document.getElementById('battle-card-icon');
  if (icon) icon.innerHTML = getHeroIcon(hero);
  syncBattleCardVisual(hero);
}

export function setHeroReaction(text: string, kind: ReactionKind): void {
  setBattleReaction(text, kind);
}

export { setBattleReaction, syncBattleCardVisual };
