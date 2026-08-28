# MVP - Own a Dungeon ## Idle Dungeon Management Game

Prototype web-based untuk memvalidasi pertanyaan inti:

> Apakah genuinely satisfying mendesain dungeon, menekan Start, dan menonton hero mencoba menaklukkannya?

Next.js (App Router, JavaScript — bukan TypeScript). Sebelumnya vanilla HTML/CSS/JS; sudah dimigrasi ke Next.js, lihat [Migrasi ke Next.js](#migrasi-ke-nextjs) di bawah.

**Live:** https://irwanasas.github.io/ownadungeon/ (auto-deploy dari `main` via GitHub Actions — lihat catatan deployment di bawah)

## Migrasi ke Next.js

Repo ini awalnya vanilla HTML/CSS/JS (tanpa build step, di-serve langsung dari `index.html` via GitHub Pages). Sekarang sudah dimigrasi ke **Next.js App Router + React, JavaScript murni (bukan TypeScript)**. Prinsip migrasinya: **migrate, don't rewrite** — game logic (state, ekonomi, raid simulation) di `src/` dipindah nyaris tanpa perubahan, dan tetap memanipulasi DOM secara langsung (`document.getElementById`, `innerHTML`, dst.) seperti sebelumnya — **bukan** dikonversi jadi `useState`/React state. React di sini cuma dipakai sebagai templating layer sekali render untuk shell HTML statis; semua update dinamis setelahnya tetap jalan lewat kode vanilla yang sama persis.

```
app/layout.js     -> Root layout: <html>/<body>, metadata, viewport, font Google Fonts, import CSS global
app/page.js       -> Route tunggal ("/"), render <GameApp/> lewat next/dynamic({ ssr: false })
app/GameApp.js    -> "use client": shell JSX (id/class sama persis dengan index.html lama) + useEffect yang panggil startGame()
app/styles/*.css  -> Isi identik dengan css/*.css lama, di-import sebagai global CSS di layout.js
game-client.js    -> Pengganti game.js lama: expose startGame() (dipanggil dari useEffect, bukan DOMContentLoaded)
```

`GameApp` di-render lewat `next/dynamic(..., { ssr: false })` supaya seluruh `src/` (yang baca `localStorage` dsb.) tidak pernah dieksekusi di server — cocok karena app ini 100% client-side, gak ada data yang perlu di-SSR.

`src/` (data/state/economy/combat/animation/ui/core) **tidak berubah** dari refactor sebelumnya — masih dipakai apa adanya oleh `game-client.js`. Detail struktur `src/` ada di bagian bawah.

**Dihapus setelah migrasi diverifikasi jalan** (dev, build, start, gameplay, save/load, mobile 360–414px, desktop): `index.html`, `game.js` (orchestrator lama, digantikan `game-client.js`), folder `css/` (isinya sudah dipindah ke `app/styles/`), `style.css` (sudah dead code dari sebelum migrasi ini).

**Catatan deployment:** GitHub Pages cuma serve file statis (gak ada Node server), jadi app di-build sebagai **static export** (`output: 'export'` di `next.config.js`) — cocok karena app ini 100% client-side, gak ada data yang perlu di-SSR. Workflow `.github/workflows/deploy-pages.yml` jalan otomatis tiap push ke `main`: `npm ci` → `npm run build` (hasilnya di `out/`) → deploy ke GitHub Pages lewat `actions/deploy-pages`.

Karena ini project page (bukan `<user>.github.io`), site di-serve dari path `/ownadungeon/`, bukan root domain. `next.config.js` otomatis set `basePath`/`assetPrefix` ke `/ownadungeon` **hanya saat build di GitHub Actions** (dideteksi lewat env var `GITHUB_ACTIONS` + `GITHUB_REPOSITORY`) — `npm run dev`/`npm run build` di lokal tetap jalan di root path seperti biasa, jadi Cara Coba Lokal di atas tidak berubah. `public/.nojekyll` juga disertakan supaya GitHub Pages gak coba proses folder `_next/` lewat Jekyll (yang defaultnya skip folder berawalan underscore).

⚠️ **Satu langkah manual yang wajib dilakukan sekali oleh pemilik repo:** buka **Settings → Pages** di GitHub, dan ubah **Source** dari "Deploy from a branch" jadi **"GitHub Actions"**. Tanpa ini, workflow-nya akan gagal di step `actions/deploy-pages` karena Pages belum dikonfigurasi untuk terima deployment dari Actions.

## Struktur File

```
src/data/                       -> Konstanta & formula murni (tidak baca state)
  traps.js, monsters.js           trap & monster & treasure catalog
  catalog.js                      lookup generik across catalog
  heroes.js                       hero archetypes & name pool
  king.js                         king stat scaling & upgrade cost
  difficulty.js                   stage/arcade difficulty formulas
  upgrades.js                     upgrade & unlock definitions
  defaultState.js                 bentuk awal state tersimpan

src/state/                      -> Game state
  gameState.js                    load/save/reset ke localStorage
  runtimeState.js                 state sesi non-persisted (item terpilih, status raid)

src/economy/economy.js          -> Gold/Souls, cost formula, unlock check, king upgrade

src/combat/                     -> Core combat/raid logic
  hero.js                          build hero, panic/rage/flee/death
  difficultyResolver.js            jembatan formula difficulty <-> state saat ini
  raid.js                          simulasi raid penuh (trap/monster/treasure/king)

src/animation/                  -> Pacing & pergerakan token di runway
  beatTiming.js                    STAGE_BEAT, jitter timing tiap beat
  heroToken.js                     posisi & visual token hero

src/ui/                         -> Render & interaksi DOM
  renderBus.js                     titik dekopling untuk trigger re-render penuh
  toast.js, raidLog.js             notifikasi & log naratif
  heroIcon.js, heroCard.js         kartu status hero & flash slot
  palette.js, dungeonSlots.js      panel Gudang & layout dungeon
  upgradesPanel.js, statsPanel.js  panel Peningkatan & Statistik
  hud.js                           currency/mode/status strip + renderAll()
  overlays.js                      buka/tutup side panel, focus trap, swipe
  offlineModal.js                  modal ringkasan progress offline

src/core/                       -> Orkestrasi lintas-domain
  resetGame.js                     reset state + UI ke kondisi awal
  offlineProgress.js               simulasi raid selagi tab ditutup
```

```
app/styles/tokens.css       -> variabel warna, base style, keyframes
app/styles/layout.css       -> app shell, topbar, dungeon slots, stage
app/styles/components.css   -> overlay, palette, toast, modal
app/styles/raid.css         -> hero card, reaction visual, runway/token
```

Kalau menambah module baru: taruh di folder `src/` yang sesuai domainnya, lalu `import` eksplisit dari module yang membutuhkannya.

## Cara Coba Lokal

```bash
npm install
npm run dev
# lalu buka http://localhost:3000
```

Build production:
```bash
npm run build
npm run start
```

## Apa yang Ada di MVP Ini

**Build**
3 trap (Spike, Poison, Net), 3 monster (Skeleton Archer, Goblin Brute, Bone Ogre), 1 Treasure slot. Layout linear, 3 slot awal, bisa digali sampai 5.

**Raid — stage-based**
Susun dungeon lewat overlay Gudang → klik "Mulai Raid" → tonton hero token berjalan dari entrance ke tiap room (enter → arrive → threat → action → resolve → next). Tidak ada input real-time dari player selama raid berjalan.

**UI single-screen**
Semua muat di satu layar tanpa scroll. Panel Gudang, Peningkatan, dan Statistik jadi overlay (bukan panel permanen di samping), lengkap dengan toast notifikasi, swipe-to-close di mobile, dan keyboard/focus trap.

**Hero & Reaction system**
3 archetype (Warrior, Rogue, Berserker), dipilih random tiap raid. Reaction dibatasi ke trigger yang jelas sebabnya, ditampilkan lewat hero card (panic 😰 / rage 🔥 / flee 💨 / dead 💀) dan flash pada slot yang relevan:
1. **Level gap** → flee/fight decision (kecuali Berserker, fear-immune)
2. **HP threshold** → panic state
3. **Class flag (Berserker)** → momen spotlight RAGE (ATK naik, teriakan, sedikit heal)

**Log naratif**
Bukan cuma "−11 HP" — log dibuat hybrid narasi + angka, dengan pacing yang di-jitter (±30%) supaya tidak terasa seperti metronom.

**Reward & Upgrade**
Ekonomi Gold + Souls, upgrade level trap/monster, unlock item baru & slot tambahan.

**Idle layer**
Simulasi offline yang disederhanakan (bukan replay penuh), muncul sebagai ringkasan saat kembali membuka game.

## Yang SENGAJA Belum Ada (di luar scope MVP)

- Elite Raid & King Raid (server-wide, terjadwal) — Fase 3, butuh infrastruktur backend
- Art/sprite penuh atau kamera 2.5D sungguhan — stage saat ini sengaja ringan (token + beat), bukan engine visual berat
- Dungeon graph/branching path — masih linear
- Recurring hero / persistent memory (arc "Sir William balik lagi")
- Interaksi kombinasi (Oil + Fire, Poison amplifier, dst.)
- Leaderboard, monetisasi, fitur sosial

Semua ini kandidat Fase 2/3 — dikerjakan **setelah** core loop terbukti genuinely fun ke orang lain juga, bukan cuma ke pembuatnya.

## Data & Persistence

State disimpan di `localStorage` browser (per-device, per-browser). Tidak ada backend/server — murni client-side.

## Pertanyaan yang Coba Dijawab Prototype Ini

Ini pertanyaan validasi, bukan checklist fitur — jawabannya baru berarti kalau datang dari orang lain, bukan cuma dari pembuatnya:

1. Apakah watch phase-nya menarik ditonton berulang, atau langsung ingin di-skip?
2. Apakah reaction system (flee/panic/rage) bikin raid terasa "readable" — paham kenapa menang/kalah?
3. Apakah pemisahan idle (pasif) vs stage-based (aktif) terasa natural?

Catat observasi dari playtest orang lain — itu yang menentukan apakah lanjut ke Fase 2.
