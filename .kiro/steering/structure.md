# Project Structure

```
.
├── .env / .env.example      # OpenRouter key config (.env is git-ignored)
├── .kiro/steering/          # Steering docs that guide Kiro on this project
├── public/                  # Static assets served from /
│   ├── favicon.svg
│   ├── icons.svg            # SVG sprite used across components
│   └── readme.png
├── src/
│   ├── main.jsx             # React entry, mounts <App /> in StrictMode
│   ├── App.jsx              # Top-level page, holds prompt/answer/result state and OpenRouter call
│   ├── App.css              # Legacy/global app styles (most styling is Tailwind utilities)
│   ├── index.css            # Tailwind v4 import only
│   ├── prompts.js           # Static array of Task 1 prompts (chart data + task wording)
│   ├── assets/              # Bundled images (hero.png, vite.svg, react.svg)
│   ├── components/
│   │   ├── AnnotatedAnswer.jsx   # Renders inline AI annotations over the student's answer
│   │   ├── ApiKeyModal.jsx       # System vs personal OpenRouter key picker
│   │   ├── HintDrawer.jsx        # Slide-out drawer with chart-type-specific writing hints
│   │   ├── ModelSelector.jsx     # Dropdown for choosing the OpenRouter model
│   │   ├── ResultsCard.jsx       # Displays band scores and rule-based feedback
│   │   └── charts/
│   │       ├── ChartRenderer.jsx        # Picks the right view by prompt.chartType
│   │       ├── LineChartView.jsx
│   │       ├── BarChartView.jsx
│   │       ├── PieChartView.jsx
│   │       ├── TableView.jsx
│   │       └── ProcessDiagramView.jsx
│   ├── docs/
│   │   └── ielts_writing_task_1_master_rulebook.md  # Loaded with ?raw, embedded in the AI system prompt
│   └── hooks/
│       ├── useChartDraft.js   # Local-edit buffer with debounced sync back to parent
│       └── useDebounce.js
├── eslint.config.js         # Flat-config ESLint setup
├── vite.config.js           # Vite + React + Tailwind plugins
├── index.html               # Single HTML entry, mounts #root
└── package.json
```

## Where things go

- **New chart type** — add a `*View.jsx` under `src/components/charts/`, register it in the `VIEWS` map in `ChartRenderer.jsx`, and add a prompt entry with the new `chartType` to `prompts.js`. Update `getDynamicDescription` in `App.jsx` to handle the new shape.
- **New prompt** — append an object to the array in `src/prompts.js`. Each prompt has `id`, `title`, `chartType`, `task`, `description`, plus chart-shape-specific fields (`data`/`lines`/`bars`/`pieData`/`tableData`/`stages`).
- **New reusable React hook** — `src/hooks/`, file named `useThing.js`, default export.
- **New shared component** — `src/components/`. If it is chart-specific, put it in `src/components/charts/`.
- **New rule for AI feedback** — extend `src/docs/ielts_writing_task_1_master_rulebook.md`. Do not duplicate rules into `App.jsx`; the rulebook is the single source of truth and is injected via `?raw`.
- **New AI response field** — update the JSON schema example inside `SYSTEM_PROMPT` in `App.jsx` so the model knows about it, then handle the field in `ResultsCard.jsx` (or a new dedicated component).
- **Static asset that needs a public URL** — `public/`. Reference by absolute path (e.g. `/icons.svg`).
- **Asset bundled with the JS graph** — `src/assets/`, imported in the consuming module.

## State boundaries

- `App.jsx` owns the high-level state: current prompt, current chart data, answer text, AI result, loading/error, model, timer, key mode, personal key.
- Chart views receive `prompt` (the current chart data) and an `onUpdate` callback; they do not hold their own canonical state. Use `useChartDraft` for local editing buffers.
- `localStorage` is used for two things only: `key_mode` and `personal_key`. Do not introduce additional persistence without discussion.

## Things to avoid

- Do not add a backend, server routes, or a `server/` folder. The app is intentionally client-only.
- Do not add new top-level folders at the repo root; extend `src/` instead.
- Do not introduce a state library (Redux, Zustand, Jotai). Local state plus prop drilling is the chosen pattern at this scale.
- Do not commit `.env`, real API keys, or anything in `dist/`.
