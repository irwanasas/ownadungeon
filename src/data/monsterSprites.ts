export interface AnimationMeta {
  path: string;
  frameCount: number;
  fps: number;
  loop: boolean;
}

export type MonsterAnimState = 'idle' | 'walk' | 'run' | 'attack' | 'hurt' | 'death';

export const MONSTER_SPRITE_MANIFEST: Record<string, Partial<Record<MonsterAnimState, AnimationMeta>>> = {
  goblin_elite: {
    idle:   { path: '/assets/monsters/goblin_elite/S_Idle.png',   frameCount: 4, fps: 6,  loop: true },
    walk:   { path: '/assets/monsters/goblin_elite/S_Walk.png',   frameCount: 6, fps: 10, loop: true },
    attack: { path: '/assets/monsters/goblin_elite/S_Attack.png', frameCount: 5, fps: 12, loop: false },
    hurt:   { path: '/assets/monsters/goblin_elite/S_Hurt.png',   frameCount: 3, fps: 10, loop: false },
    death:  { path: '/assets/monsters/goblin_elite/S_Death.png',  frameCount: 5, fps: 8,  loop: false },
  },
  goblin_shaman: {
    idle:   { path: '/assets/monsters/goblin_shaman/S_Idle.png',   frameCount: 4, fps: 6,  loop: true },
    walk:   { path: '/assets/monsters/goblin_shaman/S_Walk.png',   frameCount: 6, fps: 10, loop: true },
    attack: { path: '/assets/monsters/goblin_shaman/S_Attack.png', frameCount: 5, fps: 12, loop: false },
    hurt:   { path: '/assets/monsters/goblin_shaman/S_Hurt.png',   frameCount: 3, fps: 10, loop: false },
    death:  { path: '/assets/monsters/goblin_shaman/S_Death.png',  frameCount: 5, fps: 8,  loop: false },
  },
  goblin_troop: {
    idle:   { path: '/assets/monsters/goblin_troop/S_Idle.png',   frameCount: 4, fps: 6,  loop: true },
    walk:   { path: '/assets/monsters/goblin_troop/S_Walk.png',   frameCount: 6, fps: 10, loop: true },
    attack: { path: '/assets/monsters/goblin_troop/S_Attack.png', frameCount: 5, fps: 12, loop: false },
    hurt:   { path: '/assets/monsters/goblin_troop/S_Hurt.png',   frameCount: 3, fps: 10, loop: false },
    death:  { path: '/assets/monsters/goblin_troop/S_Death.png',  frameCount: 5, fps: 8,  loop: false },
  },
  orc: {
    idle:   { path: '/assets/monsters/orc/orc_idle.png',   frameCount: 4, fps: 6,  loop: true },
    walk:   { path: '/assets/monsters/orc/orc_walk.png',   frameCount: 6, fps: 10, loop: true },
    run:    { path: '/assets/monsters/orc/orc_run.png',    frameCount: 6, fps: 12, loop: true },
    attack: { path: '/assets/monsters/orc/orc_attack.png', frameCount: 5, fps: 12, loop: false },
    hurt:   { path: '/assets/monsters/orc/orc_hurt.png',   frameCount: 3, fps: 10, loop: false },
    death:  { path: '/assets/monsters/orc/orc_death.png',  frameCount: 5, fps: 8,  loop: false },
  },
  ghost: {
    idle:   { path: '/assets/monsters/slimes/ghost/ghost_idle.png',   frameCount: 4, fps: 6,  loop: true },
    walk:   { path: '/assets/monsters/slimes/ghost/ghost_walk.png',   frameCount: 6, fps: 10, loop: true },
    run:    { path: '/assets/monsters/slimes/ghost/ghost_run.png',    frameCount: 6, fps: 12, loop: true },
    attack: { path: '/assets/monsters/slimes/ghost/ghost_attack.png', frameCount: 5, fps: 12, loop: false },
    hurt:   { path: '/assets/monsters/slimes/ghost/ghost_hurt.png',   frameCount: 3, fps: 10, loop: false },
    death:  { path: '/assets/monsters/slimes/ghost/ghost_death.png',  frameCount: 5, fps: 8,  loop: false },
  },
};
