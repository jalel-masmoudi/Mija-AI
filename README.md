# Mija AI

Mija AI is a mobile-first assembly companion for a Nordic bedside cabinet. It turns a manual or product code into a guided build, answers step-aware questions with GPT-5.6, and checks a camera photo with structured vision feedback.

## Run

1. Install [Bun](https://bun.sh).
2. Copy `.env.example` to `.env` and add `OPENAI_API_KEY`.
3. Run `bun server.js` and open `http://localhost:3000`.

Camera access works on `localhost` or HTTPS. The built-in sample cabinet is the supported demo product; upload and product-code entry route to that guide.

## Deploy

The included `Dockerfile` deploys unchanged to Railway, Render, Fly.io, or any Docker host. Set `OPENAI_API_KEY` as a server-side environment variable and expose port `3000` (or set `PORT`).

## How it uses OpenAI

- `POST /api/chat` sends the active assembly step and user question to GPT-5.6.
- `POST /api/verify` sends the active step plus the captured image to GPT-5.6 vision and requires strict JSON: `pass`, `fix`, or `unclear`, a confidence score, and a correction.
- The API key only exists on the Bun server, never in browser code.

## Build Week

Track: **Apps for Your Life**. Codex accelerated the mobile UI, browser-camera flow, structured product data, and this small secure API boundary. GPT-5.6 powers contextual assembly help and visual verification.

## Limitations

This hackathon MVP supports one structured furniture guide. Upload parsing, arbitrary product recognition, manufacturer data, accounts, and cloud sync are intentionally out of scope.
