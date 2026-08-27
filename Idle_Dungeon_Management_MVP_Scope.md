# Idle Dungeon Management — MVP Scope & Roadmap

*Disusun berdasarkan diskusi ideation & stress-test konsep*

---

## Filosofi Scope

Prinsip dari dokumen desain awal tetap berlaku: **jangan mulai dari konten banyak, mulai dari validasi satu pertanyaan inti.**

> Apakah genuinely satisfying mendesain dungeon, menekan START, dan menonton hero mencoba menaklukkannya?

Semua fitur di bawah ini dinilai berdasarkan satu kriteria: **apakah dia dibutuhkan untuk menjawab pertanyaan itu, atau apakah dia menambah nilai setelah jawabannya "ya"?**

---

## MVP — Fase 1 (Wajib divalidasi dulu)

### Core Loop
**BUILD → RAID → WATCH → REWARD → UPGRADE → REBUILD**

Raid bersifat **stage-based**: player susun dungeon, klik Start, raid berjalan, selesai. Tidak ada input real-time dari player selama raid berlangsung — murni observasi.

### Dungeon Building
- 3–5 tipe room
- 3 trap
- 3 monster
- 1 treasure/reward mechanic sederhana
- Layout linear dulu (graph/branching path ditunda ke Fase 2)

### Hero System
- 1 hero archetype dulu (atau maksimal 2 — misal Warrior & Rogue) untuk menguji apakah class-based behavior sudah cukup menarik sebelum menambah variasi
- AI behavior sederhana: pilih jalur berdasarkan preferensi kelas (contoh: Rogue cari shortcut)

### Hero Reaction System (dibatasi, bukan penuh)
Ambil **2–3 trigger paling jelas** saja untuk MVP, sisanya masuk backlog:
1. Level gap (hero vs monster) → keputusan flee/fight
2. HP threshold → panic animation / visual sekarat
3. Satu flag class-based → contoh: Berserker fear-immune + passive aktif saat HP rendah (spotlight moment)

Tujuan: raid #47 tetap menarik ditonton karena momen dramatiknya beda-beda, bukan karena hasilnya beda.

### Idle Layer
- Sistem offline **terpisah** dari raid stage-based: auto-resolve simplifed saat player tidak online
- Player kembali ke ringkasan: "Dungeon-mu diraid X kali saat offline"
- Prioritas: simplicity & predictability, bukan simulasi detail per detik

### Reward & Upgrade
- Ekonomi sederhana: 1–2 currency (misal Gold + 1 currency progresi)
- Upgrade dasar: room, trap, monster level

### Yang SENGAJA tidak masuk MVP
- Elite Raid & King Raid (server-wide, scheduled)
- Branching/graph dungeon layout
- Persistent hero memory & recurring hero stories (Sir William arc)
- Leaderboard & kompetisi
- Monetisasi apapun
- Social/community features (dungeon browser, rating, dsb)

---

## Fase 2 — Setelah Core Loop Terbukti Fun

Baru dikerjakan jika tim sendiri genuinely ingin main ulang MVP tanpa dibayar untuk melakukannya.

- Dungeon graph/branching path
- Tambahan room/trap/monster/hero archetype
- Persistent hero progression (hero belajar dari kekalahan berulang)
- Recurring hero stories & rivalitas
- Interaksi kombinasi lebih kompleks (oil+fire, poison amplifier, dst — daftar penuh)
- Hero reaction triggers tambahan (dari daftar "banyak possibilities" yang ditunda)
- Dungeon theme/kosmetik dasar

---

## Fase 3 — Jangka Panjang / Visi Produk

Butuh infrastruktur server-side signifikan (real-time sync, load balancing, anti-cheat leaderboard). Layak didokumentasikan sekarang sebagai visi, **bukan** bagian dari validasi awal.

### Elite Raid
- Server-wide, jadwal tetap (misal tiap jam)
- Fokus: uji ketahanan (survival)
- Extra loot, extra enemy wave
- Reward eksklusif yang tidak bisa didapat dari stage biasa

### King Raid
- Server-wide, jadwal tetap (misal mingguan — "Sabtu malam jam 12")
- Fokus: uji optimasi
- Progressively stronger per wave → self-balancing, dungeon kecil tetap dapat beberapa wave, dungeon besar bisa push lebih jauh
- Leaderboard: bertahan paling lama, wave terbanyak, dll
- Perlu keputusan desain lanjutan: dungeon state terpisah dari stage biasa vs pakai config yang sama; personal-timer vs server-wide-serentak (server-wide dipilih, tapi ini menaikkan effort infrastruktur signifikan)

### Lainnya
- Social/community: player-created dungeon browser, rating, "most deadly dungeon"
- Monetisasi (premium/F2P) — didesain hanya setelah core game compelling
- Multi-platform/engine evaluation di luar web prototype

---

## Open Questions yang Masih Perlu Dijawab (di prototype, bukan di dokumen)

1. Apakah watch phase-nya genuinely menarik ditonton berulang, atau langsung di-skip setelah beberapa kali?
2. Apakah 2-3 hero reaction trigger MVP sudah cukup untuk membuat raid terasa "readable" (pemain paham kenapa menang/kalah)?
3. Apakah pemisahan idle (pasif, offline) vs stage-based (aktif, online) terasa natural atau malah seperti dua game berbeda yang dipaksa digabung?

---

*Dokumen ini adalah living document — update seiring hasil playtesting prototype MVP.*
