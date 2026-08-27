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
    startButton.disabled = raidInProgress || dungeonEmpty();
  }
}

function dungeonEmpty() {
  return state.dungeon
    .slice(0, state.slotCount)
    .every(slot => !slot);
}

function pickHeroLevel() {
  const avgLevel = averageDungeonLevel();
  const variance = Math.floor(Math.random() * 3) - 1;

  return Math.max(1, avgLevel + variance);
}

function averageDungeonLevel() {
  const filled = state.dungeon
    .slice(0, state.slotCount)
    .filter(s => s && s.kind !== 'treasure');

  if (!filled.length) return 1;

  const sum = filled.reduce(
    (acc, s) => acc + (state.levels[s.catalogId] || 1),
    0
  );

  return Math.round(sum / filled.length);
}

function generateHero() {
  const archetype =
    HERO_ARCHETYPES[
      Math.floor(Math.random() * HERO_ARCHETYPES.length)
    ];

  const level = pickHeroLevel();

  const name =
    NAME_POOL[
      Math.floor(Math.random() * NAME_POOL.length)
    ];

  const maxHp = archetype.baseHp + (level - 1) * 8;

  return {
    ...archetype,
    name,
    level,
    maxHp,
    hp: maxHp,
    atk: archetype.baseAtk + (level - 1) * 2,
    def: archetype.baseDef + Math.floor((level - 1) / 2),
    hasRaged: false,
    panicked: false,
    atkMultiplier: 1
  };
}

const logEl = () => document.getElementById('raid-log');

function clearLog() {
  const el = logEl();
  if (el) el.innerHTML = '';
}

function log(text, cls) {
  const el = logEl();
  if (!el) return;

  const p = document.createElement('p');
  p.className = 'log-line' + (cls ? ' ' + cls : '');
  p.textContent = text;

  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateHeroCard(hero) {
  const card = document.getElementById('hero-card');
  if (!card) return;

  card.classList.remove('hero-card--hidden');

  document.getElementById('hero-name').textContent = hero.name;
  document.getElementById('hero-class').textContent = hero.className;
  document.getElementById('hero-level').textContent = `Lv. ${hero.level}`;
  document.getElementById('hero-hp-text').textContent =
    `HP ${Math.max(0, Math.round(hero.hp))}/${hero.maxHp}`;

  const pct = Math.max(0, hero.hp / hero.maxHp * 100);
  const fill = document.getElementById('hero-hp-fill');

  fill.style.width = pct + '%';
  fill.classList.toggle('low', pct <= 30);
}

function showReaction(text, isRage) {
  const el = document.getElementById('hero-reaction');
  if (!el) return;

  el.textContent = text;
  el.classList.remove('show', 'rage');

  void el.offsetWidth;

  el.classList.add('show');

  if (isRage) {
    el.classList.add('rage');
  }
}

function clearSlotHighlights() {
  document.querySelectorAll('.dungeon-slot').forEach(el => {
    el.classList.remove('raid-active', 'raid-cleared');
  });
}

function highlightSlot(index, cls) {
  const slotEl =
    document.querySelector(`.dungeon-slot[data-index="${index}"]`);

  if (slotEl) slotEl.classList.add(cls);
}

async function resolveMonsterEncounter(hero, monsterDef, monsterLevel) {
  const monster = {
    name: monsterDef.name,
    hp: monsterDef.baseHp + (monsterLevel - 1) * monsterDef.hpPerLevel,
    atk: monsterDef.baseAtk + (monsterLevel - 1) * monsterDef.atkPerLevel,
    def: monsterDef.baseDef,
    level: monsterLevel
  };

  monster.maxHp = monster.hp;

  log(
    `${monster.name} (Lv.${monster.level}) menghadang di lorong.`,
    'hit'
  );

  await sleep(500);

  const levelGap = monster.level - hero.level;

  if (!hero.fearImmune && levelGap >= hero.fleeThreshold) {
    const fleeChance = Math.min(
      0.85,
      0.25 + (levelGap - hero.fleeThreshold) * 0.15
    );

    if (Math.random() < fleeChance) {
      showReaction(`${hero.name} mundur ketakutan!`, false);

      log(
        `${hero.name} melihat ${monster.name} terlalu kuat dan kabur dari dungeon.`,
        'reaction'
      );

      await sleep(700);

      return { result: 'flee' };
    }

    showReaction(
      `${hero.name} gemetar, tapi memutuskan bertarung.`,
      false
    );

    log(
      `${hero.name} ragu-ragu, tapi memilih melawan.`,
      'reaction'
    );

    await sleep(500);
  }

  let round = 0;

  while (
    hero.hp > 0 &&
    monster.hp > 0 &&
    round < 20
  ) {
    round++;

    const heroDmg = Math.max(
      1,
      Math.round(
        hero.atk * hero.atkMultiplier - monster.def
      )
    );

    monster.hp -= heroDmg;

    log(
      `${hero.name} menyerang ${monster.name} (-${heroDmg} HP).`,
      'hit'
    );

    await sleep(320);

    if (monster.hp <= 0) {
      log(`${monster.name} tumbang.`, 'hit');
      break;
    }

    const monsterDmg = Math.max(
      1,
      monster.atk - hero.def
    );

    hero.hp -= monsterDmg;

    updateHeroCard(hero);

    log(
      `${monster.name} membalas menyerang ${hero.name} (-${monsterDmg} HP).`,
      'hit'
    );

    await sleep(320);

    const hpFrac = hero.hp / hero.maxHp;

    if (
      hpFrac > 0 &&
      hpFrac <= 0.3 &&
      !hero.panicked &&
      !(hero.canRage && !hero.hasRaged)
    ) {
      hero.panicked = true;

      showReaction(
        `${hero.name} panik, HP kritis!`,
        false
      );

      log(
        `${hero.name} mulai panik melihat HP-nya menipis.`,
        'reaction'
      );

      await sleep(500);
    }

    if (
      hero.canRage &&
      !hero.hasRaged &&
      hpFrac > 0 &&
      hpFrac <= hero.rageHpThreshold
    ) {
      hero.hasRaged = true;
      hero.atkMultiplier = hero.rageAtkMultiplier;

      const healAmount =
        Math.round(hero.maxHp * hero.rageHealFraction);

      hero.hp = Math.min(
        hero.maxHp,
        hero.hp + healAmount
      );

      updateHeroCard(hero);

      showReaction(
        `"RAAAAGH!!" — ${hero.name} MENGAMUK!`,
        true
      );

      log(
        `★ ${hero.name} berteriak kencang dan memasuki mode RAGE! ATK meningkat drastis.`,
        'reaction'
      );

      await sleep(900);
    }

    if (hero.hp <= 0) {
      log(
        `${hero.name} tumbang di hadapan ${monster.name}.`,
        'defeat'
      );

      break;
    }
  }

  if (hero.hp <= 0) {
    return { result: 'hero_dead' };
  }

  if (monster.hp <= 0) {
    return { result: 'monster_dead' };
  }

  return { result: 'timeout' };
}

async function resolveTrap(hero, trapDef, trapLevel) {
  log(
    `${hero.name} menginjak ${trapDef.name}!`,
    'hit'
  );

  await sleep(400);

  if (
    hero.trapEvasion &&
    Math.random() < hero.trapEvasion
  ) {
    showReaction(
      `${hero.name} lincah menghindar!`,
      false
    );

    log(
      `${hero.name} berhasil menghindari efek trap.`,
      'reaction'
    );

    await sleep(500);
    return;
  }

  const dmg =
    trapDef.baseDamage +
    (trapLevel - 1) * trapDef.dmgPerLevel;

  hero.hp -= dmg;

  updateHeroCard(hero);

  log(
    `Trap mengenai ${hero.name} (-${dmg} HP).`,
    'hit'
  );

  if (trapDef.atkReduction) {
    hero.atkMultiplier *=
      1 - trapDef.atkReduction;

    log(
      `${hero.name} terjerat, ATK menurun untuk sisa raid.`,
      'reaction'
    );
  }

  if (trapDef.dotRounds) {
    log(
      `${hero.name} teracuni, akan melemah di pertarungan berikutnya.`,
      'reaction'
    );

    hero.poisonRounds =
      (hero.poisonRounds || 0) + trapDef.dotRounds;

    hero.poisonDmg = Math.round(dmg * 0.4);
  }

  await sleep(400);
}

async function runRaid() {
  if (raidInProgress || dungeonEmpty()) return;

  raidInProgress = true;

  clearLog();
  clearSlotHighlights();

  const startButton =
    document.getElementById('btn-start-raid');

  if (startButton) {
    startButton.disabled = true;
  }

  const raidStatus =
    document.getElementById('raid-status');

  if (raidStatus) {
    raidStatus.textContent = 'Raid berlangsung...';
  }

  const hero = generateHero();

  updateHeroCard(hero);

  const reaction =
    document.getElementById('hero-reaction');

  if (reaction) {
    reaction.classList.remove('show', 'rage');
  }

  log(
    `${hero.name} sang ${hero.className} (Lv.${hero.level}) memasuki dungeon.`,
    'hit'
  );

  await sleep(600);

  let outcome = null;
  let treasureStolen = false;

  for (let i = 0; i < state.slotCount; i++) {
    const slotData = state.dungeon[i];

    highlightSlot(i, 'raid-active');

    if (!slotData) {
      await sleep(300);
      highlightSlot(i, 'raid-cleared');
      continue;
    }

    if (slotData.kind === 'trap') {
      await applyPoisonIfAny(hero);

      const def = TRAPS[slotData.catalogId];

      await resolveTrap(
        hero,
        def,
        state.levels[slotData.catalogId] || 1
      );

      if (hero.hp <= 0) {
        outcome = 'hero_dead';
        highlightSlot(i, 'raid-cleared');
        break;
      }
    } else if (slotData.kind === 'monster') {
      await applyPoisonIfAny(hero);

      if (hero.hp <= 0) {
        outcome = 'hero_dead';
        highlightSlot(i, 'raid-cleared');
        break;
      }

      const def = MONSTERS[slotData.catalogId];

      const res = await resolveMonsterEncounter(
        hero,
        def,
        state.levels[slotData.catalogId] || 1
      );

      if (res.result === 'flee') {
        outcome = 'flee';
        highlightSlot(i, 'raid-cleared');
        break;
      }

      if (res.result === 'hero_dead') {
        outcome = 'hero_dead';
        highlightSlot(i, 'raid-cleared');
        break;
      }
    } else if (slotData.kind === 'treasure') {
      log(
        `${hero.name} menemukan Treasure Vault dan menjarahnya!`,
        'loot'
      );

      treasureStolen = true;

      await sleep(500);
    }

    highlightSlot(i, 'raid-cleared');
    await sleep(200);
  }

  if (!outcome) {
    outcome = 'hero_wins';
  }

  await finishRaid(
    hero,
    outcome,
    treasureStolen
  );
}

async function applyPoisonIfAny(hero) {
  if (hero.poisonRounds > 0) {
    hero.hp -= hero.poisonDmg;
    hero.poisonRounds -= 1;

    updateHeroCard(hero);

    log(
      `Racun mengalir di tubuh ${hero.name} (-${hero.poisonDmg} HP).`,
      'hit'
    );

    await sleep(350);
  }
}

async function finishRaid(
  hero,
  outcome,
  treasureStolen
) {
  state.stats.raidsTotal += 1;

  const dungeonPower = averageDungeonLevel();

  let goldReward = 0;
  let soulReward = 0;

  if (outcome === 'hero_dead') {
    state.stats.dungeonWins += 1;

    goldReward =
      15 +
      dungeonPower * 6 +
      hero.level * 4;

    soulReward =
      2 +
      Math.floor(dungeonPower / 2);

    log(
      `${hero.name} gugur. Dungeon-mu menang!`,
      'victory'
    );

    log(
      `+${goldReward} Gold, +${soulReward} Souls`,
      'loot'
    );
  } else if (outcome === 'flee') {
    state.stats.heroEscapes += 1;

    goldReward =
      6 +
      dungeonPower * 2;

    soulReward = 1;

    log(
      `${hero.name} berhasil kabur. Reward sebagian saja.`,
      'defeat'
    );

    log(
      `+${goldReward} Gold, +${soulReward} Souls`,
      'loot'
    );
  } else {
    state.stats.heroVictories += 1;

    goldReward = treasureStolen ? 2 : 5;
    soulReward = 1;

    log(
      `${hero.name} berhasil menaklukkan dungeon-mu!${treasureStolen ? ' Treasure dijarah.' : ''}`,
      'defeat'
    );

    log(
      `Hanya +${goldReward} Gold, +${soulReward} Souls. Waktunya redesign.`,
      'loot'
    );
  }

  state.gold += goldReward;
  state.souls += soulReward;

  saveState();

  raidInProgress = false;

  const raidStatus =
    document.getElementById('raid-status');

  if (raidStatus) {
    raidStatus.textContent = '';
  }

  renderAll();
}

const OFFLINE_RAID_INTERVAL_MIN = 8;
const OFFLINE_MAX_RAIDS = 15;

function simulateOfflineProgress() {
  const now = Date.now();

  const elapsedMs =
    now - (state.lastActive || now);

  const elapsedMin =
    elapsedMs / 60000;

  if (
    elapsedMin < OFFLINE_RAID_INTERVAL_MIN ||
    dungeonEmpty()
  ) {
    state.lastActive = now;
    return null;
  }

  const raidCount = Math.min(
    OFFLINE_MAX_RAIDS,
    Math.floor(
      elapsedMin / OFFLINE_RAID_INTERVAL_MIN
    )
  );

  const dungeonPower =
    averageDungeonLevel();

  let wins = 0;
  let escapes = 0;
  let losses = 0;
  let goldEarned = 0;
  let soulsEarned = 0;

  for (let i = 0; i < raidCount; i++) {
    const heroPower =
      3 + Math.random() * 6;

    const dungeonRoll =
      dungeonPower + Math.random() * 3;

    if (dungeonRoll >= heroPower) {
      wins++;

      goldEarned +=
        15 + dungeonPower * 6;

      soulsEarned +=
        2 + Math.floor(dungeonPower / 2);
    } else if (dungeonRoll >= heroPower - 2) {
      escapes++;

      goldEarned +=
        6 + dungeonPower * 2;

      soulsEarned += 1;
    } else {
      losses++;

      goldEarned += 4;
      soulsEarned += 1;
    }
  }

  state.gold += goldEarned;
  state.souls += soulsEarned;

  state.stats.raidsTotal += raidCount;
  state.stats.dungeonWins += wins;
  state.stats.heroEscapes += escapes;
  state.stats.heroVictories += losses;

  state.lastActive = now;

  saveState();

  return {
    raidCount,
    wins,
    escapes,
    losses,
    goldEarned,
    soulsEarned
  };
}

function showOfflineModal(summary) {
  const modal =
    document.getElementById('offline-modal');

  const body =
    document.getElementById('offline-summary');

  if (!modal || !body) return;

  body.innerHTML = `
    <p>Dungeon-mu diraid <strong>${summary.raidCount}x</strong> selagi kau pergi.</p>
    <p>🏆 Menang: <strong>${summary.wins}</strong> &nbsp; 🏃 Hero kabur: <strong>${summary.escapes}</strong> &nbsp; 💀 Hero menang: <strong>${summary.losses}</strong></p>
    <p>Total didapat: <strong>+${summary.goldEarned} Gold</strong>, <strong>+${summary.soulsEarned} Souls</strong></p>
  `;

  modal.classList.remove(
    'modal-overlay--hidden'
  );
}

function initOverlayControls() {
  const palettePanel =
    document.querySelector('.palette-panel');

  const upgradesPanel =
    document.querySelector('.upgrades-panel');

  const closeButtons =
    document.querySelectorAll(
      '[data-close-panel]'
    );

  document
    .querySelectorAll('[data-open-panel]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const target =
          button.dataset.openPanel;

        const panel =
          target === 'palette'
            ? palettePanel
            : target === 'upgrades'
              ? upgradesPanel
              : null;

        if (!panel) return;

        document
          .querySelectorAll('.panel.is-overlay-open')
          .forEach(openPanel => {
            openPanel.classList.remove(
              'is-overlay-open'
            );
          });

        panel.classList.add(
          'is-overlay-open'
        );

        document.body.classList.add(
          'overlay-active'
        );
      });
    });

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      document
        .querySelectorAll('.panel.is-overlay-open')
        .forEach(panel => {
          panel.classList.remove(
            'is-overlay-open'
          );
        });

      document.body.classList.remove(
        'overlay-active'
      );
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    document
      .querySelectorAll('.panel.is-overlay-open')
      .forEach(panel => {
        panel.classList.remove(
          'is-overlay-open'
        );
      });

    document.body.classList.remove(
      'overlay-active'
    );
  });
}

function init() {
  const offlineSummary =
    simulateOfflineProgress();

  renderAll();
  initOverlayControls();

  const startButton =
    document.getElementById('btn-start-raid');

  if (startButton) {
    startButton.addEventListener(
      'click',
      runRaid
    );
  }

  const closeOffline =
    document.getElementById(
      'btn-close-offline'
    );

  if (closeOffline) {
    closeOffline.addEventListener(
      'click',
      () => {
        document
          .getElementById('offline-modal')
          .classList.add(
            'modal-overlay--hidden'
          );
      }
    );
  }

  if (offlineSummary) {
    showOfflineModal(offlineSummary);
  }

  window.addEventListener(
    'beforeunload',
    saveState
  );

  setInterval(
    saveState,
    30000
  );
}

document.addEventListener(
  'DOMContentLoaded',
  init
);