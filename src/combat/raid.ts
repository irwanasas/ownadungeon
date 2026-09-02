import { state, saveState } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { catalogFor } from '../data/catalog';
import { getItemLevel } from '../economy/economy';
import { takePendingHero, clearPendingHero } from './hero';
import { getRaidDiff } from './difficultyResolver';
import { beatWait as waitBeat } from '../animation/beatTiming';
import { showHeroToken, hideHeroToken, walkHeroToExit } from '../animation/heroToken';
import { hideMonsterToken } from '../animation/monsterToken';
import {
  enterRaidRoomMode,
  exitRaidRoomMode,
  presentEntrance,
  presentRoom,
  presentThrone,
  playDoorEnterSequence,
  setDoorOpen
} from '../animation/roomStage';
import { renderAll } from '../ui/renderBus';
import { renderRoomPreview, showHeroIntro, showBattleCard } from '../ui/roomPreview';
import { resolveTrapEncounter } from './trapEncounter';
import { resolveMonsterEncounter } from './monsterEncounter';
import { resolveTreasureEncounter } from './treasureEncounter';
import { resolveKingFight } from './kingFight';
import { applyRaidOutcome } from './raidRewards';
import type { DungeonSlotData, MonsterDef, TrapDef } from '../types';

export async function runRaid(): Promise<void> {
  if (runtime.raidInProgress) return;
  runtime.raidInProgress = true;
  renderAll();

  var status = document.getElementById('raid-status');
  if (status) status.textContent = 'Raid berlangsung...';

  var stageDiff = getRaidDiff();

  var hero = takePendingHero();
  showHeroIntro(hero);
  enterRaidRoomMode();
  presentEntrance();
  showHeroToken(hero);

  await waitBeat('enterDungeon');
  await waitBeat('betweenRooms');

  showBattleCard(hero);

  var goldReward = 0;
  var soulsReward = 0;
  var dungeonWin = false;
  var heroVictory = false;
  var heroEscape = false;
  var slots: (DungeonSlotData | null)[] = state.dungeon.slice(0, state.slotCount);

  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    var slotEl = document.querySelector('.dungeon-slot[data-index="' + i + '"]');

    document.querySelectorAll('.dungeon-slot').forEach(function (s) {
      s.classList.remove('raid-active');
    });
    if (slotEl) {
      slotEl.classList.add('raid-active');
    }

    presentRoom(i, slot);
    await playDoorEnterSequence(waitBeat);

    if (!slot) {
      await waitBeat('resolve');
      walkHeroToExit();
      continue;
    }

    var cat = catalogFor(slot.catalogId, slot.kind);
    var level = getItemLevel(slot.catalogId);

    if (slot.kind === 'trap' && cat) {
      var trapResult = await resolveTrapEncounter(hero, cat as TrapDef, level, stageDiff, waitBeat, slotEl);
      if (trapResult.heroDied) {
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'monster' && cat) {
      var monsterResult = await resolveMonsterEncounter(hero, cat as MonsterDef, level, stageDiff, waitBeat, slotEl);
      goldReward += monsterResult.goldReward;
      if (monsterResult.heroEscaped) {
        heroEscape = true;
        break;
      }
      if (monsterResult.heroDied) {
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'treasure') {
      var treasureResult = await resolveTreasureEncounter(hero, goldReward, waitBeat);
      goldReward = treasureResult.goldReward;
      heroVictory = heroVictory || treasureResult.heroVictory;
    }

    if (slotEl) slotEl.classList.add('raid-cleared');
    walkHeroToExit();
    await waitBeat('betweenRooms');
  }

  if (hero.hp > 0 && !heroEscape) {
    document.querySelectorAll('.dungeon-slot').forEach(function (s) {
      s.classList.remove('raid-active');
    });
    var throneEl = document.querySelector('.dungeon-slot.throne-room');
    if (throneEl) {
      throneEl.classList.add('raid-active');
    }

    presentThrone();
    await playDoorEnterSequence(waitBeat);

    var kingResult = await resolveKingFight(hero, stageDiff, waitBeat, throneEl);
    goldReward += kingResult.goldReward;
    soulsReward += kingResult.soulsReward;
    heroVictory = heroVictory || kingResult.heroVictory;
    if (kingResult.heroDied) {
      dungeonWin = true;
    } else {
      walkHeroToExit();
    }
  }

  await waitBeat('ending');
  document.querySelectorAll('.dungeon-slot').forEach(function (s) {
    s.classList.remove('raid-active', 'raid-cleared', 'slot-triggered', 'slot-kill');
  });
  setDoorOpen(false);
  exitRaidRoomMode();
  clearPendingHero();

  applyRaidOutcome(hero, { dungeonWin, heroEscape, heroVictory }, goldReward, soulsReward, stageDiff);

  if (status) status.textContent = 'Raid selesai';

  runtime.raidInProgress = false;
  saveState();
  renderRoomPreview();
  renderAll();
  setTimeout(function () {
    hideHeroToken();
    hideMonsterToken();
  }, 1400);
}
