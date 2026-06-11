# TODO — Command Palette & Keyboard Shortcuts

## Goal
Power-user input layer: ⌘K does everything, shortcuts for daily moves.

## Progress
- 7 / 12 done (Sprint 2.58 — workspace g-sequences, / search focus, ? cheat sheet)

## Tasks

### Command palette (⌘K)
- [x] Global open everywhere ✓ Sprint 2.57 — `CommandPaletteProvider` in `layout.tsx`, ⌘K/Ctrl+K hotkey
- [x] Categories: Navigate, Search, Filter, Layer, Action, AI — `GET /api/command-palette` with category filter; 40 commands across 6 categories
- [x] Fuzzy search across all actions + recents — fuzzy scorer in `/api/command-palette?q=<query>`
- [ ] Inline previews (event card on hover)
- [ ] AI mode (parse free text → action)
- [ ] Per-org custom commands

### Shortcuts
- [ ] Map: `[` `]` time scrub, `1-9` toggle layers, `space` play/pause timeline
- [x] Workspace: `g h` home, `g m` map, `g d` dashboard, `g c` cases ✓ Sprint 2.58 — KeyboardShortcuts (g+h/m/d/a/s sequences)
- [x] Search: `/` focus, `Esc` clear ✓ Sprint 2.58 — / opens search, Esc closes
- [ ] AI copilot: `?` open, `enter` send
- [ ] Selection: arrows to move, `enter` open, `e` edit, `s` star/pin
- [x] Shortcut cheat sheet (`?` global) ✓ Sprint 2.58 — ? opens shortcuts help modal
- [ ] User-customizable bindings (settings page)

## i18n
- Shortcut hints adapt to keyboard layout; non-ASCII labels in palette supported.

### Примітки
Shortcuts are how analysts measure "is this tool serious?" — invest day-one.
