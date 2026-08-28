/* ========== CORE GAME: state, economy, raid ========== */

let state = loadState();
let selectedPaletteItem = null;
let raidInProgress = false;

function loadState() {
  try {
    const raw = localStorage.getItem('idm_state_v1');
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return Object.assign(structuredClone(DEFAULT_STATE), parsed);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  state.lastActive = Date.now();
  localStorage.setItem('idm_state_v1', JSON.stringify(state));
}

function upgradeCost(baseCost, level) {
  return Math.round(baseCost * Math.pow(1.6, level - 1));
}

function isUnlocked(id) {
  if (id === 'spike' || id === 'skeleton' || id === 'treasure') return true;
  return !!state.unlocked[id];
}

function catalogFor(catalogId, kind) {
  if (kind === 'trap') return TRAPS[catalogId];
  if (kind === 'monster') return MONSTERS[catalogId];
  if (kind === 'treasure') return TREASURE;
  return null;
}

function getItemLevel(catalogId) {
  return state.levels[catalogId] || 1;
}

function affordable(cost) {
  return state.gold >= (cost.gold || 0) && state.souls >= (cost.souls || 0);
}

function spend(cost) {
  state.gold -= cost.gold || 0;
  state.souls -= cost.souls || 0;
}

function costLabel(cost) {
  const parts = [];
  if (cost.gold) parts.push(cost.gold + 'g');
  if (cost.souls) parts.push(cost.souls + 's');
  return parts.length ? parts.join(' + ') : 'Gratis';
}

function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

async function runRaid() {
  if (raidInProgress) return;
  raidInProgress = true;
  if (typeof renderAll === 'function') renderAll();

  if (typeof clearRaidLog === 'function') clearRaidLog();
  var status = document.getElementById('raid-status');
  if (status) status.textContent = 'Raid berlangsung...';

  function waitBeat(key) {
    if (typeof beatWait === 'function') return beatWait(key);
    var fallback = {
      enterDungeon: 850, arriveRoom: 750, threat: 800, actionGap: 700,
      combatRound: 950, resolve: 850, betweenRooms: 650, ending: 1100
    };
    return sleep(fallback[key] || 500);
  }

  var hero = buildHero();
  if (typeof updateHeroCard === 'function') updateHeroCard(hero);
  if (typeof showHeroToken === 'function') showHeroToken(hero);

  if (typeof logLine === 'function') {
    logLine(hero.name + ' the ' + hero.className + ' menatap mulut dungeon yang menganga.', 'info');
  }
  await waitBeat('enterDungeon');
  if (typeof logLine === 'function') {
    logLine('Langkahnya menggema di batu dingin. Ia masuk.', 'info');
  }
  await waitBeat('betweenRooms');

  var goldReward = 0;
  var soulsReward = 0;
  var dungeonWin = false;
  var heroVictory = false;
  var heroEscape = false;
  var slots = state.dungeon.slice(0, state.slotCount);

  for (var i = 0; i < slots.length; i++) {
    var slot = slots[i];
    var slotEl = document.querySelector('.dungeon-slot[data-index="' + i + '"]');

    document.querySelectorAll('.dungeon-slot').forEach(function (s) {
      s.classList.remove('raid-active');
    });
    if (slotEl) {
      slotEl.classList.add('raid-active');
      if (typeof moveHeroToSlot === 'function') moveHeroToSlot(i, false);
    }

    await waitBeat('arriveRoom');

    if (!slot) {
      if (typeof logLine === 'function') {
        logLine('Ruang ' + (i + 1) + ' kosong — hanya debu dan gema langkahnya.', 'info');
      }
      await waitBeat('resolve');
      continue;
    }

    var cat = catalogFor(slot.catalogId, slot.kind);
    var level = getItemLevel(slot.catalogId);

    if (slot.kind === 'trap') {
      if (typeof logLine === 'function') {
        logLine('Di ruang ' + (i + 1) + ', lantai berkilau mencurigakan...', 'warning');
      }
      await waitBeat('threat');

      if (typeof logLine === 'function') {
        logLine(cat.name + ' (Lv.' + level + ') menganga di bawah kakinya!', 'danger');
      }
      if (typeof flashSlot === 'function') flashSlot(slotEl, 'triggered');
      await waitBeat('actionGap');

      var dmg = cat.baseDamage + (level - 1) * cat.dmgPerLevel;
      if (hero.trapEvasion && Math.random() < hero.trapEvasion) {
        if (typeof logLine === 'function') {
          logLine(hero.name + ' meloncat di detik terakhir — lolos!', 'success');
        }
        dmg = 0;
      }

      if (dmg > 0) {
        hero.hp -= dmg;
        if (typeof logLine === 'function') {
          logLine(cat.name + ' menggigit dagingnya (−' + dmg + ' HP).', 'danger');
        }
        if (typeof updateHeroCard === 'function') updateHeroCard(hero);
        checkPanic(hero);
      }

      if (cat.id === 'poison' && dmg > 0) {
        hero.status.push({ type: 'poison', rounds: cat.dotRounds, dmg: Math.round(dmg * 0.4) });
        if (typeof logLine === 'function') {
          logLine('Racun merayap di uratnya... napasnya memendek.', 'danger');
        }
      }
      if (cat.id === 'net' && dmg > 0) {
        hero.atk = Math.round(hero.atk * (1 - cat.atkReduction));
        if (typeof logLine === 'function') {
          logLine('Jaring mengerat. Lengannya kaku — ATK menurun.', 'danger');
        }
      }

      await waitBeat('resolve');

      if (hero.hp <= 0) {
        if (typeof logLine === 'function') {
          logLine(hero.name + ' ambruk di atas perangkapnya sendiri. Sunyi.', 'danger');
        }
        if (typeof flashSlot === 'function') flashSlot(slotEl, 'kill');
        if (typeof triggerDeath === 'function') triggerDeath(hero);
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'monster') {
      var monHp = cat.baseHp + (level - 1) * cat.hpPerLevel;
      var monAtk = cat.baseAtk + (level - 1) * cat.atkPerLevel;
      var monDef = cat.baseDef || 0;

      if (typeof logLine === 'function') {
        logLine('Bayangan di ruang ' + (i + 1) + ' bergerak — bukan angin.', 'warning');
      }
      await waitBeat('threat');

      if (typeof logLine === 'function') {
        logLine(cat.name + ' (Lv.' + level + ') menghadang! (HP ' + monHp + ')', 'danger');
      }
      await waitBeat('actionGap');

      var levelGap = level - hero.level;
      if (!hero.fearImmune && levelGap >= hero.fleeThreshold) {
        if (typeof logLine === 'function') {
          logLine(hero.name + ' memutihkan mata — terlalu kuat. Ia berbalik kabur!', 'warning');
        }
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
            if (typeof logLine === 'function') {
              logLine('Racun menggerogoti dari dalam (−' + s.dmg + ' HP).', 'danger');
            }
            s.rounds--;
            return s.rounds > 0;
          }
          return true;
        });
        if (typeof updateHeroCard === 'function') updateHeroCard(hero);
        checkPanic(hero);
        if (hero.hp <= 0) break;

        if (tryTriggerRage(hero)) {
          if (typeof logLine === 'function') {
            logLine(hero.name + ' mengaum — darah dan amarah. RAGE!', 'ember');
          }
          if (typeof updateHeroCard === 'function') updateHeroCard(hero);
          await waitBeat('actionGap');
        }

        var hDmg = Math.max(1, hero.atk - monDef);
        mHp -= hDmg;
        if (typeof logLine === 'function') {
          logLine(
            hero.name + ' menyerang. ' + cat.name + ' goyah (−' + hDmg + ', sisa ' +
            Math.max(0, Math.floor(mHp)) + ').'
          );
        }

        if (mHp <= 0) {
          if (typeof logLine === 'function') {
            logLine(cat.name + ' tumbang. Debu mengendap.', 'success');
          }
          if (typeof flashSlot === 'function') flashSlot(slotEl, 'cleared');
          goldReward += 8 + level * 3;
          break;
        }

        var mDmg = Math.max(1, monAtk - hero.def);
        hero.hp -= mDmg;
        if (typeof logLine === 'function') {
          logLine(cat.name + ' memukul balik (−' + mDmg + ' HP).', 'danger');
        }
        if (typeof updateHeroCard === 'function') updateHeroCard(hero);
        checkPanic(hero);
      }

      await waitBeat('resolve');

      if (hero.hp <= 0) {
        if (typeof logLine === 'function') {
          logLine(hero.name + ' jatuh. Pedangnya berdenting di batu.', 'danger');
        }
        if (typeof flashSlot === 'function') flashSlot(slotEl, 'kill');
        if (typeof triggerDeath === 'function') triggerDeath(hero);
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'treasure') {
      if (typeof logLine === 'function') {
        logLine('Cahaya emas menari di ujung ruang ' + (i + 1) + '...', 'warning');
      }
      await waitBeat('threat');
      if (typeof logLine === 'function') {
        logLine('Pintu vault terbuka. Bau logam dan keserakahan.');
      }
      await waitBeat('actionGap');

      if (hero.hp > 0) {
        var stolen = Math.round(goldReward * 0.4 + 15);
        goldReward = Math.max(0, goldReward - stolen);
        if (typeof logLine === 'function') {
          logLine(hero.name + ' mengais peti — +' + stolen + ' gold ke kantongnya.', 'warning');
        }
        heroVictory = true;
      }
      await waitBeat('resolve');
    }

    if (slotEl) slotEl.classList.add('raid-cleared');
    await waitBeat('betweenRooms');
  }

  await waitBeat('ending');
  document.querySelectorAll('.dungeon-slot').forEach(function (s) {
    s.classList.remove('raid-active', 'raid-cleared', 'slot-triggered', 'slot-kill');
  });

  if (hero.hp > 0 && !heroEscape && !heroVictory) {
    if (typeof logLine === 'function') {
      logLine(hero.name + ' muncul di pintu keluar — berlumur, tapi hidup.', 'warning');
    }
    heroVictory = true;
  }

  if (dungeonWin) {
    if (typeof logLine === 'function') {
      logLine('Dungeon menang. Tubuhnya tidak akan keluar dari sini.', 'success');
    }
    goldReward += 25 + state.slotCount * 8;
    soulsReward += 1;
    state.stats.dungeonWins++;
  } else if (heroEscape) {
    state.stats.heroEscapes++;
    goldReward = Math.round(goldReward * 0.3);
  } else if (heroVictory) {
    state.stats.heroVictories++;
    goldReward = Math.round(goldReward * 0.5);
  }

  state.gold += goldReward;
  state.souls += soulsReward;
  state.stats.raidsTotal++;

  if (typeof logLine === 'function') {
    logLine('Reward: +' + goldReward + ' Gold' + (soulsReward ? ' +' + soulsReward + ' Souls' : ''), 'info');
  }
  if (status) status.textContent = 'Raid selesai';

  raidInProgress = false;
  saveState();
  if (typeof renderAll === 'function') renderAll();
  setTimeout(function () {
    if (typeof hideHeroToken === 'function') hideHeroToken();
  }, 1400);
}

function simulateOfflineProgress() {
  var now = Date.now();
  var elapsed = now - (state.lastActive || now);
  var hours = elapsed / (1000 * 60 * 60);
  if (hours < 0.25) return null;
  var raids = Math.min(12, Math.floor(hours * 1.8));
  if (raids < 1) return null;
  var gold = 0, souls = 0, wins = 0;
  for (var i = 0; i < raids; i++) {
    if (Math.random() < 0.55) {
      wins++;
      gold += 18 + state.slotCount * 5;
      if (Math.random() < 0.25) souls += 1;
    } else gold += 6;
  }
  state.gold += gold;
  state.souls += souls;
  state.stats.raidsTotal += raids;
  state.stats.dungeonWins += wins;
  saveState();
  return { raids: raids, gold: gold, souls: souls, wins: wins, hours: hours.toFixed(1) };
}
