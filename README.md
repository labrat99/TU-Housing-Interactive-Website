# Tulane Housing Hub

A housing review + sublet platform for the Tulane community. Course DATA 2150 team project.

Students browse and search landlord/property reviews and summer sublets. Reading is public;
posting requires a verified `@tulane.edu` account.

## Stack (scaled-back 2-person build)

- **Front end:** static HTML / CSS / JS (no build step — fast to ship and easy to read).
- **Backend:** [Supabase](https://supabase.com) — accounts, `@tulane.edu` email verification, and the database.
- **Deploy:** Vercel (or Netlify) connected to GitHub for a live public URL.

> Source of truth for screens/behavior: Maddie's wireframe handoff package
> (`/docs/wireframes`). Design tokens live in `assets/css/styles.css`.

## Run it locally

No Node required. From the project root:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 — or just double-click `index.html`.

## Structure

```
index.html            Home / landing (WF-01)
assets/css/styles.css Design system: palette, type, components
assets/js/seed.js     Local demo content (temporary stand-in for Supabase)
assets/js/home.js     Renders the home "Recent activity" preview
```
