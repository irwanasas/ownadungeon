import { state } from '../state/gameState';
import { getKingStats } from '../data/king';
import { STAGE_MAX } from '../data/difficulty';

export function renderStats(): void {
  var wrap = document.getElementById('stats-list');
  if (!wrap) return;
  var s = state.stats;
  var king = getKingStats(state.king && state.king.level);
  var maxS = STAGE_MAX;
  var rows: [string, string | number][] = [
    ['— Resources —', ''],
    ['Gold', state.gold],
    ['Souls', state.souls],
    ['— Mode & Progress —', ''],
    ['Mode', state.mode === 'arcade' ? 'Arcade' : 'Stage'],
    ['Stage', (state.stage || 1) + ' / ' + maxS],
    ['Highest Stage', state.maxStageCleared || 0],
    ['Arcade Wave', state.arcadeWave || 1],
    ['Arcade Best', state.arcadeBest || 0],
    ['— King —', ''],
    ['King Level', king.level],
    ['King HP', king.maxHp],
    ['King ATK', king.atk],
    ['King DEF', king.def],
    ['— Raid Stats —', ''],
    ['Total Raids', s.raidsTotal],
    ['Dungeon Wins', s.dungeonWins],
    ['Hero Escapes', s.heroEscapes],
    ['Hero Victories', s.heroVictories]
  ];
  wrap.innerHTML = rows
    .map(function (r) {
      if (r[1] === '') {
        return (
          '<div class="stat-section">' +
          r[0].replace(/^— | —$/g, '') +
          '</div>'
        );
      }
      return (
        '<div class="stat-row"><span>' +
        r[0] +
        '</span><span>' +
        r[1] +
        '</span></div>'
      );
    })
    .join('');
}
