# Sayflow — Implementation Plan

## Approved problem and product scope

While preparing a software-assignment video, I got stuck on the spoken explanation—the video needed audible narration, and I needed a simple way to turn project details into clear, timed voiceover. Other students preparing software demos may have the same difficulty. Success means pasting project notes, choosing a target length and tone, and receiving a clear, time-aware narration script with spoken playback.

Sayflow will be a single-origin web product. The user enters project notes, selects a demo duration and tone, and asks the backend to generate a concise narration. The output includes a speaking-time estimate, editable script, copy/download controls, and accessible browser speech playback controls. The backend is the only place that contacts OpenRouter. The product is not an editor that alters or publishes video files.

## Implementation approach and service flow

- Use a small vanilla HTML/CSS/JavaScript frontend served by an Express app; this keeps the student assignment's required Express backend explicit and avoids unnecessary framework, accounts, or database.
- `POST /api/generate` validates bounded input, invokes `https://openrouter.ai/api/v1/chat/completions` from the server with model `openai/gpt-4o-mini`, and returns a structured script. The `OPENROUTER_API_KEY` is read only from `process.env` and supplied to the managed deployment as a protected secret; no key or AI endpoint appears in frontend source.
- The browser uses its native SpeechSynthesis API to play the returned script aloud. If the browser lacks speech synthesis or has no usable voices, the script remains fully usable and the interface explains the limitation. Speech is a preview; the app does not claim to render or export a downloadable audio file.
- Express serves `/` and static assets, `/api/generate`, `/health`, and `/manus-routes.json` from the same origin. Thus the live frontend URL is the service root and the backend URL is the same origin's `/health`; the README and PR will state both explicitly.
- Include `.env.example`, `.gitignore`, package scripts, readable comments, runtime-safe limits, loading/error states, and documented local commands. Never commit `.env` or credentials.
- README will answer all four assignment questions, include 2–3 specific exclusions, exact API/model/file/function details, deployment URLs, and the full cost arithmetic: `(600 / 1,000,000 × $0.15) + (400 / 1,000,000 × $0.60) = $0.000090 + $0.000240 = $0.000330 per call`; `300 × $0.000330 = $0.099 ≈ $0.10/month`.

## Project structure

```text
sayflow/
├── server.js                 # Express routes, input validation, OpenRouter request, static serving
├── public/
│   ├── index.html             # Accessible single-page narration workflow
│   ├── app.js                 # Form, loading/errors, editing/copy/download, SpeechSynthesis controls
│   ├── styles.css             # Responsive visual system
│   └── manus-routes.json      # Declared page route manifest
├── .env.example               # Placeholder only; no actual key
├── .gitignore                 # Exclude .env, node_modules, build/runtime artifacts
├── package.json               # Pinned package manager, start/dev/test scripts and dependencies
├── pnpm-lock.yaml             # Reproducible dependency graph
├── Dockerfile                 # Self-contained published Express container
├── app.config.ts              # Stable project logo URL metadata
├── README.md                  # Assignment responses, cost arithmetic, local/live URLs
├── plan.md                    # This implementation/design plan
└── TODO.md                    # Outcome-based requirements and progress
```

## Build and release workflow

1. After this plan is approved, create `TODO.md`, register JavaScript/HTML/CSS/JSON diagnostics, and implement the app and documentation.
2. Add `OPENROUTER_API_KEY` through the secure Webdev secret input card; never request it in chat. Use the same-origin Express container for the live site, with `/health` as the deployment health check.
3. Install pinned dependencies, run local API/edge checks, confirm no key or AI endpoint appears in `public/`, start the preview on the configured port, and check the route manifest.
4. Save the deployment declarations for a Docker container, commit the final product to the Manus-managed canonical repository, and publish it only after the project checkpoint is accepted.
5. Create a separate **public** GitHub submission repository using the authenticated GitHub account, push the assignment code to a feature branch, and open a self-review PR against `main`. Include the exact personal problem, both live URLs, and the backend-only key confirmation. The GitHub copy is separate from the Manus-managed deployment source.
6. Prepare and explain the three-minute demo. The user's real on-camera footage is required by the rubric. A clearly identified synthetic narration track may be added to supplied footage, but it cannot be represented as the user's own voice or substitute for genuine footage/explanation. Once a video file exists, upload it to Drive, grant “Anyone with the link” viewer access, and verify the share link.

## Design direction

### Styles considered

- Audio-workstation editorial — a precise creator desk with warm paper, waveform motifs, and carefully measured typography. **0.014**
- Swiss editorial utility — highly structured typography, restrained color, and asymmetric information hierarchy. **0.058**
- Neo-brutalist recording booth — bold blocks, loud color, and tactile controls. **0.060**

### Chosen style: Audio-workstation editorial

- **Design Movement:** contemporary audio-tool editorial, balancing a writer's desk with a recording booth.
- **Core Principles:** direct hierarchy; calm focus on the script; visible timing; accessible, low-friction controls.
- **Color Philosophy:** warm ivory keeps long text comfortable to read; near-black provides studio-like contrast; a bright coral-orange signals recording, play, and the key next action.
- **Layout Paradigm:** a left-to-right two-stage workbench on desktop—input and delivery settings at left, a larger script/output console at right—with a single-column sequence on small screens.
- **Signature Elements:** a thin waveform line that doubles as a section divider; a compact duration badge; rounded playback controls styled like physical studio buttons.
- **Interaction Philosophy:** every control communicates a clear state; generation shows progress; editing never destroys the generated version; stop/pause is always within reach.
- **Animation:** brief 140–220 ms fades and waveform movement only while speech is active; respect reduced-motion settings; no looping decoration.
- **Typography System:** a highly legible sans-serif for controls/body paired with a warm editorial serif for the hero and script title; use system-safe fallbacks.
- **Brand Essence:** “A voice-ready first draft for people who build things.” Personality: clear, supportive, practical.
- **Brand Voice:** concise and encouraging, not hype-driven. Examples: “Give your project the words it needs.” “A first take you can actually say out loud.”
- **Wordmark & Logo:** a compact typographic “S” crossed by a three-stroke waveform, paired with the Sayflow wordmark.
- **Signature Brand Color:** signal coral `#F05D43`.

## Intentionally excluded

- **Accounts and saved-project history:** excluded because the confirmed problem can be solved in one session and the assignment deadline does not justify authentication or a database.
- **A full video editor and upload workflow:** excluded because the core task is producing a spoken explanation; editing footage would broaden scope and create additional storage/privacy work.
- **Downloadable generated audio files:** excluded from the first version; browser speech playback gives immediate auditory feedback without collecting another provider key or storing user media. Users can still edit, copy, and download the text script.
