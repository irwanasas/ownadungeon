import { AnimationMeta } from '../data/monsterSprites';

export interface SpritePlayback {
  currentFrame: number;
  elapsedMs: number;
  isFinished: boolean;
}

const imageCache: Map<string, HTMLImageElement> = new Map();

/**
  Ambil gambar dari cache atau daftarkan jika belum ada.
 */
export function getCachedImage(src: string): HTMLImageElement {
  if (!imageCache.has(src)) {
    const img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return imageCache.get(src)!;
}

/**
  Update kalkulasi frame berdasarkan delta time (ms).
 */
export function updateSpriteAnimation(
  playback: SpritePlayback,
  meta: AnimationMeta,
  deltaTimeMs: number
): SpritePlayback {
  if (playback.isFinished && !meta.loop) {
    return playback;
  }

  const frameDurationMs = 1000 / meta.fps;
  let elapsedMs = playback.elapsedMs + deltaTimeMs;
  let currentFrame = playback.currentFrame;
  let isFinished = false;

  while (elapsedMs >= frameDurationMs) {
    elapsedMs -= frameDurationMs;
    currentFrame++;

    if (currentFrame >= meta.frameCount) {
      if (meta.loop) {
        currentFrame = 0;
      } else {
        currentFrame = meta.frameCount - 1;
        isFinished = true;
        break;
      }
    }
  }

  return { currentFrame, elapsedMs, isFinished };
}

/**
  Render frame animasi ke Canvas 2D dengan opsi pemotongan horizontal & flip.
 */
export function renderSideSprite(
  ctx: CanvasRenderingContext2D,
  imageSrc: string,
  meta: AnimationMeta,
  currentFrame: number,
  drawX: number,
  drawY: number,
  drawWidth?: number,
  drawHeight?: number,
  flipHorizontal: boolean = false
): void {
  const img = getCachedImage(imageSrc);
  if (!img.complete || img.naturalWidth === 0) return;

  const frameWidth = img.naturalWidth / meta.frameCount;
  const frameHeight = img.naturalHeight;
  const sourceX = currentFrame * frameWidth;

  const targetW = drawWidth ?? frameWidth;
  const targetH = drawHeight ?? frameHeight;

  ctx.save();

  if (flipHorizontal) {
    ctx.translate(drawX + targetW, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(
      img,
      sourceX, 0, frameWidth, frameHeight,
      0, 0, targetW, targetH
    );
  } else {
    ctx.drawImage(
      img,
      sourceX, 0, frameWidth, frameHeight,
      drawX, drawY, targetW, targetH
    );
  }

  ctx.restore();
}
