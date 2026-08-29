import type { StageDef } from '../types';

// Stage 1-50 as a handcrafted puzzle progression instead of a stat-scaling
// gauntlet. Each stage hardcodes which hero classes can invade
// (`heroPool`) so the puzzle the player has to solve is deterministic and
// always solvable with whatever traps/monsters they've unlocked by then —
// never a class they have no counter for yet. Difficulty comes from which
// heroes appear, in what combination, and what's newly unlocked — not from
// HP/ATK/DEF inflation (see data/difficulty.ts).
//
// Vulnerability reasoning (see data/matchups.ts):
// - Mage is the trap-side glass cannon: high vs Spike (x1.30) and Poison,
//   and Goblin Brute is its worst monster matchup (x0.8).
// - Berserker resists fear but is the best-countered class by Skeleton
//   Archer's chip damage (x1.05, the lowest hero-favoring number in the
//   whole monster table) and still takes real Spike/Poison damage.
// - Warrior shrugs off Spike (x0.72) but Poison undoes that resistance
//   (x1.28, its single worst matchup).
// - Paladin resists fear and physical trap types but is nearly as
//   poison-vulnerable as Warrior (x1.22).
// - Rogue evades traps generally but Net Trap is built specifically to
//   catch it (x1.22), and Bone Ogre is its worst monster matchup (x0.8).
// - Shadow Wraith's fear aura only meaningfully threatens non-fear-immune
//   classes (everyone except Berserker and Paladin).
//
// Stages 1-5 only ever send Mage/Berserker — the two classes already
// vulnerable to the starting Spike Trap + Skeleton Archer loadout — so the
// tutorial is always winnable with zero unlocks. From Stage 6 the roster
// opens up one class at a time, always after (or in lockstep with) the
// unlock that specifically counters it.
const TUTORIAL: string[] = ['mage', 'berserker'];
const OPEN_WARRIOR: string[] = ['mage', 'berserker', 'warrior'];
const OPEN_PALADIN: string[] = ['mage', 'berserker', 'warrior', 'paladin'];
const FULL_ROSTER: string[] = ['mage', 'berserker', 'warrior', 'paladin', 'rogue'];

export const STAGE_DEFS: StageDef[] = [
  { stage: 1, heroPool: ['mage'], note: 'Tutorial: hanya Mage yang menyerang. Spike Trap saja sudah cukup — Mage sangat rentan padanya.' },
  { stage: 2, heroPool: ['berserker'], note: 'Tutorial: hanya Berserker yang menyerang. Skeleton Archer meredam RAGE-nya lewat chip damage bertahap.' },
  { stage: 3, heroPool: TUTORIAL, note: 'Mage dan Berserker bisa muncul bergantian. Taklukkan ini untuk membuka Poison Trap + Goblin Brute.' },
  { stage: 4, heroPool: TUTORIAL, note: 'Toolkit sama, tapi kombinasikan Spike dan Skeleton di ruang yang berbeda untuk melihat urutan encounter.' },
  { stage: 5, heroPool: TUTORIAL, note: 'Ujian akhir tutorial. Taklukkan ini untuk membuka Ruang ke-4.' },
  { stage: 6, heroPool: OPEN_WARRIOR, note: 'Warrior mulai muncul — ia tahan Spike, jadi andalkan Poison Trap yang baru terbuka untuk menembus DEF-nya.' },
  { stage: 7, heroPool: OPEN_WARRIOR, note: 'Goblin Brute (baru terbuka) adalah matchup terburuk Mage — pasang di ruang awal untuk raid Mage.' },
  { stage: 8, heroPool: OPEN_PALADIN, note: 'Paladin muncul — nyaris serentan Warrior terhadap Poison. Taklukkan ini untuk membuka Net Trap.' },
  { stage: 9, heroPool: FULL_ROSTER, note: 'Rogue melengkapi roster — ia biasa lolos dari trap fisik, tapi Net Trap yang baru terbuka dibuat khusus untuk menjeratnya.' },
  { stage: 10, heroPool: FULL_ROSTER, note: 'Roster penuh 5 kelas. Urutan ruang menentukan: taruh counter yang tepat di ruang pertama yang ditemui hero.' },
  { stage: 11, heroPool: FULL_ROSTER, note: 'Kombinasi Goblin Brute + Poison Trap dalam satu layout menutup celah Warrior sekaligus Mage.' },
  { stage: 12, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Fire Trap — damage bakar susulan yang menghukum hero yang bertahan lama di ruang awal.' },
  { stage: 13, heroPool: FULL_ROSTER, note: 'Fire Trap yang baru terbuka: efek bakarnya terus jalan setelah ruang berikutnya dimulai — manfaatkan itu.' },
  { stage: 14, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Acid Slime — dinding fisik-resistant yang meredam hero non-magic.' },
  { stage: 15, heroPool: FULL_ROSTER, note: 'Acid Slime (baru terbuka) paling efektif di belakang trap yang sudah melemahkan hero lebih dulu.' },
  { stage: 16, heroPool: FULL_ROSTER, note: 'Timing: Poison Trap terus mencicil HP lewat DOT — biarkan racun bekerja sebelum ruang monster berikutnya.' },
  { stage: 17, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Frost Trap — mengurangi DEF hero sehingga ruang monster sesudahnya menghantam lebih keras.' },
  { stage: 18, heroPool: FULL_ROSTER, note: 'Kombinasi baru: Frost Trap (DEF turun) diikuti Goblin Brute (burst ATK) adalah combo dua langkah.' },
  { stage: 19, heroPool: FULL_ROSTER, note: 'Review komposisi: pastikan trap dan monster yang kamu pasang benar-benar menutup kelemahan hero yang mungkin datang.' },
  { stage: 20, heroPool: FULL_ROSTER, note: 'Semua trap dan monster yang sudah terbuka sejauh ini harus saling melengkapi dalam satu layout.' },
  { stage: 21, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Bone Ogre — tank yang paling menyulitkan Rogue (matchup terburuknya).' },
  { stage: 22, heroPool: FULL_ROSTER, note: 'Bone Ogre (baru terbuka) cocok di ruang belakang; biarkan trap cepat menyaring di ruang depan.' },
  { stage: 23, heroPool: FULL_ROSTER, note: 'Urutan: trap ringan dulu untuk memancing reaksi (panic/flee), monster berat di ruang terakhir sebelum Throne.' },
  { stage: 24, heroPool: FULL_ROSTER, note: 'Campurkan sumber damage fisik dan DOT — jangan andalkan satu jenis saja karena tiap kelas hero punya resistansi berbeda.' },
  { stage: 25, heroPool: FULL_ROSTER, note: 'Raid lebih panjang di stage ini menguntungkan Frost Trap: DEF yang berkurang bertahan sepanjang sisa raid.' },
  { stage: 26, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Shadow Wraith — aura takutnya menghukum semua kelas kecuali Berserker dan Paladin (fear-immune).' },
  { stage: 27, heroPool: FULL_ROSTER, note: 'Shadow Wraith (baru terbuka) paling efektif melawan Warrior/Rogue/Mage — sia-sia dipasang untuk menghadapi Berserker atau Paladin.' },
  { stage: 28, heroPool: FULL_ROSTER, note: 'Lapisan combo: Poison Trap terus mencicil HP sementara efek takut dari Shadow Wraith menurunkan ATK hero.' },
  { stage: 29, heroPool: FULL_ROSTER, note: 'Posisi: taruh Shadow Wraith sebelum ruang tersulit supaya efek takutnya melemahkan hero lebih dulu.' },
  { stage: 30, heroPool: FULL_ROSTER, note: 'Review penuh sebelum unlock terakhir: seluruh trap dan monster yang sudah terbuka harus sinergi dalam satu dungeon.' },
  { stage: 31, heroPool: FULL_ROSTER, note: 'Satu stage lagi sebelum Ruang ke-5 terbuka — manfaatkan 4 ruang yang ada semaksimal mungkin.' },
  { stage: 32, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Ruang ke-5, perluasan dungeon terakhir.' },
  { stage: 33, heroPool: FULL_ROSTER, note: 'Layout 5-ruang dimulai di sini — rencanakan alur penuh, bukan cuma ruang pembuka yang kuat.' },
  { stage: 34, heroPool: FULL_ROSTER, note: 'Variasi counter: hindari memasang jenis trap/monster yang sama dua ruang berturut-turut.' },
  { stage: 35, heroPool: ['berserker'], note: 'Gauntlet Berserker: fear-immune dan sulit panik — andalkan DOT (Poison/Fire) yang tetap mencicil terlepas dari RAGE-nya.' },
  { stage: 36, heroPool: ['mage'], note: 'Gauntlet Mage: rapuh tapi berbahaya — tempatkan Spike/Poison/Goblin Brute di ruang-ruang awal sebelum ia mencapai Throne.' },
  { stage: 37, heroPool: ['rogue'], note: 'Gauntlet Rogue: evasion tinggi terhadap trap fisik — kombinasi Net Trap (menjerat) dan Bone Ogre (matchup terburuknya) menutup celahnya.' },
  { stage: 38, heroPool: ['warrior'], note: 'Gauntlet Warrior: HP dan DEF tebal di garis depan — Poison Trap yang terus mencicil lebih efektif daripada damage instan.' },
  { stage: 39, heroPool: ['paladin'], note: 'Gauntlet Paladin: fear-immune dan holy vs undead/ethereal — Shadow Wraith sia-sia di sini, andalkan Poison dan Goblin Brute.' },
  { stage: 40, heroPool: FULL_ROSTER, note: 'Roster campuran kembali terbuka — satu layout harus menjawab beberapa kemungkinan kelas hero sekaligus.' },
  { stage: 41, heroPool: FULL_ROSTER, note: 'Combo review: Frost Trap ke Fire Trap — DEF berkurang dulu, lalu damage bakar menembus lebih dalam.' },
  { stage: 42, heroPool: FULL_ROSTER, note: 'Combo review: Net Trap ke Bone Ogre — kelas evasif dijerat dulu, baru dihadang tank yang sulit ia lewati.' },
  { stage: 43, heroPool: FULL_ROSTER, note: 'Combo review: Poison Trap ke Shadow Wraith — DOT terus berjalan sementara efek takut menekan ATK sepanjang raid.' },
  { stage: 44, heroPool: FULL_ROSTER, note: 'Seluruh 5 trap dan 5 monster yang sudah terbuka kini bisa dirotasi bebas — rancang layout paling efisien.' },
  { stage: 45, heroPool: FULL_ROSTER, note: 'Roster penuh, tanpa petunjuk kelas mana yang datang — susun dungeon yang menutup kelemahan kelima kelas sekaligus.' },
  { stage: 46, heroPool: FULL_ROSTER, note: 'Tekanan menuju Throne meningkat — pastikan HP hero sudah terkuras signifikan sebelum ia bertemu King.' },
  { stage: 47, heroPool: FULL_ROSTER, note: 'Presisi: hanya layout dengan urutan counter yang tepat yang menyelesaikan stage ini dengan bersih.' },
  { stage: 48, heroPool: FULL_ROSTER, note: 'Mastery check: rotasikan seluruh 5 trap dan 5 monster dalam satu raid 5-ruang.' },
  { stage: 49, heroPool: FULL_ROSTER, note: 'Gauntlet terakhir sebelum puncak — setiap mekanik yang pernah diperkenalkan bisa muncul dalam satu raid.' },
  { stage: 50, heroPool: FULL_ROSTER, note: 'Mahakarya Dungeon: puzzle penuh yang menggabungkan setiap trap, monster, dan combo yang pernah dibuka.' }
];

export function getStageDef(stage: number): StageDef {
  const s = Math.max(1, Math.min(STAGE_DEFS.length, Math.floor(stage) || 1));
  return STAGE_DEFS[s - 1];
}
