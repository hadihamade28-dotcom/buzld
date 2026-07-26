# Buzld

Proximity dating — **feel the buzz when they're close**.

GPS finds compatible people nearby. Bluetooth confirms they're close. Both phones share a unique vibration pattern and photo reveal.

## Apps

| Path | Role |
|------|------|
| `apps/web` | Primary UI (TanStack Start / Lovable) |
| `apps/mobile` | Native Expo app (BLE + haptics) |
| `supabase/` | Auth, Postgres/RLS, Storage, Realtime, Edge Functions |

## Quick start — web UI

```bash
cd apps/web
npm install
npm run dev
```

Open http://127.0.0.1:5173

From the repo root:

```bash
npm install
npm run web
```

## Mobile (Expo)

```bash
cp apps/mobile/.env.example apps/mobile/.env
# set EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY

cd apps/mobile
npm install
npx expo start
```

BLE scanning and haptics need a **dev build** on physical devices (`eas build --profile development`).

## Supabase

```bash
# Apply migrations (or paste supabase/setup-all.sql in the SQL editor)
supabase db push

supabase functions deploy find-candidates
supabase functions deploy confirm-proximity
```

## Product loop

1. Onboard (photo, interests, prefs)
2. Go Live on Discover
3. Nearby compatible users become BLE candidates
4. Strong RSSI → shared buzz + photo reveal
5. Mutual Continue → chat

## Origins

- **Web UI** from [proximity-match](https://github.com/hadihamade28-dotcom/proximity-match-e5dbb268)
- **Mobile + Supabase** from [Vicino](https://github.com/hadihamade28-dotcom/Vicino)
