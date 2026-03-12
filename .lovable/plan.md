

# Implementation Plan — Avatar AI

A dark-themed AI avatar video generator with the flow: **Landing → Auth → Studio → Preview → Payment → Download**.

## Key Decision
- Company/brand name: **Avatar AI** — used throughout (title, logo text, hero, footer, meta tags).

## Pages to Build

1. **Landing Page** (`/`) — Hero with "Avatar AI" branding, feature highlights, CTA → Studio (or login if unauthenticated)
2. **Auth Pages** (`/login`, `/signup`) — Email/password + Google login via Supabase Auth
3. **Studio** (`/studio`) — Prompt input, duration selector, currency auto-detect + toggle, dynamic pricing, "Generate" button with loading simulation
4. **Preview** (`/preview`) — 420p demo video player (2 min cap), watermark badge, demo warning, price summary, "Pay with Razorpay" button
5. **Download** (`/download`) — Post-payment 4K download page
6. **Dashboard** (`/dashboard`) — Order history & re-downloads

## Tech Approach

- **Design**: Dark-only theme (#0A0A0A bg, #8B5CF6 purple accents, Outfit + Inter fonts)
- **Auth**: Supabase Auth (email + Google OAuth)
- **Currency detection**: Free IP geolocation API + manual INR/USD toggle, stored in React context
- **Pricing logic**: Client-side based on duration + currency selection
- **Mock AI generation**: Simulated 5-8s loading animation, then show a placeholder demo video
- **Payment**: Razorpay checkout integration (script loaded dynamically)
- **State management**: React context for auth, currency; React Query for orders
- **Routing**: React Router with protected routes

## File Structure

```
src/
  contexts/AuthContext.tsx, CurrencyContext.tsx
  pages/Landing.tsx, Login.tsx, Signup.tsx, Studio.tsx, Preview.tsx, Download.tsx, Dashboard.tsx
  components/Navbar.tsx, PricingCard.tsx, VideoPlayer.tsx, CurrencyToggle.tsx, ProtectedRoute.tsx
  lib/pricing.ts, razorpay.ts
  hooks/useGeoLocation.ts
```

## Implementation Order
1. Update index.html title/meta to "Avatar AI"
2. Set up dark theme, fonts, global styles
3. Build Landing page with Avatar AI branding
4. Auth setup (Supabase) + Login/Signup pages
5. Studio page (prompt, duration, pricing)
6. Currency context + IP detection + toggle
7. Preview page with mock video + demo restrictions
8. Razorpay payment integration
9. Download page + Dashboard

