import { state } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { TRAPS } from '../data/traps';
import { MONSTERS, TREASURE } from '../data/monsters';
import { isUnlocked } from '../economy/economy';
import { showToast } from './toast';
import { closeAllOverlays } from './overlays';
import { entityIconHtml } from './entityIcon';
import type { CatalogItem } from '../types';

export function renderPalette(): void {
  const trapWrap = document.getElementById('palette-traps');
  const monsterWrap = document.getElementById('palette-monsters');
  const specialWrap = document.getElementById('palette-special');
  if (!trapWrap || !monsterWrap || !specialWrap) return;

  trapWrap.innerHTML = '';
  monsterWrap.innerHTML = '';
  specialWrap.innerHTML = '';

  var trapItems = Object.values(TRAPS);
  var monsterItems = Object.values(MONSTERS);
  var unlockedTraps = trapItems.filter(function (i) {
    return isUnlocked(i.id);
  });
  var unlockedMonsters = monsterItems.filter(function (i) {
    return isUnlocked(i.id);
  });

  if (unlockedTraps.length === 0) {
    trapWrap.innerHTML =
      '<div class="empty-state">No traps unlocked yet.<br>Unlock them in Upgrades.</div>';
  } else {
    unlockedTraps.forEach(function (item) {
      renderPaletteItem(item, trapWrap);
    });
  }

  if (unlockedMonsters.length === 0) {
    monsterWrap.innerHTML =
      '<div class="empty-state">No monsters unlocked yet.<br>Unlock them in Upgrades.</div>';
  } else {
    unlockedMonsters.forEach(function (item) {
      renderPaletteItem(item, monsterWrap);
    });
  }

  renderPaletteItem(TREASURE, specialWrap, true);
}

function renderPaletteItem(item: CatalogItem, wrap: HTMLElement, alwaysUnlocked?: boolean): void {
  var unlocked = alwaysUnlocked || isUnlocked(item.id);
  var div = document.createElement('div');
  div.className = 'palette-item' + (unlocked ? '' : ' locked');
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', unlocked ? '0' : '-1');

  if (runtime.selectedPaletteItem && runtime.selectedPaletteItem.id === item.id) {
    div.classList.add('selected');
  }

  var levelTag =
    item.kind === 'trap' || item.kind === 'monster'
      ? '<div class="palette-item-level">Lv.' +
        (state.levels[item.id] || 1) +
        '</div>'
      : '';

  div.innerHTML =
    '<span class="palette-icon">' +
    entityIconHtml(item.icon) +
    '</span>' +
    '<div class="palette-info">' +
    '<div class="palette-item-name">' +
    item.name +
    '</div>' +
    '<div class="palette-item-desc">' +
    (unlocked ? item.desc : 'Locked — unlock in Upgrades') +
    '</div></div>' +
    (unlocked ? levelTag : '');

  if (unlocked) {
    var selectItem = function () {
      runtime.selectedPaletteItem =
        runtime.selectedPaletteItem && runtime.selectedPaletteItem.id === item.id
          ? null
          : { id: item.id, kind: item.kind };
      renderPalette();
      if (runtime.selectedPaletteItem) {
        closeAllOverlays();
        showToast(item.name + ' selected — tap an empty slot', 'info');
      }
    };
    div.addEventListener('click', selectItem);
    div.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectItem();
      }
    });
  }

  wrap.appendChild(div);
}
