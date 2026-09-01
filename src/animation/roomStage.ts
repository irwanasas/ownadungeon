import { MonsterTokenState, updateMonsterToken, renderMonsterToken } from './monsterToken';
import { getCachedImage } from './spriteAnimator';

export interface StageLanes {
  laneCount: number;
  laneHeight: number;
  startY: number;
}

export class SideScrollStage {
  private ctx: CanvasRenderingContext2D;
  private backgroundSrc: string;
  private tokens: MonsterTokenState[] = [];
  private lanes: StageLanes;

  constructor(ctx: CanvasRenderingContext2D, backgroundSrc: string = '/assets/ui/bg/IMG_4394.jpeg') {
    this.ctx = ctx;
    this.backgroundSrc = backgroundSrc;
    this.lanes = {
      laneCount: 3,
      laneHeight: 80,
      startY: 120,
    };
  }

  public addToken(token: MonsterTokenState): void {
    this.tokens.push(token);
  }

  public update(deltaTimeMs: number): void {
    this.tokens = this.tokens.map((token) => updateMonsterToken(token, deltaTimeMs));
  }

  public render(canvasWidth: number, canvasHeight: number): void {
    this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Render Background Image / Parallax
    const bgImg = getCachedImage(this.backgroundSrc);
    if (bgImg.complete && bgImg.naturalWidth > 0) {
      this.ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
    } else {
      this.ctx.fillStyle = '#1e1e24';
      this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Render Garis Pembatas Lane / Lantai Arena
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 2;

    for (let i = 0; i < this.lanes.laneCount; i++) {
      const laneY = this.lanes.startY + i * this.lanes.laneHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, laneY);
      this.ctx.lineTo(canvasWidth, laneY);
      this.ctx.stroke();
    }

    // 3. Sort token berdasarkan posisi Y (Depth sorting sederhana)
    const sortedTokens = [...this.tokens].sort((a, b) => a.y - b.y);

    // 4. Render seluruh Token di dalam Lane
    for (const token of sortedTokens) {
      renderMonsterToken(this.ctx, token);
    }
  }
}
