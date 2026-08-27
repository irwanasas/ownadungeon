# Idle Dungeon Management — MVP

Prototype web-based untuk memvalidasi pertanyaan inti:

> Apakah genuinely satisfying mendesain dungeon, menekan Start, dan menonton hero mencoba menaklukkannya?

Vanilla HTML/CSS/JS, tanpa build step — langsung bisa di-deploy ke GitHub Pages.

## Cara Deploy ke GitHub Pages

1. Buat repo baru di GitHub (public), misal `idle-dungeon-mvp`.
2. Push semua file di folder ini ke branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial MVP"
   git branch -M main
   git remote add origin https://github.com/USERNAME/idle-dungeon-mvp.git
   git push -u origin main
   ```
3. Di repo GitHub: **Settings → Pages → Source → Deploy from branch → main → / (root)**.
4. Tunggu 1-2 menit, game akan live di `https://USERNAME.github.io/idle-dungeon-mvp/`.

Tidak perlu `npm install`, tidak ada dependency eksternal selain Google Fonts (dimuat via CDN link di `index.html`).

## Cara Coba Lokal

Cukup buka `index.html` langsung di browser, atau jalankan local server sederhana:
```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur File

```
index.html     -> struktur halaman
style.css      -> tema visual (dark fantasy, ember/poison/soul accent)
game.js        -> semua logic game (state, build, raid sim, upgrade, idle)
```

## Apa yang Ada di MVP Ini

Sesuai `Idle_Dungeon_Management_MVP_Scope.md`:

- **Build**: 3 trap (Spike, Poison, Net), 3 monster (Skeleton Archer, Goblin Brute, Bone Ogre), 1 Treasure slot. Layout linear, 3 slot awal, bisa digali sampai 5.
- **Raid**: stage-based — susun dungeon, klik "Mulai Raid", tonton simulasi. Tidak ada input real-time dari player selama raid berjalan.
- **Hero**: 3 archetype (Warrior, Rogue, Berserker), dipilih random tiap raid, level menyesuaikan rata-rata level item dungeon-mu.
- **Reaction system (dibatasi ke 3 trigger sesuai scope MVP):**
  1. **Level gap** → hero non-Berserker bisa memilih kabur kalau monster jauh lebih kuat.
  2. **HP threshold** (≤30%) → hero panik (indikator visual).
  3. **Class flag (Berserker)** → fear-immune, dan saat HP kritis memicu momen spotlight "RAGE" (ATK naik, sedikit heal, teriakan).
- **Reward & Upgrade**: ekonomi Gold + Souls, upgrade level trap/monster, unlock item baru & slot tambahan.
- **Idle layer**: kalau kamu tutup lalu buka lagi setelah beberapa waktu, ada simulasi offline yang disederhanakan (bukan replay penuh) dan ringkasan hasil raid selama kamu pergi.

## Yang SENGAJA Belum Ada (di luar scope MVP)

- Elite Raid & King Raid (server-wide, terjadwal) — direncanakan Fase 3, butuh infrastruktur backend.
- Dungeon graph/branching path — masih linear.
- Persistent hero memory / recurring hero stories (arc "Sir William").
- Leaderboard, monetisasi, fitur sosial.

Lihat dokumen scope untuk roadmap lengkap Fase 2 & Fase 3.

## Data & Persistence

State disimpan di `localStorage` browser (per-device, per-browser). Tidak ada backend/server — murni client-side, cocok untuk fase validasi MVP.

## Pertanyaan yang Coba Dijawab Prototype Ini

1. Apakah watch phase-nya menarik ditonton berulang, atau langsung ingin di-skip?
2. Apakah 3 reaction trigger ini sudah cukup membuat raid terasa "readable" (paham kenapa menang/kalah)?
3. Apakah pemisahan idle (pasif) vs stage-based (aktif) terasa natural?

Catat observasimu sendiri saat playtest — itu yang menentukan apakah lanjut ke Fase 2.
