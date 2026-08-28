# MVP - Own a Dungeon (Idle Dungeon Management Game)

Prototype web-based untuk memvalidasi pertanyaan inti:

> Apakah genuinely satisfying mendesain dungeon, menekan Start, dan menonton hero mencoba menaklukkannya?

Vanilla HTML/CSS/JS, tanpa build step — live di GitHub Pages.

**Live:** https://irwanasas.github.io/ownadungeon/

## Struktur File

Proyek ini sudah di-split dari satu file besar jadi beberapa modul agar lebih mudah dikembangkan. **Urutan load di `index.html` penting dan tidak boleh diubah**, karena tiap file bergantung pada konstanta/fungsi dari file sebelumnya:

```
data.js         -> 1. Konstanta: trap, monster, upgrade, default state
characters.js   -> 2. Build hero, logic panic/rage/flee/death
game.js         -> 3. State, ekonomi, raid loop utama
stage.js        -> 4. Posisi token, STAGE_BEAT (pacing), jitter timing
ui.js           -> 5. Render, overlay, toast, log DOM
```

```
css/tokens.css       -> variabel warna, base style, keyframes
css/layout.css       -> app shell, topbar, dungeon slots, stage
css/components.css   -> overlay, palette, toast, modal
css/raid.css         -> hero card, reaction visual, runway/token
```

Kalau menambah script baru: pastikan ditaruh setelah dependency-nya (misal script yang butuh helper dari `characters.js` harus di-load setelahnya).

## Cara Coba Lokal

Buka `index.html` langsung di browser, atau jalankan local server sederhana:
```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
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
