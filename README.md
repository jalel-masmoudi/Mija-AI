# Mija AI

Mija AI is a mobile-first assembly companion for a Nordic bedside cabinet. It turns a manual or product code into a guided build, answers step-aware questions with GPT-5.6, and checks a camera photo with structured vision feedback.

## Run

1. Install [Bun](https://bun.sh).
2. Run `bun server.js` and open `http://localhost:3000`.

Camera access works on `localhost` or HTTPS. The built-in sample cabinet is the supported demo product; upload and product-code entry route to that guide.

## Deploy

The included `Dockerfile` deploys unchanged to Railway, Render, Fly.io, or any Docker host. Set `OPENAI_API_KEY` as a server-side environment variable and expose port `3000` (or set `PORT`).

The production app is deployed on Vercel at https://mija-ai.vercel.app. Its Vercel Functions are in `api/`. Supabase project migrations live in `supabase/migrations/` and secure per-user assembly progress plus private manual uploads.

## Judge-friendly modes

Mija starts with a mode choice:

- **Demo Mode** works without setup, using the preloaded assembly guide and reliable local demo responses.
- **Live AI Mode** lets a user paste their own OpenAI API key. The key is saved only in that browser's local storage, never in Mija's database, and is forwarded only for that user's live request.

This means judges can experience the complete product immediately. To use live GPT-5.6 responses locally, select Live AI Mode in the app and paste a funded OpenAI key; alternatively, set `OPENAI_API_KEY` as a server-side environment variable for the Vercel Functions.

## How it uses OpenAI

- `POST /api/chat` sends the active assembly step and user question to GPT-5.6.
- `POST /api/verify` sends the active step plus the captured image to GPT-5.6 vision and requires strict JSON: `pass`, `fix`, or `unclear`, a confidence score, and a correction.
- In Live AI Mode, a user-owned key stays in browser local storage and is sent only with that request; it is not persisted by Mija's server or database.

If the OpenAI project has no remaining quota, the client keeps its local, step-aware fallback guidance available for a reliable demo; GPT-5.6 verification resumes automatically once credits are available.

## Build Week

Track: **Apps for Your Life**. Codex accelerated the mobile UI, browser-camera flow, structured product data, and this small secure API boundary. GPT-5.6 powers contextual assembly help and visual verification.

## Limitations

This hackathon MVP supports one structured furniture guide. Upload parsing, arbitrary product recognition, manufacturer data, accounts, and cloud sync are intentionally out of scope.

## Native companion

`mobile/` contains the Expo TypeScript companion app with a touch-first assembly screen. The deployed web app remains the judged demo surface today; add Expo Camera and the native 3D viewer after the hackathon flow is locked.
