const UNIT_PX = 212;

let scrollPx = 0;

function getLayer(): HTMLElement | null {
  return document.getElementById('room-corridor');
}

export function resetWorldScroll(): void {
  scrollPx = 0;
  var el = getLayer();
  if (!el) return;
  el.style.transitionDuration = '0ms';
  el.style.backgroundPositionX = '0px';
  requestAnimationFrame(function () {
    if (el) el.style.transitionDuration = '';
  });
}

export function advanceWorldScroll(unitFraction: number, ms: number): void {
  var el = getLayer();
  if (!el) return;
  scrollPx -= UNIT_PX * unitFraction;
  el.style.transitionDuration = ms + 'ms';
  el.style.backgroundPositionX = scrollPx + 'px';
}
