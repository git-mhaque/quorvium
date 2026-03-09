# Quorvium

Quorvium is a real-time collaboration board where teams gather a quorum of ideas, scribble sticky notes, and brainstorm together.

## Requirements

- Node.js 18.17 or newer
- npm 9+

## First-time setup

```bash
npm install --cache=/tmp/npm-cache
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Populate environment values before starting the app:

| Location          | Variable                     | Example                          |
| ----------------- | ---------------------------- | -------------------------------- |
| `server/.env`     | `GOOGLE_CLIENT_ID`           | `588904878485-abc123…apps.googleusercontent.com` |
|                   | `GOOGLE_CLIENT_SECRET`       | `GOCSPX-…`                       |
|                   | `GOOGLE_REDIRECT_URI`        | `http://localhost:5173/`         |
|                   | `CLIENT_ORIGIN`              | `http://localhost:5173`          |
| `client/.env`     | `VITE_API_BASE_URL`          | `http://localhost:4000`          |
|                   | `VITE_GOOGLE_CLIENT_ID`      | same as server                   |
|                   | `VITE_GOOGLE_REDIRECT_URI`   | `http://localhost:5173/`         |

Only Google-authenticated users can create boards. Visitors may still join existing boards without signing in, but they collaborate anonymously. Signed-in owners can manage boards from the home page via a "My Boards" table (name, created, updated, quick create, join link, copy, delete).

## Developing locally

Run the backend and frontend in watch mode from the repo root:

```bash
npm run dev
```

- API: http://localhost:4000 (Express + Socket.IO)
- Web app: http://localhost:5173 (Vite + React)
- OAuth redirect: http://localhost:5173/ (must match Google console configuration)

## Testing & quality checks

```bash
npm test --cache=/tmp/npm-cache      # Run server + client Vitest suites
npm run lint  # ESLint across both workspaces
npm run build # Type-check & build bundles
```

The exchange of Google authorization codes happens in `server/src/routes/auth.ts`, which stores access/refresh tokens inside secure HTTP-only cookies (`quorvium_google_access`, `quorvium_google_refresh`). These cookies are required for subsequent Google API access—no tokens are exposed to the browser.

## Project structure

- `client/` – React UI, Google auth, board canvas, Socket.IO client
- `server/` – Express API, Google token verification, Socket.IO hub
- `docs/spec.md` – Canonical product requirements
- `docs/` – Supporting documentation (legacy specs, diagrams, notes)
- `AGENTS.md` – Contributor workflow guide
