# HavenNest

A home-sharing marketplace — browse and list stays, search by city or name, filter by category, save favorites, leave reviews, and see each listing on a map.

## Stack

Node.js · Express · MongoDB/Mongoose 7 · EJS (`ejs-mate` layouts) · Passport (local auth) · Cloudinary (image storage) · Leaflet + OpenStreetMap (maps, geocoding) · Bootstrap 5

## Setup

```bash
npm install
cp .env.example .env   # fill in ATLASDB_URL, CLOUD_*, SECRET (see below)
npm run dev             # nodemon, http://localhost:8080
```

### Environment variables

See `.env.example`. Notes:

- `ATLASDB_URL` — MongoDB connection string. Falls back to `mongodb://127.0.0.1:27017/havennest` if unset (local dev only — do not rely on this fallback in production).
- `CLOUD_NAME` / `CLOUD_API_KEY` / `CLOUD_API_SECRET` — must match these exact names; `cloudConfig.js` reads these specific variables.
- `SECRET` — session signing secret. Set a long random value in production; the fallback in `app.js` is dev-only.
- `SEED_OWNER_ID` — only needed to run `npm run seed`. Sign up a user first, copy their `_id` from the `users` collection, then set this before seeding.

### Seeding sample data

```bash
npm run seed
```

This geocodes each of the ~29 sample listings against OpenStreetMap's Nominatim (1 request/sec, so it takes about half a minute) and inserts them owned by `SEED_OWNER_ID`.

## Architecture notes

- **Categories** live in one place: `models/listing.js` exports `CATEGORIES`. The filter bar, the new/edit listing forms, and Joi validation (`schema.js`) all read from this array — add a category once, it shows up everywhere.
- **Geocoding is server-side and write-time**, not client-side/read-time (`utils/geocode.js`, called from `createListing`/`updateListing`). This keeps page loads fast, respects Nominatim's rate limit, and means a temporary geocoding outage never blocks a listing from being created — it just ships without a map, and the show page renders a "map unavailable" state instead of breaking.
- **Wishlist** is a `favorites: [ObjectId]` array on the User document, toggled via `POST /listings/:id/favorite`. The button is a real `<form>` (works with JS disabled) that's progressively enhanced with `fetch` in `public/js/script.js` for an instant in-place icon update.
- **Search & filters** are plain query params (`GET /listings?q=...&category=...`) handled entirely server-side — no client framework, fully crawlable, works with JS off, and filter/search links are real `<a href>`s so browser back/forward and sharing a filtered URL both just work.
- **Dark mode** is a `data-theme` attribute on `<html>`, set by an inline script in `<head>` before first paint (avoids a flash of the wrong theme), persisted to `localStorage`, and falling back to `prefers-color-scheme` for first-time visitors.

## Known limitations / next steps

- **Mongoose was upgraded from 5.13 → 7.x** as part of this pass (5.x is years out of maintenance and increasingly incompatible with current MongoDB Atlas TLS defaults). This is a real breaking-change risk area — run the full create/edit/delete/review flow against a real database before deploying.
- **No automated tests.** For a real production deploy, add at minimum: model validation tests, an integration test for the auth flow, and a smoke test for listing CRUD.
- **No rate limiting or CSRF protection** on forms. Add `express-rate-limit` (at least on `/login` and `/signup`) and a CSRF middleware (e.g. `csrf-csrf`) before shipping this publicly.
- **Search is regex-based**, fine at this catalog size; migrate to a MongoDB `$text` index if the listing count grows into the thousands.
- **Legal pages are placeholders.** `/privacy` and `/terms` exist (previously dead footer links) but contain stub copy — replace before real users sign up.
- **No image optimization pipeline** beyond Cloudinary's defaults — worth adding responsive image transforms (`w_400`, `f_auto,q_auto`) to card thumbnails if traffic grows.
