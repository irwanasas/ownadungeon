// The scrolling narrative log shown during a raid.
export function logLine(text, type) {
  type = type || '';
  var log = document.getElementById('raid-log');
  if (!log) return;
  var p = document.createElement('p');
  p.className = 'raid-log-line' + (type ? ' ' + type : '');
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

export function clearRaidLog() {
  var log = document.getElementById('raid-log');
  if (log) log.innerHTML = '';
}
