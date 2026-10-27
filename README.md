# Sayflow — Spoken Demo Writer

## The Problem

While preparing a software-assignment video, I got stuck on the spoken explanation—the video needed audible narration, and I needed a simple way to turn project details into clear, timed voiceover. Other students preparing software demos can run into the same friction. Success means I can describe the real problem, live demo, my own code choice, and the AI-generated code I understand, then get a natural, time-aware first draft I can edit and say aloud.

## What It Does

Sayflow takes four pieces of honest context—your problem and product, the real demo input/result, one code choice you made and why, and an AI-generated code section you understand—and sends them to the Express backend. The backend asks an AI model to shape those notes into a timed three-part narration. You can edit the words, copy or download the text, and hear a spoken preview using your browser's built-in speech voice. Your draft is not saved by Sayflow.

## AI Integration

- **API:** OpenRouter Chat Completions API
- **Model:** `openai/gpt-4o-mini`
- **Location:** `server.js` → `generateNarration()` function
- **Transformation:** the AI shapes project notes into a concise, natural three-part spoken demo narration sized to the selected duration, without inventing personal experiences or implementation facts.

The API call is made only by the Express backend. `OPENROUTER_API_KEY` is read from `process.env`; it is never placed in browser code or committed to the repository. The frontend calls Sayflow's same-origin `/api/generate` route only.

## What I Intentionally Excluded

- **User accounts and saved-project history:** a one-session narration draft does not need identity or persistence, and adding them would introduce more privacy and deployment work.
- **A full video editor and media upload:** the core problem is finding the spoken words, not editing footage; a browser editor would broaden the scope and create storage/privacy responsibilities.
- **A downloadable synthesized audio file:** the first version uses browser speech playback so people can hear and revise a draft without collecting another provider credential or retaining audio. It downloads the script as text instead.

## Monthly Cost Calculation

- **Model:** `openai/gpt-4o-mini`
- **Input rate:** `$0.15 per 1M tokens`
- **Output rate:** `$0.60 per 1M tokens`
- **Average tokens per call:** `~600 input + ~400 output`
- **Cost per call:** `(600 / 1,000,000 × $0.15) + (400 / 1,000,000 × $0.60) = $0.000090 + $0.000240 = $0.000330`
- **Expected monthly calls:** `300`
- **Monthly total:** `300 × $0.000330 = $0.099 (~$0.10/month)`

This is an estimate using the assignment's token assumptions; actual provider charges vary with prompt and response length.

## Live Deployment

- **Frontend:** https://sayflow-sxde6vve.manus.space/
- **Backend health:** https://sayflow-sxde6vve.manus.space/health
- **AI route:** https://sayflow-sxde6vve.manus.space/api/generate

## Local Setup

Requirements: Node.js 22 and pnpm 11.25.0.

```bash
pnpm install
cp .env.example .env
# Add your own OPENROUTER_API_KEY to .env locally. Never commit this file.
pnpm dev
```

Open `http://localhost:3000`. Run the offline automated tests with:

```bash
pnpm test
```

For a deployed service, configure `OPENROUTER_API_KEY` as a protected backend environment variable. The unauthenticated `/health` route should return `{"status":"ok"}`. The app limits prompt length, uses a small per-process request throttle, avoids logging provider response bodies, and does not persist narration drafts.

## Project Layout

- `server.js`: Express routes, validation, backend-only OpenRouter request, and `generateNarration()`.
- `public/`: accessible UI, same-origin browser code, styling, logo, and declared route manifest.
- `test/server.test.js`: validation, prompt-shape, health, and mocked-provider tests.
- `Dockerfile`: production container for the Express app.

## Assignment Video Note

A synthetic voiceover can be laid over authentic footage if clearly treated as synthetic, but it does not replace the submitter's real on-camera explanation required by the assignment. Sayflow itself does not claim to export audio or video.
