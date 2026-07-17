# Mija AI — Assembly, made clear

**Category:** Apps for Your Life

## What it does

Mija AI turns furniture assembly into a camera-aware, step-by-step experience. For the supported Nordic bedside cabinet, a user can upload a manual or enter a product code, follow twelve guided steps, ask a contextual question, and capture a photo for visual feedback before moving on.

## Why it matters

Paper manuals make a physical task harder: users lose orientation, select the wrong hardware, and only discover mistakes several steps later. Mija gives a first-time builder clear next actions and an opportunity to check their work at the moment it matters.

## How it works

The mobile web app keeps the current step and required parts in local storage. The Bun server is the only component that receives the OpenAI key. Its two GPT-5.6 endpoints receive the active step context:

- **Ask Mija:** answers an assembly question using the current instruction, parts, and tool.
- **Visual check:** sends the captured camera image plus the expected step to GPT-5.6 and returns strict JSON with `pass`, `fix`, or `unclear`, a confidence score, a practical explanation, and a correction.

## How Codex and GPT-5.6 were used

Codex accelerated the end-to-end product implementation: the mobile interaction design, assembly-state model, browser camera flow, offline/PWA support, the Bun API boundary, tests, deployment configuration, and documentation. GPT-5.6 powers the two product-defining interactions: contextual assembly assistance and structured visual verification.

## Built with

Vanilla HTML/CSS/JavaScript, Bun, OpenAI Responses API, GPT-5.6, native browser camera APIs, and a PWA service worker.

## Running it

See [README.md](README.md). Set `OPENAI_API_KEY`, run `bun server.js`, and open `http://localhost:3000`.
