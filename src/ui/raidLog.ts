// The scrolling narrative log shown during a raid.
import type { RaidLogType } from '../types';

export function logLine(text: string, type?: RaidLogType): void {
  type = type || '';
  var log = document.getElementById('raid-log');
  if (!log) return;
  var p = document.createElement('p');
  p.className = 'raid-log-line' + (type ? ' ' + type : '');
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

export function clearRaidLog(): void {
  var log = document.getElementById('raid-log');
  if (log) log.innerHTML = '';
}
