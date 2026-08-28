'use client';

import { useEffect } from 'react';

export default function GameApp() {
  useEffect(() => {
    let cancelled = false;

    import('../game-client.js').then((mod) => {
      if (!cancelled) mod.startGame();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <h1>Idle Dungeon Management</h1>
        </div>

        <div className="topbar-actions">
          <button id="btn-open-palette" className="btn btn-small" type="button" aria-expanded="false">Gudang Dungeon</button>
          <button id="btn-open-upgrades" className="btn btn-small" type="button" aria-expanded="false">Peningkatan</button>
          <button id="btn-open-stats" className="btn btn-small" type="button" aria-expanded="false">Statistik</button>
          <button id="btn-reset-game" className="btn btn-small btn-danger" type="button">Reset Game</button>

          <div className="currencies" aria-label="Resources">
            <div className="currency" title="Gold">
              <span className="currency-icon gold-icon"></span>
              <span className="currency-label">Gold</span>
              <span id="gold-value">0</span>
            </div>
            <div className="currency" title="Souls">
              <span className="currency-icon soul-icon"></span>
              <span className="currency-label">Souls</span>
              <span id="souls-value">0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="panel stage-panel">
          <div className="stage-header">
            <h2 className="panel-title">Rancangan Dungeon</h2>
            <div className="mode-controls">
              <div className="mode-toggle" role="group" aria-label="Mode permainan">
                <button type="button" id="btn-mode-stage" className="btn btn-small mode-btn active">Stage</button>
                <button type="button" id="btn-mode-arcade" className="btn btn-small mode-btn">Arcade</button>
              </div>
              <div id="mode-stage-label" className="mode-stage-label">Stage 1 / 10</div>
            </div>
          </div>

          <div id="status-strip" className="status-strip" aria-live="polite">
            <div className="status-chip status-chip--mode">
              <span className="status-chip-key">Mode</span>
              <span id="status-mode" className="status-chip-val">Stage</span>
            </div>
            <div className="status-chip status-chip--progress">
              <span className="status-chip-key">Progress</span>
              <span id="status-progress" className="status-chip-val">1 / 10</span>
            </div>
            <div className="status-chip status-chip--king">
              <span className="status-chip-key">King</span>
              <span id="status-king" className="status-chip-val">Lv.1 · 48 HP · 9 ATK · 2 DEF</span>
            </div>
          </div>

          <div className="dungeon-runway" id="dungeon-runway">
            <div id="hero-token" className="hero-token" aria-hidden="true"><span className="hero-token-face">⚔</span></div>
            <div id="dungeon-slots" className="dungeon-slots"></div>
          </div>

          <div className="stage-controls">
            <button id="btn-start-raid" className="btn btn-primary">Mulai Raid</button>
            <span id="raid-status" className="raid-status"></span>
          </div>

          <div className="raid-stage">
            <div id="hero-card" className="hero-card hero-card--hidden">
              <div className="hero-card-top">
                <span id="hero-icon" className="hero-icon">⚔</span>
                <span id="hero-name" className="hero-name">—</span>
                <span id="hero-class" className="hero-class-tag">—</span>
              </div>

              <div className="hero-hp-bar">
                <div id="hero-hp-fill" className="hero-hp-fill"></div>
              </div>

              <div className="hero-stats">
                <span id="hero-level">Lv. —</span>
                <span id="hero-hp-text">HP —/—</span>
              </div>

              <div id="hero-reaction" className="hero-reaction"></div>
            </div>

            <div id="raid-log" className="raid-log">
              <p className="raid-log-placeholder">Susun dungeon-mu, lalu tekan &quot;Mulai Raid&quot; untuk melihat hero mencoba menaklukkannya.</p>
            </div>
          </div>
        </section>
      </main>

      <div id="palette-overlay" className="side-overlay side-overlay-left side-overlay--hidden" aria-hidden="true">
        <div className="side-overlay-backdrop" data-close-overlay="palette"></div>
        <aside className="side-panel" role="dialog" aria-modal="true" aria-label="Gudang Dungeon" tabIndex={-1}>
          <div className="side-panel-header">
            <div>
              <h2 className="panel-title">Gudang Dungeon</h2>
              <p className="panel-hint">Pilih item, lalu klik ruang kosong di layout dungeon untuk memasangnya.</p>
            </div>
            <button id="btn-close-palette" className="overlay-close" type="button" aria-label="Tutup">×</button>
          </div>
          <div className="palette-group">
            <h3 className="palette-group-title">Trap</h3>
            <div id="palette-traps" className="palette-list"></div>
          </div>
          <div className="palette-group">
            <h3 className="palette-group-title">Monster</h3>
            <div id="palette-monsters" className="palette-list"></div>
          </div>
          <div className="palette-group">
            <h3 className="palette-group-title">Ruang Spesial</h3>
            <div id="palette-special" className="palette-list"></div>
          </div>
        </aside>
      </div>

      <div id="upgrades-overlay" className="side-overlay side-overlay-right side-overlay--hidden" aria-hidden="true">
        <div className="side-overlay-backdrop" data-close-overlay="upgrades"></div>
        <aside className="side-panel" role="dialog" aria-modal="true" aria-label="Peningkatan" tabIndex={-1}>
          <div className="side-panel-header">
            <div><h2 className="panel-title">Peningkatan</h2></div>
            <button id="btn-close-upgrades" className="overlay-close" type="button" aria-label="Tutup">×</button>
          </div>
          <div id="upgrade-list" className="upgrade-list"></div>
        </aside>
      </div>

      <div id="stats-overlay" className="side-overlay side-overlay-right side-overlay--hidden" aria-hidden="true">
        <div className="side-overlay-backdrop" data-close-overlay="stats"></div>
        <aside className="side-panel" role="dialog" aria-modal="true" aria-label="Statistik" tabIndex={-1}>
          <div className="side-panel-header">
            <div><h2 className="panel-title">Statistik</h2></div>
            <button id="btn-close-stats" className="overlay-close" type="button" aria-label="Tutup">×</button>
          </div>
          <div id="stats-list" className="stats-list"></div>
        </aside>
      </div>

      <div id="offline-modal" className="modal-overlay modal-overlay--hidden">
        <div className="modal">
          <h2 className="modal-title">Selagi Kau Pergi...</h2>
          <div id="offline-summary" className="modal-body"></div>
          <button id="btn-close-offline" className="btn btn-primary">Kembali ke Dungeon</button>
        </div>
      </div>

      <div id="reset-modal" className="modal-overlay modal-overlay--hidden">
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
          <h2 id="reset-modal-title" className="modal-title">Reset Game?</h2>
          <div className="modal-body">
            <p>Semua progress akan dihapus: gold, souls, upgrade, unlock, layout dungeon, dan statistik. Tidak bisa dibatalkan.</p>
          </div>
          <div className="modal-actions">
            <button id="btn-reset-cancel" className="btn" type="button">Batal</button>
            <button id="btn-reset-confirm" className="btn btn-danger" type="button">Ya, Reset</button>
          </div>
        </div>
      </div>

      <div id="toast-container" className="toast-container" aria-live="polite"></div>
    </div>
  );
}
