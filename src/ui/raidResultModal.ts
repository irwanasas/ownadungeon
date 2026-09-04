import type { RaidOutcome } from '../combat/raidRewards';
import { playSfx } from '../audio/sfx';

export function showRaidResultModal(outcome: RaidOutcome, gold: number, souls: number): void {
  var modal = document.getElementById('raid-result-modal');
  var title = document.getElementById('raid-result-title');
  var desc = document.getElementById('raid-result-desc');
  var goldEl = document.getElementById('raid-result-gold');
  var soulsEl = document.getElementById('raid-result-souls');
  if (!modal || !title || !desc || !goldEl || !soulsEl) return;

  title.classList.remove('is-win', 'is-warn', 'is-loss');
  if (outcome.dungeonWin) {
    title.textContent = 'Dungeon Held!';
    title.classList.add('is-win');
    desc.textContent = 'The hero fell before your traps and monsters.';
    playSfx('win');
  } else if (outcome.heroEscape) {
    title.textContent = 'Hero Escaped';
    title.classList.add('is-warn');
    desc.textContent = 'The hero fled with their life, but little else.';
    playSfx('escape');
  } else {
    title.textContent = 'Dungeon Broken';
    title.classList.add('is-loss');
    desc.textContent = 'The hero fought through to the Throne and won.';
    playSfx('lose');
  }

  goldEl.textContent = String(gold);
  soulsEl.textContent = String(souls);
  modal.classList.remove('modal-overlay--hidden');
}
