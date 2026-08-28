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

  var beat = typeof STAGE_BEAT !== 'undefined' ? STAGE_BEAT : {
    enterDungeon: 500, arriveRoom: 450, threat: 400, actionGap: 380,
    combatRound: 420, resolve: 500, betweenRooms: 350, ending: 700
  };

  var hero = buildHero();
  if (typeof updateHeroCard === 'function') updateHeroCard(hero);
  if (typeof showHeroToken === 'function') showHeroToken(hero);

  if (typeof logLine === 'function') {
    logLine(hero.name + ' the ' + hero.className + ' berdiri di pintu masuk...', 'info');
  }
  await sleep(beat.enterDungeon);
  if (typeof logLine === 'function') {
    logLine(hero.name + ' melangkah masuk ke dungeon.', 'info');
  }
  await sleep(beat.betweenRooms);

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

    await sleep(beat.arriveRoom);

    if (!slot) {
      if (typeof logLine === 'function') {
        logLine('Ruang ' + (i + 1) + ' kosong. Hanya koridor gelap...', 'info');
      }
      await sleep(beat.resolve);
      continue;
    }

    var cat = catalogFor(slot.catalogId, slot.kind);
    var level = getItemLevel(slot.catalogId);

    if (slot.kind === 'trap') {
      if (typeof logLine === 'function') {
        logLine('Sesuatu berkilau di lantai ruang ' + (i + 1) + '...', 'warning');
      }
      await sleep(beat.threat);

      if (typeof logLine === 'function') {
        logLine('Trap: ' + cat.name + ' (Lv.' + level + ')!', 'danger');
      }
      if (typeof flashSlot === 'function') flashSlot(slotEl, 'triggered');
      await sleep(beat.actionGap);

      var dmg = cat.baseDamage + (level - 1) * cat.dmgPerLevel;
      if (hero.trapEvasion && Math.random() < hero.trapEvasion) {
        if (typeof logLine === 'function') logLine(hero.name + ' berhasil menghindar!', 'success');
        dmg = 0;
      }

      if (dmg > 0) {
        hero.hp -= dmg;
        if (typeof logLine === 'function') logLine('Terkena ' + dmg + ' damage.', 'danger');
        if (typeof updateHeroCard === 'function') updateHeroCard(hero);
        checkPanic(hero);
      }

      if (cat.id === 'poison' && dmg > 0) {
        hero.status.push({ type: 'poison', rounds: cat.dotRounds, dmg: Math.round(dmg * 0.4) });
        if (typeof logLine === 'function') logLine('Racun mengalir di tubuhnya...', 'danger');
      }
      if (cat.id === 'net' && dmg > 0) {
        hero.atk = Math.round(hero.atk * (1 - cat.atkReduction));
        if (typeof logLine === 'function') logLine('Hero terjerat! ATK menurun.', 'danger');
      }

      await sleep(beat.resolve);

      if (hero.hp <= 0) {
        if (typeof logLine === 'function') logLine(hero.name + ' gugur di trap.', 'danger');
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
        logLine('Bayangan bergerak di ruang ' + (i + 1) + '...', 'warning');
      }
      await sleep(beat.threat);

      if (typeof logLine === 'function') {
        logLine(cat.name + ' (Lv.' + level + ') muncul! HP ' + monHp, 'danger');
      }
      await sleep(beat.actionGap);

      var levelGap = level - hero.level;
      if (!hero.fearImmune && levelGap >= hero.fleeThreshold) {
        if (typeof logLine === 'function') {
          logLine(hero.name + ' merasa kewalahan dan memutuskan kabur!', 'warning');
        }
        triggerFlee(hero);
        heroEscape = true;
        await sleep(beat.resolve);
        break;
      }

      var mHp = monHp;
      while (mHp > 0 && hero.hp > 0) {
        await sleep(beat.combatRound);

        hero.status = hero.status.filter(function (s) {
          if (s.type === 'poison' && s.rounds > 0) {
            hero.hp -= s.dmg;
            if (typeof logLine === 'function') logLine('Racun: -' + s.dmg + ' HP', 'danger');
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
            logLine(hero.name + ' mengamuk! ATK naik & heal sedikit.', 'ember');
          }
          if (typeof updateHeroCard === 'function') updateHeroCard(hero);
          await sleep(beat.actionGap);
        }

        var hDmg = Math.max(1, hero.atk - monDef);
        mHp -= hDmg;
        if (typeof logLine === 'function') {
          logLine(hero.name + ' menyerang → ' + hDmg + ' dmg (sisa monster ' + Math.max(0, Math.floor(mHp)) + ')');
        }

        if (mHp <= 0) {
          if (typeof logLine === 'function') logLine(cat.name + ' dikalahkan!', 'success');
          if (typeof flashSlot === 'function') flashSlot(slotEl, 'cleared');
          goldReward += 8 + level * 3;
          break;
        }

        var mDmg = Math.max(1, monAtk - hero.def);
        hero.hp -= mDmg;
        if (typeof logLine === 'function') logLine(cat.name + ' memukul → ' + mDmg + ' dmg');
        if (typeof updateHeroCard === 'function') updateHeroCard(hero);
        checkPanic(hero);
      }

      await sleep(beat.resolve);

      if (hero.hp <= 0) {
        if (typeof logLine === 'function') logLine(hero.name + ' gugur dalam pertarungan.', 'danger');
        if (typeof flashSlot === 'function') flashSlot(slotEl, 'kill');
        if (typeof triggerDeath === 'function') triggerDeath(hero);
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'treasure') {
      if (typeof logLine === 'function') {
        logLine('Cahaya emas di ujung ruang ' + (i + 1) + '...', 'warning');
      }
      await sleep(beat.threat);
      if (typeof logLine === 'function') logLine('Treasure Vault terbuka!');
      await sleep(beat.actionGap);

      if (hero.hp > 0) {
        var stolen = Math.round(goldReward * 0.4 + 15);
        goldReward = Math.max(0, goldReward - stolen);
        if (typeof logLine === 'function') {
          logLine('Hero mencuri sebagian harta (+' + stolen + ' gold ke hero).', 'warning');
        }
        heroVictory = true;
      }
      await sleep(beat.resolve);
    }

    if (slotEl) slotEl.classList.add('raid-cleared');
    await sleep(beat.betweenRooms);
  }

  await sleep(beat.ending);
  document.querySelectorAll('.dungeon-slot').forEach(function (s) {
    s.classList.remove('raid-active', 'raid-cleared', 'slot-triggered', 'slot-kill');
  });

  if (hero.hp > 0 && !heroEscape && !heroVictory) {
    if (typeof logLine === 'function') logLine(hero.name + ' berhasil keluar hidup-hidup!', 'warning');
    heroVictory = true;
  }

  if (dungeonWin) {
    if (typeof logLine === 'function') logLine('Dungeon menang! Hero dihentikan.', 'success');
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
