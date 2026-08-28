// Pacing for the raid animation timeline: each named "beat" waits a
// jittered delay so combat log lines and hero-token movement read at a
// legible, slightly organic pace instead of instantly.
const STAGE_BEAT = {
  enterDungeon: 850,
  arriveRoom: 750,
  threat: 800,
  actionGap: 700,
  combatRound: 950,
  resolve: 850,
  betweenRooms: 650,
  ending: 1100,
  jitter: 0.3
};

export function beatWait(key) {
  var base = (STAGE_BEAT && STAGE_BEAT[key]) || 500;
  var j = (STAGE_BEAT && STAGE_BEAT.jitter) || 0.25;
  var factor = 1 + (Math.random() * 2 - 1) * j;
  var ms = Math.max(120, Math.round(base * factor));
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}
