'use client';

import { forwardRef, useImperativeHandle } from 'react';
import type { DungeonSlot } from '../../engine/save';
import { forgeVars, TRAP_ICON, MONSTER_ICON, UI_ICON } from './assets';
import { useRaidPlayback, type DungeonStageHandle } from './useRaidPlayback';

export type { DungeonStageHandle } from './useRaidPlayback';

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

const DungeonStage = forwardRef<DungeonStageHandle, Props>(function DungeonStage({ rooms, onCellTap }, ref) {
  const {
    cells,
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
  } = useRaidPlayback(rooms);

  useImperativeHandle(ref, () => ({ playRaid }));

  return (
    <div className="dk-stage-wrap" style={forgeVars}>
      <div className={'dk-scroll' + (raiding ? ' locked' : '')} ref={scrollRef}>
        <div className="dk-world">
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
                {cell.kind !== 'entrance' && <div className={'dk-door' + (doorOpenIndex === cell.index ? ' is-open' : '')} />}
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
                  <div
                    className={
                      'dk-monster' + (monster.visible ? ' is-visible' : '') + (monster.dying ? ' is-dying' : '') + (monster.hit ? ' hit' : '')
                    }
                  >
                    <img src={monster.iconUrl} alt="monster" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {heroVisible && (
        <div className={'dk-hero ' + heroCls + (heroFlash ? ' hit' : '')} style={{ left: heroAnchor + '%' }}>
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
        <span key={n.id} className={'dk-fx-num ' + n.cls} style={{ left: `calc(${heroAnchor}% + ${n.jitter}px)`, bottom: 78 }}>
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
