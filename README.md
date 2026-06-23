# TattooHub Mobile — React Native / Expo

## Stack
- React Native + Expo SDK 51
- Expo Router (navigation)
- Supabase (auth, BDD, Realtime, Storage)
- Zustand (state management)
- TanStack Query (data fetching)
- Stripe (paiements)

## Setup local

```bash
# 1. Copier les variables d'environnement
cp .env.example .env.local

# 2. Installer les dépendances
npm install

# 3. Lancer en dev
npx expo start

# 4. Scanner le QR code avec l'app Expo Go (iOS/Android)
```

## Base de données Supabase
Coller le contenu de `supabase/migrations/001_initial_schema.sql` dans :
Supabase Dashboard → SQL Editor → New Query → Run

## Build iOS (TestFlight)
```bash
eas build --platform ios --profile preview
```

## Soumission App Store
```bash
eas submit --platform ios --profile production
```

## Structure
```
app/
  _layout.tsx          # Root layout
  index.tsx            # Splash
  (onboarding)/        # Welcome, Auth OTP, Complete Profile
  (tabs)/              # Home, Flash, Messages, Profile
  artist/[id].tsx      # Profil artiste
  booking/[artistId]   # Flow réservation
  chat/[bookingId]     # Chat Realtime
  admin/               # Panel admin
components/ui/         # Button, ArtistCard, Toast
lib/supabase.ts        # Client + types
stores/                # Auth, Booking, UI (Zustand)
constants/             # Colors, Typography
supabase/migrations/   # SQL schema
```
