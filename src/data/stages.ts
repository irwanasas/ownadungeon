import type { StageDef } from '../types';

const TUTORIAL: string[] = ['elementalist', 'berserker'];
const ADD_PALADIN: string[] = ['elementalist', 'berserker', 'paladin'];
const ADD_TRICKSTER: string[] = ['elementalist', 'berserker', 'paladin', 'trickster'];
const ADD_ASSASSIN: string[] = ['elementalist', 'berserker', 'paladin', 'trickster', 'assassin'];
const FULL_ROSTER: string[] = ['elementalist', 'berserker', 'paladin', 'trickster', 'assassin', 'druid'];

export const STAGE_DEFS: StageDef[] = [
  { stage: 1, heroPool: ['elementalist'], note: 'Tutorial: hanya Elementalist yang menyerang. Serangan awalnya lemah — Spike Trap membunuhnya sebelum ramp elemennya sempat menguat.' },
  { stage: 2, heroPool: ['berserker'], note: 'Tutorial: hanya Berserker yang menyerang. Fear-immune dan sulit panik — andalkan damage yang mencicil pelan.' },
  { stage: 3, heroPool: TUTORIAL, note: 'Elementalist dan Berserker bisa muncul bergantian. Taklukkan ini untuk membuka Poison Trap + Goblin Troop.' },
  { stage: 4, heroPool: TUTORIAL, note: 'Toolkit sama, tapi kombinasikan Spike dan Goblin Troop di ruang berbeda untuk melihat urutan encounter.' },
  { stage: 5, heroPool: TUTORIAL, note: 'Ujian akhir tutorial. Taklukkan ini untuk membuka Ruang ke-4.' },
  { stage: 6, heroPool: ADD_PALADIN, note: 'Paladin mulai muncul — ia meredam tiap hit lewat mitigasi tetap, jadi damage berulang (DOT) lebih efektif daripada satu hit besar.' },
  { stage: 7, heroPool: ADD_PALADIN, note: 'Goblin Shaman (baru terbuka) chip damage-nya menembus mitigasi Paladin pelan-pelan sepanjang raid.' },
  { stage: 8, heroPool: ADD_TRICKSTER, note: 'Trickster muncul — evasion tingginya membuat trap sekali-hantam sering meleset. Taklukkan ini untuk membuka Net Trap.' },
  { stage: 9, heroPool: ADD_ASSASSIN, note: 'Net Trap yang baru terbuka menjerat kelas evasive seperti Trickster. Assassin melengkapi roster — ia mati sebelum bisa apa-apa jika kena burst duluan.' },
  { stage: 10, heroPool: FULL_ROSTER, note: 'Roster penuh 6 kelas. Druid melengkapi roster — regen-nya membuatnya unggul di ruang monster panjang, tapi rapuh terhadap satu hit besar.' },
  { stage: 11, heroPool: FULL_ROSTER, note: 'Kombinasi Goblin Troop + Poison Trap dalam satu layout menutup celah Paladin sekaligus Elementalist.' },
  { stage: 12, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Fire Trap — damage bakar susulan yang menghukum hero yang bertahan lama di ruang awal.' },
  { stage: 13, heroPool: FULL_ROSTER, note: 'Fire Trap yang baru terbuka: efek bakarnya terus jalan setelah ruang berikutnya dimulai — kecuali kena Elementalist yang punya afinitas elemen.' },
  { stage: 14, heroPool: FULL_ROSTER, note: 'Slime selalu tersedia — dinding fisik-resistant yang meredam hero non-magic seperti Paladin dan Berserker.' },
  { stage: 15, heroPool: FULL_ROSTER, note: 'Slime paling efektif di belakang trap yang sudah melemahkan hero lebih dulu.' },
  { stage: 16, heroPool: FULL_ROSTER, note: 'Timing: Poison Trap terus mencicil HP lewat DOT — biarkan racun bekerja sebelum ruang monster berikutnya, kecuali lawan Druid yang resist nature.' },
  { stage: 17, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Frost Trap — mengurangi DEF hero sehingga ruang monster sesudahnya menghantam lebih keras.' },
  { stage: 18, heroPool: FULL_ROSTER, note: 'Kombinasi baru: Frost Trap (DEF turun) diikuti Goblin Troop (burst ATK) adalah combo dua langkah.' },
  { stage: 19, heroPool: FULL_ROSTER, note: 'Review komposisi: pastikan trap dan monster yang kamu pasang benar-benar menutup kelemahan hero yang mungkin datang.' },
  { stage: 20, heroPool: FULL_ROSTER, note: 'Semua trap dan monster yang sudah terbuka sejauh ini harus saling melengkapi dalam satu layout.' },
  { stage: 21, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Goblin Elite — tank berarmor yang menyulitkan Assassin karena burst awalnya tidak cukup menembus DEF tebal.' },
  { stage: 22, heroPool: FULL_ROSTER, note: 'Goblin Elite (baru terbuka) cocok di ruang belakang; biarkan trap cepat menyaring di ruang depan.' },
  { stage: 23, heroPool: FULL_ROSTER, note: 'Urutan: trap ringan dulu untuk memancing panic/flee, monster berat di ruang terakhir sebelum Throne.' },
  { stage: 24, heroPool: FULL_ROSTER, note: 'Campurkan sumber damage instan dan DOT — mitigasi Paladin dan evasion Trickster butuh pendekatan berbeda.' },
  { stage: 25, heroPool: FULL_ROSTER, note: 'Raid lebih panjang di stage ini menguntungkan Frost Trap: DEF yang berkurang bertahan sepanjang sisa raid.' },
  { stage: 26, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Orc — pemukul berat yang mengancam Assassin dan Elementalist sebelum keduanya sempat unjuk kekuatan.' },
  { stage: 27, heroPool: FULL_ROSTER, note: 'Orc (baru terbuka) paling efektif melawan kelas rapuh — sia-sia dipasang untuk menghadapi Paladin yang tebal.' },
  { stage: 28, heroPool: FULL_ROSTER, note: 'Lapisan combo: Poison Trap terus mencicil HP sementara Goblin Shaman menahan hero di jarak jauh.' },
  { stage: 29, heroPool: FULL_ROSTER, note: 'Posisi: taruh monster tank sebelum ruang tersulit supaya hero sudah terkuras lebih dulu.' },
  { stage: 30, heroPool: FULL_ROSTER, note: 'Review penuh sebelum unlock terakhir: seluruh trap dan monster yang sudah terbuka harus sinergi dalam satu dungeon.' },
  { stage: 31, heroPool: FULL_ROSTER, note: 'Satu stage lagi sebelum Ruang ke-5 terbuka — manfaatkan 4 ruang yang ada semaksimal mungkin.' },
  { stage: 32, heroPool: FULL_ROSTER, note: 'Taklukkan ini untuk membuka Ruang ke-5, perluasan dungeon terakhir.' },
  { stage: 33, heroPool: FULL_ROSTER, note: 'Layout 5-ruang dimulai di sini — rencanakan alur penuh, bukan cuma ruang pembuka yang kuat.' },
  { stage: 34, heroPool: FULL_ROSTER, note: 'Variasi counter: hindari memasang jenis trap/monster yang sama dua ruang berturut-turut.' },
  { stage: 35, heroPool: ['paladin'], note: 'Gauntlet Paladin: mitigasi tetap di tiap hit dan fear-immune — andalkan DOT (Poison/Fire) yang terus mencicil tanpa terpotong mitigasi.' },
  { stage: 36, heroPool: ['berserker'], note: 'Gauntlet Berserker: fear-immune dan sulit panik — Net Trap menunda RAGE-nya, atau habisi cepat sebelum RAGE tercapai.' },
  { stage: 37, heroPool: ['trickster'], note: 'Gauntlet Trickster: evasion sangat tinggi terhadap hit tunggal — Poison/Fire (DOT) yang sekali kena tetap tergerus tiap ronde.' },
  { stage: 38, heroPool: ['assassin'], note: 'Gauntlet Assassin: opening strike-nya mematikan tapi HP dan DEF-nya nol — Spike Trap instan atau tank berlapis menghabisinya sebelum burst kedua.' },
  { stage: 39, heroPool: ['druid'], note: 'Gauntlet Druid: regen tiap ronde membuatnya sulit habis di fight panjang — satu Spike/Fire Trap besar di awal lebih efektif daripada dicicil.' },
  { stage: 40, heroPool: ['elementalist'], note: 'Gauntlet Elementalist: lemah di ronde awal tapi menguat tiap ronde — bunuh cepat dengan burst atau jerat dengan Net sebelum ramp-nya jalan.' },
  { stage: 41, heroPool: FULL_ROSTER, note: 'Roster campuran kembali terbuka — satu layout harus menjawab beberapa kemungkinan kelas hero sekaligus.' },
  { stage: 42, heroPool: FULL_ROSTER, note: 'Combo review: Frost Trap ke Fire Trap — DEF berkurang dulu, lalu damage bakar menembus lebih dalam.' },
  { stage: 43, heroPool: FULL_ROSTER, note: 'Combo review: Net Trap ke Goblin Elite — kelas evasive dijerat dulu, baru dihadang tank yang sulit ia lewati.' },
  { stage: 44, heroPool: FULL_ROSTER, note: 'Combo review: Poison Trap ke Orc — DOT terus berjalan sementara pukulan berat Orc menekan HP sepanjang raid.' },
  { stage: 45, heroPool: FULL_ROSTER, note: 'Seluruh 5 trap dan 5 monster yang sudah terbuka kini bisa dirotasi bebas — rancang layout paling efisien.' },
  { stage: 46, heroPool: FULL_ROSTER, note: 'Roster penuh, tanpa petunjuk kelas mana yang datang — susun dungeon yang menutup kelemahan keenam kelas sekaligus.' },
  { stage: 47, heroPool: FULL_ROSTER, note: 'Tekanan menuju Throne meningkat — pastikan HP hero sudah terkuras signifikan sebelum ia bertemu King.' },
  { stage: 48, heroPool: FULL_ROSTER, note: 'Presisi: hanya layout dengan urutan counter yang tepat yang menyelesaikan stage ini dengan bersih.' },
  { stage: 49, heroPool: FULL_ROSTER, note: 'Mastery check: rotasikan seluruh 5 trap dan 5 monster dalam satu raid 5-ruang.' },
  { stage: 50, heroPool: FULL_ROSTER, note: 'Mahakarya Dungeon: puzzle penuh yang menggabungkan setiap trap, monster, dan mekanik kelas yang pernah dibuka.' }
];

export function getStageDef(stage: number): StageDef {
  const s = Math.max(1, Math.min(STAGE_DEFS.length, Math.floor(stage) || 1));
  return STAGE_DEFS[s - 1];
}
