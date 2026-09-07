'use client';

import type { ReactNode } from 'react';
import type { RoomSlot } from '../../game/types';
import { TRAPS } from '../../game/content/traps';
import { MONSTERS } from '../../game/content/monsters';
import { TREASURES } from '../../game/content/treasure';
import { HEROES } from '../../game/content/heroes';
import { INTERACTIONS } from '../../game/content/interactions';
import { STAGES } from '../../game/content/stages';
import { kingSoulCost, unlockSoulCost, upgradeCost } from '../../game/state/economy';
import type { GameState } from '../../game/state/save';
import { ICON, contentArt, heroArt } from './art';

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ open, title, onClose, children }: SheetProps) {
  return (
    <>
      <div className={'scrim' + (open ? ' on' : '')} onClick={onClose} />
      <div className={'sheet frame' + (open ? ' on' : '')} aria-hidden={!open}>
        <div className="sheet-head">
          <span className="sheet-title">{title}</span>
          <button className="sheet-close btn" onClick={onClose} aria-label="Close">
            <img src={ICON.clear} alt="" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}

function unlockStage(id: string): number {
  for (const s of STAGES) {
    if (s.unlockTraps.includes(id) || s.unlockMonsters.includes(id) || s.unlockTreasure.includes(id)) return s.id;
  }
  return 1;
}

interface BuildProps {
  open: boolean;
  room: number;
  state: GameState;
  onClose: () => void;
  onPlace: (slot: RoomSlot) => void;
  onBuy: (id: string, souls: number) => void;
}

export function BuildSheet({ open, room, state, onClose, onPlace, onBuy }: BuildProps) {
  const groups: { label: string; kind: 'trap' | 'monster' | 'treasure'; items: { id: string; name: string; desc: string; goldCost: number }[] }[] = [
    { label: 'Traps', kind: 'trap', items: TRAPS },
    { label: 'Monsters', kind: 'monster', items: MONSTERS },
    { label: 'Treasure', kind: 'treasure', items: TREASURES }
  ];

  return (
    <Sheet open={open} title={`Build — Room ${room + 1}`} onClose={onClose}>
      <button className="row inset" onClick={() => onPlace({ kind: 'empty' })}>
        <img src={ICON.clear} alt="" />
        <span className="row-body">
          <span className="row-name">Leave Empty</span>
          <span className="row-desc">Heroes walk straight through. Costs nothing, does nothing.</span>
        </span>
      </button>

      {groups.map((g) => (
        <div key={g.kind}>
          <div className="sheet-group">{g.label}</div>
          {g.items.map((item) => {
            const owned = state.unlocked.includes(item.id);
            const souls = unlockSoulCost(item.goldCost);
            const lvl = state.levels[item.id] || 1;
            if (owned) {
              return (
                <button key={item.id} className="row inset" onClick={() => onPlace({ kind: g.kind, id: item.id } as RoomSlot)}>
                  <img src={contentArt(g.kind, item.id)} alt="" />
                  <span className="row-body">
                    <span className="row-name">
                      {item.name}
                      <span className="row-lvl">Lv{lvl}</span>
                    </span>
                    <span className="row-desc">{item.desc}</span>
                  </span>
                </button>
              );
            }
            const affordable = state.souls >= souls;
            return (
              <div key={item.id} className="row inset locked">
                <img src={ICON.lock} alt="" />
                <span className="row-body">
                  <span className="row-name">{item.name}</span>
                  <span className="row-desc">Found on Stage {unlockStage(item.id)} — or buy it now with souls.</span>
                </span>
                <span className={'row-cost' + (affordable ? '' : ' cant')}>
                  <img src={ICON.soul} alt="" />
                  {souls}
                </span>
                <button className="row-btn btn" disabled={!affordable} onClick={() => onBuy(item.id, souls)}>
                  +
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </Sheet>
  );
}

interface UpgradeProps {
  open: boolean;
  state: GameState;
  onClose: () => void;
  onUpgrade: (id: string, cost: number) => void;
  onKing: (souls: number) => void;
}

export function UpgradeSheet({ open, state, onClose, onUpgrade, onKing }: UpgradeProps) {
  const kingCost = kingSoulCost(state.kingLevel);
  const all = [
    ...TRAPS.map((t) => ({ ...t, kind: 'trap' as const })),
    ...MONSTERS.map((m) => ({ ...m, kind: 'monster' as const })),
    ...TREASURES.map((v) => ({ ...v, kind: 'treasure' as const }))
  ].filter((x) => state.unlocked.includes(x.id));

  return (
    <Sheet open={open} title="Upgrade" onClose={onClose}>
      <div className="row plate">
        <img src={ICON.king} alt="" />
        <span className="row-body">
          <span className="row-name">
            The King<span className="row-lvl">Lv{state.kingLevel}</span>
          </span>
          <span className="row-desc">Your last line. More health, more damage, more armour in the Throne Room.</span>
        </span>
        <span className={'row-cost' + (state.souls >= kingCost ? '' : ' cant')}>
          <img src={ICON.soul} alt="" />
          {kingCost}
        </span>
        <button className="row-btn btn" disabled={state.souls < kingCost} onClick={() => onKing(kingCost)}>
          +
        </button>
      </div>

      <div className="sheet-group">Dungeon Contents</div>
      {all.length === 0 && <div className="row inset">
        <span className="row-body">
          <span className="row-desc">Nothing unlocked yet. Clear a stage.</span>
        </span>
      </div>}
      {all.map((item) => {
        const lvl = state.levels[item.id] || 1;
        const cost = upgradeCost(item.goldCost, lvl);
        return (
          <div key={item.id} className="row inset">
            <img src={contentArt(item.kind, item.id)} alt="" />
            <span className="row-body">
              <span className="row-name">
                {item.name}
                <span className="row-lvl">Lv{lvl}</span>
              </span>
              <span className="row-desc">{item.desc}</span>
            </span>
            <span className={'row-cost' + (state.gold >= cost ? '' : ' cant')}>
              <img src={ICON.gold} alt="" />
              {cost}
            </span>
            <button className="row-btn btn" disabled={state.gold < cost} onClick={() => onUpgrade(item.id, cost)}>
              +
            </button>
          </div>
        );
      })}

      <div className="sheet-group">Record</div>
      <div className="row inset">
        <span className="row-body">
          <span className="row-desc">
            {state.stats.raids} raids &middot; {state.stats.defeated} heroes killed &middot; {state.stats.escaped} escaped &middot;{' '}
            {state.stats.lost} breaches &middot; {state.stats.goldStolen}g stolen from you
          </span>
        </span>
      </div>
    </Sheet>
  );
}

export function CodexSheet({ open, state, onClose }: { open: boolean; state: GameState; onClose: () => void }) {
  const stage = STAGES[Math.min(STAGES.length, Math.max(1, state.stage)) - 1];
  return (
    <Sheet open={open} title="Codex" onClose={onClose}>
      {state.mode === 'stage' && (
        <>
          <div className="sheet-group">This Stage</div>
          <div className="row plate">
            <span className="row-body">
              <span className="row-name">
                {stage.id}. {stage.title}
              </span>
              <span className="row-hint">{stage.teaches}</span>
            </span>
          </div>
        </>
      )}
      <div className="sheet-group">Combinations</div>
      {INTERACTIONS.map((i) => (
        <div key={i.id} className="row inset">
          <span className="row-body">
            <span className="row-name">{i.name}</span>
            <span className="row-hint">{i.hint}</span>
          </span>
        </div>
      ))}

      <div className="sheet-group">Heroes You Have Met</div>
      {HEROES.map((h) => {
        const met = state.roster.some((r) => r.defId === h.id) || state.stats.raids > 0;
        return (
          <div key={h.id} className={'row inset' + (met ? '' : ' locked')}>
            <img src={met ? heroArt(h.id) : ICON.lock} alt="" />
            <span className="row-body">
              <span className="row-name">
                {h.name}
                <span className="row-lvl">{h.role}</span>
              </span>
              {met ? (
                <>
                  <span className="row-desc">{h.strengths}</span>
                  <span className="row-hint">{h.weaknesses}</span>
                </>
              ) : (
                <span className="row-desc">Not yet seen in your dungeon.</span>
              )}
            </span>
          </div>
        );
      })}

      <div className="sheet-group">Veterans</div>
      {state.roster.length === 0 && (
        <div className="row inset">
          <span className="row-body">
            <span className="row-desc">No hero has survived long enough to matter. Yet.</span>
          </span>
        </div>
      )}
      {state.roster.map((r) => (
        <div key={r.uid} className="row inset">
          <img src={heroArt(r.defId)} alt="" />
          <span className="row-body">
            <span className="row-name">
              {r.name} {r.title}
              <span className="row-lvl">Lv{r.level}</span>
            </span>
            <span className="row-desc">
              {r.raids} raids &middot; {r.deaths} deaths
            </span>
            {r.scars.length > 0 && (
              <span className="row-hint">
                {r.scars.map((s) => (
                  <span key={s} className="codex-tag good">
                    {s} resist
                  </span>
                ))}
              </span>
            )}
          </span>
        </div>
      ))}
    </Sheet>
  );
}
