# Changelog

## 0.1.1 — 2026-11-05

Supports both the legacy `ha-md-list-item` and HA 2026.11's `ha-list-item-button` when coloring native editor rows. Existing colors, opacity and storage keys are preserved; no migration is required. Minimum HA remains 2026.10.3.

The standalone bundle passes local DOM regression tests for both HA row types, including opacity, Cancel, Save, reopening and theme reset. The related Manager was live-tested on .177; Colors was not loaded alongside it. 27 automated tests pass. Update only the package you use; do not load Colors and Manager together.


## 0.1.0 — 2026-11-01

- Per-entry color field in Home Assistant's native sidebar editor.
- HSV picker, HEX input, opacity, live preview and theme reset.
- Native Save/Cancel integration, separate per-user storage and synchronization.
- Preserve native order, hidden entries, themes and dashboard configuration.
- Complete DE/EN/FR interface.
- Single-file bundle, HACS/Marketplace manifest, validation and release workflows.
- Tested in a real Home Assistant 2026.10.4 installation; intended minimum 2026.10.3.
- Internal frontend hooks require revalidation after Home Assistant upgrades.
