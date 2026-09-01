import { MONSTER_SPRITE_MANIFEST, MonsterAnimState } from '../data/monsterSprites';
import { renderSideSprite, updateSpriteAnimation, SpritePlayback } from './spriteAnimator';

export interface MonsterTokenState {
  id: string;
  type: string;
  laneIndex: number;
  x: number;
  y: number;
  animState: MonsterAnimState;
  playback: SpritePlayback;
  hp: number;
  maxHp: number;
  isEnemy: boolean;
}

export function createMonsterToken(
  id: string,
  type: string,
  laneIndex: number,
  x: number,
  y: number,
  isEnemy: boolean = true
): MonsterTokenState {
  return {
    id,
    type,
    laneIndex,
    x,
    y,
    animState: 'idle',
    playback: { currentFrame: 0, elapsedMs: 0, isFinished: false },
    hp: 100,
    maxHp: 100,
    isEnemy,
  };
}

export function updateMonsterToken(
  token: MonsterTokenState,
  deltaTimeMs: number
): MonsterTokenState {
  const manifest = MONSTER_SPRITE_MANIFEST[token.type];
  const animMeta = manifest?.[token.animState];

  if (!animMeta) return token;

  const updatedPlayback = updateSpriteAnimation(token.playback, animMeta, deltaTimeMs);

  let nextState = token.animState;
  if (updatedPlayback.isFinished && !animMeta.loop) {
    nextState = 'idle';
  }

  return {
    ...token,
    animState: nextState,
    playback: nextState !== token.animState
      ? { currentFrame: 0, elapsedMs: 0, isFinished: false }
      : updatedPlayback,
  };
}

export function renderMonsterToken(
  ctx: CanvasRenderingContext2D,
  token: MonsterTokenState,
  width: number = 64,
  height: number = 64
): void {
  const manifest = MONSTER_SPRITE_MANIFEST[token.type];
  const animMeta = manifest?.[token.animState];

  if (manifest && animMeta) {
    renderSideSprite(
      ctx,
      animMeta.path,
      animMeta,
      token.playback.currentFrame,
      token.x - width / 2,
      token.y - height / 2,
      width,
      height,
      token.isEnemy
    );
  } else {
    // Fallback visual jika sprite belum ter-load/terdaftar
    ctx.fillStyle = token.isEnemy ? '#e74c3c' : '#2ecc71';
    ctx.fillRect(token.x - width / 2, token.y - height / 2, width, height);
  }

  // Health bar sederhana di atas unit
  if (token.hp < token.maxHp) {
    const barW = width;
    const barH = 5;
    const barX = token.x - width / 2;
    const barY = token.y - height / 2 - 8;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX, barY, barW, barH);

    const healthRatio = Math.max(0, token.hp / token.maxHp);
    ctx.fillStyle = token.isEnemy ? '#e74c3c' : '#2ecc71';
    ctx.fillRect(barX, barY, barW * healthRatio, barH);
  }
}
