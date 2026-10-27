# Sayflow — Delivery Outcomes

## AI narration workflow
- [x] The product solves the confirmed personal friction of turning project details into clear spoken narration for a software-assignment video.
- [x] The user can enter project notes, select a target duration and tone, submit them, and receive a concise plain-language narration script with an estimated speaking time.
- [x] The generated script is editable, copyable and downloadable as text, with browser-based spoken playback controls; the initial release does not claim to create downloadable audio files or edit video footage.
- [x] The AI transformation is central to the product's value, not a decorative feature.

## Express backend and AI security
- [x] An Express backend accepts frontend input, validates empty/oversized requests, calls OpenRouter using the exact model `openai/gpt-4o-mini`, and returns the generated narration.
- [x] The OpenRouter request, endpoint URL and API key exist only in backend code/runtime. The key is read from `process.env` and is never hardcoded, placed in frontend assets, committed, or logged.
- [x] `.env.example` contains placeholders only, and `.gitignore` excludes `.env`, credentials, `node_modules`, and generated/runtime files.
- [x] The backend returns useful errors for a missing API key, upstream failure, and invalid input; the frontend shows loading, success and failure states and explains when browser speech playback is unavailable.
- [x] An unauthenticated `GET /health` returns a successful JSON status response. Express honors `PORT` and listens on the configured host/port.

## Frontend experience
- [x] The UI accepts genuine project notes, sends them only to Sayflow's own backend, displays the narration clearly, and handles empty input, long input, loading, network failures and backend errors gracefully.
- [x] Speech playback is accessible with play/pause/stop controls and respects reduced-motion preferences; script text remains usable if SpeechSynthesis is unavailable.
- [x] The responsive product is served from the same origin as the backend; there are no API keys, OpenRouter/OpenAI endpoint strings or direct AI fetch calls in frontend files.

## Deployment and project documentation
- [x] The frontend and backend are deployed and accessible at real live URLs; for the single-origin Express deployment, the frontend is at `/`, the backend health URL is `/health`, and the AI route is `/api/generate`.
- [x] The published backend health URL is live and returns success; the deployed UI can reach the backend and return a real AI response using the configured protected production key.
- [x] README opens with the confirmed specific personal problem and explains who else has it and what success looks like.
- [x] README answers which API and exact model are used, the backend file and function containing the call, and what the AI transforms.
- [x] README names 2–3 intentionally excluded features and gives a specific reason for each.
- [x] README includes full cost arithmetic: input rate `$0.15 / 1M`; output rate `$0.60 / 1M`; average `~600 input + ~400 output` tokens; per-call cost `(600/1,000,000 × $0.15) + (400/1,000,000 × $0.60) = $0.000090 + $0.000240 = $0.000330`; expected calls `300/month`; monthly total `300 × $0.000330 = $0.099 (~$0.10)`.
- [x] README identifies the live frontend and backend URLs, local setup, secret configuration, and health check.

## Public GitHub repository and self-review PR
- [x] A public GitHub repository contains the assignment source without secrets or committed `.env` files.
- [x] A feature branch is pushed and a pull request is opened against `main` as a self-review PR.
- [x] PR title follows `feat: [Product Name] — [one sentence problem statement]`.
- [x] PR description includes the specific problem in one sentence, live frontend URL, live backend URL, and confirmation that the API key exists only in backend environment variables.
- [x] The completed PR URL is available for submission: https://github.com/aceeliora/sayflow-spoken-demo-writer/pull/1.

## Assignment video and public Drive link
- [ ] A roughly three-minute video demonstrates the live app with genuine input, includes the submitter visibly on camera throughout, explains one self-written code section and why it was written that way, and points out one AI-generated code section the submitter understands.
- [ ] Any synthesized narration is clearly treated as synthetic voiceover; it is not represented as the submitter's voice and does not replace the required authentic on-camera footage and explanation.
- [ ] The final video file is uploaded to Google Drive, sharing is set to “Anyone with the link can view,” and the share link is verified.
- [ ] The final Drive video link is available for submission.
