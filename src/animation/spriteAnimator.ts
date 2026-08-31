// Generic frame-stepped sprite-sheet animator for DOM elements. Steps a
// background-image through a horizontal strip of frames (optionally one
// row out of a multi-row sheet) at a fixed fps via setInterval — matching
// this project's existing setTimeout-based animation style (beatTiming.ts,
// heroToken.ts) rather than a CSS @keyframes + calc(var()) trick, so the
// frame math stays in one readable place.
import { monsterAssetUrl } from './assetPaths';

export interface SpriteSheetDef {
  /** Path relative to public/assets/monsters/. */
  src: string;
  frameW: number;
  frameH: number;
  /** Number of frames (columns) in the animation strip. */
  frameCount: number;
  /** Total rows in the sheet, for sheets that pack multiple facings/rows into one file. Default 1. */
  rows?: number;
  /** Which row (0-based) this animation uses. Default 0. */
  row?: number;
  fps: number;
}

/**
 * Points `el`'s background at one frame-strip of `sheet` and steps through
 * it on an interval. `el` must already have a laid-out square box (its
 * rendered width is read once, at start, as the per-frame display size —
 * matching the fixed-px + one breakpoint pattern .hero-token already uses
 * rather than continuously recomputing on resize).
 * Returns a stop function that clears the interval.
 */
export function startSpriteLoop(el: HTMLElement, sheet: SpriteSheetDef): () => void {
  var rows = sheet.rows || 1;
  var row = sheet.row || 0;
  var displayPx = el.getBoundingClientRect().width || sheet.frameW;
  var scale = displayPx / sheet.frameH;

  el.style.backgroundImage = 'url(' + monsterAssetUrl(sheet.src) + ')';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundSize =
    Math.round(sheet.frameW * sheet.frameCount * scale) + 'px ' +
    Math.round(sheet.frameH * rows * scale) + 'px';
  el.style.backgroundPositionY = '-' + Math.round(row * sheet.frameH * scale) + 'px';

  var frame = 0;
  el.style.backgroundPositionX = '0px';
  var intervalMs = Math.max(30, Math.round(1000 / sheet.fps));
  var id = setInterval(function () {
    frame = (frame + 1) % sheet.frameCount;
    el.style.backgroundPositionX = '-' + Math.round(frame * sheet.frameW * scale) + 'px';
  }, intervalMs);

  return function stop() {
    clearInterval(id);
  };
}
