const TRAPS = {
  spike: {
    id: 'spike', name: 'Spike Trap', icon: '🗡', kind: 'trap',
    desc: 'Damage instan saat terinjak.',
    baseDamage: 12, dmgPerLevel: 6,
    cost: { gold: 0, souls: 0 }
  },
  poison: {
    id: 'poison', name: 'Poison Trap', icon: '☠', kind: 'trap',
    desc: 'Racun berjalan, damage tiap giliran combat berikutnya.',
    baseDamage: 5, dmgPerLevel: 2, dotRounds: 3,
    cost: { gold: 40, souls: 0 }
  },
  net: {
    id: 'net', name: 'Net Trap', icon: '🕸', kind: 'trap',
    desc: 'Hero terjerat, ATK menurun untuk sisa raid.',
    baseDamage: 4, dmgPerLevel: 1, atkReduction: 0.25,
    cost: { gold: 70, souls: 0 }
  }
};

const MONSTERS = {
  skeleton: {
    id: 'skeleton', name: 'Skeleton Archer', icon: '🏹', kind: 'monster',
    desc: 'Ranged, ATK rendah tapi konsisten.',
    baseHp: 30, baseAtk: 7, baseDef: 1,
    hpPerLevel: 10, atkPerLevel: 2,
    cost: { gold: 0, souls: 0 }
  },
  goblin: {
    id: 'goblin', name: 'Goblin Brute', icon: '👹', kind: 'monster',
    desc: 'HP rendah, ATK tinggi. Cepat mati, cepat membunuh.',
    baseHp: 22, baseAtk: 11, baseDef: 0,
    hpPerLevel: 6, atkPerLevel: 3,
    cost: { gold: 50, souls: 0 }
  },
  ogre: {
    id: 'ogre', name: 'Bone Ogre', icon: '🦴', kind: 'monster',
    desc: 'HP tinggi, tahan lama. Baik untuk menguras hero.',
    baseHp: 55, baseAtk: 6, baseDef: 3,
    hpPerLevel: 14, atkPerLevel: 2,
    cost: { gold: 90, souls: 5 }
  }
};

const TREASURE = {
  id: 'treasure',
  name: 'Treasure Vault',
  icon: '💰',
  kind: 'treasure',
  desc: 'Jika hero mencapai ruang ini hidup-hidup, ia mencuri sebagian rewardmu.'
};

const HERO_ARCHETYPES = [
  {
    id: 'warrior',
    name: 'Warrior',
    className: 'Warrior',
    icon: '⚔',
    color: 'var(--bone)',
    baseHp: 60,
    baseAtk: 9,
    baseDef: 3,
    fleeThreshold: 3,
    fearImmune: false,
    canRage: false
  },
  {
    id: 'rogue',
    name: 'Rogue',
    className: 'Rogue',
    icon: '🗡',
    color: 'var(--soul)',
    baseHp: 42,
    baseAtk: 11,
    baseDef: 1,
    fleeThreshold: 2,
    trapEvasion: 0.4,
    fearImmune: false,
    canRage: false
  },
  {
    id: 'berserker',
    name: 'Berserker',
    className: 'Berserker',
    icon: '🪓',
    color: 'var(--ember-bright)',
    baseHp: 65,
    baseAtk: 10,
    baseDef: 1,
    fleeThreshold: 999,
    fearImmune: true,
    canRage: true,
    rageHpThreshold: 0.3,
    rageAtkMultiplier: 1.5,
    rageHealFraction: 0.15
  }
];

const NAME_POOL = [
  'Sir William',
  'Dame Ottavia',
  'Korrin the Bold',
  'Fenwick Ash',
  'Brannigan',
  'Ysolde Thorn',
  'Garrick Vane',
  'Marrow the Grim',
  'Petra Loam',
  'Osric Hale'
];

const DEFAULT_STATE = {
  gold: 30,
  souls: 0,
  slotCount: 3,
  maxSlotCount: 5,
  dungeon: [null, null, null],
  levels: {
    spike: 1,
    poison: 1,
    net: 1,
    skeleton: 1,
    goblin: 1,
    ogre: 1
  },
  unlocked: {
    spike: true,
    poison: false,
    net: false,
    skeleton: true,
    goblin: false,
    ogre: false,
    slot4: false,
    slot5: false
  },
  stats: {
    raidsTotal: 0,
    dungeonWins: 0,
    heroEscapes: 0,
    heroVictories: 0
  },
  lastActive: Date.now()
};

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

const UPGRADE_DEFS = [
  { id: 'spike', label: 'Spike Trap — Damage', type: 'trap', baseCost: 20 },
  { id: 'poison', label: 'Poison Trap — Damage', type: 'trap', baseCost: 30, requiresUnlock: 'poison' },
  { id: 'net', label: 'Net Trap — Damage', type: 'trap', baseCost: 35, requiresUnlock: 'net' },
  { id: 'skeleton', label: 'Skeleton Archer — Level', type: 'monster', baseCost: 25 },
  { id: 'goblin', label: 'Goblin Brute — Level', type: 'monster', baseCost: 35, requiresUnlock: 'goblin' },
  { id: 'ogre', label: 'Bone Ogre — Level', type: 'monster', baseCost: 45, requiresUnlock: 'ogre' }
];

const UNLOCK_DEFS = [
  { id: 'poison', label: 'Buka: Poison Trap', cost: { gold: 40, souls: 0 } },
  { id: 'net', label: 'Buka: Net Trap', cost: { gold: 70, souls: 0 } },
  { id: 'goblin', label: 'Buka: Goblin Brute', cost: { gold: 50, souls: 0 } },
  { id: 'ogre', label: 'Buka: Bone Ogre', cost: { gold: 90, souls: 5 } },
  { id: 'slot4', label: 'Gali Ruang ke-4', cost: { gold: 120, souls: 10 } },
  { id: 'slot5', label: 'Gali Ruang ke-5', cost: { gold: 220, souls: 20 } }
];

function renderPalette() {
  const trapWrap = document.getElementById('palette-traps');
  const monsterWrap = document.getElementById('palette-monsters');
  const specialWrap = document.getElementById('palette-special');

  if (!trapWrap || !monsterWrap || !specialWrap) return;

  trapWrap.innerHTML = '';
  monsterWrap.innerHTML = '';
  specialWrap.innerHTML = '';

  Object.values(TRAPS).forEach(item => renderPaletteItem(item, trapWrap));
  Object.values(MONSTERS).forEach(item => renderPaletteItem(item, monsterWrap));
  renderPaletteItem(TREASURE, specialWrap, true);
}

function isUnlocked(id) {
  if (id === 'spike' || id === 'skeleton' || id === 'treasure') return true;
  return !!state.unlocked[id];
}

function renderPaletteItem(item, wrap, alwaysUnlocked) {
  const unlocked = alwaysUnlocked || isUnlocked(item.id);
  const div = document.createElement('div');

  div.className = 'palette-item' + (unlocked ? '' : ' locked');

  if (selectedPaletteItem && selectedPaletteItem.id === item.id) {
    div.classList.add('selected');
  }

  const levelTag =
    item.kind === 'trap' || item.kind === 'monster'
      ? `<div class="palette-item-level">Lv.${state.levels[item.id] || 1}</div>`
      : '';

  div.innerHTML = `
    <span class="palette-icon">${item.icon}</span>
    <div class="palette-info">
      <div class="palette-item-name">${item.name}</div>
      <div class="palette-item-desc">${unlocked ? item.desc : 'Terkunci — buka di panel Peningkatan'}</div>
    </div>
    ${unlocked ? levelTag : ''}
  `;

  if (unlocked) {
    div.addEventListener('click', () => {
      selectedPaletteItem =
        selectedPaletteItem && selectedPaletteItem.id === item.id
          ? null
          : { id: item.id, kind: item.kind };

      renderPalette();
    });
  }

  wrap.appendChild(div);
}

function catalogFor(catalogId, kind) {
  if (kind === 'trap') return TRAPS[catalogId];
  if (kind === 'monster') return MONSTERS[catalogId];
  if (kind === 'treasure') return TREASURE;
  return null;
}

function renderDungeonSlots() {
  const wrap = document.getElementById('dungeon-slots');
  if (!wrap) return;

  wrap.innerHTML = '';

  const entrance = document.createElement('div');
  entrance.className = 'dungeon-slot entrance';
  entrance.innerHTML = `<span class="slot-icon">🚪</span><span class="slot-label">Masuk</span>`;
  wrap.appendChild(entrance);

  for (let i = 0; i < state.maxSlotCount; i++) {
    if (i > 0) {
      const connector = document.createElement('div');
      connector.className = 'slot-connector';
      wrap.appendChild(connector);
    }

    const locked = i >= state.slotCount;
    const slotData = state.dungeon[i];
    const slotEl = document.createElement('div');

    slotEl.className =
      'dungeon-slot' +
      (locked ? ' locked-slot' : '') +
      (slotData ? ' filled' : '');

    slotEl.dataset.index = i;

    const indexTag = `<span class="slot-index">${i + 1}</span>`;

    if (locked) {
      slotEl.innerHTML =
        `${indexTag}<span class="slot-icon">⛏</span><span class="slot-label">Terkunci</span>`;
    } else if (slotData) {
      const cat = catalogFor(slotData.catalogId, slotData.kind);

      slotEl.innerHTML =
        `${indexTag}<span class="slot-icon">${cat.icon}</span><span class="slot-label">${cat.name}</span>`;

      slotEl.addEventListener('click', () => {
        if (raidInProgress) return;
        state.dungeon[i] = null;
        saveState();
        renderAll();
      });
    } else {
      slotEl.innerHTML =
        `${indexTag}<span class="slot-icon">·</span><span class="slot-label">Kosong</span>`;

      slotEl.addEventListener('click', () => {
        if (raidInProgress || !selectedPaletteItem) return;

        state.dungeon[i] = {
          catalogId: selectedPaletteItem.id,
          kind: selectedPaletteItem.kind
        };

        selectedPaletteItem = null;
        saveState();
        renderAll();
      });
    }

    wrap.appendChild(slotEl);
  }
}

function affordable(cost) {
  return (
    state.gold >= (cost.gold || 0) &&
    state.souls >= (cost.souls || 0)
  );
}

function spend(cost) {
  state.gold -= cost.gold || 0;
  state.souls -= cost.souls || 0;
}

function costLabel(cost) {
  const parts = [];
  if (cost.gold) parts.push(`${cost.gold}g`);
  if (cost.souls) parts.push(`${cost.souls}s`);
  return parts.length ? parts.join(' + ') : 'Gratis';
}

function renderUpgrades() {
  const wrap = document.getElementById('upgrade-list');
  if (!wrap) return;

  wrap.innerHTML = '';

  UPGRADE_DEFS.forEach(def => {
    if (def.requiresUnlock && !isUnlocked(def.requiresUnlock)) return;

    const level = state.levels[def.id] || 1;
    const cost = {
      gold: upgradeCost(def.baseCost, level),
      souls: 0
    };

    const can = affordable(cost);
    const div = document.createElement('div');

    div.className = 'upgrade-item';

    div.innerHTML = `
      <div class="upgrade-item-top">
        <span class="upgrade-item-name">${def.label}</span>
        <span class="upgrade-item-level">Lv.${level}</span>
      </div>
      <div class="upgrade-item-cost">Biaya: ${costLabel(cost)}</div>
      <div class="upgrade-btn-row">
        <button class="btn btn-small" ${can ? '' : 'disabled'}>Tingkatkan</button>
      </div>
    `;

    div.querySelector('button').addEventListener('click', () => {
      if (!affordable(cost)) return;
      spend(cost);
      state.levels[def.id] = level + 1;
      saveState();
      renderAll();
    });

    wrap.appendChild(div);
  });

  UNLOCK_DEFS.forEach(def => {
    if (state.unlocked[def.id]) return;
    if (def.id === 'slot4' && state.slotCount !== 3) return;
    if (def.id === 'slot5' && state.slotCount !== 4) return;

    const can = affordable(def.cost);
    const div = document.createElement('div');

    div.className = 'upgrade-item';

    div.innerHTML = `
      <div class="upgrade-item-top">
        <span class="upgrade-item-name">${def.label}</span>
      </div>
      <div class="upgrade-item-cost">Biaya: ${costLabel(def.cost)}</div>
      <div class="upgrade-btn-row">
        <button class="btn btn-small" ${can ? '' : 'disabled'}>Buka</button>
      </div>
    `;

    div.querySelector('button').addEventListener('click', () => {
      if (!affordable(def.cost)) return;
      spend(def.cost);
      state.unlocked[def.id] = true;
      if (def.id === 'slot4') state.slotCount = 4;
      if (def.id === 'slot5') state.slotCount = 5;
      saveState();
      renderAll();
    });

    wrap.appendChild(div);
  });
}

function renderStats() {
  const wrap = document.getElementById('stats-list');
  if (!wrap) return;

  const s = state.stats;
  const rows = [
    ['Total Raid', s.raidsTotal],
    ['Dungeon Menang', s.dungeonWins],
    ['Hero Kabur', s.heroEscapes],
    ['Hero Menang', s.heroVictories]
  ];

  wrap.innerHTML = rows
    .map(([label, val]) =>
      `<div class="stat-row"><span>${label}</span><span>${val}</span></div>`
    )
    .join('');
}

function renderCurrencies() {
  const gold = document.getElementById('gold-value');
  const souls = document.getElementById('souls-value');
  if (gold) gold.textContent = Math.floor(state.gold);
  if (souls) souls.textContent = Math.floor(state.souls);
}

function renderAll() {
  renderCurrencies();
  renderPalette();
  renderDungeonSlots();
  renderUpgrades();
  renderStats();

  const startButton = document.getElementById('btn-start-raid');
  if (startButton) {
    startButton.disabled = raidInProgress;
  }
}

/* ========== OVERLAY CONTROLS (baru) ========== */

function openOverlay(which) {
  const palette = document.getElementById('palette-overlay');
  const upgrades = document.getElementById('upgrades-overlay');

  closeAllOverlays();

  if (which === 'palette' && palette) {
    palette.classList.remove('side-overlay--hidden');
    palette.setAttribute('aria-hidden', 'false');
  } else if (which === 'upgrades' && upgrades) {
    upgrades.classList.remove('side-overlay--hidden');
    upgrades.setAttribute('aria-hidden', 'false');
  }

  document.body.classList.add('overlay-active');
}

function closeAllOverlays() {
  document.querySelectorAll('.side-overlay').forEach(el => {
    el.classList.add('side-overlay--hidden');
    el.setAttribute('aria-hidden', 'true');
  });
  document.body.classList.remove('overlay-active');
}

function initOverlayControls() {
  const btnPalette = document.getElementById('btn-open-palette');
  const btnUpgrades = document.getElementById('btn-open-upgrades');
  const btnClosePalette = document.getElementById('btn-close-palette');
  const btnCloseUpgrades = document.getElementById('btn-close-upgrades');

  if (btnPalette) btnPalette.addEventListener('click', () => openOverlay('palette'));
  if (btnUpgrades) btnUpgrades.addEventListener('click', () => openOverlay('upgrades'));
  if (btnClosePalette) btnClosePalette.addEventListener('click', closeAllOverlays);
  if (btnCloseUpgrades) btnCloseUpgrades.addEventListener('click', closeAllOverlays);

  document.querySelectorAll('[data-close-overlay]').forEach(el => {
    el.addEventListener('click', closeAllOverlays);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllOverlays();
  });
}

/* ========== RAID LOGIC (dari repo asli) ========== */

function getItemLevel(catalogId) {
  return state.levels[catalogId] || 1;
}

function buildHero() {
  const arch = HERO_ARCHETYPES[Math.floor(Math.random() * HERO_ARCHETYPES.length)];
  const avgLevel = Math.max(
    1,
    Math.round(
      Object.values(state.levels).reduce((a, b) => a + b, 0) /
        Object.keys(state.levels).length
    )
  );

  const level = Math.max(1, avgLevel + Math.floor(Math.random() * 3) - 1);
  const hp = Math.round(arch.baseHp + (level - 1) * 8);
  const atk = Math.round(arch.baseAtk + (level - 1) * 1.5);
  const def = Math.round(arch.baseDef + (level - 1) * 0.4);

  return {
    ...arch,
    name: NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)],
    level,
    maxHp: hp,
    hp,
    atk,
    def,
    status: [],
    raged: false
  };
}

function logLine(text, type = '') {
  const log = document.getElementById('raid-log');
  if (!log) return;
  const p = document.createElement('p');
  p.className = 'raid-log-line' + (type ? ` ${type}` : '');
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

function clearRaidLog() {
  const log = document.getElementById('raid-log');
  if (log) log.innerHTML = '';
}

function updateHeroCard(hero) {
  const card = document.getElementById('hero-card');
  if (!card) return;

  card.classList.remove('hero-card--hidden');
  document.getElementById('hero-name').textContent = hero.name;
  document.getElementById('hero-class').textContent = hero.className;
  document.getElementById('hero-level').textContent = `Lv. ${hero.level}`;
  document.getElementById('hero-hp-text').textContent = `HP ${Math.max(0, Math.floor(hero.hp))}/${hero.maxHp}`;

  const fill = document.getElementById('hero-hp-fill');
  if (fill) {
    const pct = Math.max(0, (hero.hp / hero.maxHp) * 100);
    fill.style.width = pct + '%';
    fill.classList.toggle('low', pct <= 30);
  }

  const reaction = document.getElementById('hero-reaction');
  if (reaction) reaction.textContent = '';
}

function setReaction(text) {
  const el = document.getElementById('hero-reaction');
  if (el) el.textContent = text;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runRaid() {
  if (raidInProgress) return;
  raidInProgress = true;
  renderAll();

  clearRaidLog();
  const status = document.getElementById('raid-status');
  if (status) status.textContent = 'Raid berlangsung...';

  const hero = buildHero();
  updateHeroCard(hero);
  logLine(`${hero.name} the ${hero.className} memasuki dungeon...`, 'info');

  let goldReward = 0;
  let soulsReward = 0;
  let dungeonWin = false;
  let heroVictory = false;
  let heroEscape = false;

  const slots = state.dungeon.slice(0, state.slotCount);

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const slotEl = document.querySelector(`.dungeon-slot[data-index="${i}"]`);
    if (slotEl) {
      document.querySelectorAll('.dungeon-slot').forEach(s => s.classList.remove('raid-active'));
      slotEl.classList.add('raid-active');
    }

    await sleep(600);

    if (!slot) {
      logLine(`Ruang ${i + 1} kosong. Hero melanjutkan.`);
      continue;
    }

    const cat = catalogFor(slot.catalogId, slot.kind);
    const level = getItemLevel(slot.catalogId);

    if (slot.kind === 'trap') {
      logLine(`Hero menginjak ${cat.name} (Lv.${level})!`);

      let dmg = cat.baseDamage + (level - 1) * cat.dmgPerLevel;
      if (hero.trapEvasion && Math.random() < hero.trapEvasion) {
        logLine(`${hero.name} berhasil menghindar!`, 'success');
        dmg = 0;
      }

      if (dmg > 0) {
        hero.hp -= dmg;
        logLine(`Terkena ${dmg} damage.`, 'danger');
        updateHeroCard(hero);
      }

      if (cat.id === 'poison' && dmg > 0) {
        hero.status.push({ type: 'poison', rounds: cat.dotRounds, dmg: Math.round(dmg * 0.4) });
        logLine('Racun mengalir di tubuhnya...', 'danger');
      }
      if (cat.id === 'net' && dmg > 0) {
        hero.atk = Math.round(hero.atk * (1 - cat.atkReduction));
        logLine('Hero terjerat! ATK menurun.', 'danger');
      }

      if (hero.hp <= 0) {
        logLine(`${hero.name} gugur di trap.`, 'danger');
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'monster') {
      const monHp = cat.baseHp + (level - 1) * cat.hpPerLevel;
      const monAtk = cat.baseAtk + (level - 1) * cat.atkPerLevel;
      const monDef = cat.baseDef || 0;

      logLine(`${cat.name} (Lv.${level}) muncul! HP ${monHp}`);

      // Level gap flee check
      const levelGap = level - hero.level;
      if (!hero.fearImmune && levelGap >= hero.fleeThreshold) {
        logLine(`${hero.name} merasa kewalahan dan memutuskan kabur!`, 'warning');
        setReaction('KABUR!');
        heroEscape = true;
        break;
      }

      let mHp = monHp;
      let round = 0;

      while (mHp > 0 && hero.hp > 0) {
        round++;
        await sleep(450);

        // poison tick
        hero.status = hero.status.filter(s => {
          if (s.type === 'poison' && s.rounds > 0) {
            hero.hp -= s.dmg;
            logLine(`Racun: -${s.dmg} HP`, 'danger');
            s.rounds--;
            return s.rounds > 0;
          }
          return true;
        });
        updateHeroCard(hero);
        if (hero.hp <= 0) break;

        // rage check
        if (hero.canRage && !hero.raged && hero.hp / hero.maxHp <= hero.rageHpThreshold) {
          hero.raged = true;
          hero.atk = Math.round(hero.atk * hero.rageAtkMultiplier);
          hero.hp = Math.min(hero.maxHp, hero.hp + Math.round(hero.maxHp * hero.rageHealFraction));
          setReaction('RAGE!');
          logLine(`${hero.name} mengamuk! ATK naik & heal sedikit.`, 'ember');
          updateHeroCard(hero);
        }

        // panic visual
        if (hero.hp / hero.maxHp <= 0.3) {
          setReaction('PANIK...');
        }

        // hero attack
        const hDmg = Math.max(1, hero.atk - monDef);
        mHp -= hDmg;
        logLine(`${hero.name} menyerang → ${hDmg} dmg (sisa monster ${Math.max(0, Math.floor(mHp))})`);

        if (mHp <= 0) {
          logLine(`${cat.name} dikalahkan!`, 'success');
          goldReward += 8 + level * 3;
          break;
        }

        // monster attack
        const mDmg = Math.max(1, monAtk - hero.def);
        hero.hp -= mDmg;
        logLine(`${cat.name} memukul → ${mDmg} dmg`);
        updateHeroCard(hero);
      }

      if (hero.hp <= 0) {
        logLine(`${hero.name} gugur dalam pertarungan.`, 'danger');
        dungeonWin = true;
        break;
      }
    }

    if (slot.kind === 'treasure') {
      logLine(`Hero menemukan Treasure Vault!`);
      if (hero.hp > 0) {
        const stolen = Math.round(goldReward * 0.4 + 15);
        goldReward = Math.max(0, goldReward - stolen);
        logLine(`Hero mencuri sebagian harta (+${stolen} gold ke hero).`, 'warning');
        heroVictory = true;
      }
    }

    if (slotEl) slotEl.classList.add('raid-cleared');
  }

  // akhir raid
  await sleep(400);
  document.querySelectorAll('.dungeon-slot').forEach(s => {
    s.classList.remove('raid-active', 'raid-cleared');
  });

  if (hero.hp > 0 && !heroEscape && !heroVictory) {
    logLine(`${hero.name} berhasil keluar hidup-hidup!`, 'warning');
    heroVictory = true;
  }

  if (dungeonWin) {
    logLine('Dungeon menang! Hero dihentikan.', 'success');
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

  logLine(`Reward: +${goldReward} Gold` + (soulsReward ? ` +${soulsReward} Souls` : ''), 'info');
  if (status) status.textContent = 'Raid selesai';

  raidInProgress = false;
  saveState();
  renderAll();
}

/* ========== OFFLINE ========== */

function simulateOfflineProgress() {
  const now = Date.now();
  const elapsed = now - (state.lastActive || now);
  const hours = elapsed / (1000 * 60 * 60);

  if (hours < 0.25) return null;

  const raids = Math.min(12, Math.floor(hours * 1.8));
  if (raids < 1) return null;

  let gold = 0;
  let souls = 0;
  let wins = 0;

  for (let i = 0; i < raids; i++) {
    const success = Math.random() < 0.55;
    if (success) {
      wins++;
      gold += 18 + state.slotCount * 5;
      if (Math.random() < 0.25) souls += 1;
    } else {
      gold += 6;
    }
  }

  state.gold += gold;
  state.souls += souls;
  state.stats.raidsTotal += raids;
  state.stats.dungeonWins += wins;
  saveState();

  return { raids, gold, souls, wins, hours: hours.toFixed(1) };
}

function showOfflineModal(summary) {
  const modal = document.getElementById('offline-modal');
  const body = document.getElementById('offline-summary');
  if (!modal || !body) return;

  body.innerHTML = `
    <p>Kamu pergi selama ~${summary.hours} jam.</p>
    <p>Simulasi offline: <strong>${summary.raids}</strong> raid.</p>
    <p>Dungeon menang: <strong>${summary.wins}</strong></p>
    <p>Gold didapat: <strong>+${summary.gold}</strong></p>
    <p>Souls didapat: <strong>+${summary.souls}</strong></p>
  `;
  modal.classList.remove('modal-overlay--hidden');
}

/* ========== INIT ========== */

function init() {
  const offlineSummary = simulateOfflineProgress();

  renderAll();
  initOverlayControls();

  const startButton = document.getElementById('btn-start-raid');
  if (startButton) {
    startButton.addEventListener('click', runRaid);
  }

  const closeOffline = document.getElementById('btn-close-offline');
  if (closeOffline) {
    closeOffline.addEventListener('click', () => {
      document.getElementById('offline-modal').classList.add('modal-overlay--hidden');
    });
  }

  if (offlineSummary) {
    showOfflineModal(offlineSummary);
  }

  window.addEventListener('beforeunload', saveState);
  setInterval(saveState, 30000);
}

document.addEventListener('DOMContentLoaded', init);