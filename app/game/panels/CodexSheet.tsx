'use client';

import { HEROES } from '../../../game/content/heroes';
import { INTERACTIONS } from '../../../game/content/interactions';
import { STAGES } from '../../../game/content/stages';
import type { GameState } from '../../../game/state/save';
import { ICON, heroArt } from '../art';
import { Sheet } from './Sheet';

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
