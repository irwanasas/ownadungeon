# Own a Dungeon

Idle dungeon management — desain perangkap & monster, tekan **Raid**, lalu tonton hero mencoba menaklukkannya.

**Prototype web** untuk menguji apakah loop “susun → tonton → upgrade” terasa memuaskan.

- **Stack:** Next.js App Router (JavaScript), CSS modular, game logic vanilla di `src/`
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

Matrix di `src/data/matchups.js` (advantage ~×1.25, disadvantage ~×0.8, plus special: net-blocks-rage, frost DEF, holy/magic bonus, dll.). Tidak ada multiplier yang menumpuk sampai broken.

### Room-by-room progression

Raid bukan scroll sideways terus-menerus:

**Entrance → Room 1 → … → Room N → Throne**

Tiap ruang: pintu tertutup → buka → hero masuk → combat/trap → resolve → pintu berikutnya.
UI battle (`battle-active`) memperbesar chamber dan menyembunyikan chrome manajemen; setelah raid UI kembali normal.

### Stage & Arcade

- **Stage 1–50** — scaling lembut; kesulitan lebih dari komposisi encounter daripada inflasi stat.
- **Arcade** — wave naik, best wave tersimpan.
- First-clear bonus di Stage.

### King

Level King, upgrade, duel di ruang terakhir (Throne). King ikut bertarung sebagai boss dungeon.

### UI

- Satu layar (mobile-first), tanpa scroll utama.
- Overlay: Gudang, Upgrade, Stats (swipe / keyboard).
- Encounter Preview sebelum PLAY.
- Hero card + log naratif (hybrid cerita + angka, pacing ber-jitter).
- Offline summary saat kembali ke game.

---

## Stack & arsitektur

```
app/
  layout.js          # fonts + global CSS
  page.js            # dynamic GameApp (ssr: false)
  GameApp.js         # shell JSX + startGame()
  styles/            # tokens, layout, components, raid, battle, preview
game-client.js       # bootstrap client
src/
  data/              # heroes, monsters, traps, matchups, difficulty, king, …
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
npm run dev      # http://localhost:3000
npm run build && npm start
```

Deploy: GitHub Actions → GitHub Pages dari `main`.

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
