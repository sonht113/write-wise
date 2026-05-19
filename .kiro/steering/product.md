# Product

**IELTS WriteWise** — an AI-powered IELTS Writing Task 1 practice tool.

## What it does

- Presents one of several Task 1 prompts (line graph, bar chart, pie charts, table, process diagram) and renders an editable chart so learners can manipulate the underlying data while practicing.
- Lets the student write an answer in a textarea with an optional 20-minute timer and a live word counter.
- Sends the answer plus a generated chart description to OpenRouter, where a model evaluates the response against a comprehensive rule-based IELTS rulebook (`src/docs/ielts_writing_task_1_master_rulebook.md`).
- Returns structured JSON feedback: band scores for the four IELTS criteria (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammar), per-criterion issues/fixes/rule citations, inline word/phrase annotations (correct / improvement / incorrect), grammar errors, vocabulary issues, and improved sentences.

## Audience and tone

- Vietnamese-speaking IELTS learners. All AI feedback is bilingual (English + Vietnamese `explanation_vi`). UI labels are in English.
- Tone is supportive and rule-grounded — every issue must reference a specific rulebook section.

## API key model

Two modes, toggled in the UI and persisted in `localStorage`:

- **System key** — read from `VITE_OPENROUTER_API_KEY` in `.env`.
- **Personal key** — user-supplied, stored in browser only.

## Non-goals

- No backend, no auth, no user accounts. Everything runs client-side and talks to OpenRouter directly.
- No persistence of student answers or scores beyond the current session.
