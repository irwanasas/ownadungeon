'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { RaidResult, RaidEvent, StatusKind } from '../../engine/types';
import type { DungeonSlot } from '../../engine/save';
import { buildCells, CAMERA_ANCHOR_PX, type CellGeom } from './raidCells';
import { forgeVars, HERO_ICON, MONSTER_ICON, TRAP_ICON, UI_ICON } from './assets';
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

interface Props {
  rooms: DungeonSlot[];
  onCellTap: (roomIndex: number) => void;
}

function contentIcon(content: DungeonSlot | null): { url: string; label: string } | null {
  if (!content) return null;
  if (content.kind === 'trap') return { url: TRAP_ICON[content.trapId], label: content.trapId };
  if (content.kind === 'monster') return { url: MONSTER_ICON[content.monsterId], label: content.monsterId };
  return null;
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

const DungeonStage = forwardRef<DungeonStageHandle, Props>(function DungeonStage({ rooms, onCellTap }, ref) {
  const [raiding, setRaiding] = useState(false);
  const [worldOffset, setWorldOffset] = useState(0);
  const [instant, setInstant] = useState(false);
  const [doorOpenIndex, setDoorOpenIndex] = useState<number | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [heroCls, setHeroCls] = useState('');
  const [heroFlash, setHeroFlash] = useState(false);
  const [heroIcon, setHeroIcon] = useState('');
  const [monster, setMonster] = useState<MonsterVisual | null>(null);
  const [numbers, setNumbers] = useState<FloatingNumber[]>([]);
  const [badges, setBadges] = useState<StatusKind[]>([]);
  const [hud, setHud] = useState<BattleHud>({ visible: false, name: '', hp: 0, maxHp: 1, reaction: '', reactionCls: '' });

  const cellsRef = useRef<CellGeom[]>(buildCells(rooms));
  if (!raiding) cellsRef.current = buildCells(rooms);
  const cells = cellsRef.current;
  const currentCellIndexRef = useRef<number>(-1);

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
    if (!cell) return;
    currentCellIndexRef.current = cellIndex;
    setInstant(!animate);
    setWorldOffset(CAMERA_ANCHOR_PX - cell.center);
    if (!animate) requestAnimationFrame(() => setInstant(false));
  }

  useImperativeHandle(ref, () => ({
    async playRaid(result, roomsAtStart, heroDefId) {
      cellsRef.current = buildCells(roomsAtStart);
      setRaiding(true);
      setHeroIcon(HERO_ICON[heroDefId] || '');
      setHeroVisible(true);
      setHeroCls('');
      setMonster(null);
      setNumbers([]);
      setBadges([]);
      cameraTo(-1, false);
      startAmbient();
      await sleep(150);

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
  }));

  async function applyEvent(ev: RaidEvent): Promise<void> {
    switch (ev.type) {
      case 'raidStart':
        setHud({ visible: true, name: ev.heroName, hp: ev.hp, maxHp: ev.maxHp, reaction: '', reactionCls: '' });
        break;

      case 'enterRoom': {
        const throneIdx = cellsRef.current[cellsRef.current.length - 1].index;
        const idx = ev.kind === 'throne' ? throneIdx : ev.roomIndex;
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

  return (
    <div className="dk-stage-wrap" style={forgeVars}>
      <div
        className="dk-world"
        style={{ transform: `translateX(${worldOffset}px)`, transitionDuration: instant ? '0ms' : undefined }}
      >
        {cells.map((cell) => {
          const icon = contentIcon(cell.content);
          const isBuildable = !raiding && cell.kind === 'room';
          return (
            <div
              key={cell.kind + cell.index}
              className={'dk-cell ' + cell.kind + (isBuildable ? ' buildable' : '') + (!cell.content ? ' empty' : '')}
              style={{ width: cell.width, flexBasis: cell.width }}
              onClick={isBuildable ? () => onCellTap(cell.index) : undefined}
            >
              {cell.kind !== 'entrance' && (
                <div className={'dk-door' + (doorOpenIndex === cell.index ? ' is-open' : '')} />
              )}
              {cell.kind === 'room' && (
                <div className="dk-torch left">
                  <div className="dk-torch-flame" />
                </div>
              )}
              {cell.kind === 'throne' && (
                <div className="dk-torch right">
                  <div className="dk-torch-flame" />
                </div>
              )}
              <div className="dk-cell-content">
                {icon ? (
                  <img className="dk-cell-icon" src={icon.url} alt={icon.label} />
                ) : cell.kind === 'room' && !raiding ? (
                  <span className="dk-cell-plus">+</span>
                ) : cell.kind === 'throne' && !raiding ? (
                  <img className="dk-cell-icon" src={UI_ICON.king} alt="throne" />
                ) : null}
                {!raiding && <span className="dk-cell-label">{cell.kind === 'room' ? 'Room ' + (cell.index + 1) : cell.kind}</span>}
              </div>
              {raiding && monster && monster.cellIndex === cell.index && (
                <div className={'dk-monster' + (monster.visible ? ' is-visible' : '') + (monster.dying ? ' is-dying' : '') + (monster.hit ? ' hit' : '')}>
                  <img src={monster.iconUrl} alt="monster" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {heroVisible && (
        <div className={'dk-hero ' + heroCls + (heroFlash ? ' hit' : '')} style={{ left: CAMERA_ANCHOR_PX }}>
          <div className="dk-hero-face">
            <img src={heroIcon} alt="hero" />
          </div>
          {badges.map((k) => (
            <span key={k} className={'dk-status-badge ' + k}>
              {k === 'poison' ? '☠' : k === 'chill' ? '❄' : k === 'weaken' ? '↓' : '🔥'}
            </span>
          ))}
        </div>
      )}

      {numbers.map((n) => (
        <span key={n.id} className={'dk-fx-num ' + n.cls} style={{ left: CAMERA_ANCHOR_PX + n.jitter, bottom: 78 }}>
          {n.text}
        </span>
      ))}

      <div className={'dk-battle-hud' + (hud.visible ? ' is-visible' : '')}>
        <div className="dk-battle-hud-top">
          <span className="dk-battle-hud-name">{hud.name}</span>
          <span>
            {Math.max(0, hud.hp)}/{hud.maxHp} HP
          </span>
        </div>
        <div className="dk-battle-hud-hp">
          <div
            className={'dk-battle-hud-hp-fill' + (hud.hp / hud.maxHp <= 0.35 ? ' low' : '')}
            style={{ width: Math.max(0, (hud.hp / hud.maxHp) * 100) + '%' }}
          />
        </div>
        <div className={'dk-battle-hud-reaction ' + hud.reactionCls}>{hud.reaction}</div>
      </div>
    </div>
  );
});

export default DungeonStage;
