'use client';

import { useEffect } from 'react';
import { uiAssetVars } from './assetVars';

export default function GameApp() {
  useEffect(() => {
    let cancelled = false;

    import('../game-client').then((mod) => {
      if (!cancelled) mod.startGame();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app" style={uiAssetVars}>
      <header className="player-hud" aria-label="Player status">
        <div className="player-hud-left">
          <div className="player-avatar icon-king" aria-hidden="true"></div>
          <div className="player-meta">
            <div className="player-name">King</div>
            <div id="hud-king-level" className="player-level">
              Lv.1
            </div>
            <div id="hud-progress" className="player-progress">
              Stage 1 / 50
            </div>
          </div>
        </div>

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
      </header>

      <main className="layout">
        <section className="panel stage-panel">
          <div className="stage-header">
            <h2 className="panel-title">Dungeon Layout</h2>
            <div className="mode-controls">
              <div className="mode-toggle" role="group" aria-label="Game mode">
                <button type="button" id="btn-mode-stage" className="btn btn-small mode-btn active">
                  Stage
                </button>
                <button type="button" id="btn-mode-arcade" className="btn btn-small mode-btn">
                  Arcade
                </button>
              </div>
              <div id="mode-stage-label" className="mode-stage-label">
                Stage 1 / 50
              </div>
            </div>
          </div>

          <div id="status-strip" className="status-strip" aria-live="polite">
            <div className="status-chip status-chip--mode">
              <span className="status-chip-key">Mode</span>
              <span id="status-mode" className="status-chip-val">
                Stage
              </span>
            </div>
            <div className="status-chip status-chip--progress">
              <span className="status-chip-key">Progress</span>
              <span id="status-progress" className="status-chip-val">
                1 / 50
              </span>
            </div>
            <div className="status-chip status-chip--king">
              <span className="status-chip-key">King</span>
              <span id="status-king" className="status-chip-val">
                Lv.1 · 48 HP · 9 ATK · 2 DEF
              </span>
            </div>
          </div>

          <div id="room-preview" className="room-preview" aria-label="Enemy detected"></div>

          <div className="dungeon-runway" id="dungeon-runway">
            <div
              id="room-stage"
              className="room-stage is-hidden"
              aria-hidden="true"
            >
              <div id="room-depth" className="room-depth">
                Entrance
              </div>
              <div id="room-chamber" className="room-chamber">
                <div id="room-corridor" className="room-corridor" aria-hidden="true"></div>
                <div className="room-torch" style={{ left: '26%', top: '40%' }} aria-hidden="true">
                  <div className="room-torch-flame"></div>
                </div>
                <div className="room-torch" style={{ left: '74%', top: '40%' }} aria-hidden="true">
                  <div className="room-torch-flame"></div>
                </div>
                <div id="room-door" className="room-door" aria-hidden="true">
                  <div className="room-door-panel"></div>
                  <div className="room-door-frame"></div>
                </div>
                <div className="room-floor">
                  <div id="room-content" className="room-content">
                    <span className="room-content-icon icon-door"></span>
                    <span className="room-content-label">Dungeon Mouth</span>
                  </div>
                  <div id="hero-token" className="hero-token" aria-hidden="true">
                    <span className="hero-token-face">⚔</span>
                  </div>
                  <div id="monster-token" className="monster-token" aria-hidden="true">
                    <span className="monster-token-face"></span>
                  </div>
                </div>
              </div>
            </div>
            <div id="dungeon-slots" className="dungeon-slots"></div>
          </div>

          <div className="stage-controls">
            <span id="raid-status" className="raid-status"></span>
          </div>
        </section>
      </main>

      <button
        id="btn-start-raid"
        className="play-fab"
        type="button"
        aria-label="Start Raid"
      >
        <span className="play-fab-icon icon-play" aria-hidden="true"></span>
        <span className="play-fab-label">Raid</span>
      </button>

      <nav className="bottom-nav" aria-label="Main">
        <button type="button" id="btn-open-palette" className="bottom-nav-item" aria-expanded="false" data-nav="palette">
          <span className="bottom-nav-icon icon-armory" aria-hidden="true"></span>
          <span className="bottom-nav-label">Armory</span>
        </button>
        <button type="button" id="btn-open-upgrades" className="bottom-nav-item" aria-expanded="false" data-nav="upgrades">
          <span className="bottom-nav-icon icon-upgrade" aria-hidden="true"></span>
          <span className="bottom-nav-label">Upgrade</span>
        </button>
        <button type="button" id="btn-nav-home" className="bottom-nav-item bottom-nav-item--center active" data-nav="home" aria-current="page">
          <span className="bottom-nav-icon" aria-hidden="true">🏭</span>
          <span className="bottom-nav-label">Battle</span>
        </button>
        <button type="button" id="btn-open-stats" className="bottom-nav-item" aria-expanded="false" data-nav="stats">
          <span className="bottom-nav-icon" aria-hidden="true">📊</span>
          <span className="bottom-nav-label">Stats</span>
        </button>
        <button type="button" id="btn-open-settings" className="bottom-nav-item" aria-expanded="false" data-nav="settings">
          <span className="bottom-nav-icon icon-settings" aria-hidden="true"></span>
          <span className="bottom-nav-label">Settings</span>
        </button>
      </nav>

      <div id="palette-overlay" className="side-overlay side-overlay-left side-overlay--hidden" aria-hidden="true">
        <div className="side-overlay-backdrop" data-close-overlay="palette"></div>
        <aside className="side-panel" role="dialog" aria-modal="true" aria-label="Dungeon Armory" tabIndex={-1}>
          <div className="side-panel-header">
            <div>
              <h2 className="panel-title">Dungeon Armory</h2>
              <p className="panel-hint">Select an item, then tap an empty dungeon room to place it.</p>
            </div>
            <button id="btn-close-palette" className="overlay-close" type="button" aria-label="Close">×</button>
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
            <h3 className="palette-group-title">Special Rooms</h3>
            <div id="palette-special" className="palette-list"></div>
          </div>
        </aside>
      </div>

      <div id="upgrades-overlay" className="side-overlay side-overlay-right side-overlay--hidden" aria-hidden="true">
        <div className="side-overlay-backdrop" data-close-overlay="upgrades"></div>
        <aside className="side-panel" role="dialog" aria-modal="true" aria-label="Upgrades" tabIndex={-1}>
          <div className="side-panel-header">
            <div><h2 className="panel-title">Upgrades</h2></div>
            <button id="btn-close-upgrades" className="overlay-close" type="button" aria-label="Close">×</button>
          </div>
          <div id="upgrade-list" className="upgrade-list"></div>
        </aside>
      </div>

      <div id="stats-overlay" className="side-overlay side-overlay-right side-overlay--hidden" aria-hidden="true">
        <div className="side-overlay-backdrop" data-close-overlay="stats"></div>
        <aside className="side-panel" role="dialog" aria-modal="true" aria-label="Statistics" tabIndex={-1}>
          <div className="side-panel-header">
            <div><h2 className="panel-title">Statistics</h2></div>
            <button id="btn-close-stats" className="overlay-close" type="button" aria-label="Close">×</button>
          </div>
          <div id="stats-list" className="stats-list"></div>
        </aside>
      </div>

      <div id="settings-overlay" className="side-overlay side-overlay-right side-overlay--hidden" aria-hidden="true">
        <div className="side-overlay-backdrop" data-close-overlay="settings"></div>
        <aside className="side-panel" role="dialog" aria-modal="true" aria-label="Settings" tabIndex={-1}>
          <div className="side-panel-header">
            <div>
              <h2 className="panel-title">Settings</h2>
              <p className="panel-hint">Preferences and data</p>
            </div>
            <button id="btn-close-settings" className="overlay-close" type="button" aria-label="Close">×</button>
          </div>
          <div className="settings-body">
            <section className="settings-section" aria-labelledby="settings-lang-title">
              <h3 id="settings-lang-title" className="settings-section-title">Language</h3>
              <label className="settings-field" htmlFor="setting-language">
                <span className="settings-field-label">Display language</span>
                <select id="setting-language" className="settings-select" defaultValue="en" aria-describedby="settings-lang-note">
                  <option value="en">English</option>
                </select>
              </label>
              <p id="settings-lang-note" className="settings-note">English only for now. More languages later.</p>
            </section>
            <section className="settings-section settings-section--danger" aria-labelledby="settings-danger-title">
              <h3 id="settings-danger-title" className="settings-section-title">Danger zone</h3>
              <p className="settings-note">Deletes gold, souls, upgrades, unlocks, layout, and stats. Cannot be undone.</p>
              <button id="btn-reset-game" className="btn btn-danger settings-reset-btn" type="button">
                Reset game
              </button>
            </section>
          </div>
        </aside>
      </div>

      <div id="offline-modal" className="modal-overlay modal-overlay--hidden">
        <div className="modal">
          <h2 className="modal-title">While You Were Away...</h2>
          <div id="offline-summary" className="modal-body"></div>
          <button id="btn-close-offline" className="btn btn-primary">Back to the Dungeon</button>
        </div>
      </div>

      <div id="reset-modal" className="modal-overlay modal-overlay--hidden">
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
          <h2 id="reset-modal-title" className="modal-title">Reset Game?</h2>
          <div className="modal-body">
            <p>All progress will be wiped: gold, souls, upgrades, unlocks, dungeon layout, and stats. This cannot be undone.</p>
          </div>
          <div className="modal-actions">
            <button id="btn-reset-cancel" className="btn" type="button">Cancel</button>
            <button id="btn-reset-confirm" className="btn btn-danger" type="button">Yes, Reset</button>
          </div>
        </div>
      </div>

      <div id="toast-container" className="toast-container" aria-live="polite"></div>
    </div>
  );
}
