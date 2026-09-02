export type BeatKey =
  | 'enterDungeon'
  | 'doorClosed'
  | 'doorOpen'
  | 'arriveRoom'
  | 'threat'
  | 'actionGap'
  | 'combatRound'
  | 'resolve'
  | 'betweenRooms'
  | 'ending';

const STAGE_BEAT: Record<BeatKey, number> & { jitter: number } = {
  enterDungeon: 850,
  doorClosed: 500,
  doorOpen: 600,
  arriveRoom: 750,
  threat: 800,
  actionGap: 700,
  combatRound: 950,
  resolve: 850,
  betweenRooms: 650,
  ending: 1100,
  jitter: 0.3
};

export function beatMs(key: BeatKey): number {
  var base = (STAGE_BEAT && STAGE_BEAT[key]) || 500;
  var j = (STAGE_BEAT && STAGE_BEAT.jitter) || 0.25;
  var factor = 1 + (Math.random() * 2 - 1) * j;
  return Math.max(120, Math.round(base * factor));
}

export function beatWait(key: BeatKey): Promise<void> {
  var ms = beatMs(key);
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}
