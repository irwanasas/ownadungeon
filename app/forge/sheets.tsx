'use client';

import type { GameState } from '../../engine/save';
import { TRAPS } from '../../engine/data/traps';
import { MONSTERS } from '../../engine/data/monsters';
import { upgradeCost, kingUpgradeCost } from '../../engine/economy';
import { TRAP_ICON, MONSTER_ICON, UI_ICON } from './assets';

interface BuildSheetProps {
  open: boolean;
  onClose: () => void;
  state: GameState;
  onPlace: (content: { kind: 'empty' } | { kind: 'trap'; trapId: string } | { kind: 'monster'; monsterId: string }) => void;
}

export function BuildSheet({ open, onClose, state, onPlace }: BuildSheetProps) {
  return (
    <>
      <div className={'dk-sheet-scrim' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'dk-sheet' + (open ? ' open' : '')}>
        <div className="dk-sheet-title">
          <span>Build Room</span>
          <button className="dk-sheet-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dk-item-row" onClick={() => onPlace({ kind: 'empty' })}>
          <div className="dk-item-info">
            <div className="dk-item-name">Clear room</div>
            <div className="dk-item-desc">Leave this room empty.</div>
          </div>
        </div>

        {TRAPS.map((t) => {
          const locked = !state.unlockedTraps.includes(t.id);
          return (
            <div key={t.id} className={'dk-item-row' + (locked ? ' locked' : '')} onClick={locked ? undefined : () => onPlace({ kind: 'trap', trapId: t.id })}>
              <img src={TRAP_ICON[t.id]} alt={t.name} />
              <div className="dk-item-info">
                <div className="dk-item-name">{t.name}</div>
                <div className="dk-item-desc">{locked ? 'Locked — unlocks on a later stage.' : t.desc}</div>
              </div>
            </div>
          );
        })}

        {MONSTERS.map((m) => {
          const locked = !state.unlockedMonsters.includes(m.id);
          return (
            <div key={m.id} className={'dk-item-row' + (locked ? ' locked' : '')} onClick={locked ? undefined : () => onPlace({ kind: 'monster', monsterId: m.id })}>
              <img src={MONSTER_ICON[m.id]} alt={m.name} />
              <div className="dk-item-info">
                <div className="dk-item-name">{m.name}</div>
                <div className="dk-item-desc">{locked ? 'Locked — unlocks on a later stage.' : m.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

interface UpgradeSheetProps {
  open: boolean;
  onClose: () => void;
  state: GameState;
  onUpgradeTrap: (id: string, cost: number) => void;
  onUpgradeMonster: (id: string, cost: number) => void;
  onUpgradeKing: (cost: number) => void;
}

export function UpgradeSheet({ open, onClose, state, onUpgradeTrap, onUpgradeMonster, onUpgradeKing }: UpgradeSheetProps) {
  const kingCost = kingUpgradeCost(state.kingLevel);
  return (
    <>
      <div className={'dk-sheet-scrim' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'dk-sheet' + (open ? ' open' : '')}>
        <div className="dk-sheet-title">
          <span>Upgrade</span>
          <button className="dk-sheet-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dk-item-row">
          <img src={UI_ICON.king} alt="King" />
          <div className="dk-item-info">
            <div className="dk-item-name">King · Lv.{state.kingLevel}</div>
            <div className="dk-item-desc">Raises the King's stats for the Throne fight.</div>
          </div>
          <span className="dk-item-side">{kingCost}g</span>
          <button className="dk-item-btn" disabled={state.gold < kingCost} onClick={() => onUpgradeKing(kingCost)}>
            +
          </button>
        </div>

        {state.unlockedTraps.map((id) => {
          const t = TRAPS.find((x) => x.id === id);
          if (!t) return null;
          const lvl = state.trapLevels[id] || 1;
          const cost = upgradeCost(t.goldCost, lvl);
          return (
            <div className="dk-item-row" key={id}>
              <img src={TRAP_ICON[id]} alt={t.name} />
              <div className="dk-item-info">
                <div className="dk-item-name">
                  {t.name} · Lv.{lvl}
                </div>
                <div className="dk-item-desc">{t.desc}</div>
              </div>
              <span className="dk-item-side">{cost}g</span>
              <button className="dk-item-btn" disabled={state.gold < cost} onClick={() => onUpgradeTrap(id, cost)}>
                +
              </button>
            </div>
          );
        })}

        {state.unlockedMonsters.map((id) => {
          const m = MONSTERS.find((x) => x.id === id);
          if (!m) return null;
          const lvl = state.monsterLevels[id] || 1;
          const cost = upgradeCost(m.goldCost, lvl);
          return (
            <div className="dk-item-row" key={id}>
              <img src={MONSTER_ICON[id]} alt={m.name} />
              <div className="dk-item-info">
                <div className="dk-item-name">
                  {m.name} · Lv.{lvl}
                </div>
                <div className="dk-item-desc">{m.desc}</div>
              </div>
              <span className="dk-item-side">{cost}g</span>
              <button className="dk-item-btn" disabled={state.gold < cost} onClick={() => onUpgradeMonster(id, cost)}>
                +
              </button>
            </div>
          );
        })}

        <div className="dk-item-row" style={{ cursor: 'default' }}>
          <div className="dk-item-info">
            <div className="dk-item-name">Raid record</div>
            <div className="dk-item-desc">
              {state.stats.raids} raids · {state.stats.dungeonWins} dungeon wins · {state.stats.heroEscapes} escapes ·{' '}
              {state.stats.heroVictories} hero wins
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ResultSheetProps {
  open: boolean;
  outcome: 'dungeonWin' | 'heroEscape' | 'heroVictory' | null;
  gold: number;
  souls: number;
  onClose: () => void;
}

const OUTCOME_COPY: Record<string, { title: string; desc: string; cls: string }> = {
  dungeonWin: { title: 'Dungeon Held!', desc: 'The hero fell before your traps and monsters.', cls: 'win' },
  heroEscape: { title: 'Hero Escaped', desc: 'The hero fled with their life, but little else.', cls: 'escape' },
  heroVictory: { title: 'Dungeon Broken', desc: 'The hero fought through to the Throne and won.', cls: 'loss' }
};

export function ResultSheet({ open, outcome, gold, souls, onClose }: ResultSheetProps) {
  const copy = outcome ? OUTCOME_COPY[outcome] : null;
  return (
    <div className={'dk-result' + (open ? ' open' : '')}>
      {copy && (
        <>
          <div className={'dk-result-title ' + copy.cls}>{copy.title}</div>
          <div className="dk-result-desc">{copy.desc}</div>
          <div className="dk-result-rewards">
            <span className="dk-reward-pill">
              <img src={UI_ICON.gold} alt="gold" />+{gold}
            </span>
            <span className="dk-reward-pill souls">
              <img src={UI_ICON.soul} alt="souls" />+{souls}
            </span>
          </div>
          <button className="dk-result-btn" onClick={onClose}>
            Continue
          </button>
        </>
      )}
    </div>
  );
}
