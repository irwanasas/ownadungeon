// The raid simulation: walks the hero through each dungeon room, resolves
// trap/monster/treasure encounters and the throne-room king fight, then
// tallies rewards. This is the "combat" core of the game.
import { state, saveState } from '../state/gameState';
import { runtime } from '../state/runtimeState';
import { catalogFor } from '../data/catalog';
import { STAGE_MAX } from '../data/difficulty';
import { getItemLevel } from '../economy/economy';
import { takePendingHero, clearPendingHero, checkPanic, tryTriggerRage, triggerFlee, triggerDeath, triggerPain, triggerSurprise, triggerFear } from './hero';
import { getRaidDiff } from './difficultyResolver';
import { getKingStats } from '../data/king';
import { beatWait as waitBeat } from '../animation/beatTiming';
import {
  showHeroToken,
  hideHeroToken,
  walkHeroToExit
} from '../animation/heroToken';
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
import { flashSlot } from '../ui/dungeonSlots';
import { renderAll } from '../ui/renderBus';
import {
  heroMonsterMult,
  heroTrapMult,
  applySpecialOnTrap,
  applySpecialOnMonsterHit
} from '../data/matchups';
import { renderRoomPreview, showHeroIntro, showBattleCard, updateBattleCard } from '../ui/roomPreview';
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
      var trapCat = cat as TrapDef;
      triggerSurprise(hero);
      await waitBeat('threat');

      flashSlot(slotEl, 'triggered');
      await waitBeat('actionGap');

      var baseTrap = Math.round((trapCat.baseDamage + (level - 1) * trapCat.dmgPerLevel) * stageDiff.trapMult);
      var tMult = heroTrapMult(hero.classId, trapCat.id);
      var dmg = Math.round(baseTrap * tMult);

      if (hero.trapEvasion && Math.random() < hero.trapEvasion) {
        dmg = 0;
      }

      if (dmg > 0) {
        var spec = applySpecialOnTrap(hero, trapCat.id, dmg);
        dmg = spec.dmg;
        hero.hp -= dmg;
        triggerPain(hero);
        updateBattleCard(hero);
        checkPanic(hero);
      }

      if (trapCat.id === 'poison' && dmg > 0) {
        hero.status.push({ type: 'poison', rounds: trapCat.dotRounds || 0, dmg: Math.round(dmg * 0.4) });
      }
      if (trapCat.id === 'fire' && dmg > 0 && trapCat.burnRounds) {
        hero.status.push({ type: 'poison', rounds: trapCat.burnRounds, dmg: Math.round(dmg * 0.35) });
      }
      if (trapCat.id === 'net' && dmg > 0 && trapCat.atkReduction) {
        hero.atk = Math.round(hero.atk * (1 - trapCat.atkReduction));
      }

      await waitBeat('resolve');

      if (hero.hp <= 0) {
        flashSlot(slotEl, 'kill');
        triggerDeath(hero);
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'monster' && cat) {
      var monCat = cat as MonsterDef;
      var monHp = Math.round((monCat.baseHp + (level - 1) * monCat.hpPerLevel) * stageDiff.monsterHpMult);
      var monAtk = Math.round((monCat.baseAtk + (level - 1) * monCat.atkPerLevel) * stageDiff.monsterAtkMult);
      var monDef = monCat.baseDef || 0;

      triggerSurprise(hero);
      await waitBeat('threat');
      await waitBeat('actionGap');

      if (monCat.fearAura && !hero.fearImmune) {
        if (Math.random() < 0.22) {
          hero.atk = Math.max(1, Math.round(hero.atk * 0.9));
          triggerFear(hero);
        }
      }

      var levelGap = level - hero.level;
      if (!hero.fearImmune && levelGap >= hero.fleeThreshold) {
        triggerFlee(hero);
        heroEscape = true;
        await waitBeat('resolve');
        break;
      }

      var mHp = monHp;
      while (mHp > 0 && hero.hp > 0) {
        await waitBeat('combatRound');

        hero.status = hero.status.filter(function (s) {
          if (s.type === 'poison' && s.rounds > 0) {
            hero.hp -= s.dmg;
            s.rounds--;
            return s.rounds > 0;
          }
          return true;
        });
        updateBattleCard(hero);
        checkPanic(hero);
        if (hero.hp <= 0) break;

        if (tryTriggerRage(hero)) {
          updateBattleCard(hero);
          await waitBeat('actionGap');
        }

        var mMult = heroMonsterMult(hero.classId, monCat.id);
        var raw = Math.max(1, hero.atk - monDef);
        if (hero.magicAtk) raw = Math.max(1, hero.atk - Math.floor(monDef * 0.4));
        var hit = applySpecialOnMonsterHit(hero, monCat, Math.round(raw * mMult));
        var hDmg = Math.max(1, hit.dmg);
        mHp -= hDmg;

        if (mHp <= 0) {
          flashSlot(slotEl, 'cleared');
          goldReward += 10 + level * 4;
          break;
        }

        var mDmg = Math.max(1, monAtk - hero.def);
        hero.hp -= mDmg;
        triggerPain(hero);
        updateBattleCard(hero);
        checkPanic(hero);
      }

      await waitBeat('resolve');

      if (hero.hp <= 0) {
        flashSlot(slotEl, 'kill');
        triggerDeath(hero);
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'treasure') {
      await waitBeat('threat');
      await waitBeat('actionGap');

      if (hero.hp > 0) {
        var stolen = Math.round(goldReward * 0.4 + 15);
        goldReward = Math.max(0, goldReward - stolen);
        heroVictory = true;
      }
      await waitBeat('resolve');
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
    triggerSurprise(hero);
    await waitBeat('threat');

    var king = getKingStats(state.king && state.king.level);
    var kHp = Math.round(king.maxHp * stageDiff.kingMult);
    var kAtk = Math.round(king.atk * stageDiff.kingMult);
    var kDef = Math.max(0, Math.round(king.def * stageDiff.kingMult));

    await waitBeat('actionGap');

    while (kHp > 0 && hero.hp > 0) {
      await waitBeat('combatRound');

      hero.status = hero.status.filter(function (s) {
        if (s.type === 'poison' && s.rounds > 0) {
          hero.hp -= s.dmg;
          s.rounds--;
          return s.rounds > 0;
        }
        return true;
      });
      updateBattleCard(hero);
      checkPanic(hero);
      if (hero.hp <= 0) break;

      if (tryTriggerRage(hero)) {
        updateBattleCard(hero);
        await waitBeat('actionGap');
      }

      var hDmg = Math.max(1, hero.atk - kDef);
      kHp -= hDmg;

      if (kHp <= 0) {
        flashSlot(throneEl, 'cleared');
        goldReward += 35 + king.level * 10;
        soulsReward += 1;
        heroVictory = true;
        break;
      }

      var mDmg = Math.max(1, kAtk - hero.def);
      hero.hp -= mDmg;
      triggerPain(hero);
      updateBattleCard(hero);
      checkPanic(hero);
    }

    await waitBeat('resolve');

    if (hero.hp <= 0) {
      flashSlot(throneEl, 'kill');
      triggerDeath(hero);
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

  if (hero.hp > 0 && !heroEscape && !heroVictory) {
    heroVictory = true;
  }

  var firstClear = false;

  if (dungeonWin) {
    goldReward += 32 + state.slotCount * 10;
    soulsReward += 1;
    state.stats.dungeonWins++;

    if (state.mode === 'stage') {
      firstClear = state.stage > state.maxStageCleared;
      if (firstClear) {
        state.maxStageCleared = state.stage;
        goldReward += stageDiff.firstClearBonusGold || 0;
        soulsReward += stageDiff.firstClearBonusSouls || 0;
      }
      if (state.stage < STAGE_MAX) {
        state.stage += 1;
      }
    } else if (state.mode === 'arcade') {
      var wave = state.arcadeWave || 1;
      if (wave > (state.arcadeBest || 0)) {
        state.arcadeBest = wave;
      }
      state.arcadeWave = wave + 1;
    }
  } else if (heroEscape) {
    state.stats.heroEscapes++;
    goldReward = Math.round(goldReward * 0.35);
  } else if (heroVictory) {
    state.stats.heroVictories++;
    goldReward = Math.round(goldReward * 0.45);
  }

  if (stageDiff.rewardMult && stageDiff.rewardMult !== 1) {
    goldReward = Math.round(goldReward * stageDiff.rewardMult);
    if (soulsReward > 0) {
      soulsReward = Math.max(1, Math.round(soulsReward * Math.min(2.5, 1 + (stageDiff.rewardMult - 1) * 0.5)));
    }
  }

  state.gold += goldReward;
  state.souls += soulsReward;
  state.stats.raidsTotal++;

  if (status) status.textContent = 'Raid selesai';

  runtime.raidInProgress = false;
  saveState();
  // Restore Musuh Terdeteksi for the next invader (pending was cleared above).
  renderRoomPreview();
  renderAll();
  setTimeout(function () {
    hideHeroToken();
    hideMonsterToken();
  }, 1400);
}
