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
  hideHeroToken
} from '../animation/heroToken';
import {
  enterRaidRoomMode,
  exitRaidRoomMode,
  presentEntrance,
  presentRoom,
  presentThrone,
  playDoorEnterSequence,
  setDoorOpen
} from '../animation/roomStage';
import { logLine, clearRaidLog } from '../ui/raidLog';
import { flashSlot } from '../ui/dungeonSlots';
import { renderAll } from '../ui/renderBus';
import {
  heroMonsterMult,
  heroTrapMult,
  matchupLabel,
  applySpecialOnTrap,
  applySpecialOnMonsterHit
} from '../data/matchups';
import { renderRoomPreview, showHeroIntro, showBattleCard, updateBattleCard } from '../ui/roomPreview';
import type { DungeonSlotData, MonsterDef, TrapDef } from '../types';

export async function runRaid(): Promise<void> {
  if (runtime.raidInProgress) return;
  runtime.raidInProgress = true;
  renderAll();

  clearRaidLog();
  var status = document.getElementById('raid-status');
  if (status) status.textContent = 'Raid berlangsung...';

  var stageDiff = getRaidDiff();

  var hero = takePendingHero();
  showHeroIntro(hero);
  enterRaidRoomMode();
  presentEntrance();
  showHeroToken(hero);
  logLine(
    hero.name +
      ' the ' +
      hero.className +
      ' (' +
      (hero.role || 'Hero') +
      ') — ' +
      (hero.strengths || ''),
    'info'
  );

  if (state.mode === 'arcade') {
    logLine('Arcade Wave ' + (state.arcadeWave || 1) + ' — hero memasuki dungeon.', 'info');
  } else if (state.mode === 'stage') {
    logLine('Stage ' + (stageDiff.stage || state.stage) + ' / ' + STAGE_MAX + ' — hero memasuki dungeon.', 'info');
  }
  logLine(hero.name + ' the ' + hero.className + ' menatap mulut dungeon yang menganga.', 'info');

  await waitBeat('enterDungeon');
  logLine('Langkahnya menggema di batu dingin. Ia masuk.', 'info');
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
      logLine('Ruang ' + (i + 1) + ' kosong — hanya debu dan gema langkahnya.', 'info');
      await waitBeat('resolve');
      continue;
    }

    var cat = catalogFor(slot.catalogId, slot.kind);
    var level = getItemLevel(slot.catalogId);

    if (slot.kind === 'trap' && cat) {
      var trapCat = cat as TrapDef;
      logLine('Di ruang ' + (i + 1) + ', lantai berkilau mencurigakan...', 'warning');
      triggerSurprise(hero);
      await waitBeat('threat');

      logLine(trapCat.name + ' (Lv.' + level + ') menganga di bawah kakinya!', 'danger');
      flashSlot(slotEl, 'triggered');
      await waitBeat('actionGap');

      var baseTrap = Math.round((trapCat.baseDamage + (level - 1) * trapCat.dmgPerLevel) * stageDiff.trapMult);
      var tMult = heroTrapMult(hero.classId, trapCat.id);
      var dmg = Math.round(baseTrap * tMult);
      var tLabel = matchupLabel(tMult);
      if (tLabel === 'strong') {
        logLine('Matchup trap: ' + hero.className + ' rentan vs ' + trapCat.name + '.', 'warning');
      } else if (tLabel === 'weak') {
        logLine('Matchup trap: ' + hero.className + ' tahan vs ' + trapCat.name + '.', 'success');
      }

      if (hero.trapEvasion && Math.random() < hero.trapEvasion) {
        logLine(hero.name + ' meloncat di detik terakhir — lolos!', 'success');
        dmg = 0;
      }

      if (dmg > 0) {
        var spec = applySpecialOnTrap(hero, trapCat.id, dmg);
        dmg = spec.dmg;
        hero.hp -= dmg;
        logLine(trapCat.name + ' menggigit (−' + dmg + ' HP).', 'danger');
        triggerPain(hero);
        updateBattleCard(hero);
        checkPanic(hero);
        if (spec.special === 'net_blocks_rage') {
          logLine('Jaring menahan amarah — RAGE tertunda.', 'warning');
        }
        if (spec.special === 'frost_def') {
          logLine('Dingin merayap — DEF hero turun.', 'warning');
        }
      }

      if (trapCat.id === 'poison' && dmg > 0) {
        hero.status.push({ type: 'poison', rounds: trapCat.dotRounds || 0, dmg: Math.round(dmg * 0.4) });
        logLine('Racun merayap di uratnya...', 'danger');
      }
      if (trapCat.id === 'fire' && dmg > 0 && trapCat.burnRounds) {
        hero.status.push({ type: 'poison', rounds: trapCat.burnRounds, dmg: Math.round(dmg * 0.35) });
        logLine('Api sisa membakar kulitnya.', 'danger');
      }
      if (trapCat.id === 'net' && dmg > 0 && trapCat.atkReduction) {
        hero.atk = Math.round(hero.atk * (1 - trapCat.atkReduction));
        logLine('Jaring mengerat — ATK menurun.', 'danger');
      }

      await waitBeat('resolve');

      if (hero.hp <= 0) {
        logLine(hero.name + ' ambruk di atas perangkapnya sendiri. Sunyi.', 'danger');
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

      logLine('Bayangan di ruang ' + (i + 1) + ' bergerak — bukan angin.', 'warning');
      triggerSurprise(hero);
      await waitBeat('threat');

      logLine(monCat.name + ' (Lv.' + level + ') menghadang! (HP ' + monHp + ')', 'danger');
      var mm = heroMonsterMult(hero.classId, monCat.id);
      if (matchupLabel(mm) === 'strong') {
        logLine(hero.className + ' unggul vs ' + monCat.name + '.', 'success');
      } else if (matchupLabel(mm) === 'weak') {
        logLine(hero.className + ' kesulitan vs ' + monCat.name + '.', 'warning');
      }
      await waitBeat('actionGap');

      if (monCat.fearAura && !hero.fearImmune) {
        logLine('Aura ketakutan merayap dari ' + monCat.name + '...', 'warning');
        if (Math.random() < 0.22) {
          logLine(hero.name + ' goyah — hampir kabur!', 'warning');
          hero.atk = Math.max(1, Math.round(hero.atk * 0.9));
          triggerFear(hero);
        }
      }

      var levelGap = level - hero.level;
      if (!hero.fearImmune && levelGap >= hero.fleeThreshold) {
        logLine(hero.name + ' memutihkan mata — terlalu kuat. Ia berbalik kabur!', 'warning');
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
            logLine('Racun menggerogoti dari dalam (−' + s.dmg + ' HP).', 'danger');
            s.rounds--;
            return s.rounds > 0;
          }
          return true;
        });
        updateBattleCard(hero);
        checkPanic(hero);
        if (hero.hp <= 0) break;

        if (tryTriggerRage(hero)) {
          logLine(hero.name + ' mengaum — darah dan amarah. RAGE!', 'ember');
          updateBattleCard(hero);
          await waitBeat('actionGap');
        }

        var mMult = heroMonsterMult(hero.classId, monCat.id);
        var raw = Math.max(1, hero.atk - monDef);
        if (hero.magicAtk) raw = Math.max(1, hero.atk - Math.floor(monDef * 0.4));
        var hit = applySpecialOnMonsterHit(hero, monCat, Math.round(raw * mMult));
        var hDmg = Math.max(1, hit.dmg);
        mHp -= hDmg;
        var mTag = matchupLabel(mMult);
        logLine(
          hero.name +
            ' menyerang' +
            (mTag === 'strong' ? ' (advantage)' : mTag === 'weak' ? ' (disadvantage)' : '') +
            '. ' +
            monCat.name +
            ' (−' +
            hDmg +
            ', sisa ' +
            Math.max(0, Math.floor(mHp)) +
            ').'
        );

        if (mHp <= 0) {
          logLine(monCat.name + ' tumbang. Debu mengendap.', 'success');
          flashSlot(slotEl, 'cleared');
          goldReward += 10 + level * 4;
          break;
        }

        var mDmg = Math.max(1, monAtk - hero.def);
        hero.hp -= mDmg;
        logLine(monCat.name + ' memukul balik (−' + mDmg + ' HP).', 'danger');
        triggerPain(hero);
        updateBattleCard(hero);
        checkPanic(hero);
      }

      await waitBeat('resolve');

      if (hero.hp <= 0) {
        logLine(hero.name + ' jatuh. Pedangnya berdenting di batu.', 'danger');
        flashSlot(slotEl, 'kill');
        triggerDeath(hero);
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'treasure') {
      logLine('Cahaya emas menari di ujung ruang ' + (i + 1) + '...', 'warning');
      await waitBeat('threat');
      logLine('Pintu vault terbuka. Bau logam dan keserakahan.');
      await waitBeat('actionGap');

      if (hero.hp > 0) {
        var stolen = Math.round(goldReward * 0.4 + 15);
        goldReward = Math.max(0, goldReward - stolen);
        logLine(hero.name + ' mengais peti — +' + stolen + ' gold ke kantongnya.', 'warning');
        heroVictory = true;
      }
      await waitBeat('resolve');
    }

    if (slotEl) slotEl.classList.add('raid-cleared');
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
    logLine('Koridor berakhir di aula takhta. Peti harta mengkilat di kaki singgasana.', 'warning');
    triggerSurprise(hero);
    await waitBeat('threat');

    var king = getKingStats(state.king && state.king.level);
    var kHp = Math.round(king.maxHp * stageDiff.kingMult);
    var kAtk = Math.round(king.atk * stageDiff.kingMult);
    var kDef = Math.max(0, Math.round(king.def * stageDiff.kingMult));

    logLine(
      'Raja bangkit dari singgasana (Lv.' +
        king.level +
        ', HP ' +
        kHp +
        '). Pedang menghunus.',
      'danger'
    );
    await waitBeat('actionGap');

    while (kHp > 0 && hero.hp > 0) {
      await waitBeat('combatRound');

      hero.status = hero.status.filter(function (s) {
        if (s.type === 'poison' && s.rounds > 0) {
          hero.hp -= s.dmg;
          logLine('Racun menggerogoti dari dalam (−' + s.dmg + ' HP).', 'danger');
          s.rounds--;
          return s.rounds > 0;
        }
        return true;
      });
      updateBattleCard(hero);
      checkPanic(hero);
      if (hero.hp <= 0) break;

      if (tryTriggerRage(hero)) {
        logLine(hero.name + ' mengaum — darah dan amarah. RAGE!', 'ember');
        updateBattleCard(hero);
        await waitBeat('actionGap');
      }

      var hDmg = Math.max(1, hero.atk - kDef);
      kHp -= hDmg;
      logLine(
        hero.name +
          ' menyerang Raja. Baja bertubrukan (−' +
          hDmg +
          ', sisa Raja ' +
          Math.max(0, Math.floor(kHp)) +
          ').'
      );

      if (kHp <= 0) {
        logLine('Raja tumbang di atas karpet merah. Peti terbuka lebar.', 'success');
        flashSlot(throneEl, 'cleared');
        goldReward += 35 + king.level * 10;
        soulsReward += 1;
        heroVictory = true;
        break;
      }

      var mDmg = Math.max(1, kAtk - hero.def);
      hero.hp -= mDmg;
      logLine('Raja memukul balik dari singgasana (−' + mDmg + ' HP).', 'danger');
      triggerPain(hero);
      updateBattleCard(hero);
      checkPanic(hero);
    }

    await waitBeat('resolve');

    if (hero.hp <= 0) {
      logLine(hero.name + ' jatuh di kaki takhta. Raja tetap berkuasa.', 'danger');
      flashSlot(throneEl, 'kill');
      triggerDeath(hero);
      dungeonWin = true;
    }
  }

  await waitBeat('ending');
  document.querySelectorAll('.dungeon-slot').forEach(function (s) {
    s.classList.remove('raid-active', 'raid-cleared', 'slot-triggered', 'slot-kill');
  });
  setDoorOpen(false);
  exitRaidRoomMode();
  clearPendingHero();
  renderRoomPreview();

  if (hero.hp > 0 && !heroEscape && !heroVictory) {
    logLine(hero.name + ' muncul di pintu keluar — berlumur, tapi hidup.', 'warning');
    heroVictory = true;
  }

  var firstClear = false;
  var clearedStage = state.stage;

  if (dungeonWin) {
    logLine('Dungeon menang. Tubuhnya tidak akan keluar dari sini.', 'success');
    goldReward += 32 + state.slotCount * 10;
    soulsReward += 1;
    state.stats.dungeonWins++;

    if (state.mode === 'stage') {
      firstClear = state.stage > state.maxStageCleared;
      if (firstClear) {
        state.maxStageCleared = state.stage;
        goldReward += stageDiff.firstClearBonusGold || 0;
        soulsReward += stageDiff.firstClearBonusSouls || 0;
        logLine(
          'First clear Stage ' +
            clearedStage +
            '! Bonus +' +
            (stageDiff.firstClearBonusGold || 0) +
            'g +' +
            (stageDiff.firstClearBonusSouls || 0) +
            's',
          'success'
        );
      }
      if (state.stage < STAGE_MAX) {
        state.stage += 1;
        logLine('Stage naik → ' + state.stage + ' / ' + STAGE_MAX, 'info');
      } else {
        logLine('Semua Stage (1–' + STAGE_MAX + ') sudah ditaklukkan.', 'success');
      }
    } else if (state.mode === 'arcade') {
      var wave = state.arcadeWave || 1;
      if (wave > (state.arcadeBest || 0)) {
        state.arcadeBest = wave;
      }
      state.arcadeWave = wave + 1;
      logLine('Arcade Wave naik → ' + state.arcadeWave + ' (best ' + state.arcadeBest + ')', 'info');
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

  var rewardMsg =
    'Reward: +' +
    goldReward +
    ' Gold' +
    (soulsReward ? ' +' + soulsReward + ' Souls' : '');
  if (stageDiff.rewardMult > 1) {
    rewardMsg +=
      ' (×' +
      stageDiff.rewardMult.toFixed(2) +
      (state.mode === 'arcade' ? ' arcade)' : ' stage)');
  }
  logLine(rewardMsg, 'info');
  if (status) status.textContent = 'Raid selesai';

  runtime.raidInProgress = false;
  saveState();
  renderAll();
  setTimeout(function () {
    hideHeroToken();
  }, 1400);
}
