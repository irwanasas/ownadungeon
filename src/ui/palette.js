// The "Gudang Dungeon" side panel: lists unlocked traps/monsters/treasure
// and lets the player pick one to place into an empty dungeon slot.
import { state } from '../state/gameState.js';
import { runtime } from '../state/runtimeState.js';
import { TRAPS } from '../data/traps.js';
import { MONSTERS, TREASURE } from '../data/monsters.js';
import { isUnlocked } from '../economy/economy.js';
import { showToast } from './toast.js';
import { closeAllOverlays } from './overlays.js';

export function renderPalette() {
  var trapWrap = document.getElementById('palette-traps');
  var monsterWrap = document.getElementById('palette-monsters');
  var specialWrap = document.getElementById('palette-special');
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
      '<div class="empty-state">Belum ada trap terbuka.<br>Buka di panel Peningkatan.</div>';
  } else {
    unlockedTraps.forEach(function (item) {
      renderPaletteItem(item, trapWrap);
    });
  }

  if (unlockedMonsters.length === 0) {
    monsterWrap.innerHTML =
      '<div class="empty-state">Belum ada monster terbuka.<br>Buka di panel Peningkatan.</div>';
  } else {
    unlockedMonsters.forEach(function (item) {
      renderPaletteItem(item, monsterWrap);
    });
  }

  renderPaletteItem(TREASURE, specialWrap, true);
}

function renderPaletteItem(item, wrap, alwaysUnlocked) {
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
    item.icon +
    '</span>' +
    '<div class="palette-info">' +
    '<div class="palette-item-name">' +
    item.name +
    '</div>' +
    '<div class="palette-item-desc">' +
    (unlocked ? item.desc : 'Terkunci — buka di panel Peningkatan') +
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
        showToast(item.name + ' dipilih — klik slot kosong', 'info');
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
