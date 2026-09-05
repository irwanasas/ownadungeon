import type {
  DungeonConfig,
  HeroInstance,
  HeroStatus,
  MonsterDef,
  RaidEvent,
  RaidResult,
  TrapDef
} from './types';
import { heroById } from './data/heroes';
import { trapById } from './data/traps';
import { monsterById, KING_BASE } from './data/monsters';

function rand(): number {
  return Math.random();
}

export function buildHeroInstance(heroDefId: string, level: number): HeroInstance {
  const def = heroById(heroDefId);
  const lvl = Math.max(1, level);
  return {
    defId: def.id,
    name: def.name,
    hp: Math.round(def.baseHp + (lvl - 1) * 8),
    maxHp: Math.round(def.baseHp + (lvl - 1) * 8),
    atk: Math.round(def.baseAtk + (lvl - 1) * 1.4),
    def: Math.round(def.baseDef + (lvl - 1) * 0.4),
    status: []
  };
}

function currentEvasion(hero: HeroInstance): number {
  const def = heroById(hero.defId);
  let e = def.evasion;
  for (const s of hero.status) if (s.evasionDelta) e += s.evasionDelta;
  return Math.max(0, Math.min(0.9, e));
}

function currentAtkMult(hero: HeroInstance): number {
  let m = 1;
  for (const s of hero.status) if (s.atkMult) m *= s.atkMult;
  return m;
}

function tagMultiplier(hero: HeroInstance, tag: string): number {
  const def = heroById(hero.defId);
  return def.resist.includes(tag as never) ? 0.55 : 1;
}

function tickStatusesForRoom(hero: HeroInstance, events: RaidEvent[]): number {
  let total = 0;
  for (const s of hero.status) {
    if (s.dmgPerTick) {
      total += s.dmgPerTick;
      hero.hp = Math.max(0, hero.hp - s.dmgPerTick);
      events.push({ type: 'statusTick', kind: s.kind, dmg: s.dmgPerTick, heroHp: hero.hp });
    }
  }
  hero.status = hero.status
    .map((s) => ({ ...s, roomsLeft: s.roomsLeft - 1 }))
    .filter((s) => s.roomsLeft > 0);
  return total;
}

function applyStatus(hero: HeroInstance, status: HeroStatus, events: RaidEvent[]): void {
  hero.status = hero.status.filter((s) => s.kind !== status.kind);
  hero.status.push(status);
  events.push({ type: 'statusApplied', kind: status.kind });
}

function resolveTrapRoom(hero: HeroInstance, trap: TrapDef, level: number, events: RaidEvent[]): void {
  events.push({ type: 'trapTrigger', trapId: trap.id });

  const evaded = rand() < currentEvasion(hero);
  let dmg = Math.round((trap.baseDamage + (level - 1) * trap.dmgPerLevel) * tagMultiplier(hero, trap.tag));
  const def = heroById(hero.defId);
  dmg = Math.max(1, Math.round(dmg - hero.def * 0.3));
  dmg = Math.round(dmg * (1 - def.damageReduction));

  if (evaded) dmg = 0;
  if (dmg > 0) hero.hp = Math.max(0, hero.hp - dmg);
  events.push({ type: 'damage', source: 'trap', dmg, heroHp: hero.hp, heroMaxHp: hero.maxHp, evaded });
  events.push({ type: 'heroReaction', reaction: dmg > 0 ? 'pain' : 'surprise' });

  if (dmg > 0 && trap.statusOnHit) {
    applyStatus(
      hero,
      {
        kind: trap.statusOnHit.kind,
        roomsLeft: trap.statusOnHit.rooms,
        dmgPerTick: trap.statusOnHit.dmgPerTick,
        evasionDelta: trap.statusOnHit.evasionDelta
      },
      events
    );
  }
}

interface MonsterFightOutcome {
  monsterDied: boolean;
  heroDied: boolean;
  goldReward: number;
}

function resolveMonsterRoom(
  hero: HeroInstance,
  monster: MonsterDef,
  level: number,
  events: RaidEvent[]
): MonsterFightOutcome {
  events.push({ type: 'monsterAppear', monsterId: monster.id });

  let monsterHp = Math.round(monster.baseHp + (level - 1) * monster.hpPerLevel);
  const monsterMaxHp = monsterHp;
  const monsterAtk = Math.round(monster.baseAtk + (level - 1) * monster.atkPerLevel);
  const def = heroById(hero.defId);

  for (let round = 0; round < 12; round++) {
    tickStatusesForRoom(hero, events);
    if (hero.hp <= 0) return { monsterDied: false, heroDied: true, goldReward: 0 };

    const ramp = Math.min(def.rampCap, def.rampPerRound * round);
    const heroDmg = Math.max(
      1,
      Math.round(hero.atk * currentAtkMult(hero) * (1 + ramp) * tagMultiplier(hero, monster.tag) - monster.baseDef)
    );
    monsterHp = Math.max(0, monsterHp - heroDmg);
    events.push({ type: 'heroAttack', targetHp: monsterHp, targetMaxHp: monsterMaxHp, dmg: heroDmg, crit: round === 0 });

    if (monsterHp <= 0) {
      events.push({ type: 'monsterDeath', monsterId: monster.id });
      return { monsterDied: true, heroDied: false, goldReward: monster.goldValue };
    }

    let statusLanded = false;
    for (let hit = 0; hit < monster.hitsPerRound; hit++) {
      const evaded = rand() < currentEvasion(hero);
      let dmg = Math.round(monsterAtk - hero.def * 0.35);
      dmg = Math.max(1, Math.round(dmg * (1 - def.damageReduction)));
      if (evaded) dmg = 0;
      if (dmg > 0) hero.hp = Math.max(0, hero.hp - dmg);
      events.push({ type: 'monsterAttack', dmg, evaded });
      events.push({ type: 'damage', source: 'monster', dmg, heroHp: hero.hp, heroMaxHp: hero.maxHp, evaded });
      if (dmg > 0 && !statusLanded && monster.appliesStatus && !(monster.role === 'shaman' && def.fearImmune)) {
        applyStatus(
          hero,
          { kind: monster.appliesStatus.kind, roomsLeft: monster.appliesStatus.rooms, atkMult: monster.appliesStatus.atkMult },
          events
        );
        statusLanded = true;
      }
      if (hero.hp <= 0) break;
    }

    if (hero.hp <= 0) {
      events.push({ type: 'heroReaction', reaction: 'dead' });
      return { monsterDied: false, heroDied: true, goldReward: 0 };
    }
    if (hero.hp / hero.maxHp <= 0.3) {
      events.push({ type: 'heroReaction', reaction: 'panic' });
    }
  }

  return { monsterDied: false, heroDied: false, goldReward: 0 };
}

export function simulateRaid(dungeon: DungeonConfig, heroDefId: string, heroLevel: number, kingLevel: number): RaidResult {
  const hero = buildHeroInstance(heroDefId, heroLevel);
  const events: RaidEvent[] = [];
  events.push({ type: 'raidStart', heroDefId: hero.defId, heroName: hero.name, hp: hero.hp, maxHp: hero.maxHp });

  let goldReward = 0;
  let dungeonWin = false;

  for (let i = 0; i < dungeon.rooms.length; i++) {
    const room = dungeon.rooms[i];
    const contentId = room.kind === 'trap' ? room.trapId : room.kind === 'monster' ? room.monsterId : undefined;
    events.push({ type: 'enterRoom', roomIndex: i, kind: room.kind, contentId });
    events.push({ type: 'doorOpen' });

    if (room.kind === 'trap') {
      resolveTrapRoom(hero, trapById(room.trapId), room.level, events);
      if (hero.hp <= 0) {
        events.push({ type: 'heroReaction', reaction: 'dead' });
        dungeonWin = true;
        break;
      }
    } else if (room.kind === 'monster') {
      const outcome = resolveMonsterRoom(hero, monsterById(room.monsterId), room.level, events);
      goldReward += outcome.goldReward;
      if (outcome.heroDied) {
        dungeonWin = true;
        break;
      }
    }

    events.push({ type: 'roomCleared', roomIndex: i });
  }

  let outcome: RaidResult['outcome'];
  let soulsReward = 0;

  if (dungeonWin) {
    outcome = 'dungeonWin';
    goldReward += 30 + dungeon.rooms.length * 8;
    soulsReward = 1;
  } else {
    const kingHp = Math.round(KING_BASE.hp + (kingLevel - 1) * KING_BASE.hpPerLevel);
    const kingAtk = Math.round(KING_BASE.atk + (kingLevel - 1) * KING_BASE.atkPerLevel);
    const kingDef = Math.round(KING_BASE.def + (kingLevel - 1) * KING_BASE.defPerLevel);
    events.push({ type: 'enterRoom', roomIndex: dungeon.rooms.length, kind: 'throne' });
    events.push({ type: 'doorOpen' });
    events.push({ type: 'kingAppear', level: kingLevel, hp: kingHp });

    const def = heroById(hero.defId);
    let hp = kingHp;
    let heroWinsKing = false;
    for (let round = 0; round < 12 && hero.hp > 0; round++) {
      tickStatusesForRoom(hero, events);
      if (hero.hp <= 0) break;

      const ramp = Math.min(def.rampCap, def.rampPerRound * round);
      const heroDmg = Math.max(1, Math.round(hero.atk * currentAtkMult(hero) * (1 + ramp) - kingDef));
      hp = Math.max(0, hp - heroDmg);
      events.push({ type: 'heroAttack', targetHp: hp, targetMaxHp: kingHp, dmg: heroDmg, crit: round === 0 });
      if (hp <= 0) {
        heroWinsKing = true;
        break;
      }

      const evaded = rand() < currentEvasion(hero);
      let dmg = Math.max(1, Math.round(kingAtk - hero.def * 0.35));
      dmg = Math.round(dmg * (1 - def.damageReduction));
      if (evaded) dmg = 0;
      if (dmg > 0) hero.hp = Math.max(0, hero.hp - dmg);
      events.push({ type: 'monsterAttack', dmg, evaded });
      events.push({ type: 'damage', source: 'king', dmg, heroHp: hero.hp, heroMaxHp: hero.maxHp, evaded });
    }

    if (hero.hp <= 0) {
      events.push({ type: 'heroReaction', reaction: 'dead' });
      outcome = 'dungeonWin';
      goldReward += 30 + dungeon.rooms.length * 8 + 25;
      soulsReward = 2;
    } else if (heroWinsKing) {
      events.push({ type: 'heroReaction', reaction: 'rage' });
      outcome = 'heroVictory';
      goldReward = Math.round(goldReward * 0.45);
    } else {
      outcome = 'heroEscape';
      goldReward = Math.round(goldReward * 0.35);
    }
  }

  events.push({ type: 'raidEnd', outcome, goldReward, soulsReward });
  return { events, outcome, goldReward, soulsReward };
}
