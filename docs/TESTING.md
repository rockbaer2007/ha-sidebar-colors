# Verification scope

## HA 2026.11 compatibility — 0.1.1

Supports both the legacy `ha-md-list-item` and HA 2026.11's `ha-list-item-button` when coloring native editor rows. Existing colors, opacity and storage keys are preserved; no migration is required. Minimum HA remains 2026.10.3.

The standalone bundle passes local DOM regression tests for both HA row types, including opacity, Cancel, Save, reopening and theme reset. The related Manager was live-tested on .177; Colors was not loaded alongside it. 27 automated tests pass. Update only the package you use; do not load Colors and Manager together.

Source bundles and .177 full backup `3c252cf9` were created first. The previous native settings and “Test für APP” were preserved. After approved removal of the oldest full backup, .177 retains three full backups (`3c252cf9`, `2157cbf4`, `2b60a8a7`); app-update and PC backups remain.

## Runtime

- A real Home Assistant Core **2026.10.4** test installation was backed up before testing.
- Native sidebar dialog, per-entry field, HSV/HEX editing and 70%/0% opacity checked.
- Live preview, picker Escape/Cancel, main-dialog Cancel and native Save checked.
- Persisted color survives page reload. Reset to theme synchronizes to a second tab.
- Native visibility control and keyboard reordering checked; test changes cancelled.
- Original native user preferences compared structurally before/after; unchanged.
- Existing test dashboard and dashboard resources compared byte-for-byte; unchanged.
- Temporary test color removed. Additional user-selected colors retained.
- User confirmed the visual result and authorized the included screenshots.

## Local tests

Tests cover color validation, HSV round trips, alpha zero, theme reset, complete DE/EN/FR strings, cancellation callbacks, separate color storage, conflict detection, blocked local backups, connection loss and lost acknowledgements, mixed-save failure and rollback protection. Distribution tests check the single-file artifact and HACS manifest.

## Limits

The **2026.10.3** minimum follows the documented frontend and per-user storage interfaces, not another real-device test. The Marketplace uses the same plugin manifest and distribution format; a **2026.11** runtime test is not claimed. No real phone/tablet test was performed. Connection-loss and mixed-save failure paths were simulated locally, not induced on the HA installation.

The extension uses internal sidebar dialog methods and named dirty-state slices. Future HA versions require regression tests. Frontend user data has no compare-and-swap operation: a narrow race between independent clients remains possible. Mixed native/color updates are not a server-side transaction. Failed or uncertain persistence keeps the draft available and avoids blind retries.
