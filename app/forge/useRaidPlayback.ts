import { useRef, useState } from 'react';
import type { RaidResult, RaidEvent, StatusKind } from '../../engine/types';
import type { DungeonSlot } from '../../engine/save';
import { buildCells, type CellGeom } from './raidCells';
import { HERO_ICON, MONSTER_ICON, UI_ICON } from './assets';
import { playSfx, startAmbient, stopAmbient } from './audio';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface FloatingNumber {
  id: number;
  text: string;
  cls: string;
  jitter: number;
}

interface MonsterVisual {
  cellIndex: number;
  iconUrl: string;
  visible: boolean;
  dying: boolean;
  hit: boolean;
}

interface BattleHud {
  visible: boolean;
  name: string;
  hp: number;
  maxHp: number;
  reaction: string;
  reactionCls: string;
}

export interface DungeonStageHandle {
  playRaid(result: RaidResult, rooms: DungeonSlot[], heroDefId: string): Promise<void>;
}

let fxId = 0;

const REACTION_TEXT: Record<string, string> = {
  surprise: 'SURPRISED',
  pain: 'HURT!',
  panic: 'PANIC',
  rage: 'RAGE',
  flee: 'FLEE',
  dead: 'DEFEATED',
  none: ''
};

export function useRaidPlayback(rooms: DungeonSlot[]) {
  const [raiding, setRaiding] = useState(false);
  const [doorOpenIndex, setDoorOpenIndex] = useState<number | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroAnchor, setHeroAnchor] = useState(50);
  const [heroCls, setHeroCls] = useState('');
  const [heroFlash, setHeroFlash] = useState(false);
  const [heroIcon, setHeroIcon] = useState('');
  const [monster, setMonster] = useState<MonsterVisual | null>(null);
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);
  const [badges, setBadges] = useState<StatusKind[]>([]);
  const [hud, setHud] = useState<BattleHud>({ visible: false, name: '', hp: 0, maxHp: 1, reaction: '', reactionCls: '' });

  const cellsRef = useRef<CellGeom[]>(buildCells(rooms));
  if (!raiding) cellsRef.current = buildCells(rooms);
  const currentCellIndexRef = useRef<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  function addNumber(text: string, cls: string) {
    const id = ++fxId;
    setNumbers((prev) => [...prev, { id, text, cls, jitter: Math.round(Math.random() * 24 - 12) }]);
    setTimeout(() => setNumbers((prev) => prev.filter((n) => n.id !== id)), 900);
  }

  function flashHero() {
    setHeroFlash(true);
    setTimeout(() => setHeroFlash(false), 300);
  }

  function flashMonster() {
    setMonster((m) => (m ? { ...m, hit: true } : m));
    setTimeout(() => setMonster((m) => (m ? { ...m, hit: false } : m)), 260);
  }

  function cameraTo(cellIndex: number, animate: boolean) {
    const cell = cellsRef.current.find((c) => c.index === cellIndex);
    const el = scrollRef.current;
    if (!cell || !el) return;
    currentCellIndexRef.current = cellIndex;
    const target = Math.max(0, cell.center - el.clientWidth / 2);
    el.scrollTo({ left: target, behavior: animate ? 'smooth' : 'auto' });
  }

  async function applyEvent(ev: RaidEvent): Promise<void> {
    switch (ev.type) {
      case 'raidStart':
        setHud({ visible: true, name: ev.heroName, hp: ev.hp, maxHp: ev.maxHp, reaction: '', reactionCls: '' });
        break;

      case 'enterRoom': {
        const throneIdx = cellsRef.current[cellsRef.current.length - 1].index;
        const idx = ev.kind === 'throne' ? throneIdx : ev.roomIndex;
        setHeroAnchor(50);
        setHeroCls('walking');
        cameraTo(idx, true);
        setDoorOpenIndex(null);
        await sleep(520);
        setHeroCls('');
        if (ev.kind === 'monster' && ev.contentId) {
          setMonster({ cellIndex: idx, iconUrl: MONSTER_ICON[ev.contentId], visible: false, dying: false, hit: false });
        } else if (ev.kind === 'throne') {
          setMonster({ cellIndex: idx, iconUrl: UI_ICON.king, visible: false, dying: false, hit: false });
        } else {
          setMonster(null);
        }
        break;
      }

      case 'doorOpen':
        playSfx('door');
        setDoorOpenIndex(currentCellIndexRef.current);
        await sleep(260);
        break;

      case 'trapTrigger':
        playSfx('trapTrigger');
        flashHero();
        await sleep(220);
        break;

      case 'monsterAppear':
        playSfx('monsterAppear');
        setMonster((m) => (m ? { ...m, visible: true } : m));
        await sleep(320);
        break;

      case 'heroAttack':
        playSfx('heroAttack');
        flashMonster();
        addNumber('-' + ev.dmg, ev.crit ? 'crit' : '');
        await sleep(260);
        break;

      case 'monsterAttack':
        if (!ev.evaded) playSfx('hit');
        await sleep(120);
        break;

      case 'damage':
        setHud((h) => ({ ...h, hp: ev.heroHp, maxHp: ev.heroMaxHp }));
        if (ev.evaded) {
          addNumber('DODGE', 'evaded');
        } else if (ev.dmg > 0) {
          addNumber('-' + ev.dmg, '');
          flashHero();
          if (ev.source !== 'status') playSfx('pain');
        }
        await sleep(260);
        break;

      case 'statusApplied':
        playSfx(ev.kind === 'poison' ? 'statusPoison' : ev.kind === 'chill' ? 'statusChill' : 'statusWeaken');
        setBadges((b) => (b.includes(ev.kind) ? b : [...b, ev.kind]));
        await sleep(180);
        break;

      case 'statusTick':
        setHud((h) => ({ ...h, hp: ev.heroHp }));
        addNumber('-' + ev.dmg, 'dot');
        await sleep(220);
        break;

      case 'heroReaction':
        setHud((h) => ({ ...h, reaction: REACTION_TEXT[ev.reaction] || '', reactionCls: ev.reaction }));
        if (ev.reaction === 'panic') setHeroCls('panic');
        if (ev.reaction === 'rage') setHeroCls('rage');
        if (ev.reaction === 'dead') setHeroCls('dead');
        if (ev.reaction === 'dead') playSfx('death');
        await sleep(260);
        break;

      case 'monsterDeath':
        setMonster((m) => (m ? { ...m, dying: true } : m));
        setBadges([]);
        await sleep(360);
        setMonster(null);
        break;

      case 'roomCleared':
        await sleep(120);
        break;

      case 'kingAppear':
        setMonster((m) => (m ? { ...m, visible: true } : m));
        await sleep(300);
        break;

      case 'raidEnd':
        if (ev.outcome === 'dungeonWin') playSfx('win');
        else if (ev.outcome === 'heroEscape') playSfx('escape');
        else playSfx('lose');
        await sleep(200);
        break;
    }
  }

  async function playRaid(result: RaidResult, roomsAtStart: DungeonSlot[], heroDefId: string): Promise<void> {
    cellsRef.current = buildCells(roomsAtStart);
    setRaiding(true);
    setHeroIcon(HERO_ICON[heroDefId] || '');
    setHeroVisible(true);
    setHeroAnchor(20);
    setHeroCls('');
    setMonster(null);
    setNumbers([]);
    setBadges([]);
    cameraTo(-1, false);
    startAmbient();
    await sleep(600);

    for (const ev of result.events) {
      await applyEvent(ev);
    }

    await sleep(700);
    stopAmbient();
    setHeroVisible(false);
    setMonster(null);
    setHud((h) => ({ ...h, visible: false }));
    setRaiding(false);
  }

  return {
    cells: cellsRef.current,
    scrollRef,
    raiding,
    doorOpenIndex,
    heroVisible,
    heroAnchor,
    heroCls,
    heroFlash,
    heroIcon,
    monster,
    numbers,
    badges,
    hud,
    playRaid
  };
}
