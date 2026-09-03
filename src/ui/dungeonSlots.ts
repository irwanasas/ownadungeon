import { state } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { saveState } from '../state/gameState';
import { catalogFor } from '../data/catalog';
import { showToast } from './toast';
import { renderAll } from './renderBus';
import { entityIconHtml } from './entityIcon';

export function renderDungeonSlots(): void {
  var wrap = document.getElementById('dungeon-slots');
  if (!wrap) return;
  wrap.innerHTML = '';

  var entrance = document.createElement('div');
  entrance.className = 'dungeon-slot entrance';
  entrance.innerHTML =
    '<span class="slot-icon">🚪</span><span class="slot-label">Entrance</span>';
  wrap.appendChild(entrance);

  for (var i = 0; i < state.maxSlotCount; i++) {
    if (i > 0) {
      var connector = document.createElement('div');
      connector.className = 'slot-connector';
      wrap.appendChild(connector);
    }

    var locked = i >= state.slotCount;
    var slotData = state.dungeon[i];
    var slotEl = document.createElement('div');
    slotEl.className =
      'dungeon-slot' +
      (locked ? ' locked-slot' : '') +
      (slotData ? ' filled' : '');
    slotEl.dataset.index = String(i);

    var indexTag = '<span class="slot-index">' + (i + 1) + '</span>';

    if (locked) {
      slotEl.innerHTML =
        indexTag +
        '<span class="slot-icon">⛏</span><span class="slot-label">Locked</span>';
    } else if (slotData) {
      var cat = catalogFor(slotData.catalogId, slotData.kind);
      slotEl.innerHTML =
        indexTag +
        '<span class="slot-icon">' +
        (cat ? entityIconHtml(cat.icon) : '') +
        '</span><span class="slot-label">' +
        (cat ? cat.name : '') +
        '</span>';
      (function (idx, c) {
        slotEl.addEventListener('click', function () {
          if (runtime.raidInProgress) return;
          state.dungeon[idx] = null;
          saveState();
          renderAll();
          showToast((c ? c.name : 'Item') + ' removed', 'info');
        });
      })(i, cat);
    } else {
      slotEl.innerHTML =
        indexTag +
        '<span class="slot-icon">·</span><span class="slot-label">Empty</span>';
      (function (idx) {
        slotEl.addEventListener('click', function () {
          if (runtime.raidInProgress || !runtime.selectedPaletteItem) return;
          var c = catalogFor(runtime.selectedPaletteItem.id, runtime.selectedPaletteItem.kind);
          state.dungeon[idx] = {
            catalogId: runtime.selectedPaletteItem.id,
            kind: runtime.selectedPaletteItem.kind
          };
          runtime.selectedPaletteItem = null;
          saveState();
          renderAll();
          showToast((c ? c.name : 'Item') + ' placed', 'success');
        });
      })(i);
    }

    wrap.appendChild(slotEl);
  }

  var endConn = document.createElement('div');
  endConn.className = 'slot-connector';
  wrap.appendChild(endConn);

  var throne = document.createElement('div');
  throne.className = 'dungeon-slot throne-room filled';
  throne.dataset.index = 'throne';
  var kingLv = (state.king && state.king.level) || 1;
  throne.innerHTML =
    '<span class="slot-index">◆</span>' +
    '<span class="slot-icon">👑</span>' +
    '<span class="slot-label">Throne</span>' +
    '<span class="slot-sub">Chest · King Lv.' + kingLv + '</span>';
  wrap.appendChild(throne);
}

export function flashSlot(slotEl: Element | null, kind: 'kill' | 'cleared' | 'triggered'): void {
  if (!slotEl) return;
  var cls =
    kind === 'kill'
      ? 'slot-kill'
      : kind === 'cleared'
        ? 'slot-cleared-flash'
        : 'slot-triggered';
  slotEl.classList.add(cls);
  setTimeout(function () {
    slotEl.classList.remove(cls);
  }, 400);
}
