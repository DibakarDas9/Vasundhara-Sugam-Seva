# TODO

## Dark mode toggle: “Same mode as device” on double-click

- [ ] Edit `vasundhara-frontend/src/components/ui/ThemeToggle.tsx`
  - [x] Add double-click handler that opens a small popover
  - [x] Add checkbox “Same mode as device” (default ON)
  - [x] Persist setting in `localStorage`
  - [x] Ensure single-click toggles theme as usual
- [x] Edit `vasundhara-frontend/src/components/ThemeController.tsx` to apply persisted setting on load (system vs manual)



- [x] Run `npm run build` (in `vasundhara-frontend`) and verify no TS errors
- [ ] Manual test: default ON + checkbox flow + persistence

