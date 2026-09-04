'use client';

import { useEffect, useRef, useState } from 'react';
import type { GameState, DungeonSlot } from '../../engine/save';
import { loadState, saveState } from '../../engine/save';
import { HEROES, heroById } from '../../engine/data/heroes';
import { STAGES, STAGE_MAX, stageById } from '../../engine/data/stages';
import { toDungeonConfig } from '../../engine/economy';
import { simulateRaid } from '../../engine/simulate';
import { EDITABLE_ROOMS, type RaidResult } from '../../engine/types';
import DungeonStage, { type DungeonStageHandle } from './DungeonStage';
import { BuildSheet, UpgradeSheet, ResultSheet } from './sheets';
import { HERO_ICON, UI_ICON } from './assets';
import { playSfx } from './audio';
import './forge.css';

function syncUnlocks(state: GameState): GameState {
  const traps = new Set<string>(['spike']);
  const monsters = new Set<string>();
  for (const s of STAGES) {
    if (s.id > state.stage) break;
    s.unlockTrapIds.forEach((id) => traps.add(id));
    s.unlockMonsterIds.forEach((id) => monsters.add(id));
  }
  const dungeon: GameState['dungeon'] = [];
  for (let i = 0; i < EDITABLE_ROOMS; i++) dungeon.push(state.dungeon[i] || { kind: 'empty' });
  return { ...state, unlockedTraps: [...traps], unlockedMonsters: [...monsters], dungeon };
}

function pickHero(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] || HEROES[0].id;
}

export default function ForgeApp() {
  const [state, setState] = useState<GameState | null>(null);
  const [pendingHero, setPendingHero] = useState<string>(HEROES[0].id);
  const [sheet, setSheet] = useState<'build' | 'upgrade' | null>(null);
  const [buildTarget, setBuildTarget] = useState<number | null>(null);
  const [raiding, setRaiding] = useState(false);
  const [result, setResult] = useState<{ open: boolean; outcome: RaidResult['outcome'] | null; gold: number; souls: number }>({
    open: false,
    outcome: null,
    gold: 0,
    souls: 0
  });

  const stageRef = useRef<DungeonStageHandle>(null);

  useEffect(() => {
    const loaded = syncUnlocks(loadState());
    setState(loaded);
    const pool = loaded.mode === 'arcade' ? HEROES.map((h) => h.id) : stageById(loaded.stage).heroPool;
    setPendingHero(pickHero(pool));
  }, []);

  function update(patch: Partial<GameState> | ((s: GameState) => GameState)) {
    setState((prev) => {
      if (!prev) return prev;
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }

  if (!state) return <div className="forge-root" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>Loading…</div>;

  const stageDef = stageById(state.stage);
  const heroDef = heroById(pendingHero);
  const heroPool = state.mode === 'arcade' ? HEROES.map((h) => h.id) : stageDef.heroPool;

  function rerollHero() {
    setPendingHero(pickHero(heroPool));
  }

  function openBuild(index: number) {
    if (raiding) return;
    setBuildTarget(index);
    setSheet('build');
    playSfx('tap');
  }

  function placeContent(content: DungeonSlot) {
    if (buildTarget === null) return;
    update((s) => {
      const dungeon = s.dungeon.slice();
      dungeon[buildTarget] = content;
      return { ...s, dungeon };
    });
    setSheet(null);
    playSfx('tap');
  }

  function upgradeTrap(id: string, cost: number) {
    update((s) => (s.gold < cost ? s : { ...s, gold: s.gold - cost, trapLevels: { ...s.trapLevels, [id]: (s.trapLevels[id] || 1) + 1 } }));
    playSfx('tap');
  }

  function upgradeMonster(id: string, cost: number) {
    update((s) => (s.gold < cost ? s : { ...s, gold: s.gold - cost, monsterLevels: { ...s.monsterLevels, [id]: (s.monsterLevels[id] || 1) + 1 } }));
    playSfx('tap');
  }

  function upgradeKing(cost: number) {
    update((s) => (s.gold < cost ? s : { ...s, gold: s.gold - cost, kingLevel: s.kingLevel + 1 }));
    playSfx('tap');
  }

  function setMode(mode: 'stage' | 'arcade') {
    if (raiding) return;
    update({ mode });
    playSfx('tap');
  }

  async function startRaid() {
    if (raiding || !state) return;
    setRaiding(true);
    playSfx('tap');

    const dungeonConfig = toDungeonConfig(state);
    const heroLevel = state.mode === 'arcade' ? 1 + Math.floor((state.arcadeWave - 1) / 2) : 1 + Math.floor((state.stage - 1) / 2);
    const kingLevel =
      state.mode === 'arcade' ? state.kingLevel + Math.floor(state.arcadeWave / 3) : Math.max(state.kingLevel, stageDef.kingLevel);

    const raidResult = simulateRaid(dungeonConfig, pendingHero, heroLevel, kingLevel);

    if (stageRef.current) {
      await stageRef.current.playRaid(raidResult, dungeonConfig.rooms, pendingHero);
    }

    update((s) => {
      let next = { ...s };
      next.stats = { ...s.stats, raids: s.stats.raids + 1 };
      if (raidResult.outcome === 'dungeonWin') next.stats.dungeonWins++;
      if (raidResult.outcome === 'heroEscape') next.stats.heroEscapes++;
      if (raidResult.outcome === 'heroVictory') next.stats.heroVictories++;

      next.gold += raidResult.goldReward;
      next.souls += raidResult.soulsReward;

      if (next.mode === 'stage') {
        if (raidResult.outcome === 'dungeonWin') {
          next.maxStageCleared = Math.max(next.maxStageCleared, next.stage);
          if (next.stage < STAGE_MAX) next.stage += 1;
          next = syncUnlocks(next);
        }
      } else {
        if (raidResult.outcome === 'dungeonWin') {
          if (next.arcadeWave > next.arcadeBest) next.arcadeBest = next.arcadeWave;
          next.arcadeWave += 1;
        } else {
          next.arcadeWave = 1;
        }
      }
      return next;
    });

    setResult({ open: true, outcome: raidResult.outcome, gold: raidResult.goldReward, souls: raidResult.soulsReward });
    setRaiding(false);
  }

  function closeResult() {
    setResult((r) => ({ ...r, open: false }));
    rerollHero();
  }

  return (
    <div className="forge-root">
      <header className="dk-hud">
        <div className="dk-hud-progress">
          <span className="dk-hud-title">Dungeon Forge</span>
          <span className="dk-hud-sub">
            {state.mode === 'stage' ? `Stage ${state.stage}/${STAGE_MAX} · ${stageDef.title}` : `Arcade Wave ${state.arcadeWave} · Best ${state.arcadeBest}`}
          </span>
        </div>
        <div className="dk-currencies">
          <span className="dk-currency">
            <img src={UI_ICON.gold} alt="gold" />
            {state.gold}
          </span>
          <span className="dk-currency souls">
            <img src={UI_ICON.soul} alt="souls" />
            {state.souls}
          </span>
        </div>
      </header>

      <div className="dk-mode-row">
        <div className={'dk-mode-btn' + (state.mode === 'stage' ? ' active' : '')} onClick={() => setMode('stage')}>
          Stage
        </div>
        <div className={'dk-mode-btn' + (state.mode === 'arcade' ? ' active' : '')} onClick={() => setMode('arcade')}>
          Arcade
        </div>
      </div>

      <DungeonStage ref={stageRef} rooms={state.dungeon} onCellTap={openBuild} />

      {!raiding && (
        <div style={{ padding: '6px 16px 0', fontSize: 11, color: 'var(--dk-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={HERO_ICON[pendingHero]} alt={heroDef.name} style={{ width: 20, height: 20, imageRendering: 'pixelated' }} />
          <span>
            <strong style={{ color: 'var(--dk-bone)' }}>{heroDef.name}</strong> ({heroDef.role}) is coming — {heroDef.strengths} {heroDef.weaknesses}
          </span>
        </div>
      )}

      <div className="dk-bottom">
        <button className="dk-side-btn" onClick={() => setSheet('build')} aria-label="Build">
          <img src={UI_ICON.build} alt="Build" />
        </button>
        <button className="dk-raid-btn" onClick={startRaid} disabled={raiding} aria-label="Raid">
          <img src={UI_ICON.play} alt="Raid" />
        </button>
        <button className="dk-side-btn" onClick={() => setSheet('upgrade')} aria-label="Upgrade">
          <img src={UI_ICON.upgrade} alt="Upgrade" />
        </button>
      </div>

      <BuildSheet open={sheet === 'build'} onClose={() => setSheet(null)} state={state} onPlace={placeContent} />
      <UpgradeSheet
        open={sheet === 'upgrade'}
        onClose={() => setSheet(null)}
        state={state}
        onUpgradeTrap={upgradeTrap}
        onUpgradeMonster={upgradeMonster}
        onUpgradeKing={upgradeKing}
      />
      <ResultSheet open={result.open} outcome={result.outcome} gold={result.gold} souls={result.souls} onClose={closeResult} />
    </div>
  );
}
