'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { RoomSlot } from '../../game/types';
import { TRAPS } from '../../game/content/traps';
import { LORD, MONSTERS } from '../../game/content/monsters';
import { TREASURES } from '../../game/content/treasure';
import { HEROES } from '../../game/content/heroes';
import { INTERACTIONS } from '../../game/content/interactions';
import { STAGES, STAGE_MAX, unlockStageOf } from '../../game/content/stages';
import { worldEvent } from '../../game/content/worldEvents';
import { describeEffect, effectCount } from '../../game/state/world';
import { MAX_PER_ID } from '../../game/types';
import { lordSoulCost, unlockSoulCost, upgradeCost } from '../../game/state/economy';
import { idCounts, type GameState } from '../../game/state/save';
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

interface BuildProps {
  open: boolean;
  room: number;
  state: GameState;
  onClose: () => void;
  onPlace: (slot: RoomSlot) => void;
  onBuy: (id: string, goldCost: number) => void;
}

export function BuildSheet({ open, room, state, onClose, onPlace, onBuy }: BuildProps) {
  const groups: { label: string; kind: 'trap' | 'monster' | 'treasure'; items: { id: string; name: string; desc: string; goldCost: number }[] }[] = [
    { label: 'Traps', kind: 'trap', items: TRAPS },
    { label: 'Monsters', kind: 'monster', items: MONSTERS },
    { label: 'Treasure', kind: 'treasure', items: TREASURES }
  ];
  const counts = idCounts(state.rooms);
  const here = state.rooms[room];
  const elsewhere = (id: string) => (counts[id] || 0) - (here && here.kind !== 'empty' && here.id === id ? 1 : 0);

  return (
    <Sheet open={open} title={`Build — Room ${room + 1}`} onClose={onClose}>
      <div className="sheet-rule">The same thing fits in {MAX_PER_ID} rooms at most. Mix, or leave a room empty.</div>

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
            const souls = unlockSoulCost(item.goldCost, unlockStageOf(item.id), state.stage);
            const lvl = state.levels[item.id] || 1;
            if (owned) {
              const used = elsewhere(item.id);
              const atCap = used >= MAX_PER_ID;
              const chip = (
                <span className={'row-count' + (atCap ? ' full' : '')}>
                  {used}/{MAX_PER_ID}
                </span>
              );
              const body = (
                <>
                  <img src={contentArt(g.kind, item.id)} alt="" />
                  <span className="row-body">
                    <span className="row-name">
                      {item.name}
                      <span className="row-lvl">Lv{lvl}</span>
                    </span>
                    <span className="row-desc">{atCap ? "Already in 2 rooms — that's the limit." : item.desc}</span>
                  </span>
                  {chip}
                </>
              );
              if (atCap) {
                return (
                  <div key={item.id} className="row inset locked">
                    {body}
                  </div>
                );
              }
              return (
                <button key={item.id} className="row inset" onClick={() => onPlace({ kind: g.kind, id: item.id } as RoomSlot)}>
                  {body}
                </button>
              );
            }
            const affordable = state.souls >= souls;
            return (
              <div key={item.id} className="row inset locked">
                <img src={ICON.lock} alt="" />
                <span className="row-body">
                  <span className="row-name">{item.name}</span>
                  <span className="row-desc">Found on Stage {unlockStageOf(item.id)} — or buy it now with souls. The further ahead, the dearer.</span>
                </span>
                <span className={'row-cost' + (affordable ? '' : ' cant')}>
                  <img src={ICON.soul} alt="" />
                  {souls}
                </span>
                <button className="row-btn btn" disabled={!affordable} onClick={() => onBuy(item.id, item.goldCost)}>
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
  onLord: (souls: number) => void;
}

export function UpgradeSheet({ open, state, onClose, onUpgrade, onLord }: UpgradeProps) {
  const lordCost = lordSoulCost(state.lordLevel);
  const all = [
    ...TRAPS.map((t) => ({ ...t, kind: 'trap' as const })),
    ...MONSTERS.map((m) => ({ ...m, kind: 'monster' as const })),
    ...TREASURES.map((v) => ({ ...v, kind: 'treasure' as const }))
  ].filter((x) => state.unlocked.includes(x.id));

  return (
    <Sheet open={open} title="Upgrade" onClose={onClose}>
      <div className="row plate">
        <img src={ICON.lord} alt="" />
        <span className="row-body">
          <span className="row-name">
            {LORD.name}<span className="row-lvl">Lv{state.lordLevel}</span>
          </span>
          <span className="row-desc">Your last line. More health, more damage, more armour in the Throne Room.</span>
        </span>
        <span className={'row-cost' + (state.souls >= lordCost ? '' : ' cant')}>
          <img src={ICON.soul} alt="" />
          {lordCost}
        </span>
        <button className="row-btn btn" disabled={state.souls < lordCost} onClick={() => onLord(lordCost)}>
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

interface SettingsProps {
  open: boolean;
  state: GameState;
  onClose: () => void;
  onReset: () => void;
}

const STATS: { label: string; value: (s: GameState) => string }[] = [
  { label: 'Raids run', value: (s) => String(s.stats.raids) },
  { label: 'Heroes killed', value: (s) => String(s.stats.defeated) },
  { label: 'Heroes escaped', value: (s) => String(s.stats.escaped) },
  { label: 'Dungeon breached', value: (s) => String(s.stats.lost) },
  { label: 'Gold earned', value: (s) => `${s.stats.goldEarned}g` },
  { label: 'Gold stolen from you', value: (s) => `${s.stats.goldStolen}g` },
  { label: 'Stages cleared', value: (s) => `${s.maxStageCleared}/${STAGE_MAX}` },
  { label: 'Best arcade wave', value: (s) => String(s.bestWave) },
  { label: 'Dungeon Lord level', value: (s) => `Lv${s.lordLevel}` },
  { label: 'Veterans remembered', value: (s) => String(s.roster.length) }
];

export function SettingsSheet({ open, state, onClose, onReset }: SettingsProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) setArmed(false);
  }, [open]);

  return (
    <Sheet open={open} title="Settings" onClose={onClose}>
      <div className="sheet-group">Records</div>
      <div className="row inset stats">
        <span className="row-body">
          {STATS.map((s) => (
            <span className="stat" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value(state)}</span>
            </span>
          ))}
        </span>
      </div>

      <div className="sheet-group">Language</div>
      <div className="row inset">
        <span className="row-body">
          <span className="row-name">Language</span>
          <span className="row-desc">More to come.</span>
        </span>
        <select className="picker btn" value="en" onChange={() => undefined} aria-label="Language">
          <option value="en">English</option>
        </select>
      </div>

      <div className="sheet-group">Danger</div>
      <div className={'row ' + (armed ? 'danger' : 'inset')}>
        <span className="row-body">
          <span className="row-name">Reset Game</span>
          <span className="row-desc">
            {armed
              ? 'Erases everything — dungeon, gold, souls, unlocks, stages, heroes. No undo.'
              : 'Permanently deletes all player data and starts over.'}
          </span>
        </span>
        {armed ? (
          <>
            <button className="row-btn btn" onClick={() => setArmed(false)}>
              No
            </button>
            <button className="row-btn btn wipe" onClick={onReset}>
              Erase
            </button>
          </>
        ) : (
          <button className="row-btn btn warn" onClick={() => setArmed(true)}>
            Reset
          </button>
        )}
      </div>

      <div className="sheet-group">Credits</div>
      <div className="row inset">
        <span className="row-body">
          <span className="row-name">Created by xanaksetan</span>
          <span className="row-desc">Own a Dungeon — built as a mobile-first browser game.</span>
        </span>
      </div>
      <a className="row inset link" href="https://www.instagram.com/xanaksetan" target="_blank" rel="noopener noreferrer">
        <span className="row-body">
          <span className="row-name">Instagram</span>
          <span className="row-desc">@xanaksetan</span>
        </span>
        <span className="row-count">&#8599;</span>
      </a>
      <a className="row inset link" href="https://github.com/irwanasas" target="_blank" rel="noopener noreferrer">
        <span className="row-body">
          <span className="row-name">GitHub</span>
          <span className="row-desc">github.com/irwanasas</span>
        </span>
        <span className="row-count">&#8599;</span>
      </a>
      <div className="copyright">All Rights Reserved 2026</div>
    </Sheet>
  );
}

export function WorldSheet({ open, state, onClose }: { open: boolean; state: GameState; onClose: () => void }) {
  const active = state.world.active
    .map((a) => ({ left: a.raidsLeft, event: worldEvent(a.id) }))
    .filter((x) => x.event !== null);
  const live = new Set(active.map((x) => x.event!.id));
  const past = state.world.history.filter((id) => !live.has(id)).map(worldEvent).filter((e) => e !== null);

  return (
    <Sheet open={open} title="The World" onClose={onClose}>
      <div className="sheet-rule">
        News from above ground. Some of it changes what walks into your dungeon — check before you raid.
      </div>

      <div className="sheet-group">Happening Now</div>
      {active.length === 0 && (
        <div className="row inset">
          <span className="row-body">
            <span className="row-name">Quiet</span>
            <span className="row-desc">Nothing stirring above ground. Word will reach you soon enough.</span>
          </span>
        </div>
      )}
      {active.map(({ left, event }) => {
        const e = event!;
        const lines = describeEffect(e.effect);
        return (
          <div key={e.id} className="row inset">
            <span className="row-body">
              <span className="row-name">
                <span className={'tone-tag ' + e.tone}>{e.category}</span>
                {e.headline}
              </span>
              <span className="row-desc">{e.body}</span>
              {lines.length > 0 ? (
                lines.map((l) => (
                  <span className="row-hint" key={l}>
                    {l}
                  </span>
                ))
              ) : (
                <span className="row-hint quiet">Word only. Nothing here changes the fighting.</span>
              )}
            </span>
            <span className="row-count">
              {left}
              <span className="row-count-sub">left</span>
            </span>
          </div>
        );
      })}

      {effectCount(state.world) > 0 && (
        <div className="sheet-rule">Two world effects can run at once, and none lasts more than four raids.</div>
      )}

      <div className="sheet-group">Already Passed</div>
      {past.length === 0 && (
        <div className="row inset">
          <span className="row-body">
            <span className="row-desc">Nothing has come and gone yet.</span>
          </span>
        </div>
      )}
      {past.map((e) => (
        <div key={e!.id} className="row inset">
          <span className="row-body">
            <span className="row-name">
              <span className={'tone-tag ' + e!.tone}>{e!.category}</span>
              {e!.headline}
            </span>
            <span className="row-desc">{e!.body}</span>
          </span>
        </div>
      ))}
    </Sheet>
  );
}
