# Own a Dungeon

Idle dungeon management — desain perangkap & monster, tekan **Raid**, lalu tonton hero mencoba menaklukkannya.

**Prototype web** untuk menguji apakah loop “susun → tonton → upgrade” terasa memuaskan.

- **Stack:** Next.js App Router (TypeScript), CSS modular, game logic vanilla di `src/`
- **Live:** https://irwanasas.github.io/ownadungeon/
- **Persistensi:** `localStorage` (client-side only)
- **Bahasa UI:** seluruh teks in-game (label, toast, log, nama hero/monster/trap) sudah di-i18n penuh ke **English**. README ini sendiri tetap ditulis dalam Bahasa Indonesia sebagai dokumentasi dev.

---

## Cara main

1. Panel **Enemy Detected** (`#room-preview`) langsung menampilkan hero yang akan menyerang **sebelum** kamu menekan PLAY — nama, stat, strengths/weaknesses, trait, plus hint matchup per ruang berdasarkan layout dungeon saat ini.
2. Buka **Armory** (dulu "Gudang") → pasang trap / monster ke slot ruangan untuk melawan hero itu.
3. Tekan **Raid** (tombol ▶).
4. Hero masuk **pintu per ruang**: pintu buka → enter → encounter → resolve → next → **Throne / King**. Begitu masuk Ruang 1, panel Enemy Detected beralih jadi battle card compact (HP bar + reaksi kontekstual).
5. Gold & Souls → **Upgrade** level item, unlock konten baru, naikkan King.
6. **Settings** (bottom nav, dulu "Reset") → pilihan bahasa (saat ini English-only) dan tombol Reset Game di Danger Zone.

Mode: **Stage** (1–50) atau **Arcade** (wave tak terbatas).

---

## Fitur utama

### Dungeon puzzle (matchup)

Bukan sekadar HP/ATK lebih besar. Tiap room adalah puzzle **Hero × Monster × Trap**.

**6 Hero Classes** — dikelompokkan jadi 3 keluarga arketipe, masing-masing dua kelas yang saling melengkapi (DEF vs ATK):

| Class | Family | Role | Mekanik inti | Kelemahan |
|-------|--------|------|---------------|-----------|
| Paladin | Warrior | Tank | Mitigasi tetap (`damageReduction`) di setiap hit, fear-immune | Burst rendah; DOT/attrition menembus mitigasi pelan-pelan |
| Berserker | Warrior | Bruiser | RAGE comeback di HP rendah, fear-immune | Net menunda RAGE; mati sebelum RAGE kalau di-burst cepat |
| Trickster | Rogue | Evasion | `evasion` tinggi, aktif di trap **dan** monster **dan** King | Tidak bisa evade DOT yang sudah kena; rapuh kalau dodge gagal |
| Assassin | Rogue | Burst | `burstMultiplier` — hit pertama tiap encounter sangat besar | Nol sustain/mitigasi; melempem kalau fight molor |
| Druid | Mage | Support | `regenPerRound` — heal tiap ronde di fight panjang, resist nature/DOT | Tidak bisa out-heal satu hit besar sekaligus |
| Elementalist | Mage | Terrain | `rampPerRound` — makin kuat tiap ronde, magic ATK, resist trap elemen | Opener lemah; kill cepat / control trap membatalkan ramp-nya |

Mekanik-mekanik ini (`evasion`, `damageReduction`, `regenPerRound`, `burstMultiplier`, `rampPerRound`, dll. — lihat `src/types.ts` field `Hero`) dicek generik di **ketiga** resolver combat (`trapEncounter.ts`, `monsterEncounter.ts`, `kingFight.ts`), bukan cuma tabel multiplier per-monster/per-trap — supaya counterplay antar arketipe muncul dari mekanik (timing, sustain, evasion, mitigasi), bukan sekadar angka damage yang lebih besar/kecil.

**5 Monster Types** — progresi Slime → Goblin Troop → Goblin Shaman →
Goblin Elite → Orc. 4 dari 5 sudah pakai real sprite art dari
`public/assets/monsters/` (ditampilkan sebagai token statis, bukan
frame-by-frame animation) — manifest path + frame count ada di
`src/data/monsterSprites.ts`. Slime belum punya art, masih tampil sebagai
emoji:

- Slime (physical resist, selalu tersedia — starter monster gratis)
- Goblin Troop (burst, DEF tipis)
- Goblin Shaman (ranged/caster, chip damage)
- Goblin Elite (armored tank)
- Orc (endgame heavy hitter — HP & ATK terbesar)

**5 Traps**

- Spike · Poison · Net · Fire · Frost

Matrix di `src/data/matchups.ts` kini cuma lapisan flavor sekunder (advantage ~×1.12, disadvantage ~×0.9, plus special: net-blocks-rage, frost DEF, elemental/nature affinity, magic bonus, dll.) — counterplay utama datang dari mekanik hero generik di atas, bukan dari multiplier ini. Tidak ada yang menumpuk sampai broken.

### Room-by-room progression

Raid bukan scroll sideways terus-menerus:

**Entrance → Room 1 → … → Room N → Throne**

Tiap ruang: pintu tertutup → buka → hero masuk → combat/trap → resolve → pintu berikutnya.
UI battle (`battle-active`) memperbesar chamber dan menyembunyikan chrome manajemen; setelah raid UI kembali normal.

### Stage & Arcade

- **Stage 1–50** — 50 puzzle yang di-hardcode satu per satu (`src/data/stages.ts`), bukan kurva stat. Lihat [Stage 1–50: puzzle & unlock progression](#stage-1-50-puzzle--unlock-progression) di bawah.
- **Arcade** — mode terpisah, wave naik tanpa batas dengan scaling stat ringan, best wave tersimpan. Roster hero-nya tetap acak dari seluruh kelas yang sudah di-unlock — tidak memakai desain puzzle per-stage.
- First-clear bonus di Stage.

### King

Level King, upgrade, duel di ruang terakhir (Throne). King ikut bertarung sebagai boss dungeon.

### UI

- Satu layar (mobile-first), tanpa scroll utama.
- Overlay: Armory, Upgrades, Stats, **Settings** (swipe / keyboard) — Settings menggantikan tombol Reset langsung di bottom nav; Reset Game sekarang ada di dalam Settings → Danger Zone.
- Panel `#room-preview` gabungan (Enemy Detected pre-raid, battle card saat combat) — lihat [Battle UX: panel gabungan & reaksi kontekstual](#battle-ux-panel-gabungan--reaksi-kontekstual) di bawah.
- Bottom nav (Armory/Upgrade/Settings) dan tombol Raid pakai real sprite icon (crop dari `public/assets/ui/Icons.png`, lihat `app/assetVars.ts`), bukan emoji lagi. King avatar, nav Battle, dan nav Stats masih emoji — belum ada asset yang cocok di UI pack.
- Offline summary saat kembali ke game.

---

## Battle UX: panel gabungan & reaksi kontekstual

Dulu ada dua elemen terpisah — `#hero-card` (status hero selama combat) dan `#room-preview` (preview komposisi dungeon sebelum PLAY, dengan hero cuma diketahui random saat raid mulai). Keduanya sekarang **digabung jadi satu panel** (`src/ui/roomPreview.ts` + `src/ui/battleReaction.ts`), dan hero yang akan menyerang sekarang **sudah ditentukan dan ditampilkan sebelum PLAY**, bukan lagi cuma di-reveal begitu raid dimulai:

- **`ensurePendingHero()` / `takePendingHero()`** (`src/combat/hero.ts`) — begitu panel di-render (idle, belum raid), sebuah hero "pending" di-roll sekali dan disimpan di `runtime.pendingHero` (`RuntimeState`, `src/types.ts`). Panel Enemy Detected menampilkan hero *itu juga*, bukan preview generik — jadi hero yang kamu lihat sebelum PLAY adalah hero yang benar-benar akan menyerang. `takePendingHero()` dipanggil sekali saat raid benar-benar dimulai (`combat/raid.ts`) untuk "mengambil" hero yang sama, lalu slot pending dikosongkan lagi untuk raid berikutnya.
- Pending hero di-reset (`clearPendingHero()`) saat ganti mode Stage/Arcade atau saat Reset Game, supaya tidak ada hero pending yang salah konteks nyangkut ke mode lain.

Panel berganti mode lewat class modifier di elemen yang sama:

| Mode | Kapan | Isi |
|---|---|---|
| `.room-preview--intro` | Idle (sebelum PLAY) **dan** saat entrance-beat awal raid | **Enemy Detected**: nama, class, level, HP/ATK/DEF, strengths, weaknesses, trait/ability (Fear Immune, RAGE, Evasion, Magic ATK, Damage Reduction, Regen, Burst Opener, Terrain Ramp), plus hint matchup ringkas per ruang (`R1`, `R2`, dst.) berdasarkan isi dungeon saat ini vs hero yang sudah diketahui |
| `.room-preview--battle` | Sejak hero masuk Ruang 1 sampai raid selesai | Kartu compact: icon, nama, HP bar, dan **reaksi kontekstual** — **tidak ada** teks strengths/weaknesses lagi |

**Kenapa dipisah begini:** strengths/weaknesses/traits/matchup-hint (jawaban puzzle-nya) selalu terlihat sebelum & saat entrance — sengaja, supaya player bisa menyusun ulang layout sebelum PLAY. Begitu combat benar-benar berjalan (Ruang 1+), panel beralih total ke reaksi — supaya combat tetap "readable" tanpa mengulang-ulang jawaban puzzle di tengah pertarungan (`ReactionKind` di `src/types.ts`):

- **PANIK** — HP hero ≤35% (kecuali sedang RAGE).
- **RAGE** — Berserker memicu RAGE-nya.
- **KABUR** — hero mundur karena gap level terlalu jauh.
- **TAKUT** — dipicu monster dengan `fearAura` terhadap hero non-fear-immune. Mekanisme masih ada di kode (`src/combat/monsterEncounter.ts`), tapi tidak ada monster di roster saat ini yang memakainya (lihat `src/data/monsters.ts`) — siap dipakai kalau monster fear-aura ditambahkan lagi.
- **SAKIT!** — hero baru kena hit (trap, monster, atau King) yang tidak memicu reaksi lain.
- **TERKEJUT** — ancaman ruang baru saja terungkap (trap berkilau, bayangan monster bergerak, Raja bangkit dari singgasana).

(Label reaksi ini masih dalam Bahasa Indonesia — belum ikut ke-i18n saat UI lain dipindah ke English.)

Setelah raid selesai, panel otomatis kembali ke mode Enemy Detected lewat `renderRoomPreview()`, sekaligus me-roll pending hero berikutnya.

### Room/chamber: sidescroll, tanpa raid log

Raid log (narasi teks per-beat) sudah **dihapus total**. Kombat sekarang murni visual: hero/monster token, HP bar di battle card (`#room-preview`), dan reaksi kontekstual (PANIK/RAGE/dll., lihat bagian di atas) — tidak ada lagi feed teks.

Battlefield-nya adalah panggung sidescroll DOM sederhana, bukan grid isometrik:

- `src/animation/laneLayout.ts` mendefinisikan posisi tetap dalam persen dari `.room-floor`: `ENTRANCE_X` (kiri, tempat hero masuk), `ENCOUNTER_X` (tengah, tempat hero vs monster bertemu), `EXIT_X` (kanan, tempat hero keluar / monster muncul), `FLOOR_Y` (garis tanah). Tidak ada tile grid — hero-token dan monster-token cukup di-`left`/`top` lewat CSS transition antar tiga titik ini.
- `src/animation/heroToken.ts` dan `src/animation/monsterToken.ts` masing-masing mengontrol elemen `#hero-token`/`#monster-token` sendiri (posisi, visual state, dan untuk monster: swap ke sprite art asli via `background-image` kalau tersedia di `MONSTER_SPRITE_MANIFEST`, fallback ke emoji kalau tidak).
- `src/animation/roomStage.ts` yang mengorkestrasi tampilan tiap ruang (buka pintu, present room/throne, pindah mode battle-active) lewat elemen `#room-stage`/`#room-door`/`#room-chamber`/`#room-content`.
- Styling ada di `app/styles/sidescroll.css` + `app/styles/battle.css`.

---

## Stage 1–50: puzzle & unlock progression

Stage 1–50 tidak lagi berupa kurva stat (`data/stages.ts` menggantikan sistem lama di mana `trapMult`/`monsterHpMult`/`monsterAtkMult`/`kingMult`/`heroLevelBonus` naik terus seiring stage). Sekarang **setiap stage men-hardcode kelas hero mana saja yang bisa menyerang** (`heroPool`) — kesulitan datang dari *interaksi* (matchup, combo trap→monster, urutan ruang, timing DOT/fear), bukan dari HP/ATK/DEF yang membesar. Base stat trap & monster (`data/traps.ts`, `data/monsters.ts`) sama persis di Stage 1 maupun Stage 50; yang berubah cuma reward gold/soul (pacing ekonomi, bukan combat power).

**Jaminan desain:** setiap stage hanya pernah mengirim hero yang *bisa* dikalahkan dengan trap/monster yang sudah ter-unlock di stage itu. Item baru selalu terbuka **sebelum** stage yang membutuhkannya, tidak pernah sesudah.

### Tutorial (Stage 1–5)

Hanya toolkit awal — **Spike Trap + Slime** (Slime selalu ter-unlock, gratis) — dan hero yang menyerang dibatasi ke kelas yang memang rentan terhadap keduanya:

- **Elementalist** — opener-nya lemah (belum sempat ramp), jadi Spike Trap yang instan langsung menjatuhkannya.
- **Berserker** — matchup terburuknya justru chip damage konsisten seperti Slime, karena RAGE-nya butuh HP turun cukup dalam dulu.

Paladin/Trickster/Assassin/Druid **tidak pernah muncul** di stage 1–5 — mekanik mereka (mitigasi, evasion, burst, regen) butuh unlock lain dulu supaya tutorial tetap winnable.

- Stage 1 — hanya Elementalist.
- Stage 2 — hanya Berserker.
- Stage 3 — Elementalist + Berserker bergantian. **Clear → buka Poison Trap + Goblin Troop.**
- Stage 4 — sama, tapi kombinasikan urutan ruang Spike vs Slime.
- Stage 5 — ujian akhir tutorial. **Clear → buka Ruang ke-4.**

### Jadwal unlock progresif

| Stage | Unlock | Kenapa di sini |
|---|---|---|
| 3 | Poison Trap + Goblin Troop | Poison adalah DOT yang menembus mitigasi Paladin & menembus evasion Trickster begitu sekali kena |
| 5 | Ruang ke-4 | Penutup tutorial, dungeon mulai lebih lega |
| 9 | Net Trap | Menjerat kelas evasive (Trickster) dan menunda RAGE Berserker |
| 12 | Fire Trap | DOT bakar susulan — jawaban untuk hero yang bertahan lama |
| 14 | Goblin Shaman | Ranged caster chip — efektif menembus mitigasi tetap Paladin secara perlahan |
| 17 | Frost Trap | Mengurangi DEF hero — combo starter untuk ruang monster sesudahnya |
| 21 | Goblin Elite | Armored tank yang membatalkan opening burst Assassin |
| 26 | Orc | Endgame heavy hitter — mengancam kelas rapuh (Assassin, Elementalist) sebelum mereka sempat berkontribusi |
| 32 | Ruang ke-5 | Perluasan dungeon terakhir, membuka layout 5-ruang penuh |

Setiap stage unlock di atas hanya membuka **kesempatan membeli** item itu di panel Upgrades (masih perlu Gold/Souls seperti biasa) — item baru disembunyikan total dari panel sampai stage-nya tercapai, supaya tidak ada janji counter yang belum bisa ditebus.

### Roster hero: dari 2 kelas ke 6 kelas

- **Stage 1–5** — Elementalist, Berserker saja (lihat Tutorial di atas).
- **Stage 6–7** — Paladin masuk.
- **Stage 8** — Trickster masuk (Net Trap baru terbuka sebagai penawarnya).
- **Stage 9** — Assassin masuk.
- **Stage 10–34** — Druid melengkapi roster → **6 kelas penuh** mulai stage 10, dan tetap penuh untuk sisa game.
- **Stage 35–40** — enam "gauntlet" single-class berturut-turut (Paladin → Berserker → Trickster → Assassin → Druid → Elementalist), masing-masing menguji counter mekanik spesifik kelas itu satu per satu.
- **Stage 41–50** — roster campuran lagi; kesulitan sepenuhnya dari komposisi/urutan/combo ruang (Frost→Fire, Net→Goblin Elite, Poison→Orc, dll.), bukan hero baru atau stat baru.

Detail lengkap 50 stage (`heroPool` + catatan desain per stage) ada di `src/data/stages.ts`.

---

## Stack & arsitektur

```
app/
  layout.tsx         # fonts + global CSS
  page.tsx           # dynamic GameApp (ssr: false)
  GameApp.tsx        # shell JSX + startGame()
  assetVars.ts       # asset-path helpers + CSS custom properties (basePath-aware)
  styles/            # tokens, layout, components, raid, battle, preview, sidescroll, ui-skin
game-client.ts       # bootstrap client
src/
  types.ts           # shared type definitions (GameState, Hero, data model, dll.)
  data/              # heroes, monsters, traps, matchups, difficulty, king, stages, monsterSprites, …
  state/             # gameState, runtimeState
  economy/           # unlock, level cost, rewards
  combat/            # hero, difficultyResolver, dan raid flow: raid.ts (orchestrator) +
                      # trapEncounter/monsterEncounter/treasureEncounter/kingFight (per-encounter
                      # resolvers) + raidRewards (tally akhir)
  animation/         # roomStage, heroToken, monsterToken, laneLayout, beatTiming
  ui/                # overlays, palette, roomPreview, battleReaction, hud, …
  core/              # reset, offline, event wiring
```

Prinsip: **migrate, don’t rewrite**. Logic game tetap DOM/vanilla; React hanya shell template sekali render. Tidak ada komentar kode di seluruh repo — nama identifier & struktur file yang menjelaskan diri sendiri, bukan komentar.

```bash
npm install
npm run dev         # http://localhost:3000
npm run type-check  # tsc --noEmit
npm run build && npm start
```

Deploy: GitHub Actions → GitHub Pages dari `main`.

---

## TypeScript

Seluruh codebase (`src/`, `app/`, `game-client.ts`, `next.config.ts`) sudah dimigrasi dari JavaScript ke **TypeScript** (`strict: true`), tanpa mengubah gameplay/behavior — migrasi murni menambahkan tipe di atas logic yang sama persis.

- **`src/types.ts`** — definisi tipe pusat: bentuk data model (`TrapDef`, `MonsterDef`, `HeroArchetype`, dll.), state tersimpan (`GameState`), state sesi (`RuntimeState`), entitas combat (`Hero`), dan hasil formula difficulty (`RaidDifficulty`). Modul lain meng-import tipe dari sini alih-alih saling menurunkan bentuk data satu sama lain.
- Prioritas pengetikan mengikuti urutan: **data model → state → game logic (economy/combat) → utility (animation) → UI**, karena UI paling banyak bergantung pada bentuk data yang sudah stabil dari layer di bawahnya.
- **Tanpa `any`/`@ts-ignore`/`as any`** di seluruh kode aplikasi — satu-satunya cast eksplisit adalah pada `catalogFor()` di `combat/raid.ts` (narrowing `TrapDef | MonsterDef | TreasureDef` ke variant yang sesuai `slot.kind`, yang tidak bisa disimpulkan otomatis oleh TypeScript dari relasi antar dua parameter runtime yang terpisah).
- Import relatif antar-modul TypeScript ditulis **tanpa ekstensi file** (mis. `from '../state/gameState'`, bukan `.js`) — konvensi ini dibutuhkan Turbopack (bundler Next.js) untuk me-resolve modul `.ts`/`.tsx` lewat dynamic maupun static import.
- `next-env.d.ts` di-generate otomatis oleh Next.js (`next build`/`next dev`) — jangan diedit manual. `tsconfig.json` di-commit seperti biasa, dengan `strict: true` diaktifkan manual.
- `npm run type-check` menjalankan `tsc --noEmit` secara terpisah dari build untuk validasi cepat tanpa menghasilkan output.

---

## Yang sengaja belum ada

- Sprite / kamera 2.5D penuh
- Path dungeon bercabang
- Hero rekuren (memory arc)
- Elite/King raid server-wide
- Leaderboard & sosial
- Kombinasi trap lanjutan (oil + fire, dll.)

Kandidat fase berikutnya **setelah** core loop terbukti fun di playtest orang lain.

---

## Validasi prototype

1. Apakah fase tonton (door → fight → reaksi kontekstual) ingin diulang, atau langsung di-skip?
2. Apakah matchup (advantage/disadvantage, hint di panel Enemy Detected) terbaca dan memengaruhi keputusan layout?
3. Apakah Stage vs Arcade terasa beda dan natural?

Catat observasi playtest — itu yang menentukan lanjut tidaknya ke fase berikutnya.

---

## License / credit

Proyek personal / experiment. Kontribusi & feedback welcome via Issues.
