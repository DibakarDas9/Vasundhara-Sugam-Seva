# Google Sign-In Implementation TODO

## Backend (`vasundhara-api`)
- [ ] Wire new route `/api/auth/google`
  - File: `src/app.ts` (mount router)
  - Route file: `src/routes/google.ts`
- [ ] Add/confirm dependency for verification
  - Use `google-auth-library` (confirm installed or add)
- [ ] Add env vars documentation
  - `GOOGLE_CLIENT_ID`

## Frontend (`vasundhara-frontend`)
- [ ] Add Google Identity Services script
  - In `src/app/auth/page.tsx` via `useEffect` or Next `Script`
- [ ] Add button: “Continue with Google” on auth page (login tab)
  - Hide shopkeeper panel from auth panel when Google login succeeds (role forced to household)
- [ ] Implement handler: obtain `id_token` and call backend
  - Endpoint: `${NEXT_PUBLIC_API_URL}/api/auth/google`
  - Then call existing `persistRemoteSession` flow via adding `loginWithGoogle()` to `AuthContext`

## Session
- [ ] Add method in `AuthContext` for Google login to reuse token persistence

## Verification
- [ ] Run `npm run build` for both apps
- [ ] Manual test: Google login creates user, returns tokens, redirects to /dashboard

