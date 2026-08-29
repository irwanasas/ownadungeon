# Own a Dungeon

Idle dungeon management — desain perangkap & monster, tekan **Raid**, lalu tonton hero mencoba menaklukkannya.

**Prototype web** untuk menguji apakah loop “susun → tonton → upgrade” terasa memuaskan.

- **Stack:** Next.js App Router (TypeScript), CSS modular, game logic vanilla di `src/`
- **Live:** https://irwanasas.github.io/ownadungeon/
- **Persistensi:** `localStorage` (client-side only)

---

## Cara main

1. Buka **Gudang** → pasang trap / monster ke slot ruangan.
2. Lihat **Encounter Preview** (isi tiap room + Throne).
3. Tekan **Raid** (tombol ▶).
4. Hero random masuk **pintu per ruang**: pintu buka → enter → encounter → resolve → next → **Throne / King**.
5. Gold & Souls → **Upgrade** level item, unlock konten baru, naikkan King.

Mode: **Stage** (1–50) atau **Arcade** (wave tak terbatas).

---

## Fitur utama

### Dungeon puzzle (matchup)

Bukan sekadar HP/ATK lebih besar. Tiap room adalah puzzle **Hero × Monster × Trap**.

**5 Hero Classes**

| Class | Role | Kekuatan | Kelemahan |
|-------|------|----------|-----------|
| Warrior | Frontline | Tahan spike, solid vs brute | Racun, ethereal |
| Rogue | Skirmisher | Evasion trap, kuat vs Archer | DEF tinggi, Net |
| Berserker | Brawler | Fear-immune, RAGE | Net menunda RAGE, DOT |
| Mage | Caster | Magic (partial DEF ignore), vs Slime/Shade | HP tipis, Spike/Brute |
| Paladin | Support-tank | Holy vs undead/shade, tahan fear | Poison, tempo lambat |

**5 Monster Types**

- Skeleton Archer (ranged undead)
- Goblin Brute (burst)
- Bone Ogre (tank undead)
- Acid Slime (physical resist)
- Shadow Wraith (fear aura, ethereal)

**5 Traps**

- Spike · Poison · Net · Fire · Frost

Matrix di `src/data/matchups.ts` (advantage ~×1.25, disadvantage ~×0.8, plus special: net-blocks-rage, frost DEF, holy/magic bonus, dll.). Tidak ada multiplier yang menumpuk sampai broken.

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
- Overlay: Gudang, Upgrade, Stats (swipe / keyboard).
- Panel `#room-preview` gabungan (encounter preview, intro hero, battle card) — lihat [Battle UX: panel gabungan & reaksi kontekstual](#battle-ux-panel-gabungan--reaksi-kontekstual) di bawah.
- Log naratif (hybrid cerita + angka, pacing ber-jitter) — selalu terlihat penuh selama raid, tidak pernah tertutup/terpotong UI lain.
- Offline summary saat kembali ke game.

---

## Battle UX: panel gabungan & reaksi kontekstual

Dulu ada dua elemen terpisah — `#hero-card` (status hero selama combat) dan `#room-preview` (preview dungeon sebelum PLAY). Keduanya sekarang **digabung jadi satu panel** (`src/ui/roomPreview.ts`), yang berganti mode lewat class modifier di elemen yang sama:

| Mode | Kapan | Isi |
|---|---|---|
| *(default)* | Sebelum raid / sedang menyusun dungeon | Encounter Preview — komposisi tiap ruang, matchup jika ada preview-hero dipilih |
| `.room-preview--intro` | Hero sudah diketahui, sebelum masuk Ruang 1 | **Musuh Terdeteksi**: nama, class, level, HP/ATK/DEF, strengths, weaknesses, dan trait/ability (Fear-immune, Bisa RAGE, Evasion trap %, Magic ATK, Holy) |
| `.room-preview--battle` | Sejak hero masuk Ruang 1 sampai raid selesai | Kartu compact: icon, nama, HP bar, dan **reaksi kontekstual** — **tidak ada** teks strengths/weaknesses lagi |

**Kenapa dipisah begini:** strengths/weaknesses/traits (jawaban puzzle-nya) cuma muncul sekali, di fase intro, sebelum combat dimulai. Begitu combat berjalan, panel beralih total ke reaksi — supaya combat tetap "readable" tanpa mengulang-ulang jawaban puzzle di tengah pertarungan (`ReactionKind` di `src/types.ts`):

- **PANIK** — HP hero ≤35% (kecuali sedang RAGE).
- **RAGE** — Berserker memicu RAGE-nya.
- **KABUR** — hero mundur karena gap level terlalu jauh.
- **TAKUT** — aura takut Shadow Wraith berhasil menggoyahkan hero non-fear-immune.
- **SAKIT!** — hero baru kena hit (trap, monster, atau King) yang tidak memicu reaksi lain.
- **TERKEJUT** — ancaman ruang baru saja terungkap (trap berkilau, bayangan monster bergerak, Raja bangkit dari singgasana).

Setelah raid selesai, panel otomatis kembali ke mode Encounter Preview lewat `renderRoomPreview()`.

### Raid log: selalu terlihat, tidak pernah ketutup

Layout `.raid-stage` selama battle sekarang cuma berisi `#raid-log` (dulu berbagi ruang dengan `#hero-card`). Prioritas ruang vertikal saat raid berlangsung (`app/styles/battle.css`):

1. `#room-preview` (battle card) — ukuran tetap, kecil, tidak pernah menyusut.
2. `.raid-stage` / `#raid-log` — **punya `min-height` sebagai lantai keras** (140px normal, turun bertahap ke 100px di viewport pendek), dijamin selalu dapat ruang.
3. `.dungeon-runway` (room chamber) — satu-satunya elemen yang boleh menyusut duluan lewat `flex-shrink` saat viewport sempit.

Karena `min-height` di flexbox tidak bisa dilanggar oleh `flex-shrink`, log dijamin tidak pernah terpotong — yang mengalah adalah chamber ruang di atasnya. Ditambah breakpoint `@media (max-height: 640px)` dan `(max-height: 520px)` untuk viewport pendek (mis. landscape phone), serta `position: relative; z-index: 1` di `.raid-log` supaya tidak ada elemen lain yang bisa menimpanya.

---

## Stage 1–50: puzzle & unlock progression

Stage 1–50 tidak lagi berupa kurva stat (`data/stages.ts` menggantikan sistem lama di mana `trapMult`/`monsterHpMult`/`monsterAtkMult`/`kingMult`/`heroLevelBonus` naik terus seiring stage). Sekarang **setiap stage men-hardcode kelas hero mana saja yang bisa menyerang** (`heroPool`) — kesulitan datang dari *interaksi* (matchup, combo trap→monster, urutan ruang, timing DOT/fear), bukan dari HP/ATK/DEF yang membesar. Base stat trap & monster (`data/traps.ts`, `data/monsters.ts`) sama persis di Stage 1 maupun Stage 50; yang berubah cuma reward gold/soul (pacing ekonomi, bukan combat power).

**Jaminan desain:** setiap stage hanya pernah mengirim hero yang *bisa* dikalahkan dengan trap/monster yang sudah ter-unlock di stage itu. Item baru selalu terbuka **sebelum** stage yang membutuhkannya, tidak pernah sesudah.

### Tutorial (Stage 1–5)

Hanya toolkit awal — **Spike Trap + Skeleton Archer** — dan hero yang menyerang dibatasi ke kelas yang memang rentan terhadap keduanya:

- **Mage** — sangat rentan Spike Trap (×1.30) dan lemah lawan apa pun yang mengandalkan trap fisik instan.
- **Berserker** — matchup terburuknya justru chip damage konsisten seperti Skeleton Archer (×1.05, angka terendah di seluruh tabel monster).

Warrior/Rogue/Paladin **tidak pernah muncul** di stage 1–5 — ketiganya terlalu tahan terhadap Spike+Skeleton sehingga tutorial jadi mustahil dimenangkan tanpa unlock lain.

- Stage 1 — hanya Mage.
- Stage 2 — hanya Berserker.
- Stage 3 — Mage + Berserker bergantian. **Clear → buka Poison Trap + Goblin Brute.**
- Stage 4 — sama, tapi kombinasikan urutan ruang Spike vs Skeleton.
- Stage 5 — ujian akhir tutorial. **Clear → buka Ruang ke-4.**

### Jadwal unlock progresif

| Stage | Unlock | Kenapa di sini |
|---|---|---|
| 3 | Poison Trap + Goblin Brute | Poison adalah satu-satunya penawar Warrior (×1.28) & Paladin (×1.22); Goblin Brute matchup terburuk Mage (×0.8) |
| 5 | Ruang ke-4 | Penutup tutorial, dungeon mulai lebih lega |
| 8 | Net Trap | Dibuat khusus menjerat Rogue (×1.22), kelas paling evasive terhadap trap fisik lain |
| 12 | Fire Trap | DOT bakar susulan — jawaban untuk hero yang bertahan lama |
| 14 | Acid Slime | Dinding physical-resist untuk meredam hero non-magic |
| 17 | Frost Trap | Mengurangi DEF hero — combo starter untuk ruang monster sesudahnya |
| 21 | Bone Ogre | Tank yang jadi matchup terburuk Rogue (×0.8), pelengkap Net Trap |
| 26 | Shadow Wraith | Aura takut — efektif ke semua kelas kecuali Berserker & Paladin (fear-immune) |
| 32 | Ruang ke-5 | Perluasan dungeon terakhir, membuka layout 5-ruang penuh |

Setiap stage unlock (3, 8, 12, 14, 17, 21, 26, 32) hanya membuka **kesempatan membeli** item itu di panel Peningkatan (masih perlu Gold/Souls seperti biasa) — item baru disembunyikan total dari panel sampai stage-nya tercapai, supaya tidak ada janji counter yang belum bisa ditebus.

### Roster hero: dari 2 kelas ke 5 kelas

- **Stage 1–5** — Mage, Berserker saja (lihat Tutorial di atas).
- **Stage 6** — Warrior masuk, dibarengi Poison Trap yang baru terbuka sebagai penawarnya.
- **Stage 8** — Paladin masuk (poison-vulnerable juga, ×1.22).
- **Stage 9–34** — Rogue melengkapi roster (Net Trap baru terbuka sebagai penawar) → **5 kelas penuh** mulai stage 9, dan tetap penuh untuk sisa game.
- **Stage 35–39** — lima "gauntlet" single-class berturut-turut (Berserker → Mage → Rogue → Warrior → Paladin), masing-masing menguji counter spesifik kelas itu satu per satu.
- **Stage 40–50** — roster campuran lagi; kesulitan sepenuhnya dari komposisi/urutan/combo ruang (Frost→Fire, Net→Ogre, Poison→Shadow Wraith, dll.), bukan hero baru atau stat baru.

Detail lengkap 50 stage (`heroPool` + catatan desain per stage) ada di `src/data/stages.ts`.

---

## Stack & arsitektur

```
app/
  layout.tsx         # fonts + global CSS
  page.tsx           # dynamic GameApp (ssr: false)
  GameApp.tsx         # shell JSX + startGame()
  styles/            # tokens, layout, components, raid, battle, preview
game-client.ts       # bootstrap client
src/
  types.ts           # shared type definitions (GameState, Hero, data model, dll.)
  data/              # heroes, monsters, traps, matchups, difficulty, king, stages, …
  state/             # gameState, runtimeState
  economy/           # unlock, level cost, rewards
  combat/            # hero, raid, difficultyResolver
  animation/         # roomStage, heroToken, beatTiming
  ui/                # overlays, palette, roomPreview, hud, …
  core/              # reset, offline, event wiring
```

Prinsip: **migrate, don’t rewrite**. Logic game tetap DOM/vanilla; React hanya shell template sekali render.

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
- `tsconfig.json` dan `next-env.d.ts` di-generate otomatis oleh Next.js (`next build`) mengikuti konvensi App Router, dengan `strict: true` diaktifkan manual.
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

1. Apakah fase tonton (door → fight → log) ingin diulang, atau langsung di-skip?
2. Apakah matchup (advantage/disadvantage di log) terbaca dan memengaruhi keputusan layout?
3. Apakah Stage vs Arcade terasa beda dan natural?

Catat observasi playtest — itu yang menentukan lanjut tidaknya ke fase berikutnya.

---

## License / credit

Proyek personal / experiment. Kontribusi & feedback welcome via Issues.
