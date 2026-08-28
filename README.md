# MVP - Own a Dungeon ## Idle Dungeon Management Game

Prototype web-based untuk memvalidasi pertanyaan inti:

> Apakah genuinely satisfying mendesain dungeon, menekan Start, dan menonton hero mencoba menaklukkannya?

Vanilla HTML/CSS/JS, tanpa build step — live di GitHub Pages.

**Live:** https://irwanasas.github.io/ownadungeon/

## Struktur File

`index.html` memuat satu entry point saja: `<script type="module" src="game.js">`. `game.js` di root hanyalah orchestrator (boot sequence + top-level event wiring) — semua logic ada di `src/`, di-import lewat ES modules (jadi urutan load tidak lagi jadi masalah manual seperti dulu; dependency dinyatakan eksplisit lewat `import`).

```
game.js                         -> Entry point/orchestrator: init(), DOMContentLoaded wiring

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
css/tokens.css       -> variabel warna, base style, keyframes
css/layout.css       -> app shell, topbar, dungeon slots, stage
css/components.css   -> overlay, palette, toast, modal
css/raid.css         -> hero card, reaction visual, runway/token
```

Kalau menambah module baru: taruh di folder `src/` yang sesuai domainnya, lalu `import` eksplisit dari module yang membutuhkannya — tidak ada lagi ketergantungan pada urutan `<script>` tag.

## Cara Coba Lokal

`game.js` di-load sebagai ES module (`<script type="module">`), jadi **harus** lewat local server — membuka `index.html` langsung lewat `file://` akan diblokir browser (CORS pada module import). Jalankan local server sederhana:
```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```
GitHub Pages (deployment live) sudah otomatis serve lewat https, jadi tidak terpengaruh.

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
