import { state } from '../state/gameState';
import { saveState } from '../state/gameState';
import { getKingStats, kingUpgradeCost } from '../data/king';
import { UPGRADE_DEFS, UNLOCK_DEFS } from '../data/upgrades';
import {
  affordable,
  spend,
  costLabel,
  upgradeCost,
  isUnlocked,
  tryUpgradeKing
} from '../economy/economy';
import { showToast } from './toast';
import { renderAll } from './renderBus';

export function renderUpgrades(): void {
  const wrap = document.getElementById('upgrade-list');
  if (!wrap) return;
  wrap.innerHTML = '';
  var hasAny = false;

  var secKing = document.createElement('div');
  secKing.className = 'upgrade-section-title';
  secKing.textContent = 'Raja / King';
  wrap.appendChild(secKing);

  var kingLevel = (state.king && state.king.level) || 1;
  var kingStats = getKingStats(kingLevel);
  var nextStats = getKingStats(kingLevel + 1);
  var kingCost = kingUpgradeCost(kingLevel);
  var canKing = affordable(kingCost);
  var kingDiv = document.createElement('div');
  kingDiv.className = 'upgrade-item upgrade-item--king';
  var kingDesc =
    'HP ' +
    kingStats.maxHp +
    ' · ATK ' +
    kingStats.atk +
    ' · DEF ' +
    kingStats.def;
  if (nextStats) {
    kingDesc +=
      ' → HP ' +
      nextStats.maxHp +
      ' · ATK ' +
      nextStats.atk +
      ' · DEF ' +
      nextStats.def;
  }
  kingDiv.innerHTML =
    '<div class="upgrade-item-top"><span class="upgrade-item-name">Raja (King)</span><span class="upgrade-item-level">Lv.' +
    kingLevel +
    '</span></div>' +
    '<div class="upgrade-item-cost">' +
    kingDesc +
    '</div>' +
    '<div class="upgrade-item-cost">Biaya: ' +
    costLabel(kingCost) +
    '</div>' +
    '<div class="upgrade-btn-row"><button class="btn btn-small"' +
    (canKing ? '' : ' disabled') +
    '>Tingkatkan King</button></div>';
  kingDiv.querySelector('button')!.addEventListener('click', function () {
    if (!tryUpgradeKing()) {
      showToast('Resource tidak cukup', 'warning');
      return;
    }
    renderAll();
    showToast('King → Lv.' + state.king.level, 'success');
  });
  wrap.appendChild(kingDiv);
  hasAny = true;

  var secDungeon = document.createElement('div');
  secDungeon.className = 'upgrade-section-title';
  secDungeon.textContent = 'Trap & Monster';
  wrap.appendChild(secDungeon);

  UPGRADE_DEFS.forEach(function (def) {
    if (def.requiresUnlock && !isUnlocked(def.requiresUnlock)) return;
    hasAny = true;
    var level = state.levels[def.id] || 1;
    var cost = { gold: upgradeCost(def.baseCost, level), souls: 0 };
    var can = affordable(cost);
    var div = document.createElement('div');
    div.className = 'upgrade-item';
    div.innerHTML =
      '<div class="upgrade-item-top"><span class="upgrade-item-name">' +
      def.label +
      '</span><span class="upgrade-item-level">Lv.' +
      level +
      '</span></div>' +
      '<div class="upgrade-item-cost">Biaya: ' +
      costLabel(cost) +
      '</div>' +
      '<div class="upgrade-btn-row"><button class="btn btn-small"' +
      (can ? '' : ' disabled') +
      '>Tingkatkan</button></div>';

    div.querySelector('button')!.addEventListener('click', function () {
      if (!affordable(cost)) return;
      spend(cost);
      state.levels[def.id] = level + 1;
      saveState();
      renderAll();
      showToast(def.label + ' → Lv.' + (level + 1), 'success');
    });
    wrap.appendChild(div);
  });

  UNLOCK_DEFS.forEach(function (def) {
    if (state.unlocked[def.id]) return;
    if (def.id === 'slot4' && state.slotCount !== 3) return;
    if (def.id === 'slot5' && state.slotCount !== 4) return;

    if (def.unlockAtStage && state.stage < def.unlockAtStage) return;
    hasAny = true;
    var can = affordable(def.cost);
    var div = document.createElement('div');
    div.className = 'upgrade-item';
    div.innerHTML =
      '<div class="upgrade-item-top"><span class="upgrade-item-name">' +
      def.label +
      '</span></div>' +
      '<div class="upgrade-item-cost">Biaya: ' +
      costLabel(def.cost) +
      '</div>' +
      '<div class="upgrade-btn-row"><button class="btn btn-small"' +
      (can ? '' : ' disabled') +
      '>Buka</button></div>';

    div.querySelector('button')!.addEventListener('click', function () {
      if (!affordable(def.cost)) return;
      spend(def.cost);
      state.unlocked[def.id] = true;
      if (def.id === 'slot4') state.slotCount = 4;
      if (def.id === 'slot5') state.slotCount = 5;
      while (state.dungeon.length < state.slotCount) state.dungeon.push(null);
      saveState();
      renderAll();
      showToast(def.label + ' berhasil!', 'success');
    });
    wrap.appendChild(div);
  });

  if (!hasAny) {
    wrap.innerHTML =
      '<div class="empty-state">Semua item sudah terbuka & max level untuk saat ini.</div>';
  }
}
