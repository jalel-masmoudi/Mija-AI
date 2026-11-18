# Mija AI

Mija AI is a mobile-first web app that walks you through assembling one piece of furniture: a "Nordic bedside cabinet" with a hard-coded 12-step guide. On each step you can ask a question about that step and take a photo of your work to get a pass / fix / unclear check.

Live demo: https://mija-ai.vercel.app

## Status and limits

This is a hackathon demo, not a product.

- **One guide only.** The 12 steps, parts and tools are hard-coded in `app.js`. "Upload a manual" and "Enter product code" both open the same guide; the file is never read or uploaded, and the code is not looked up.
- **On first launch you pick a mode:** Demo Mode or Live AI Mode (paste your own OpenAI key). The choice is remembered and can be changed later.
- **Demo Mode does not call any AI.** Chat answers come from keyword matching in `app.js` (`answer()`). The photo check returns a scripted result: on step 7 a captured photo reports a reversed drawer runner until you tap "I fixed it"; every other check passes.
- **Live AI Mode** sends the question or photo, plus the current step's text, to the OpenAI Responses API (model `gpt-5.6`) and needs an OpenAI API key. If a request fails, the app quietly falls back to the Demo Mode answer.
- **Progress lives in browser `localStorage`.** There are no accounts. `supabase/migrations/` defines a progress table and a private storage bucket, but no code uses them yet.
- The "interactive view" is a CSS drawing of the cabinet that highlights a panel and rotates in 45° steps, not a 3D model.
- `mobile/` is an Expo app that is still mostly the starter template. Its home screen lists the same 12 step titles with placeholder buttons; there is no camera, AI or networking there.

## Run locally

Requires [Bun](https://bun.sh).

```bash
bun server.js              # serves the app and /api on http://localhost:3000
bun test ./server.test.js  # checks that only the front-end files are served
```

Camera access needs `localhost` or HTTPS. Demo Mode works with no key. For Live AI Mode against the Bun server, set `OPENAI_API_KEY` in the environment or copy `.env.example` to `.env` (Bun loads it automatically); the Bun server ignores a key pasted into the app. Besides `/api`, the server only serves the front-end files (`index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js`); every other path, including `.env`, `.git` and the server source, returns 404.

The `Dockerfile` runs the same Bun server on port 3000 (override with `PORT`). `.dockerignore` keeps `.env*`, `.git` and `node_modules` out of the image, so pass the key as an environment variable at runtime.

Mobile app (optional):

```bash
cd mobile && npm ci && npx expo start
```

## Stack

- Frontend: plain HTML, CSS and JavaScript (`index.html`, `styles.css`, `app.js`), no build step.
- Backend: two endpoints, implemented twice: `server.js` for Bun, and `api/` as Vercel Functions for the hosted demo.
- AI: OpenAI Responses API with strict JSON-schema output.
- Unused so far: a Supabase migration (`supabase/`) and an Expo / React Native app (`mobile/`).

## Architecture

1. `app.js` renders every screen as an HTML string and keeps the session (current step, completed and verified steps, mode) in `localStorage`.
2. In Live AI Mode the browser calls `POST /api/chat` with `{ question, step }` or `POST /api/verify` with `{ image, step }`, where `image` is a JPEG data URL taken from the camera.
3. The server builds a prompt from the step's title, instruction, parts and tool and asks OpenAI for JSON: `{ answer }` for chat, `{ status, confidence, message, correction }` for verify.
4. On Vercel, a key pasted in the app is kept in that browser's `localStorage` and sent to `api/` in the `x-mija-openai-key` header for each request; it is not stored server-side. Without it, `api/` falls back to the `OPENAI_API_KEY` environment variable.

## Team

Med Jalel Masmoudi (backend, AI integration, deployment) and Mahdi (mobile UI, UX and camera interface).

## License

MIT, see `LICENSE`.
